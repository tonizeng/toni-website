"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import localFont from "next/font/local";
import Fuse from "fuse.js";
import { qaData, type QAEntry } from "@/lib/qa-data";
import TypewriterHeading from "./TypewriterHeading";
import ResumeModal from "./ResumeModal";

const canvaSans = localFont({
  src: "../app/fonts/CanvaSans-Regular.otf",
  weight: "400",
  style: "normal",
  display: "swap",
});

const NO_MATCH_MESSAGE =
  "Hmm, I don't have an answer for that yet — try asking about my background, education, projects, or experience.";

const MAX_SUGGESTIONS = 5;

const QUICK_SELECT: { id: string; label: string }[] = [
  { id: "about-me", label: "background" },
  { id: "job-experience", label: "work experience" },
  { id: "project-experience", label: "projects" },
];

// Inline text that shows an uncropped image in a hover popup — e.g. "(proof)".
function HoverImage({ label, src }: { label: string; src: string }) {
  return (
    <span className="group relative inline-block">
      <span className="cursor-help text-sm text-brand-red underline underline-offset-2">
        {label}
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-brand-pink bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        <Image src={src} alt="" width={240} height={192} className="h-auto w-full" />
      </span>
    </span>
  );
}

// Lightweight markdown-style formatting — "**text**" into <strong>,
// "[label](src)" into a hover-triggered image popup, and
// "[label](ask:entry-id)" into a clickable question link.
function renderFormattedText(text: string, onAsk?: (id: string) => void) {
  return text
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
    .map((part, i) => {
      const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
      if (boldMatch) {
        return (
          <strong key={i} className="text-brand-red">
            {boldMatch[1]}
          </strong>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, target] = linkMatch;
        if (target.startsWith("ask:")) {
          const id = target.slice("ask:".length);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onAsk?.(id)}
              className="text-brand-red underline underline-offset-2 hover:text-brand-red/80"
            >
              {label}
            </button>
          );
        }
        return <HoverImage key={i} label={label} src={target} />;
      }
      return part;
    });
}

function rankByKeyword(query: string, entries: QAEntry[]): QAEntry[] {
  const q = query.toLowerCase();
  const scored: { entry: QAEntry; score: number }[] = [];
  for (const entry of entries) {
    let bestLength = 0;
    for (const keyword of entry.keywords) {
      const lower = keyword.toLowerCase();
      if (q.includes(lower)) bestLength = Math.max(bestLength, lower.length);
    }
    if (bestLength > 0) scored.push({ entry, score: bestLength });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.entry);
}

export default function SearchExperience() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [selected, setSelected] = useState<QAEntry | null>(null);
  const [noMatch, setNoMatch] = useState(false);
  // Sticky once true — once a question has been asked, the layout stays in
  // "bottom bar" mode for the rest of the session, even while typing the
  // next query (which clears `selected`/`noMatch` but shouldn't pop the
  // header back or move the search bar back up).
  const [hasAskedOnce, setHasAskedOnce] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  // First two shuffle clicks are a fixed intro sequence; after that it's
  // random among whatever's left.
  const [randomClickCount, setRandomClickCount] = useState(0);
  const thinkingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (thinkingTimeout.current) clearTimeout(thinkingTimeout.current);
    };
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse<QAEntry>(qaData, {
        keys: [
          { name: "question", weight: 0.5 },
          { name: "keywords", weight: 0.4 },
          { name: "category", weight: 0.1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    []
  );

  const trimmed = query.trim();
  const suggestions = useMemo(() => {
    if (!trimmed) return [];
    const keywordMatches = rankByKeyword(trimmed, qaData);
    // Fuzzy search is a fallback for typos/paraphrasing only — with just a
    // handful of well-separated topics, blending it in whenever a keyword
    // already hit just adds noisy, loosely-related suggestions.
    if (keywordMatches.length > 0) return keywordMatches.slice(0, MAX_SUGGESTIONS);
    return fuse
      .search(trimmed)
      .map((r) => r.item)
      .slice(0, MAX_SUGGESTIONS);
  }, [trimmed, fuse]);

  function handleChange(value: string) {
    setQuery(value);
    setHighlighted(0);
    setIsOpen(true);
  }

  function chooseRandom() {
    let entry: QAEntry | undefined;
    if (randomClickCount === 0) {
      entry = qaData.find((e) => e.id === "why-software-engineering");
    } else if (randomClickCount === 1) {
      entry = qaData.find((e) => e.id === "future-plans");
    } else {
      const remaining = qaData.filter(
        (e) => e.id !== "why-software-engineering" && e.id !== "future-plans"
      );
      entry = remaining[Math.floor(Math.random() * remaining.length)];
    }
    setRandomClickCount((c) => c + 1);
    choose(entry);
  }

  function askById(id: string) {
    choose(qaData.find((e) => e.id === id));
  }

  function resetChat() {
    if (thinkingTimeout.current) clearTimeout(thinkingTimeout.current);
    setRandomClickCount(0);
    setIsThinking(false);
    setQuery("");
    setSelected(null);
    setNoMatch(false);
    setIsOpen(false);
    setHighlighted(0);
    setHasAskedOnce(false);
  }

  function choose(entry: QAEntry | undefined) {
    if (entry) setQuery(entry.question);
    setIsOpen(false);
    setHasAskedOnce(true);
    setIsThinking(true);

    if (thinkingTimeout.current) clearTimeout(thinkingTimeout.current);
    thinkingTimeout.current = setTimeout(() => {
      if (!entry) {
        setSelected(null);
        setNoMatch(true);
      } else {
        setSelected(entry);
        setNoMatch(false);
      }
      setIsThinking(false);
    }, 1100);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && suggestions.length > 0) {
        choose(suggestions[highlighted]);
      } else if (trimmed) {
        choose(undefined);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (isOpen) setHighlighted((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  const showDropdown = isOpen && trimmed && suggestions.length > 0;
  // Keep showing the previous answer while the user types a follow-up —
  // it only gets replaced once they actually pick a new suggestion, not
  // the moment the dropdown opens.
  const showAnswer = Boolean(selected || noMatch);

  function renderInputAndDropdown(direction: "up" | "down", big = false) {
    return (
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => trimmed && setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          placeholder="search about me, my work, projects, experience, and more..."
          className={`w-full rounded-full border-2 border-brand-pink bg-white px-6 py-3 ${big ? "text-base" : "text-base"} text-zinc-800 placeholder:text-zinc-400 focus:border-brand-red focus:outline-none`}
        />
        {showDropdown && (
          <ul
            className={`absolute z-10 w-full overflow-hidden rounded-2xl border border-brand-pink bg-white shadow-lg ${
              direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
          >
            {suggestions.map((entry, i) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(entry)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`block w-full px-6 py-3 text-left text-zinc-700 ${
                    i === highlighted ? "bg-brand-pink/20" : ""
                  }`}
                >
                  {entry.question}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  function renderQuickButtons(big = false) {
    return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`${big ? "text-base" : "text-sm"} text-zinc-500`}>learn more about toni&apos;s:</span>
      {QUICK_SELECT.map(({ id, label }) => {
        const entry = qaData.find((e) => e.id === id);
        if (!entry) return null;
        return (
          <button
            key={id}
            type="button"
            onClick={() => choose(entry)}
            className={`rounded-full bg-brand-red px-4 py-1 ${big ? "text-sm" : "text-sm"} text-white transition-colors hover:bg-brand-red/90`}
          >
            {label}
          </button>
        );
      })}
      <div className="group relative">
        <button
          type="button"
          onClick={chooseRandom}
          aria-label="Ask a random question"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-red transition-colors hover:bg-brand-red/90"
        >
          <Image
            src="/shuffle.svg"
            alt="click to generate random question"
            width={16}
            height={16}
          />
        </button>
        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          click for a random question
        </span>
      </div>
    </div>
    );
  }

  const allParagraphs = (selected ? selected.answer : NO_MATCH_MESSAGE).split(
    "\n\n"
  );
  const answerImages = selected?.images;
  // Images render right after this paragraph index; defaults to the very end.
  const imageInsertIndex = selected?.imageAfterParagraph ?? allParagraphs.length - 1;
  const paragraphsBeforeImages = allParagraphs.slice(0, imageInsertIndex + 1);
  const paragraphsAfterImages = allParagraphs.slice(imageInsertIndex + 1);

  const answerBox = (isThinking || showAnswer) && (
    <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-8 text-zinc-700">
      {isThinking ? (
        <div className="flex items-center gap-2">
          <Image
            src="/octo.png"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 animate-octo-bounce [image-rendering:pixelated]"
          />
          <span className="animate-shimmer text-base font-medium">
            Thinking...
          </span>
        </div>
      ) : selected?.timeline ? (
        <div className="space-y-6">
          <p className="whitespace-pre-line">
            {renderFormattedText(selected.answer, askById)}
          </p>
          <div>
            {selected.timeline.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-red" />
                  {i < selected.timeline!.length - 1 && (
                    <div className="w-px flex-1 bg-brand-pink" />
                  )}
                </div>
                <div className={i < selected.timeline!.length - 1 ? "pb-6" : ""}>
                  <p className="font-semibold text-brand-red">
                    {item.company} | {item.dates}
                  </p>
                  <p className="text-sm text-zinc-500">{item.role}</p>
                  <p className="mt-1">{item.blurb}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setResumeModalOpen(true)}
            className="text-brand-red underline underline-offset-2 hover:text-brand-red/80"
          >
            view my full resume →
          </button>
        </div>
      ) : selected?.projects ? (
        <div className="space-y-6">
          <p className="whitespace-pre-line">
            {renderFormattedText(selected.answer, askById)}
          </p>
          <div>
            {selected.projects.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-red" />
                  {i < selected.projects!.length - 1 && (
                    <div className="w-px flex-1 bg-brand-pink" />
                  )}
                </div>
                <div className={i < selected.projects!.length - 1 ? "pb-6" : ""}>
                  <p className="font-semibold text-brand-red">{item.name}</p>
                  {item.context && (
                    <p className="text-sm text-zinc-500">{item.context}</p>
                  )}
                  <p className="mt-1">{item.description}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-brand-red underline underline-offset-2 hover:text-brand-red/80"
                    >
                      github repo →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {paragraphsBeforeImages.map((para, i) => (
            <p key={`before-${i}`} className="whitespace-pre-line">
              {renderFormattedText(para, askById)}
            </p>
          ))}
          {answerImages && answerImages.length > 0 && (
            <div
              className={
                answerImages.length === 1
                  ? "mx-auto w-[280px]"
                  : "mx-auto grid w-[600px] grid-cols-2 gap-3"
              }
            >
              {answerImages.map(({ src, caption }) => (
                <div
                  key={src}
                  className="group relative aspect-square overflow-hidden rounded-2xl"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="400px"
                    className="object-cover object-bottom"
                  />
                  {caption && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-xs text-white">{caption}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {paragraphsAfterImages.map((para, i) => (
            <p key={`after-${i}`} className="whitespace-pre-line">
              {renderFormattedText(para, askById)}
            </p>
          ))}
        </div>
      )}
    </div>
  );

  if (hasAskedOnce) {
    return (
      <div className="flex flex-1 flex-col items-center bg-background px-6 py-8">
        <main className="flex w-full max-w-2xl flex-1 flex-col">
          {answerBox}
          <div className="mt-auto flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="group relative shrink-0">
                <button
                  type="button"
                  onClick={resetChat}
                  aria-label="Reset chat"
                  className="block"
                >
                  <Image
                    src="/octo.png"
                    alt="Octopus icon"
                    width={32}
                    height={32}
                    className="h-8 w-8 animate-octo-bounce [image-rendering:pixelated]"
                  />
                </button>
                <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  click to go home
                </span>
              </div>
              <div className="flex-1">{renderInputAndDropdown("up")}</div>
            </div>
            {renderQuickButtons()}
          </div>
        </main>
        <ResumeModal
          open={resumeModalOpen}
          onClose={() => setResumeModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-background px-6 pt-[25vh]">
      <main className="flex w-full max-w-2xl flex-col gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/octo.png"
            alt="Octopus icon"
            width={40}
            height={40}
            className="h-10 w-10 animate-octo-bounce [image-rendering:pixelated]"
          />
          <TypewriterHeading
            text="hi I'm toni!"
            className={`text-[26px] font-bold text-brand-pink ${canvaSans.className}`}
          />
        </div>
        <p className="-mt-2 text-l text-brand-red">
          &gt; 4th year engineering student @ uwaterloo
        </p>
        <p className="-mt-4 text-l text-brand-red">
          &gt; seeking new grad software engineering roles starting june 2027
        </p>
        {renderInputAndDropdown("down", true)}
        {renderQuickButtons(true)}
      </main>
    </div>
  );
}
