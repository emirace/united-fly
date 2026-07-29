"use client";

import { useState, useEffect } from "react";
import Loading from "@/components/common/loading";
import { Eyebrow } from "@/components/ui";

const CardPayment: React.FC = () => {
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
          <Eyebrow className="mb-3">Unavailable</Eyebrow>
          <p className="m-0 text-lg text-danger">
            Card payment is currently not available.
          </p>
          <p className="m-0 mt-2 text-sm text-dim">
            Please choose another payment method.
          </p>
        </div>
      )}
    </div>
  );
};

export default CardPayment;
