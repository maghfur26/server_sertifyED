import crypto from "crypto";
import brcypt from "bcrypt";

interface CertificateData {
  recipientName: string;
  recipientEmail: string;
  courseName: string;
  issueDate: Date | string;
  issuerName: string;
}

class HashService {
  static generateHash(data: any) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");
  }

  static generateCertificateHash(certificateData : CertificateData) {
    const {
      recipientName,
      recipientEmail,
      courseName,
      issueDate,
      issuerName,
    } = certificateData;

    const dataToHash = {
      recipientName: recipientName.trim(),
      recipientEmail: recipientEmail.toLowerCase().trim(),
      courseName: courseName.trim(),
      issueDate: new Date(issueDate).toISOString(),
      issuerName: issuerName.trim(),
    };

    return this.generateHash(dataToHash);
  }

  static generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString("hex");
  }

  static hashPassword(password: string, saltRounds = 12) {
    return brcypt.hash(password, saltRounds);
  }

  static comparePassword(password: string, hash: string) {
    return brcypt.compare(password, hash);
  }
}

export default HashService;