"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useToastNotification } from "@/context/toastNotification";
import { useFlight } from "@/context/flight";
import { useUser } from "@/context/user";
import { generatePaymentLink } from "@/services/payment";
import { sendEmail } from "@/services/email";
import Loading from "@/components/common/loading";
import { Panel } from "@/components/ui";
import { DetailRow } from "./shared";

const LinkTransfer = ({
  amount,
  close,
}: {
  amount?: number;
  close: () => void;
}) => {
  const t = useTranslations("payment.bank");
  const { user } = useUser();
  const { addNotification } = useToastNotification();
  const { formData } = useFlight();
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState("");

  useEffect(() => {
    const handlePayment = async () => {
      try {
        setLoading(true);
        const res = await generatePaymentLink({
          seatNumber: formData.seats,
          flightId: formData.flightId,
          classType: formData.class,
          amount: amount!,
          currency: "USD",
          paymentMethod: "bank_transfer",
          travellers: formData.travellersInfo,
          confirmEmail: formData.email,
        });
        setLink(res);
      } catch (error) {
        addNotification({ message: error as string, error: true });
        close();
      } finally {
        setLoading(false);
      }
    };
    handlePayment();

    sendEmail(
      "self",
      `A user ${
        user?.fullName || user?.email
      } has clicked the bank transfer payment method and requested to make payment`,
      "Payment requested"
    ).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-5 text-sm text-dim">
        {t("generating")}
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="m-0 mb-1.5 font-display text-xl font-semibold">
        {t("title")}
      </h2>
      <p className="m-0 mb-5 text-sm text-dim">{t("copy")}</p>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center rounded-btn bg-accent px-6 py-4 font-display text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        {t("makePayment", { amount: `$${amount}` })}
      </a>

      <Panel className="mt-5 px-5 py-1">
        <DetailRow label={t("paymentLink")} value={link} copy={link} mono />
      </Panel>
    </div>
  );
};

export default LinkTransfer;
