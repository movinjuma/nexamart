<template>
  <div class="receipt-page">
    <h2 class="title">Rental Receipt Generator</h2>

    <div v-if="loadingLandlord" class="loading">
      <div class="spinner"></div>
      Loading landlord details...
    </div>

    <div v-else-if="landlordError" class="error">{{ landlordError }}</div>

    <div v-else class="form-section">
      <div class="form-row">
        <label>
          Tenant Full Name
          <input v-model="tenantName" type="text" required placeholder="John Doe" />
        </label>
      </div>

      <div class="form-row">
        <label>
          Property Name
          <input v-model="propertyName" type="text" required placeholder="Sunset Apartments" />
        </label>
      </div>

      <div class="form-row">
        <label>
          Room / Unit Number
          <input v-model="roomNumber" type="text" required placeholder="B12" />
        </label>
      </div>

      <div class="form-row">
        <label>
          Amount Paid
          <div class="currency-input-container">
            <span class="currency-symbol">{{ countryConfig?.currency_symbol || 'KSh' }}</span>
            <input v-model.number="amountPaid" type="number" min="0" required placeholder="5000" />
          </div>
        </label>
      </div>

      <div class="form-row">
        <label>
          Balance Remaining
          <div class="currency-input-container">
            <span class="currency-symbol">{{ countryConfig?.currency_symbol || 'KSh' }}</span>
            <input v-model.number="balance" type="number" min="0" required placeholder="0" />
          </div>
        </label>
      </div>

      <button
        @click="generateReceipt"
        class="btn-primary"
        :disabled="loading || !landlordDetails || !formValid"
        :class="{ 'btn-loading': loading }"
      >
        <span v-if="!loading">Generate Receipt</span>
        <span v-else>Generating...</span>
      </button>
    </div>

    <div class="verify-controls">
      <button @click="showVerifyModal = true" class="btn-secondary">Verify Receipt</button>
      <button @click="toggleScanner" class="btn-scan">
        <span v-if="!scanning">📷 Scan QR Code</span>
        <span v-else>🛑 Stop Scanning</span>
      </button>
    </div>

    <!-- Verify Receipt Modal -->
    <div v-if="showVerifyModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>Verify Receipt</h3>
        <input v-model="receiptToVerify" placeholder="Enter Receipt Number" class="verify-input" />
        <button class="btn-primary" @click="verifyReceipt" :disabled="verificationLoading">
          <span v-if="!verificationLoading">Verify</span>
          <span v-else>Verifying...</span>
        </button>

        <div v-if="verificationLoading" class="loading">Verifying...</div>

        <div v-if="verificationResult" class="verification-result">
          <p>{{ verificationResult }}</p>
        </div>

        <div v-if="receiptUrl" class="receipt-preview">
          <iframe :src="receiptUrl" width="100%" height="400px" frameborder="0"></iframe>
          <button @click="showDownloadPopup = true" class="btn-download">⬇ Download Receipt</button>
        </div>
      </div>
    </div>

    <!-- Download Popup for both Generate and Verify -->
    <div v-if="showDownloadPopup" class="modal-overlay" @click.self="showDownloadPopup = false">
      <div class="modal">
        <h3>Receipt Ready</h3>
        <p>You can now download the receipt.</p>
        <button @click="downloadReceipt" class="btn-download">⬇ Download Receipt</button>
        <button @click="showDownloadPopup = false" class="btn-close-notification">Close</button>
      </div>
    </div>

    <!-- Generated Receipt Modal -->
    <div v-if="showGeneratedModal" class="modal-overlay" @click.self="showGeneratedModal = false">
      <div class="modal">
        <h3>Receipt Generated Successfully!</h3>
        <p>Your receipt has been generated and saved.</p>
        <button @click="downloadGeneratedReceipt" class="btn-download">⬇ Download Receipt</button>
        <button @click="showGeneratedModal = false" class="btn-close-notification">Close</button>
      </div>
    </div>

    <!-- QR Scanner Overlay -->
    <div v-if="scanning" class="scanner-overlay">
      <div class="scanner-container">
        <div id="qr-reader" class="qr-scanner"></div>
        <button @click="toggleScanner" class="btn-close-scan">Close Scanner</button>
      </div>
    </div>

    <!-- Success Notification -->
    <div v-if="showSuccess" class="success-notification">
      <p>✅ Receipt generated successfully!</p>
      <button @click="showSuccess = false" class="btn-close-notification">×</button>
    </div>
  </div>
</template>
<style scoped>
.receipt-page {
  padding: 0.5rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.title {
  text-align: center;
  margin-bottom: 0.4rem;
  font-size: 1.3rem;
  color: #2c3e50;
  font-weight: 700;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-row {
  margin-bottom: 0.2rem;
}

label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  font-size: 0.95rem;
  color: #34495e;
  margin-bottom: 0.3rem;
}

input, select {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  margin-top: 0.3rem;
  background: white;
  transition: border-color 0.3s ease;
}

input:focus, select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

input:invalid {
  border-color: #e74c3c;
}

.currency-input-container {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: border-color 0.3s ease;
}

.currency-input-container:focus-within {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.currency-symbol {
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  font-weight: bold;
  color: #2c3e50;
  border-right: 1px solid #ddd;
}

.currency-input-container input {
  flex: 1;
  border: none;
  margin-top: 0;
  padding: 0.75rem 1rem;
}

.currency-input-container input:focus {
  outline: none;
  box-shadow: none;
}

.btn-primary {
  background: #3498db;
  color: white;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin-top: 1rem;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.btn-primary.btn-loading {
  position: relative;
  color: transparent;
}

.btn-primary.btn-loading::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.btn-secondary {
  background: #2ecc71;
  color: white;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  flex: 1;
}

.btn-secondary:hover {
  background: #27ae60;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-scan {
  background: #f39c12;
  color: white;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  flex: 1;
}

.btn-scan:hover {
  background: #d35400;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.verify-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease-out;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 1rem;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease-out;
  position: relative;
  text-align: center;
}

.modal h3 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 700;
}

.modal p {
  margin: 1rem 0;
  color: #34495e;
  font-size: 1rem;
}

.btn-download {
  background: #3498db;
  color: white;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.3s ease;
  width: 100%;
  margin-top: 1rem;
}

.btn-download:hover {
  background: #2980b9;
}

.btn-close-notification {
  background: #e74c3c;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.btn-close-notification:hover {
  background: #c0392b;
}

/* Responsive: Mobile Modal */
@media screen and (max-width: 600px) {
  .modal {
    padding: 1.2rem;
  }

  .btn-download, .btn-close-notification {
    width: 100%;
    font-size: 1rem;
  }
}


@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal h3 {
  margin-top: 0;
  color: #2c3e50;
  text-align: center;
}

.verify-input {
  width: 100%;
  padding: 0.8rem;
  margin: 1rem 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.verification-result {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.verification-result p {
  margin: 0;
  color: #2c3e50;
  font-weight: 500;
}

.receipt-preview {
  margin-top: 1.5rem;
  border: 1px solid #eee;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
}

.receipt-preview iframe {
  width: 100%;
  height: 400px;
  border: none;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.btn-download {
  background: #3498db;
  color: white;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
  width: 100%;
}

.btn-download:hover {
  background: #2980b9;
}

.loading {
  text-align: center;
  padding: 1.5rem;
  color: #7f8c8d;
  font-weight: 500;
}

.loading .spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(52, 152, 219, 0.3);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
  vertical-align: middle;
}

.error {
  text-align: center;
  padding: 1.5rem;
  color: #e74c3c;
  font-weight: 600;
  background: #fdecea;
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
}

.scanner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.scanner-container {
  width: 90%;
  max-width: 500px;
  text-align: center;
}

.qr-scanner {
  width: 100%;
  height: 300px;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
}

.btn-close-scan {
  background: #e74c3c;
  color: white;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.btn-close-scan:hover {
  background: #c0392b;
}

.success-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #2ecc71;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1002;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.btn-close-notification {
  background: transparent;
  color: white;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
}

@media screen and (max-width: 600px) {
  .receipt-page {
    padding: 1rem;
  }
  
  .verify-controls {
    flex-direction: column;
  }
  
  .btn-secondary, .btn-scan {
    width: 100%;
  }
}
</style>
<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { Html5Qrcode } from 'html5-qrcode';
import { account, db, storage, DATABASE_ID, COLLECTION_IDS } from './../../utils/appwrite';
import { Query, ID } from 'appwrite';

const tenantName = ref('');
const propertyName = ref('');
const roomNumber = ref('');
const amountPaid = ref(null);
const balance = ref(null);

const landlordDetails = ref(null);
const countryConfig = ref(null);
const loadingLandlord = ref(true);
const landlordError = ref('');
const loading = ref(false);

const showVerifyModal = ref(false);
const showDownloadPopup = ref(false);
const receiptToVerify = ref('');
const verificationResult = ref('');
const receiptUrl = ref('');
const scanning = ref(false);
const showSuccess = ref(false);
const showGeneratedModal = ref(false);
const generatedReceiptBlob = ref(null);
const generatedReceiptName = ref('');
let html5Qrcode = null;

const logoBase64 = ref('');
const defaultLogo = new URL('./../../assets/final logo.png', import.meta.url).href;

const formValid = computed(() =>
  tenantName.value.trim() &&
  propertyName.value.trim() &&
  roomNumber.value.trim() &&
  typeof amountPaid.value === 'number' && amountPaid.value >= 0 &&
  typeof balance.value === 'number' && balance.value >= 0
);

const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  return `${countryConfig.value?.currency_symbol || 'KSh'} ${isNaN(num) ? '0.00' : num.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const initializeApp = async () => {
  try {
    loadingLandlord.value = true;
    const user = await account.get();
    const res = await db.listDocuments(DATABASE_ID, COLLECTION_IDS.USERS, [
      Query.equal('user_id', user.$id)
    ]);
    if (!res.documents.length) throw new Error('Landlord profile not found');
    landlordDetails.value = res.documents[0];

    if (landlordDetails.value.country_id) {
      countryConfig.value = await db.getDocument(
        DATABASE_ID,
        COLLECTION_IDS.COUNTRIES,
        landlordDetails.value.country_id
      );
    }

    logoBase64.value = landlordDetails.value.logo_url
      ? await convertImageToBase64(landlordDetails.value.logo_url)
      : await convertImageToBase64(defaultLogo);
  } catch (err) {
    landlordError.value = err.message || 'Failed to initialize';
  } finally {
    loadingLandlord.value = false;
  }
};

const resetForm = () => {
  tenantName.value = '';
  propertyName.value = '';
  roomNumber.value = '';
  amountPaid.value = null;
  balance.value = null;
};

const convertImageToBase64 = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = src;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL('image/png'));
  };
  img.onerror = reject;
});

const generateReceiptNumber = () => {
  const now = new Date();
  const prefix = 'H';
  const countryCode = countryConfig.value?.country_code?.substring(0, 2).toUpperCase() || 'KE';
  const day = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][now.getDay()];
  const date = String(now.getDate()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).slice(0, 2).padStart(2, '0');
  return `${prefix}${countryCode}${day}${date}${sec}${ms}`;
};

const generateQRCode = (data) => QRCode.toDataURL(data, {
  errorCorrectionLevel: 'H',
  margin: 1,
  scale: 4,
  width: 100
}).catch(() => '');

const compressPDF = (pdfBlob) => new Promise(resolve => {
  const reader = new FileReader();
  reader.onload = () => resolve(new Blob([reader.result], { type: 'application/pdf' }));
  reader.readAsArrayBuffer(pdfBlob);
});

const createPDFDocument = (data) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

  if (logoBase64.value) {
    try {
      doc.addImage(logoBase64.value, 'PNG', 75, 15, 60, 20);
    } catch (e) {
      console.error('Error adding logo:', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RENT PAYMENT RECEIPT', 105, 45, { align: 'center' });

  doc.setFontSize(9);
  doc.text(`R/NO #: ${data.receiptNumber}`, 105, 52, { align: 'center' });
  doc.text(`Date: ${data.paymentDate.toLocaleDateString()}`, 105, 57, { align: 'center' });
  doc.text(`Issued by: ${landlordDetails.value?.name || 'Landlord'}`, 105, 62, { align: 'center' });

  autoTable(doc, {
    startY: 70,
    head: [['Description', 'Details']],
    body: [
      ['Tenant Name', data.tenantName],
      ['Property', data.propertyName],
      ['Room/Unit', data.roomNumber],
      ['Amount Paid', formatCurrency(data.amountPaid)],
      ['Balance', formatCurrency(data.balance)],
      ['Payment Date', data.paymentDate.toLocaleString()],
      ['Contact', landlordDetails.value?.phone_number || 'N/A']
    ],
    headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255] },
    bodyStyles: { textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    styles: { fontSize: 9 }
  });

  if (data.qrCodeUrl) {
    doc.setFontSize(8);
    doc.text('Scan to verify this receipt', 105, doc.lastAutoTable.finalY + 10, { align: 'center' });
    doc.addImage(data.qrCodeUrl, 'JPEG', 85, doc.lastAutoTable.finalY + 15, 40, 40);
  }

  doc.setFontSize(8);
  doc.text('Thank you for your payment. This is an official receipt.', 105, doc.lastAutoTable.finalY + 75, { align: 'center' });
  return doc;
};

const downloadGeneratedReceipt = () => {
  if (generatedReceiptBlob.value) {
    const url = URL.createObjectURL(generatedReceiptBlob.value);
    const link = document.createElement('a');
    link.href = url;
    link.download = generatedReceiptName.value;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showGeneratedModal.value = false;
  }
};

const saveReceipt = async (blob, data) => {
  const compressed = await compressPDF(blob);
  const pdfFile = new File([compressed], `${data.receiptNumber}.pdf`, { type: 'application/pdf' });
  const file = await storage.createFile(COLLECTION_IDS.BUCKET, ID.unique(), pdfFile);
  await db.createDocument(DATABASE_ID, COLLECTION_IDS.RECEIPTS, ID.unique(), {
    receipt_number: data.receiptNumber,
    tenant_name: data.tenantName,
    property_name: data.propertyName,
    room_number: data.roomNumber,
    amount_paid: data.amountPaid,
    balance: data.balance,
    date: data.paymentDate.toISOString(),
    file_id: file.$id,
    landlord_id: landlordDetails.value?.user_id,
    landlord_name: landlordDetails.value?.name,
    landlord_phone: landlordDetails.value?.phone_number,
    landlord_email: landlordDetails.value?.email,
    currency: countryConfig.value?.currency_code || 'KES',
    country: countryConfig.value?.name || 'Kenya'
  });
  return file;
};

const generateReceipt = async () => {
  if (!formValid.value) return alert('Fill all fields');
  loading.value = true;
  try {
    const receiptNumber = generateReceiptNumber();
    const paymentDate = new Date();
    const data = {
      receiptNumber,
      tenantName: tenantName.value,
      propertyName: propertyName.value,
      roomNumber: roomNumber.value,
      amountPaid: amountPaid.value,
      balance: balance.value,
      paymentDate
    };
    data.qrCodeUrl = await generateQRCode(JSON.stringify({
      receiptNumber, tenant: data.tenantName, amount: data.amountPaid,
      date: paymentDate.toISOString(), landlord: landlordDetails.value?.name
    }));
    const doc = createPDFDocument(data);
    const blob = doc.output('blob');
    generatedReceiptBlob.value = await compressPDF(blob);
    generatedReceiptName.value = `${data.receiptNumber}.pdf`;
    await saveReceipt(blob, data);
    resetForm();
    showSuccess.value = true;
    showGeneratedModal.value = true;
    setTimeout(() => showSuccess.value = false, 4000);
  } catch (e) {
    console.error(e);
    alert('An error occurred while generating receipt.');
  } finally {
    loading.value = false;
  }
};

const toggleScanner = () => scanning.value ? stopScanner() : startScanner();

const startScanner = () => {
  scanning.value = true;
  html5Qrcode = new Html5Qrcode('qr-reader');
  html5Qrcode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    (decoded) => {
      receiptToVerify.value = decoded;
      stopScanner();
      verifyReceipt();
    },
    (err) => console.warn(err)
  ).catch(() => {
    alert('Camera access denied');
    scanning.value = false;
  });
};

const stopScanner = () => {
  if (html5Qrcode?.isScanning) {
    html5Qrcode.stop().then(() => scanning.value = false).catch(() => scanning.value = false);
  } else scanning.value = false;
};

const verifyReceipt = async () => {
  if (!receiptToVerify.value.trim()) {
    verificationResult.value = 'Please enter a receipt number';
    return;
  }

  try {
    const res = await db.listDocuments(DATABASE_ID, COLLECTION_IDS.RECEIPTS, [
      Query.equal('receipt_number', receiptToVerify.value.trim())
    ]);
    if (!res.documents.length) {
      verificationResult.value = 'Receipt not found.';
      return;
    }
    const doc = res.documents[0];
    verificationResult.value = `Valid receipt for ${doc.tenant_name}, Amount: ${formatCurrency(doc.amount_paid)}`;
    receiptUrl.value = (await storage.getFileView(COLLECTION_IDS.BUCKET, doc.file_id)).href;
    showDownloadPopup.value = true;
  } catch {
    verificationResult.value = 'Verification failed. Try again.';
  }
};

const downloadReceipt = () => {
  if (receiptUrl.value) {
    const link = document.createElement('a');
    link.href = receiptUrl.value;
    link.download = `Receipt-${receiptToVerify.value}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showDownloadPopup.value = false;
  }
};

const closeModal = () => {
  showVerifyModal.value = false;
  receiptToVerify.value = '';
  verificationResult.value = '';
  receiptUrl.value = '';
  showDownloadPopup.value = false;
};

onMounted(() => initializeApp());
onBeforeUnmount(() => stopScanner());
</script>