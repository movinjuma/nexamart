// utils/paystack.js
import { PAYSTACK_PUBLIC_KEY } from './appwrite.js';

/**
 * Load Paystack SDK if not already loaded
 * @returns {Promise<void>}
 */
function loadPaystackSDK() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Paystack SDK failed to load'));

    document.body.appendChild(script);
  });
}

/**
 * Initialize and process payment with Paystack
 * @param {Object} params - Payment parameters
 * @param {string} params.email - Customer email
 * @param {number} params.amount - Amount in major currency (e.g. KES)
 * @param {string} params.name - Customer name
 * @param {string} [params.currency='KES'] - Currency code
 * @param {string} [params.propertyId] - Property ID being booked
 * @param {string} [params.room] - Room/unit being booked
 * @param {string} [params.landlordId] - Landlord's user ID
 * @returns {Promise<Object>} Payment result
 */
export async function payWithPaystack({
  email,
  amount,
  name,
  currency = 'KES',
  propertyId,
  room,
  landlordId
}) {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        throw new Error('Invalid payment amount.');
      }

      await loadPaystackSDK();

      const ref = `prop_${propertyId || 'generic'}_${Date.now()}`;

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: Math.round(amount * 100), // Convert to smallest currency unit
        currency,
        ref,
        metadata: {
          custom_fields: [
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: name
            },
            ...(propertyId ? [{
              display_name: 'Property ID',
              variable_name: 'property_id',
              value: propertyId
            }] : []),
            ...(room ? [{
              display_name: 'Room/Unit',
              variable_name: 'room',
              value: room
            }] : []),
            ...(landlordId ? [{
              display_name: 'Landlord ID',
              variable_name: 'landlord_id',
              value: landlordId
            }] : [])
          ]
        },
        callback: (response) => {
          resolve({
            success: true,
            reference: ref, // Our own reference
            transactionReference: response.reference, // Paystack response ref
            metadata: {
              propertyId,
              room,
              landlordId
            }
          });
        },
        onClose: () => {
          resolve({
            success: false,
            message: 'Payment window closed by user',
            metadata: {
              propertyId,
              room,
              landlordId
            }
          });
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('Paystack payment error:', error);
      reject({
        success: false,
        message: error.message || 'Payment failed',
        metadata: {
          propertyId,
          room,
          landlordId
        }
      });
    }
  });
}

/**
 * Verify a Paystack transaction (⚠️ only use this temporarily on frontend)
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Verification result
 */
export async function verifyPayment(reference) {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || 'Verification failed');
    }

    return {
      success: data.data.status === 'success',
      data: data.data
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      message: error.message || 'Verification failed'
    };
  }
}