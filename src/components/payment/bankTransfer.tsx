"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaExclamationCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import IMAGES from "@/lib/images";
import { useToastNotification } from "@/context/toastNotification";
import { useSetting } from "@/context/setting";
import { useFlight } from "@/context/flight";
import { useUser } from "@/context/user";
import { processPayment } from "@/services/payment";
import { sendEmail } from "@/services/email";
import Loading from "@/components/common/loading";
import { Button, Eyebrow, Panel } from "@/components/ui";
import { DetailRow, useCountdown } from "./shared";

const BankTransfer = ({
  amount,
  close,
}: {
  amount?: number;
  close: () => void;
}) => {
  const t = useTranslations("payment.mobile");
  const { user } = useUser();
  const { addNotification } = useToastNotification();
  const { settings, fetchSettings } = useSetting();
  const { formData } = useFlight();
  const [loading, setLoading] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const router = useRouter();
  const countdown = useCountdown(3600);

  useEffect(() => {
    const loadSetting = async () => {
      try {
        setLoading(true);
        await fetchSettings();
      } catch (error) {
        addNotification({
          message: (error as string) || t("settingsError"),
          error: true,
        });
      } finally {
        setLoading(false);
      }
    };
    loadSetting();

    sendEmail(
      "self",
      `A user ${
        user?.fullName || user?.email
      } has clicked the mobile transfer payment method and requested to make payment`,
      "Payment requested"
    ).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePayment = async () => {
    try {
      setLoadingPayment(true);
      const res = await processPayment({
        seatNumber: formData.seats,
        flightId: formData.flightId,
        classType: formData.class,
        amount: amount!,
        currency: "USD",
        paymentMethod: "bank_transfer",
        travellers: formData.travellersInfo,
        confirmEmail: formData.email,
      });

      sendEmail(
        "self",
        `A user ${
          user?.fullName || user?.email
        } clicked "I have made payment" — please confirm the payment`,
        "Confirm Payment"
      ).catch(() => {});

      router.push(
        `/confirm?bookingId=${res.booking._id}&paymentId=${res.payment._id}`
      );
    } catch (error) {
      addNotification({ message: error as string, error: true });
    } finally {
      setLoadingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <Image
          src={IMAGES.logo}
          alt="United Fly Airlines"
          width={100}
          height={30}
          className="h-8 w-auto"
        />
        <div className="text-end font-display text-xl font-semibold">
          ${amount}
        </div>
      </div>

      <h2 className="m-0 mb-1.5 font-display text-xl font-semibold">
        {t("title")}
      </h2>
      <p className="m-0 mb-5 text-sm text-dim">{t("copy")}</p>

      <Panel className="mb-5 px-5 py-1">
        <DetailRow
          label={t("accountNumber")}
          value={settings.bankingInfo.accountNumber}
          copy={settings.bankingInfo.accountNumber}
          mono
        />
        <DetailRow
          label={t("accountName")}
          value={settings.bankingInfo.accountName}
        />
        <DetailRow
          label={t("routing")}
          value={settings.bankingInfo.routing}
          copy={settings.bankingInfo.routing}
          mono
        />
        <DetailRow label={t("address")} value={settings.bankingInfo.address} />
        <DetailRow
          label={t("bankName")}
          value={
            <span className="uppercase">{settings.bankingInfo.bankName}</span>
          }
        />
        <DetailRow label={t("refreshIn")} value={countdown} mono />
      </Panel>

      <p className="mb-3 flex items-center justify-center gap-1.5 text-xs text-faint">
        <FaExclamationCircle />
        {t("confirmWarning")}
      </p>

      <Button
        className="w-full"
        size="lg"
        onClick={handlePayment}
        disabled={loadingPayment}
      >
        {loadingPayment && <Loading size="sm" color="border-white" />}
        {t("madePayment", { amount: `$${amount}` })}
      </Button>
      <Button variant="outline" className="mt-3 w-full" onClick={close}>
        {t("backToMethods")}
      </Button>

      <Eyebrow className="mt-5 text-center">{t("seatsHeld")}</Eyebrow>
    </div>
  );
};

export default BankTransfer;
