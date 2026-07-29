"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CiBank, CiPhone } from "react-icons/ci";
import { FaCreditCard } from "react-icons/fa6";
import { MdCurrencyBitcoin } from "react-icons/md";
import { SiCashapp } from "react-icons/si";
import { useFlight, IFlight } from "@/context/flight";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import Loading from "@/components/common/loading";
import Modal from "@/components/common/modal";
import FareSummary from "@/components/payment/fareSummary";
import BankTransfer from "@/components/payment/bankTransfer";
import LinkTransfer from "@/components/payment/linkTransfer";
import CryptoPayment from "@/components/payment/cryptoPayment";
import CardPayment from "@/components/payment/cardPayment";
import CashApp from "@/components/payment/cashApp";
import { Button, Eyebrow, StatusDot, Stepper } from "@/components/ui";

type Sheet = "mobile" | "bank" | "card" | "crypto" | "cashapp" | null;

const methods: {
  key: Exclude<Sheet, null>;
  icon: React.ElementType;
  title: string;
  copy: string;
}[] = [
  {
    key: "mobile",
    icon: CiPhone,
    title: "Mobile transfer",
    copy: "Securely transfer funds directly from your mobile bank account.",
  },
  {
    key: "bank",
    icon: CiBank,
    title: "Bank transfer",
    copy: "Securely transfer funds directly from your bank account.",
  },
  {
    key: "card",
    icon: FaCreditCard,
    title: "Credit / debit card",
    copy: "Pay instantly using Visa, Mastercard or Verve.",
  },
  {
    key: "crypto",
    icon: MdCurrencyBitcoin,
    title: "Cryptocurrency",
    copy: "Pay using Bitcoin, Ethereum or other cryptocurrencies.",
  },
  {
    key: "cashapp",
    icon: SiCashapp,
    title: "Cash App",
    copy: "Send the amount due to our Cash App tag.",
  },
];

export default function Payment() {
  const { getFlight, formData } = useFlight();
  const [flight, setFlight] = useState<IFlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState<Sheet>(null);
  const router = useRouter();

  useEffect(() => {
    const loadFlight = async () => {
      if (!formData.flightId) {
        router.back();
        return;
      }
      try {
        setLoading(true);
        setError("");
        setFlight(await getFlight(formData.flightId));
      } catch (err) {
        setError(err as string);
      } finally {
        setLoading(false);
      }
    };
    loadFlight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const amount =
    flight?.price && formData.type === "Round Trip"
      ? flight.price * 2
      : flight?.price;

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Navbar compact />
      <Stepper
        steps={["Search", "Passengers & seats", "Payment", "Ticket issued"]}
        current={3}
      />

      {loading ? (
        <div className="flex h-[70vh] items-center justify-center">
          <Loading />
        </div>
      ) : error ? (
        <div className="px-4 py-24 text-center text-danger md:px-12">
          {error}
        </div>
      ) : (
        <div className="grid items-start gap-5 px-4 py-10 pb-16 md:px-12 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
          <main>
            <div className="mb-2 flex items-center gap-2 text-xs text-success">
              <StatusDot tone="success" />
              Secure checkout · PCI DSS
            </div>
            <h1 className="m-0 mb-2 text-3xl font-semibold tracking-[-0.035em] md:text-[40px]">
              How would you like to pay?
            </h1>
            <p className="m-0 mb-7 text-sm text-dim">
              {formData.seats.length > 0
                ? `Seats ${formData.seats.join(", ")} held for you`
                : "Your seats are held while you pay"}
            </p>

            <div className="flex flex-col gap-2.5">
              {methods.map((method) => (
                <div
                  key={method.key}
                  className="flex flex-col gap-4 rounded-card border border-line bg-panel p-5 md:flex-row md:items-center"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-control border border-line-strong bg-field text-xl text-accent-tint">
                    <method.icon />
                  </span>
                  <div className="flex-1">
                    <div className="font-display text-[17px] font-semibold">
                      {method.title}
                    </div>
                    <div className="mt-1 text-[13px] text-dim">
                      {method.copy}
                    </div>
                  </div>
                  <Button
                    className="shrink-0"
                    onClick={() => setSheet(method.key)}
                  >
                    Proceed
                  </Button>
                </div>
              ))}
            </div>

            <Eyebrow className="mt-6">
              You will not be charged until you confirm
            </Eyebrow>
          </main>

          <FareSummary flight={flight} />
        </div>
      )}

      <Modal isOpen={sheet === "mobile"} onClose={() => setSheet(null)}>
        <BankTransfer amount={amount} close={() => setSheet(null)} />
      </Modal>

      <Modal isOpen={sheet === "bank"} onClose={() => setSheet(null)}>
        {sheet === "bank" && (
          <LinkTransfer amount={amount} close={() => setSheet(null)} />
        )}
      </Modal>

      <Modal isOpen={sheet === "crypto"} onClose={() => setSheet(null)}>
        <CryptoPayment price={amount} />
      </Modal>

      <Modal isOpen={sheet === "card"} onClose={() => setSheet(null)}>
        <CardPayment />
      </Modal>

      <Modal isOpen={sheet === "cashapp"} onClose={() => setSheet(null)}>
        <CashApp price={amount} />
      </Modal>

      <Footer />
    </div>
  );
}
