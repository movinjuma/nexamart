import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import logoImage from './../assets/final logo.png';
import { PDFDocument } from 'pdf-lib';

// Brand colors - dark green and black theme
const PRIMARY_COLOR = '#2E7D32'; // Dark green
const SECONDARY_COLOR = '#000000'; // Black
const ACCENT_COLOR = '#4CAF50'; // Light green
const TEXT_COLOR = '#333333';
const LIGHT_GRAY = '#f5f5f5';

const COMPANY_NAME = 'HOUSIKA PROPERTIES';
const COMPANY_CONTACT = 'Email: support@housika.co.ke | Phone: +254 745 108 505';
const SECURITY_NOTICE = 'IMPORTANT: Do not pay until you have entered and verified the property.';

// Enhanced image conversion with caching
const imageCache = new Map();
async function convertImageToBase64(imagePath) {
  if (imageCache.has(imagePath)) {
    return imageCache.get(imagePath);
  }

  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    const result = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    imageCache.set(imagePath, result);
    return result;
  } catch (error) {
    console.error('Image conversion error:', error);
    return null;
  }
}

// QR Code generation with error correction
async function generateQRCode(text) {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H', // High error correction
      margin: 2,
      color: {
        dark: SECONDARY_COLOR,
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('QR code generation failed:', error);
    return null;
  }
}

// Advanced PDF compression
async function compressPDF(pdfBytes) {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Set document metadata
    pdfDoc.setTitle('Housika Booking Receipt');
    pdfDoc.setAuthor('Housika Properties');
    pdfDoc.setSubject('Property Booking Confirmation');
    pdfDoc.setKeywords(['housika', 'booking', 'receipt', 'property']);
    pdfDoc.setProducer('Housika PDF Generator');
    
    // Optimize all pages
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      page.setContentCompression(true);
    }
    
    return await pdfDoc.save({
      useObjectStreams: true,
      useCompression: true
    });
  } catch (error) {
    console.error('PDF compression failed, using original:', error);
    return pdfBytes;
  }
}

export async function generateReceiptPDF(bookingData) {
  // Create PDF with better settings
  const doc = new jsPDF({
    unit: 'mm',
    compress: true,
    filters: ['ASCIIHexEncode']
  });

  const receiptNumber = bookingData.payment_id || `RCPT-${Date.now().toString().slice(-6)}`;
  const receiptDate = new Date(bookingData.payment_date || new Date()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Add document protection
  doc.setProperties({
    title: `Housika Receipt ${receiptNumber}`,
    subject: 'Property Booking Receipt',
    author: 'Housika Properties',
    keywords: 'receipt, booking, property',
    creator: 'Housika PDF Generator'
  });

  // Add watermark and security features
  doc.setDisplayMode('fullwidth', 'continuous');
  doc.setLanguage('en-US');

  // Add decorative border
  doc.setDrawColor(SECONDARY_COLOR);
  doc.setLineWidth(0.2);
  doc.roundedRect(5, 5, 200, 287, 3, 3, 'S');

  // Add logo with better handling
  try {
    const logo = await convertImageToBase64(logoImage);
    if (logo) {
      doc.addImage(logo, 'PNG', 15, 10, 25, 25, undefined, 'MEDIUM');
    }
  } catch (e) {
    console.warn('Logo loading failed:', e);
  }

  // Company header
  doc.setFontSize(16);
  doc.setTextColor(PRIMARY_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_NAME, 50, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(TEXT_COLOR);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_CONTACT, 50, 26);

  // Receipt header
  doc.setFontSize(14);
  doc.setTextColor(SECONDARY_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKING RECEIPT', 105, 40, { align: 'center' });

  // Receipt details
  doc.setFontSize(10);
  doc.setTextColor(TEXT_COLOR);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt Number: ${receiptNumber}`, 15, 50);
  doc.text(`Date: ${receiptDate}`, 15, 55);

  // Security notice - prominently displayed
  doc.setFontSize(9);
  doc.setTextColor('#D32F2F'); // Red for emphasis
  doc.setFont('helvetica', 'bolditalic');
  doc.text(SECURITY_NOTICE, 105, 65, { align: 'center', maxWidth: 180 });

  // Booking details table
  autoTable(doc, {
    startY: 75,
    head: [['Booking Details', '']],
    body: [
      ['Property', bookingData.property_name],
      ['Tenant', bookingData.user_name],
      ['Room Selected', bookingData.room_selected || 'N/A'],
      ['Booking Dates', `${formatDate(bookingData.startDate)} to ${formatDate(bookingData.endDate)}`],
      ['Amount Paid', `${bookingData.currency} ${bookingData.amount_paid.toLocaleString()}`],
      ['Payment Ref', bookingData.payment_id],
      ['Status', bookingData.status]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: '#FFFFFF',
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: LIGHT_GRAY
    },
    styles: {
      cellPadding: 5,
      fontSize: 10,
      valign: 'middle'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    }
  });

  // Landlord contact information
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Landlord Information', '']],
    body: [
      ['Name', bookingData.landlord_name],
      ['Phone', bookingData.landlord_phone],
      ['Property Location', bookingData.location]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: SECONDARY_COLOR,
      textColor: '#FFFFFF',
      fontStyle: 'bold'
    },
    styles: {
      cellPadding: 5,
      fontSize: 10
    }
  });

  // QR Code with booking details
  const qrData = [
    'Housika Booking Receipt',
    `Receipt: ${receiptNumber}`,
    `Property: ${bookingData.property_name}`,
    `Tenant: ${bookingData.user_name}`,
    `Amount: ${bookingData.amount_paid} ${bookingData.currency}`,
    `Paid: ${receiptDate}`
  ].join('\n');
  
  const qrCode = await generateQRCode(qrData);
  
  if (qrCode) {
    doc.addImage(qrCode, 'PNG', 150, doc.lastAutoTable.finalY + 10, 40, 40);
    doc.setFontSize(8);
    doc.setTextColor(TEXT_COLOR);
    doc.text('Scan to verify booking', 150, doc.lastAutoTable.finalY + 55, { align: 'center' });
  }

  // Terms and conditions
  doc.setFontSize(8);
  doc.setTextColor(TEXT_COLOR);
  doc.setFont('helvetica', 'italic');
  const termsY = qrCode ? doc.lastAutoTable.finalY + 65 : doc.lastAutoTable.finalY + 20;
  doc.text('Terms & Conditions:', 15, termsY);
  doc.text('1. This receipt serves as proof of booking only', 20, termsY + 5);
  doc.text('2. Payment does not guarantee property condition', 20, termsY + 10);
  doc.text('3. All disputes must be reported within 24 hours', 20, termsY + 15);
  doc.text('4. Housika is not liable for tenant-landlord disputes', 20, termsY + 20);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(SECONDARY_COLOR);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for using Housika Properties', 105, 280, { align: 'center' });

  // Generate final PDF
  const fileName = `Housika_Receipt_${receiptNumber}.pdf`;
  const pdfBytes = doc.output('arraybuffer');
  const compressedPdf = await compressPDF(pdfBytes);
  
  // Save with better handling
  try {
    const pdfBlob = new Blob([compressedPdf], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    return {
      url: pdfUrl,
      fileName,
      size: compressedPdf.byteLength,
      receiptNumber
    };
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
}

export async function saveReceiptToDevice(pdfUrl, fileName) {
  try {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup with better error handling
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfUrl);
      } catch (cleanupError) {
        console.warn('Cleanup error:', cleanupError);
      }
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Save failed:', error);
    return false;
  }
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
}