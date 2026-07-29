"use client";

import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { BiChevronRight } from "react-icons/bi";
import { FaPaperPlane } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { IUser } from "@/types/user";
import { Eyebrow } from "@/components/ui";

interface FAQProps {
  articles: { _id: string; topic: string }[];
  setScreen: (screen: string) => void;
  setShowSupport: (value: boolean) => void;
  user: IUser | null;
}

const commonQuestions = [
  "Can I change the name on a ticket?",
  "How long do refunds take?",
  "What baggage is included in my fare?",
  "Do I need a visa for a layover?",
];

const FAQ: React.FC<FAQProps> = ({
  articles,
  setScreen,
  setShowSupport,
  user,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleContinue = () => setScreen(user ? "chat" : "form");

  const results = commonQuestions.filter((question) =>
    question.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 scrollbar-slim">
      <div className="mb-3 rounded-card border border-line bg-panel p-4">
        <Eyebrow className="mb-3">Common questions</Eyebrow>

        <div className="mb-2 flex items-center gap-2 rounded-full border border-line-strong px-3 py-2">
          <FiSearch className="text-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-fg outline-none"
            placeholder="Search a question"
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
              key={question}
              className="flex items-center justify-between border-b border-line-soft px-1 py-2.5 text-[13px] text-muted last:border-b-0"
            >
              <span>{question}</span>
              <span className="text-faint">+</span>
            </div>
          ))}
          {!results.length && !articles.length && (
            <p className="px-1 py-3 text-[13px] text-faint">
              No matching questions — send us a message instead.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-card border border-line bg-panel p-4">
        <Eyebrow className="mb-3">Start a conversation</Eyebrow>
        <p className="m-0 mb-4 text-[13px] leading-relaxed text-dim">
          We will reply as soon as we can, but usually within 2 hours.
        </p>
        <button
          onClick={handleContinue}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-control bg-accent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          <FaPaperPlane />
          <span>Send us a message</span>
        </button>
      </div>
    </div>
  );
};

export default FAQ;
