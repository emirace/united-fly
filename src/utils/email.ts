import nodemailer from "nodemailer";
import Setting from "@/model/setting";
import dbConnect from "@/utils/dbConnect";

interface SendEmailArgs {
  to: string;
  subject: string;
  text: string;
  /** Optional HTML body; `text` is still sent as the plain-text alternative. */
  html?: string;
  /** Explicit mailbox, used by the admin "send email" screen. */
  name?: string;
  password?: string;
}

/**
 * Mailbox to send from, in priority order:
 *
 *   1. credentials passed by the caller (the admin compose screen),
 *   2. the mailbox saved on the Settings document,
 *   3. EMAIL_USER / EMAIL_PASS from the environment.
 *
 * Resolving Settings here rather than at each call site is deliberate: only
 * `/api/emails` ever looked them up, so every other message — payment
 * confirmations, password resets, email verification — silently fell through
 * to the environment variables and failed authentication whenever those were
 * unset, which is the normal case once an operator has configured the mailbox
 * through the dashboard.
 */
/**
 * Google shows app passwords as four space-separated groups and people paste
 * them that way, but SMTP rejects the spaces. Nothing is lost by stripping
 * whitespace — no mail provider uses it meaningfully in a password.
 */
const normalise = (secret?: string) => secret?.replace(/\s+/g, "");

const resolveMailbox = async (name?: string, password?: string) => {
  if (name && password) return { user: name, pass: normalise(password) };

  let settings: { mail?: { name?: string; password?: string } } | null = null;
  try {
    await dbConnect();
    settings = await Setting.findOne().lean();
  } catch (error) {
    // Fall through to the environment rather than failing outright.
    console.error("Could not read mail settings:", error);
  }

  return {
    user: name || settings?.mail?.name || process.env.EMAIL_USER,
    pass: normalise(
      password || settings?.mail?.password || process.env.EMAIL_PASS
    ),
  };
};

const sendEmail = async ({
  to,
  subject,
  text,
  html,
  name,
  password,
}: SendEmailArgs) => {
  const { user, pass } = await resolveMailbox(name, password);

  // Without this the failure surfaces as an opaque nodemailer auth error, and
  // every caller wraps sending in a try/catch that only logs.
  if (!user || !pass) {
    throw new Error(
      "No outbound mailbox configured. Set it on the dashboard Settings screen, " +
        "or provide EMAIL_USER and EMAIL_PASS."
    );
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `United Fly Airlines <${user}>`,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });
};

export default sendEmail;
