"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import IMAGES from "@/lib/images";
import { useSetting } from "@/context/setting";
import { useToastNotification } from "@/context/toastNotification";
import { sendEmail } from "@/services/email";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import {
  Button,
  Eyebrow,
  Field,
  Input,
  Panel,
  StatusDot,
  Textarea,
} from "@/components/ui";

const faqs = [
  "Can I change the name on a ticket?",
  "How long do refunds take?",
  "What baggage is included in my fare?",
  "Do I need a visa for a layover?",
];

const emptyForm = {
  name: "",
  email: "",
  mobile: "",
  reference: "",
  message: "",
};

export default function Contact() {
  const { settings, fetchSettings } = useSetting();
  const { addNotification } = useToastNotification();
  const [form, setForm] = useState(emptyForm);
  const [agreed, setAgreed] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const supportEmail = settings.mail.name || "info@unitedflyairlines.com";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      addNotification({
        message: "Name, email and message are required.",
        error: true,
      });
      return;
    }
    if (!agreed) {
      addNotification({
        message: "Please accept the terms and conditions.",
        error: true,
      });
      return;
    }

    try {
      setSending(true);
      // "self" routes to the support inbox configured in dashboard settings.
      await sendEmail(
        "self",
        `From: ${form.name} <${form.email}>\nMobile: ${
          form.mobile || "—"
        }\nBooking reference: ${form.reference || "—"}\n\n${form.message}`,
        `Contact form — ${form.name}`
      );
      addNotification({ message: "Message sent. We'll be in touch shortly." });
      setForm(emptyForm);
      setAgreed(false);
    } catch (error) {
      addNotification({ message: error as string, error: true });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[1440px]">
      <Navbar compact />

      <section className="px-4 pt-14 md:px-12">
        <div className="max-w-[60ch]">
          <Eyebrow className="mb-3.5">Support · 24/7</Eyebrow>
          <h1 className="m-0 mb-3.5 text-4xl leading-[1.02] font-semibold tracking-[-0.035em] text-balance md:text-[52px]">
            Talk to a person, not a queue.
          </h1>
          <p className="m-0 text-base leading-relaxed text-dim">
            Average first response under four minutes, any hour, any timezone.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Panel className="p-6">
            <Eyebrow className="mb-4 text-accent">Call</Eyebrow>
            <h3 className="m-0 mb-2 font-display text-[19px] font-semibold">
              Speak to the desk
            </h3>
            <p className="m-0 mb-4 text-[13px] leading-relaxed text-dim">
              Fastest for same-day changes and cancellations.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="tel:+2226543677"
                className="font-mono text-sm text-accent-tint transition-colors hover:text-accent-bright"
              >
                +(222) 6543 677
              </a>
              <a
                href="tel:+2224567586"
                className="font-mono text-sm text-dim transition-colors hover:text-fg"
              >
                +(222) 4567 586
              </a>
            </div>
          </Panel>

          <Panel className="p-6">
            <Eyebrow className="mb-4 text-accent">Email</Eyebrow>
            <h3 className="m-0 mb-2 font-display text-[19px] font-semibold">
              Send the details
            </h3>
            <p className="m-0 mb-4 text-[13px] leading-relaxed text-dim">
              Best for refunds, receipts and documentation.
            </p>
            <a
              href={`mailto:${supportEmail}`}
              className="text-sm break-all text-accent-tint transition-colors hover:text-accent-bright"
            >
              {supportEmail}
            </a>
          </Panel>

          <Panel className="p-6">
            <Eyebrow className="mb-4 text-accent">Chat</Eyebrow>
            <h3 className="m-0 mb-2 font-display text-[19px] font-semibold">
              Live chat &amp; WhatsApp
            </h3>
            <p className="m-0 mb-4 text-[13px] leading-relaxed text-dim">
              Continue the conversation from any device.
            </p>
            <div className="flex items-center gap-2 text-[13px] text-success">
              <StatusDot tone="success" pulse />
              Agents online now
            </div>
          </Panel>
        </div>
      </section>

      <section className="grid items-center gap-10 px-4 pt-16 md:px-12 lg:grid-cols-2">
        <div className="flex items-center justify-center rounded-panel bg-plate p-9">
          <Image
            src={IMAGES.contact}
            alt="Traveller"
            width={420}
            height={420}
            className="h-auto w-full max-w-[420px]"
          />
        </div>

        <div>
          <h2 className="m-0 mb-5 text-3xl font-semibold tracking-[-0.03em] md:text-[34px]">
            Send us a message
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-3.5 sm:grid-cols-2"
          >
            <Field label="Your name">
              <Input name="name" value={form.name} onChange={handleChange} />
            </Field>
            <Field label="Email address">
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </Field>
            <Field label="Mobile number">
              <Input
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
              />
            </Field>
            <Field label="Booking reference (optional)">
              <Input
                name="reference"
                value={form.reference}
                onChange={handleChange}
                placeholder="BOOK-1A2B3C4D"
                className="font-mono tracking-[0.1em]"
              />
            </Field>
            <Field label="How can we help?" className="sm:col-span-2">
              <Textarea
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
              />
            </Field>

            <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-dim sm:col-span-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="size-4"
              />
              I agree to the terms and conditions.
            </label>

            <Button
              type="submit"
              size="lg"
              className="sm:col-span-2"
              disabled={sending}
            >
              {sending ? "Sending…" : "Send message"}
            </Button>
          </form>
        </div>
      </section>

      <section className="px-4 pt-16 pb-4 md:px-12">
        <h2 className="m-0 mb-5 text-2xl font-semibold tracking-[-0.03em] md:text-[30px]">
          Common questions
        </h2>
        <div className="overflow-hidden rounded-card border border-line">
          {faqs.map((question) => (
            <button
              key={question}
              onClick={() => setOpenFaq(openFaq === question ? null : question)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 border-b border-line-soft bg-panel px-6 py-5 text-left text-[15px] text-fg transition-colors last:border-b-0 hover:bg-white/3"
            >
              {question}
              <span className="text-faint">
                {openFaq === question ? "–" : "+"}
              </span>
            </button>
          ))}
        </div>
        {openFaq && (
          <p className="mt-4 text-sm text-dim">
            Our support desk can answer this directly — call, email or start a
            chat above and quote your booking reference.
          </p>
        )}
      </section>

      {settings.whatsApp && (
        <a
          href={settings.whatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-6 bottom-24 z-50 flex size-13 items-center justify-center rounded-full bg-success text-ink shadow-[0_16px_36px_-12px_rgba(91,214,166,0.8)] transition-transform hover:scale-105"
          aria-label="WhatsApp"
        >
          <FaWhatsapp className="text-2xl" />
        </a>
      )}

      <Footer />
    </div>
  );
}
