"use client";

import { ArrowRight, ArrowUp, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useId, useRef, useState } from "react";

import {
  getPortfolioResponse,
  type AssistantTopic,
} from "./assistantResponses";

const suggestions = [
  { label: "View projects", target: "projects" },
  { label: "About Omar", target: "about" },
  { label: "Explore skills", target: "skills" },
  { label: "Contact Omar", target: "links" },
] as const;

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  actionLabel?: string;
  target?: AssistantTopic;
};

type AssistantApiResponse = {
  message: string;
  actionLabel?: string;
  target?: AssistantTopic;
};

const initialMessage: ChatMessage = {
  id: 0,
  role: "assistant",
  text: "Hi, I'm Omi, Omar's right hand and portfolio assistant 👋 Ask me anything about his work, skills, services, or availability.",
};

function scrollToSection(target: Exclude<AssistantTopic, null>) {
  const section = document.getElementById(target);

  if (!section) return;

  section.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.pushState(null, "", `#${target}`);
}

export function PortfolioAssistant() {
  const inputId = useId();
  const messagesRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(1);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const messageList = messagesRef.current;
    if (!messageList) return;

    messageList.scrollTo({
      top: messageList.scrollHeight,
      behavior: "auto",
    });
  }, [messages]);

  const appendExchange = async (prompt: string) => {
    if (waiting) return;

    const userMessage: ChatMessage = {
      id: nextMessageId.current++,
      role: "user",
      text: prompt,
    };
    setMessages((current) => [...current, userMessage]);
    setWaiting(true);

    let response: AssistantApiResponse;
    try {
      const apiResponse = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      if (!apiResponse.ok) throw new Error("Assistant request failed");
      response = (await apiResponse.json()) as AssistantApiResponse;
    } catch {
      response = getPortfolioResponse(prompt);
    } finally {
      setWaiting(false);
    }

    setMessages((current) => [
      ...current,
      {
        id: nextMessageId.current++,
        role: "assistant",
        text: response.message,
        actionLabel: response.actionLabel,
        target: response.target,
      },
    ]);
  };

  const submitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    void appendExchange(trimmedQuestion);
    setQuestion("");
  };

  return (
    <div
      className="portfolio-assistant"
      aria-label="Omi, Omar's portfolio assistant"
    >
      <div
        ref={messagesRef}
        className="assistant-messages"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={waiting}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`assistant-message assistant-message-${message.role}`}
          >
            <span className="assistant-message-label">
              {message.role === "assistant" ? "Omi" : "You"}
            </span>
            <p>{message.text}</p>
            {message.target && message.actionLabel ? (
              <Link
                className="assistant-inline-action"
                href={
                  message.target === "links" || message.target === "book"
                    ? `/${message.target}`
                    : `/#${message.target}`
                }
                onClick={(event) => {
                  if (message.target === "links" || message.target === "book")
                    return;
                  event.preventDefault();
                  scrollToSection(message.target!);
                }}
              >
                <span>{message.actionLabel}</span>
                <ArrowRight aria-hidden="true" size={14} strokeWidth={2} />
              </Link>
            ) : null}
          </div>
        ))}
        {waiting ? (
          <div className="assistant-message assistant-message-assistant assistant-message-loading">
            <span className="assistant-message-label">Omi</span>
            <p>
              <LoaderCircle aria-hidden="true" /> Thinking…
            </p>
          </div>
        ) : null}
      </div>

      <div
        className="assistant-suggestions"
        aria-label="Suggested portfolio topics"
      >
        {suggestions.map(({ label, target }) => (
          <button
            key={target}
            type="button"
            disabled={waiting}
            onClick={() => void appendExchange(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <form className="assistant-form" onSubmit={submitQuestion}>
        <label className="sr-only" htmlFor={inputId}>
          Ask Omi a question about Omar
        </label>
        <input
          id={inputId}
          name="portfolio-question"
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={"Ask Omi anything about Omar\u2026"}
          autoComplete="off"
          maxLength={500}
          disabled={waiting}
        />
        <button
          type="submit"
          disabled={!question.trim() || waiting}
          aria-label="Send question"
        >
          <ArrowUp aria-hidden="true" size={18} strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}
