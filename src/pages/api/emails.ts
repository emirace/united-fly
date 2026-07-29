import Setting from "@/model/setting";
import dbConnect from "@/utils/dbConnect";
import sendEmail from "@/utils/email";
import corsMiddleware from "@/utils/middleware";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await corsMiddleware(req, res);
  await dbConnect();

  try {
    if (req.method === "POST") {
      const { to, message, subject } = req.body;

      if (!to || !message) {
        return res
          .status(200)
          .json({ message: "Receipient and Message info are required" });
      }

      const settings = await Setting.findOne();

      if (to === "self") {
        await sendEmail({
          to: settings.mail.name || "",
          subject,
          text: message,
          name: settings.mail.name,
          password: settings.mail.password,
        });
      } else {
        await sendEmail({
          to,
          subject,
          text: message,
          name: settings.mail.name,
          password: settings.mail.password,
        });
      }

      return res.status(200).json({ message: "Email sent successfully" });
    }

    return res.status(405).json({ message: "Method Not Allowed" });
  } catch (error) {
    console.error("Error handling settings:", error);
    return res.status(200).json({ message: "Internal Server Error" });
  }
}
