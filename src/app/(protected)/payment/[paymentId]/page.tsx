"use client";

import { useState, useEffect, ChangeEvent, useCallback } from "react";
import moment from "moment";
import { useParams, useRouter } from "next/navigation";
import { FaExclamationCircle } from "react-icons/fa";
import { useSetting } from "@/context/setting";
import { useToastNotification } from "@/context/toastNotification";
import { sendEmail } from "@/services/email";
import { getPaymentByToken, updatePaymentImage } from "@/services/payment";
import { compressImageUpload } from "@/utils/image";
import { IPayment } from "@/context/payment";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import Loading from "@/components/common/loading";
import { Button, Eyebrow, Panel } from "@/components/ui";
import { DetailRow } from "@/components/payment/shared";

/**
 * Pay-by-link page. An admin generates the token, the customer opens it here,
 * reads the bank details and uploads a transfer receipt.
 */
export default function BookingPayment() {
  const { addNotification } = useToastNotification();
  const { settings, fetchSettings } = useSetting();
  const params = useParams<{ paymentId: string }>();
  const paymentId = params?.paymentId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [payment, setPayment] = useState<IPayment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState("");

  const load = useCallback(async () => {
    if (!paymentId) return;
    try {
      setLoading(true);
      await fetchSettings();
      const res = await getPaymentByToken(paymentId);
      setPayment(res);
      setImage(res?.image || "");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePayment = async () => {
    try {
      if (!paymentId) return;
      setLoadingPayment(true);

      const res = await updatePaymentImage(paymentId, image);
      setPayment(res);

      sendEmail(
        "self",
        `A user ${
          payment?.userId?.fullName || payment?.userId?.email
        } has uploaded a payment receipt`,
        "Uploaded Payment Receipt"
      ).catch(() => {});

      router.push(`/confirm?paymentId=${paymentId}`);
    } catch (error) {
      addNotification({ message: error as string, error: true });
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) throw Error("No image found");

      setImage(await compressImageUpload(file, 1024));
      addNotification({ message: "Receipt uploaded" });
    } catch {
      addNotification({ message: "Failed uploading image", error: true });
    } finally {
      setUploading(false);
    }
  };

  const flight = payment?.bookingId?.flightId;

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Navbar compact />

      {loading ? (
        <div className="flex h-[60vh] w-full items-center justify-center">
          <Loading />
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-4 py-12 md:px-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <Eyebrow className="mb-2">Complete your payment</Eyebrow>
              <h1 className="m-0 text-3xl font-semibold md:text-[36px]">
                Bank transfer
              </h1>
            </div>
            <div className="text-right font-display text-2xl font-semibold">
              ${payment?.amount ?? flight?.price}
            </div>
          </div>

          {flight && (
            <Panel className="mb-4 px-5 py-1">
              <DetailRow
                label="Route"
                value={`${flight.origin?.city} (${flight.origin?.code}) → ${flight.destination?.city} (${flight.destination?.code})`}
              />
              <DetailRow label="Flight" value={flight.flightNumber} mono />
              <DetailRow
                label="Departs"
                value={moment(flight.departureTime).format("ddd D MMM · HH:mm")}
              />
              <DetailRow
                label="Arrives"
                value={moment(flight.arrivalTime).format("ddd D MMM · HH:mm")}
              />
              <DetailRow label="Class" value={payment?.bookingId?.class} />
            </Panel>
          )}

          <p className="mb-3 text-sm text-dim">
            Make the transfer to the account details provided, then upload your
            receipt.
          </p>

          <Panel className="mb-5 px-5 py-1">
            <DetailRow
              label="Account number"
              value={settings.bankingInfo.accountNumber}
              copy={settings.bankingInfo.accountNumber}
              mono
            />
            <DetailRow
              label="Account name"
              value={settings.bankingInfo.accountName}
            />
            <DetailRow
              label="Bank name"
              value={
                <span className="uppercase">
                  {settings.bankingInfo.bankName}
                </span>
              }
            />
            <DetailRow
              label="Routing"
              value={settings.bankingInfo.routing}
              copy={settings.bankingInfo.routing}
              mono
            />
            <DetailRow label="Address" value={settings.bankingInfo.address} />
          </Panel>

          <p className="mb-4 flex items-center justify-center gap-1.5 text-xs text-faint">
            <FaExclamationCircle />
            Only confirm if you have made the transfer
          </p>

          {!image ? (
            <label
              htmlFor="receipt"
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-btn bg-accent px-6 py-4 font-display text-[15px] font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              {uploading && <Loading size="sm" color="border-white" />}
              Upload receipt
              <input
                type="file"
                id="receipt"
                accept="image/*"
                className="sr-only"
                onChange={handleImageUpload}
              />
            </label>
          ) : (
            <div className="w-full">
              <img
                src={image}
                alt="Payment receipt"
                className="mb-4 max-h-96 w-full rounded-card border border-line object-contain"
              />
              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={loadingPayment}
              >
                {loadingPayment && <Loading size="sm" color="border-white" />}
                Confirm payment
              </Button>
              <button
                onClick={() => setImage("")}
                className="mt-3 w-full cursor-pointer text-center text-[13px] text-dim transition-colors hover:text-fg"
              >
                Choose a different receipt
              </button>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
