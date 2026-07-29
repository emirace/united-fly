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
import { Button, Field, Panel, Select } from "@/components/ui";
import { DetailRow, shortAddress, useCountdown } from "./shared";

type Crypto = {
  name: string;
  network: string;
  address: string;
  rate: number;
};

const CryptoPayment: React.FC<{ price?: number }> = ({ price }) => {
  const { user } = useUser();
  const { addNotification } = useToastNotification();
  const { formData } = useFlight();
  const { settings, fetchSettings } = useSetting();
  const router = useRouter();

  const [loadingPayment, setLoadingPayment] = useState(false);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
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
      } clicked crypto payment and requested to make payment.`,
      "Payment requested"
    ).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCrypto && price) setAmount(selectedCrypto.rate * price);
  }, [selectedCrypto, price]);

  const handlePayment = async () => {
    if (!selectedCrypto) return;
    try {
      setLoadingPayment(true);
      const res = await processPayment({
        seatNumber: formData.seats,
        flightId: formData.flightId,
        classType: formData.class,
        amount,
        currency: selectedCrypto.name,
        paymentMethod: "crypto",
        travellers: formData.travellersInfo,
        confirmEmail: formData.email,
      });

      sendEmail(
        "self",
        `A user ${user?.fullName || user?.email} clicked "I have made payment" for ${
          selectedCrypto.name
        }.`,
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
      <h2 className="m-0 mb-4 font-display text-xl font-semibold">
        Pay with cryptocurrency
      </h2>

      <Field label="Select a coin">
        <Select
          value={selectedCrypto?.name || ""}
          onChange={(e) =>
            setSelectedCrypto(
              settings.cryptoInfo.find((c) => c.name === e.target.value) || null
            )
          }
        >
          <option value="">Select a cryptocurrency</option>
          {settings.cryptoInfo.map((crypto) => (
            <option key={crypto.name} value={crypto.name}>
              {crypto.name} ({crypto.network})
            </option>
          ))}
        </Select>
      </Field>

      {selectedCrypto && (
        <>
          <p className="mt-5 mb-4 text-center text-sm text-dim">
            Send the amount due to the address below. Only send{" "}
            <span className="text-fg capitalize">{selectedCrypto.name}</span> to
            this address.
          </p>

          <div className="flex flex-col items-center">
            <div className="rounded-card bg-white p-3">
              <QRCodeSVG value={selectedCrypto.address} size={120} />
            </div>
            <p className="mt-3 text-center font-mono text-xs break-all text-dim">
              {selectedCrypto.address}
            </p>
          </div>

          <Panel className="mt-5 px-5 py-1">
            <DetailRow
              label="Amount due"
              value={`${amount} ${selectedCrypto.name}`}
              mono
            />
            <DetailRow
              label="Wallet address"
              value={shortAddress(selectedCrypto.address)}
              copy={selectedCrypto.address}
              mono
            />
            <DetailRow label="Network" value={selectedCrypto.network} />
            <DetailRow label="Time left to pay" value={timeLeft} mono />
          </Panel>

          <Button
            className="mt-5 w-full"
            size="lg"
            onClick={handlePayment}
            disabled={loadingPayment}
          >
            {loadingPayment && <Loading size="sm" color="border-white" />}I have
            made payment ({amount} {selectedCrypto.name})
          </Button>
        </>
      )}
    </div>
  );
};

export default CryptoPayment;
