"use client";

import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { BiChevronRight } from "react-icons/bi";
import { FaPaperPlane } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IUser } from "@/types/user";
import { Eyebrow } from "@/components/ui";

interface FAQProps {
  articles: { _id: string; topic: string }[];
  setScreen: (screen: string) => void;
  setShowSupport: (value: boolean) => void;
  user: IUser | null;
}

const questionKeys = ["nameChange", "refunds", "baggage", "visa"] as const;

const FAQ: React.FC<FAQProps> = ({
  articles,
  setScreen,
  setShowSupport,
  user,
}) => {
  const t = useTranslations("support.faq");
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleContinue = () => setScreen(user ? "chat" : "form");

  const results = questionKeys
    .map((key) => ({ key, label: t("questions." + key) }))
    .filter((question) =>
      question.label.toLowerCase().includes(query.toLowerCase())
    );

  return (
    <div className="flex-1 overflow-y-auto p-4 scrollbar-slim">
      <div className="mb-3 rounded-card border border-line bg-panel p-4">
        <Eyebrow className="mb-3">{t("title")}</Eyebrow>

        <div className="mb-2 flex items-center gap-2 rounded-full border border-line-strong px-3 py-2">
          <FiSearch className="text-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-fg outline-hidden"
            placeholder={t("searchPlaceholder")}
          />
        </div>

        <div>
          {articles.map((article) => (
            <div
              key={article._id}
              onClick={() => {
                setShowSupport(false);
                router.push(`/articles/${article._id}`);
              }}
              className="flex cursor-pointer items-center justify-between px-1 py-2.5 text-sm text-muted transition-colors hover:text-accent-bright"
            >
              <span>{article.topic}</span>
              <BiChevronRight size={18} />
            </div>
          ))}

          {results.map((question) => (
            <div
              key={question.key}
              className="flex items-center justify-between border-b border-line-soft px-1 py-2.5 text-[13px] text-muted last:border-b-0"
            >
              <span>{question.label}</span>
              <span className="text-faint">+</span>
            </div>
          ))}
          {!results.length && !articles.length && (
            <p className="px-1 py-3 text-[13px] text-faint">{t("noMatch")}</p>
          )}
        </div>
      </div>

      <div className="rounded-card border border-line bg-panel p-4">
        <Eyebrow className="mb-3">{t("startTitle")}</Eyebrow>
        <p className="m-0 mb-4 text-[13px] leading-relaxed text-dim">
          {t("startCopy")}
        </p>
        <button
          onClick={handleContinue}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          <FaPaperPlane />
          <span>{t("startCta")}</span>
        </button>
      </div>
    </div>
  );
};

export default FAQ;
