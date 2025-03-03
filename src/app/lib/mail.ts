import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Change to your provider (e.g., SMTP settings)
    auth: {
      user: process.env.EMAIL_USER, // Set this in .env
      pass: process.env.EMAIL_PASS, // Set this in .env
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
}
