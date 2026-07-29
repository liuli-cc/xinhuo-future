"use client";

import { useEffect, useRef, useState } from "react";

export type InterviewerState = "idle" | "thinking" | "speaking" | "listening" | "scoring";

interface VirtualInterviewerProps {
  state: InterviewerState;
  audioLevel?: number;
  ttsSource?: "tencent" | "browser" | "none";
}

export default function VirtualInterviewer({ state, ttsSource = "none" }: VirtualInterviewerProps) {
  const [blink, setBlink] = useState(false);
  const blinkTimer = useRef<ReturnType<typeof setInterval>>(null as unknown as ReturnType<typeof setInterval>);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    blinkTimer.current = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkTimer.current);
  }, []);

  const expression = state === "listening"
    ? "专注倾听"
    : state === "thinking"
      ? "整理思路"
      : state === "speaking"
        ? "温和提问"
        : state === "scoring"
          ? "记录反馈"
          : "准备就绪";

  return (
    <div className={`virtual-interviewer mentor-state-${state}`} aria-label={`虚拟面试官林老师，${expression}`}>
      <div className="mentor-scene" aria-hidden="true">
        <span className="mentor-scene-shape shape-one" />
        <span className="mentor-scene-shape shape-two" />
        <svg viewBox="0 0 240 300" className="interviewer-svg">
          <defs>
            <linearGradient id="mentorJacket" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="oklch(0.58 0.15 255)" />
              <stop offset="1" stopColor="oklch(0.42 0.13 262)" />
            </linearGradient>
            <linearGradient id="mentorHair" x1="0" y1="0" x2="0.8" y2="1">
              <stop offset="0" stopColor="oklch(0.28 0.05 35)" />
              <stop offset="1" stopColor="oklch(0.18 0.03 30)" />
            </linearGradient>
          </defs>

          <g className="mentor-body">
            <path d="M52 292c4-65 27-91 68-91s64 26 68 91" className="mentor-jacket" />
            <path d="M92 207l28 37 28-37c-8-6-17-9-28-9s-20 3-28 9z" className="mentor-shirt" />
            <path d="M78 292c4-30 1-56-9-77-24 14-34 39-36 77z" className="mentor-sleeve mentor-sleeve-left" />
            <path d="M162 292c-4-30-1-56 9-77 24 14 34 39 36 77z" className="mentor-sleeve mentor-sleeve-right" />
          </g>

          <g className="mentor-head-group">
            <path d="M64 116c0-58 23-88 58-88 38 0 61 31 61 90v71H64z" className="mentor-hair-back" />
            <ellipse cx="122" cy="121" rx="49" ry="61" className="mentor-face" />
            <path d="M76 102c2-48 22-70 51-70 29 0 48 21 52 62-17-8-30-23-39-42-14 25-36 42-64 50z" className="mentor-hair-front" />
            <path d="M77 99c-3 17-2 41 5 65-13-10-19-27-18-48 1-16 5-29 13-39z" className="mentor-hair-side" />

            <g className={`mentor-eyes ${blink ? "is-blinking" : ""}`}>
              <path d="M91 119q10-8 20 0" className="mentor-eye-line" />
              <path d="M133 119q10-8 20 0" className="mentor-eye-line" />
              <circle cx="101" cy="119" r={blink ? 0 : 3.1} className="mentor-pupil" />
              <circle cx="143" cy="119" r={blink ? 0 : 3.1} className="mentor-pupil" />
            </g>
            <path d="M91 105q10-5 20 0" className="mentor-brow mentor-brow-left" />
            <path d="M133 105q10-5 20 0" className="mentor-brow mentor-brow-right" />
            <path d="M120 120q-3 14 2 18" className="mentor-nose" />
            <path d={state === "thinking" ? "M108 153q13 2 25 0" : "M107 151q13 13 27 0"} className="mentor-smile" />

            <circle cx="88" cy="142" r="8" className="mentor-cheek" />
            <circle cx="156" cy="142" r="8" className="mentor-cheek" />
            <path d="M109 181v22h24v-22" className="mentor-neck" />
          </g>

          <g className="mentor-gesture">
            {state === "speaking" && (
              <>
                <path d="M174 230q25-30 34-13 7 13-18 34" className="mentor-arm-gesture" />
                <path d="M206 218l9-8m-7 12 13-1m-14 4 9 8" className="mentor-hand-lines" />
              </>
            )}
            {state === "listening" && (
              <>
                <path d="M171 235q25-22 31-7 5 13-18 29" className="mentor-arm-gesture" />
                <path d="M195 220q6-13 13-3" className="mentor-hand-lines" />
              </>
            )}
            {state === "thinking" && (
              <>
                <path d="M171 238q25-30 33-13 5 11-15 29" className="mentor-arm-gesture" />
                <circle cx="204" cy="211" r="4" className="mentor-thought-dot dot-one" />
                <circle cx="216" cy="196" r="6" className="mentor-thought-dot dot-two" />
              </>
            )}
            {state === "scoring" && (
              <g className="mentor-notebook">
                <rect x="163" y="215" width="52" height="66" rx="7" />
                <path d="M174 232h28m-28 12h23m-23 12h27" />
              </g>
            )}
          </g>
        </svg>
      </div>

      <div className="mentor-identity">
        <strong>林老师</strong>
        <span>青年职业导师</span>
      </div>
      <div className="interviewer-label">
        <span className={`indicator state-${state}`} />
        <span>
          {state === "idle" && "随时可以开始"}
          {state === "thinking" && "正在整理下一步问题"}
          {state === "speaking" && "正在和你交流"}
          {state === "listening" && "正在认真倾听"}
          {state === "scoring" && "正在整理面试反馈"}
        </span>
        {ttsSource !== "none" && state === "speaking" && (
          <small className="tts-source-badge">{ttsSource === "tencent" ? "云TTS" : "浏览器"}</small>
        )}
      </div>
    </div>
  );
}
