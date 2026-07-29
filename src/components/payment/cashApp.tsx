"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { useToastNotification } from "@/context/toastNotification";
import { useSetting } from "@/context/setting";
import { useFlight } from "@/context/flight";
import { useUser } from "@/context/user";
import { processPayment } from "@/services/payment";
import { sendEmail } from "@/services/email";
import Loading from "@/components/common/loading";
import { Button, Panel } from "@/components/ui";
import { DetailRow, useCountdown } from "./shared";

const CashApp: React.FC<{ price?: number }> = ({ price }) => {
  const { user } = useUser();
  const { addNotification } = useToastNotification();
  const { formData } = useFlight();
  const { settings, fetchSettings } = useSetting();
  const router = useRouter();

  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeLeft = useCountdown(15 * 60 + 56);

  useEffect(() => {
    const loadSetting = async () => {
      try {
        setLoading(true);
        await fetchSettings();
      } catch (error) {
        addNotification({
          message: (error as string) || "An error occurred loading settings.",
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
      } clicked Cash App payment and requested to make payment.`,
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
        amount: price!,
        currency: "USD",
        paymentMethod: "cashApp",
        travellers: formData.travellersInfo,
        confirmEmail: formData.email,
      });

      sendEmail(
        "self",
        `A user ${
          user?.fullName || user?.email
        } clicked "I have made payment" for Cash App.`,
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
      <h2 className="m-0 mb-1.5 font-display text-xl font-semibold">Cash App</h2>
      <p className="m-0 mb-5 text-sm text-dim">
        Send the amount due to the tag below.
      </p>

      <div className="flex flex-col items-center">
        <div className="rounded-card bg-white p-3">
          <QRCodeSVG value={settings.cashApp.tag || "unitedfly"} size={120} />
        </div>
        <p className="mt-3 text-center font-mono text-sm break-all text-dim">
          {settings.cashApp.tag}
        </p>
      </div>

      <Panel className="mt-5 px-5 py-1">
        <DetailRow label="Amount due" value={`$${price}`} mono />
        <DetailRow label="Name" value={settings.cashApp.name} />
        <DetailRow
          label="Cash tag"
          value={settings.cashApp.tag}
          copy={settings.cashApp.tag}
          mono
        />
        <DetailRow label="Time left to pay" value={timeLeft} mono />
      </Panel>

      <Button
        className="mt-5 w-full"
        size="lg"
        onClick={handlePayment}
        disabled={loadingPayment}
      >
        {loadingPayment && <Loading size="sm" color="border-white" />}I have
        made payment (${price})
      </Button>
    </div>
  );
};

export default CashApp;
