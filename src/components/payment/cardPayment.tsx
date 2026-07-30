"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Loading from "@/components/common/loading";
import { Eyebrow } from "@/components/ui";

const CardPayment: React.FC = () => {
  const t = useTranslations("payment.card");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex w-full justify-center py-14">
      {loading ? (
        <Loading />
      ) : (
        <div className="text-center">
          <Eyebrow className="mb-3">{t("unavailable")}</Eyebrow>
          <p className="m-0 text-lg text-danger">{t("notAvailable")}</p>
          <p className="m-0 mt-2 text-sm text-dim">{t("chooseAnother")}</p>
        </div>
      )}
    </div>
  );
};

export default CardPayment;
