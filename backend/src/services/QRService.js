import QRCode from 'qrcode';
import crypto from 'crypto';

export class QRService {
  // Generate QR code for session
  static async generateQR(sessionId, pinCode) {
    const data = {
      session_id: sessionId,
      pin_code: pinCode,
      timestamp: new Date().toISOString()
    };

    const qrImage = await QRCode.toDataURL(JSON.stringify(data));
    return qrImage;
  }

  // Generate random PIN code (6 digits)
  static generatePIN() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Verify QR data (decode)
  static async verifyQRData(qrData) {
    try {
      return JSON.parse(qrData);
    } catch (error) {
      throw new Error('Invalid QR code data');
    }
  }
}
