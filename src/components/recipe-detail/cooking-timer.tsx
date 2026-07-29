"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { cn, formatClock } from "@/lib/utils";

/**
 * A per-step countdown.
 *
 * Timing is anchored to `Date.now()` rather than accumulated from interval
 * ticks, because browsers throttle timers in background tabs — an interval-
 * counted timer silently runs slow the moment you switch away to read
 * something, which is exactly when a cook is using it.
 */
export function CookingTimer({
  minutes,
  label,
}: {
  minutes: number;
  label: string;
}) {
  const totalSeconds = minutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const deadlineRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;

    deadlineRef.current ??= Date.now() + remaining * 1000;

    const tick = () => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;

      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(left);

      if (left === 0) {
        setRunning(false);
        setDone(true);
        deadlineRef.current = null;
        notify(label);
      }
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [running, remaining, label]);

  const toggle = () => {
    if (done) return reset();
    if (running) {
      // Pausing discards the deadline; it is recomputed from the remaining
      // seconds when the timer resumes.
      deadlineRef.current = null;
      setRunning(false);
    } else {
      setRunning(true);
    }
  };

  const reset = () => {
    deadlineRef.current = null;
    setRunning(false);
    setDone(false);
    setRemaining(totalSeconds);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2 py-1 text-sm transition-colors",
        done
          ? "border-brand-500 bg-brand-500/12 text-brand-700 dark:text-brand-300"
          : running
            ? "border-accent-500 bg-accent-500/12 text-accent-700 dark:text-accent-300"
            : "border-border bg-surface text-foreground-muted",
      )}
      data-print="hide"
    >
      <Timer className="ml-1 size-3.5 shrink-0" aria-hidden />

      <span
        className="min-w-[3ch] font-mono tabular-nums"
        aria-live={running ? "off" : "polite"}
      >
        {done ? "Done" : formatClock(remaining)}
      </span>

      <button
        type="button"
        onClick={toggle}
        className="rounded-full p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        aria-label={
          done ? `Reset timer for ${label}` : running ? `Pause timer for ${label}` : `Start ${minutes} minute timer for ${label}`
        }
      >
        {done ? (
          <RotateCcw className="size-3.5" />
        ) : running ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5" />
        )}
      </button>

      {!done && remaining !== totalSeconds && (
        <button
          type="button"
          onClick={reset}
          className="rounded-full p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          aria-label={`Reset timer for ${label}`}
        >
          <RotateCcw className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/**
 * Best-effort completion alert. Notifications are only requested once the user
 * has actually started a timer — asking on page load is the behaviour everyone
 * blocks permanently.
 */
function notify(label: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  const show = () => {
    new Notification("Timer finished", { body: label, tag: "recipe-timer" });
  };

  if (Notification.permission === "granted") show();
  else if (Notification.permission !== "denied") {
    void Notification.requestPermission().then((permission) => {
      if (permission === "granted") show();
    });
  }
}
