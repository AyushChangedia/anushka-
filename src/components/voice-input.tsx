"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dictate ingredients using the browser's built-in speech recognition.
 *
 * Progressive enhancement: the Web Speech API is still prefixed and absent in
 * Firefox, so the button renders nothing at all where it is unsupported rather
 * than offering a control that cannot work.
 */

// Minimal structural types — the DOM lib does not ship SpeechRecognition.
interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceInput({ onResult }: { onResult: (text: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Support is checked after mount so the server render and first client render
  // agree (the server cannot know what the browser supports).
  useEffect(() => setSupported(getRecognitionCtor() !== null), []);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const toggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result?.isFinal) transcript += result[0].transcript;
      }
      if (transcript.trim()) onResult(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={listening}
      aria-label={listening ? "Stop dictating" : "Dictate ingredients"}
      title={listening ? "Stop dictating" : "Dictate ingredients"}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full transition-colors",
        listening
          ? "bg-red-500 text-white"
          : "text-foreground-subtle hover:bg-surface-muted hover:text-foreground",
      )}
    >
      {listening ? (
        <>
          <MicOff className="size-4" aria-hidden />
          <span className="sr-only" aria-live="assertive">
            Listening
          </span>
        </>
      ) : (
        <Mic className="size-4" aria-hidden />
      )}
    </button>
  );
}
