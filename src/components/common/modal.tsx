"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { IoClose } from "react-icons/io5";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const t = useTranslations("common");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = "hidden";
    } else {
      const timeout = setTimeout(() => setShow(false), 300);
      document.body.style.overflow = "auto";
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-panel border border-line bg-raised p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] transition-transform duration-300 scrollbar-slim ${
          isOpen ? "scale-100" : "scale-95"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 end-4 cursor-pointer text-faint transition-colors hover:text-fg"
          aria-label={t("close")}
        >
          <IoClose size={22} />
        </button>

        <div className="text-fg">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
