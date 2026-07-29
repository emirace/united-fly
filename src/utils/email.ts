import nodemailer from "nodemailer";

const sendEmail = async ({
  to,
  subject,
  text,
  name,
  password,
}: {
  to: string;
  subject: string;
  text: string;
  name?: string;
  password?: string;
}) => {
  const transporter = nodemailer.createTransport({
    service:"Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure:true,
    auth: {
      user: name || process.env.EMAIL_USER,
      pass: password || process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: name || process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

export default sendEmail;
