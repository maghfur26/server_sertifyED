import QRCode from "qrcode";

const generateQRCode = async (url: string) => {
  const qrCode = await QRCode.toDataURL(url);
  return qrCode;
};

export default generateQRCode;
