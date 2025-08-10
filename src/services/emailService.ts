import { emailTransport } from "../config/email.config";
import generateQRCode from "../utils/generateQR";

const sendCertidicateNotification = async (
  email: string,
  name: string,
  certificateUrl: string,
  certificateId: string
) => {
  const verifyUrl = `${process.env.BASE_URL}/verify/${certificateId}`;
  const qrCodeUrl = await generateQRCode(verifyUrl);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Certificate Notification",
    html: `
            <p>Hello ${name},</p>
            <p>You have successfully issued a certificate. id: ${certificateId}</p>
            <p>Use the following link to verify your certificate:</p>
            <a href="${certificateUrl}">${certificateUrl}</a>
            <p>Scan the QR code below to verify your certificate:</p>
            <img src="${qrCodeUrl}" alt="QR Code">
            <p>Thank you for using our service.</p>
        `,
  };

  emailTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

export default sendCertidicateNotification;
