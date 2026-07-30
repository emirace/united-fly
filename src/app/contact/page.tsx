"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslations } from "next-intl";
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

const faqKeys = ["nameChange", "refunds", "baggage", "visa"] as const;

const emptyForm = {
  name: "",
  email: "",
  mobile: "",
  reference: "",
  message: "",
};

export default function Contact() {
  const t = useTranslations("contact");
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
      addNotification({ message: t("errors.required"), error: true });
      return;
    }
    if (!agreed) {
      addNotification({ message: t("errors.terms"), error: true });
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
      addNotification({ message: t("sent") });
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
          <Eyebrow className="mb-3.5">{t("eyebrow")}</Eyebrow>
          <h1 className="m-0 mb-3.5 text-4xl leading-[1.02] font-semibold tracking-[-0.035em] text-balance md:text-[52px]">
            {t("title")}
          </h1>
          <p className="m-0 text-base leading-relaxed text-dim">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Panel className="p-6">
            <Eyebrow className="mb-4 text-accent">{t("call.label")}</Eyebrow>
            <h3 className="m-0 mb-2 font-display text-[19px] font-semibold">
              {t("call.title")}
            </h3>
            <p className="m-0 mb-4 text-[13px] leading-relaxed text-dim">
              {t("call.copy")}
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
            <Eyebrow className="mb-4 text-accent">{t("email.label")}</Eyebrow>
            <h3 className="m-0 mb-2 font-display text-[19px] font-semibold">
              {t("email.title")}
            </h3>
            <p className="m-0 mb-4 text-[13px] leading-relaxed text-dim">
              {t("email.copy")}
            </p>
            <a
              href={`mailto:${supportEmail}`}
              className="text-sm break-all text-accent-tint transition-colors hover:text-accent-bright"
            >
              {supportEmail}
            </a>
          </Panel>

          <Panel className="p-6">
            <Eyebrow className="mb-4 text-accent">{t("chat.label")}</Eyebrow>
            <h3 className="m-0 mb-2 font-display text-[19px] font-semibold">
              {t("chat.title")}
            </h3>
            <p className="m-0 mb-4 text-[13px] leading-relaxed text-dim">
              {t("chat.copy")}
            </p>
            <div className="flex items-center gap-2 text-[13px] text-success">
              <StatusDot tone="success" pulse />
              {t("chat.online")}
            </div>
          </Panel>
        </div>
      </section>

      <section className="grid items-center gap-10 px-4 pt-16 md:px-12 lg:grid-cols-2">
        <div className="flex items-center justify-center rounded-panel bg-plate p-9">
          <Image
            src={IMAGES.contact}
            alt={t("imageAlt")}
            width={420}
            height={420}
            className="h-auto w-full max-w-[420px]"
          />
        </div>

        <div>
          <h2 className="m-0 mb-5 text-3xl font-semibold tracking-[-0.03em] md:text-[34px]">
            {t("form.title")}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-3.5 sm:grid-cols-2"
          >
            <Field label={t("form.name")}>
              <Input name="name" value={form.name} onChange={handleChange} />
            </Field>
            <Field label={t("form.email")}>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </Field>
            <Field label={t("form.mobile")}>
              <Input
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
              />
            </Field>
            <Field label={t("form.reference")}>
              <Input
                name="reference"
                value={form.reference}
                onChange={handleChange}
                placeholder="BOOK-1A2B3C4D"
                className="font-mono tracking-[0.1em]"
              />
            </Field>
            <Field label={t("form.message")} className="sm:col-span-2">
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
              {t("form.terms")}
            </label>

            <Button
              type="submit"
              size="lg"
              className="sm:col-span-2"
              disabled={sending}
            >
              {sending ? t("form.sending") : t("form.submit")}
            </Button>
          </form>
        </div>
      </section>

      <section className="px-4 pt-16 pb-4 md:px-12">
        <h2 className="m-0 mb-5 text-2xl font-semibold tracking-[-0.03em] md:text-[30px]">
          {t("faq.title")}
        </h2>
        <div className="overflow-hidden rounded-card border border-line">
          {faqKeys.map((key) => (
            <button
              key={key}
              onClick={() => setOpenFaq(openFaq === key ? null : key)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 border-b border-line-soft bg-panel px-6 py-5 text-start text-[15px] text-fg transition-colors last:border-b-0 hover:bg-white/3"
            >
              {t("faq." + key)}
              <span className="text-faint">{openFaq === key ? "–" : "+"}</span>
            </button>
          ))}
        </div>
        {openFaq && <p className="mt-4 text-sm text-dim">{t("faq.answer")}</p>}
      </section>

      {settings.whatsApp && (
        <a
          href={settings.whatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed end-6 bottom-24 z-50 flex size-13 items-center justify-center rounded-full bg-success text-ink shadow-[0_16px_36px_-12px_rgba(91,214,166,0.8)] transition-transform hover:scale-105"
          aria-label="WhatsApp"
        >
          <FaWhatsapp className="text-2xl" />
        </a>
      )}

      <Footer />
    </div>
  );
}
