import nodemailer from "nodemailer";

let transport;

const initializeEmailService = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (emailUser && emailPassword) {
    transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
    console.log("Email service initialized successfully");
  } else {
    console.error("Email user or password not set in environment variables");
  }
};

initializeEmailService();

export {
    transport as emailTransport,
    initializeEmailService,
}
