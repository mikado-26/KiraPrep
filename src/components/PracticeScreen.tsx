"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import NavBar from "./NavBar";
import AuthGate from "./AuthGate";
import Paywall from "./Paywall";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface SchoolInfo {
  school_id: string;
  display_name: string;
  slug: string;
  batch_size: number;
  prep_sec: number;
  answer_sec: number;
}

interface QuestionItem {
  id: number;
  text: string;
}

type AppState = "waiting" | "prep" | "recording" | "submitted" | "endofset";

const FREE_LIMIT = 10;

function fmtTimer(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function fmtLabel(s: number): string {
  if (s < 60) return s + "s";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

export default function PracticeScreen({
  school,
  questions,
}: {
  school: SchoolInfo;
  questions: QuestionItem[];
}) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const [appState, setAppState] = useState<AppState>("waiting");
  const [currentQ, setCurrentQ] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalSecs, setTotalSecs] = useState(0);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);

  // Playback
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const playbackVideoRef = useRef<HTMLVideoElement>(null);

  // Permissions
  type PermState = "pending" | "granted" | "no-audio" | "denied";
  const [permState, setPermState] = useState<PermState>("pending");

  // Camera / recorder
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camError, setCamError] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Revoke blob URL on unmount to free memory
  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  // Load persisted state + auth
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setMounted(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const storedIndex = parseInt(
      localStorage.getItem(`kiraprep_nextqi_${school.school_id}`) || "0",
      10
    );
    setStartIndex(storedIndex);

    const used = parseInt(
      localStorage.getItem("kiraprep_questions_used") || "0",
      10
    );
    setQuestionsCompleted(used);

    return () => listener.subscription.unsubscribe();
  }, [school.school_id]);

  // Start camera
  useEffect(() => {
    if (!mounted || !user) return;

    async function startCamera() {
      try {
        // Request video + audio together — both are required
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        const hasAudio = stream.getAudioTracks().length > 0;
        if (!hasAudio) {
          stream.getTracks().forEach((t) => t.stop());
          setPermState("no-audio");
          setCamError(true);
          return;
        }
        setPermState("granted");
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: unknown) {
        const name = err instanceof Error ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setPermState("denied");
        } else {
          setPermState("no-audio");
        }
        setCamError(true);
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [mounted, user]);

  // Timer effect
  useEffect(() => {
    if (appState !== "prep" && appState !== "recording") return;
    if (timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appState, timeLeft > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle timer hitting 0
  useEffect(() => {
    if (timeLeft !== 0) return;
    if (appState === "prep") {
      goRecording();
    } else if (appState === "recording") {
      goSubmitted();
    }
  }, [timeLeft, appState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get current set questions
  const getSetQuestions = useCallback((): QuestionItem[] => {
    return Array.from({ length: school.batch_size }, (_, i) => {
      const idx = (startIndex + i) % questions.length;
      return questions[idx];
    });
  }, [startIndex, school.batch_size, questions]);

  const setQs = getSetQuestions();
  const currentQuestion = setQs[currentQ];

  function isPaid(): boolean {
    return localStorage.getItem("kiraprep_paid") === "true";
  }

  function goPrep() {
    setAppState("prep");
    setTotalSecs(school.prep_sec);
    setTimeLeft(school.prep_sec);
  }

  function goRecording() {
    setRecordedUrl(null);
    setAppState("recording");
    setTotalSecs(school.answer_sec);
    setTimeLeft(school.answer_sec);

    // Start recording
    if (streamRef.current) {
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "";
      const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
    }
  }

  function goSubmitted() {
    if (timerRef.current) clearInterval(timerRef.current);

    // Stop recording — onstop handler is already set in goRecording
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }

    setAppState("submitted");

    // Increment questions used
    const newUsed = questionsCompleted + 1;
    setQuestionsCompleted(newUsed);
    localStorage.setItem("kiraprep_questions_used", newUsed.toString());
  }

  function goEndOfSet() {
    // Check paywall
    if (questionsCompleted >= FREE_LIMIT && !isPaid()) {
      setShowPaywall(true);
      return;
    }
    setAppState("endofset");
  }

  function handleMainBtn() {
    if (appState === "waiting") {
      goPrep();
    } else if (appState === "recording") {
      goSubmitted();
    } else if (appState === "submitted") {
      const isLast = currentQ >= school.batch_size - 1;
      if (isLast) {
        goEndOfSet();
      } else {
        setCurrentQ((q) => q + 1);
        setAppState("waiting");
      }
    }
  }

  function newSet() {
    const nextStart = (startIndex + school.batch_size) % questions.length;
    setStartIndex(nextStart);
    localStorage.setItem(
      `kiraprep_nextqi_${school.school_id}`,
      nextStart.toString()
    );
    setSetIndex((s) => s + 1);
    setCurrentQ(0);
    setAppState("waiting");
  }

  function repeatSet() {
    setCurrentQ(0);
    setAppState("waiting");
  }

  function togglePlayback() {
    const vid = playbackVideoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play();
    } else {
      vid.pause();
    }
  }

  const progressPct =
    totalSecs > 0 ? ((totalSecs - timeLeft) / totalSecs) * 100 : 0;

  const willWrap =
    startIndex + school.batch_size >= questions.length;

  const estimatedMinutes = Math.round(
    (school.batch_size * (school.prep_sec + school.answer_sec)) / 60
  );

  // Loading
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-[#94a3b8]">Loading...</div>
      </div>
    );
  }

  // Auth gate
  if (!user) {
    return <AuthGate />;
  }

  // Paywall
  if (showPaywall) {
    return <Paywall schoolSlug={school.slug} />;
  }

  // Permission gate — camera and/or microphone not granted
  if (permState === "pending" || permState === "denied" || permState === "no-audio") {
    const isDenied = permState === "denied" || permState === "no-audio";
    return (
      <div className="min-h-screen bg-white">
        <NavBar maxWidth={1080} />
        <div className="max-w-[480px] mx-auto px-8 py-24 flex flex-col items-center gap-5 text-center">
          {/* Icon */}
          <div className="w-[64px] h-[64px] rounded-full bg-[#fef9ec] border border-[#fde68a] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </div>

          <div className="text-[22px] font-bold text-[#0f172a]">
            Camera & microphone required
          </div>

          <div className="text-[14px] text-[#475569] leading-[1.7] max-w-[360px]">
            {isDenied
              ? "It looks like access was blocked. To practice, you need to allow both your camera and microphone in your browser settings."
              : "KiraPrep needs access to your camera and microphone to simulate the Kira assessment. Please allow both when your browser asks."}
          </div>

          {isDenied ? (
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 text-left text-[13px] text-[#475569] leading-[1.7] w-full">
              <p className="font-semibold text-[#0f172a] mb-2">How to fix this:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click the <strong>lock icon</strong> in your browser's address bar</li>
                <li>Set <strong>Camera</strong> and <strong>Microphone</strong> to <strong>Allow</strong></li>
                <li>Refresh the page</li>
              </ol>
            </div>
          ) : (
            <button
              onClick={() => {
                setPermState("pending");
                navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                  .then((stream) => {
                    const hasAudio = stream.getAudioTracks().length > 0;
                    if (!hasAudio) { setPermState("no-audio"); return; }
                    setPermState("granted");
                    streamRef.current = stream;
                    if (videoRef.current) videoRef.current.srcObject = stream;
                  })
                  .catch(() => setPermState("denied"));
              }}
              className="bg-brand text-white text-[15px] font-semibold py-3 px-8 rounded-lg border-none cursor-pointer hover:bg-[#1d4ed8] transition-colors"
            >
              Allow camera & microphone
            </button>
          )}

          <p className="text-[12px] text-[#94a3b8]">
            Your video is never uploaded or stored — it stays on your device.
          </p>
        </div>
      </div>
    );
  }

  // End of Set screen
  if (appState === "endofset") {
    return (
      <div className="min-h-screen bg-white">
        <NavBar maxWidth={1080} />
        <div className="max-w-[1080px] mx-auto px-8 py-16 flex flex-col items-center justify-center gap-6 text-center">
          {/* Trophy icon */}
          <div className="w-[72px] h-[72px] rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-[32px] text-[#16a34a]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <div className="font-[family-name:var(--font-dm-serif)] text-[28px] text-[#0f172a]">
            Set complete!
          </div>
          <div className="text-[15px] text-[#64748b] max-w-[380px] leading-[1.65]">
            You completed {school.batch_size} {school.display_name} questions.
            Great work — the more you practice, the more natural it feels.
          </div>
          {/* Stats */}
          <div className="flex gap-3">
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-[14px] px-6 text-center min-w-[100px]">
              <div className="text-[22px] font-bold text-[#0f172a]">{school.batch_size}</div>
              <div className="text-[11px] text-[#94a3b8] mt-[3px] uppercase tracking-[0.06em]">Questions</div>
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-[14px] px-6 text-center min-w-[100px]">
              <div className="text-[22px] font-bold text-[#0f172a]">~{estimatedMinutes}</div>
              <div className="text-[11px] text-[#94a3b8] mt-[3px] uppercase tracking-[0.06em]">Minutes</div>
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-[14px] px-6 text-center min-w-[100px]">
              <div className="text-[22px] font-bold text-[#0f172a]">Set {setIndex + 1}</div>
              <div className="text-[11px] text-[#94a3b8] mt-[3px] uppercase tracking-[0.06em]">Completed</div>
            </div>
          </div>
          {/* Buttons */}
          <div className="flex flex-col gap-[10px] w-full max-w-[360px]">
            <button
              onClick={newSet}
              className="bg-brand text-white text-[15px] font-semibold py-[14px] px-6 rounded-[10px] border-none cursor-pointer flex items-center justify-center gap-2 hover:bg-[#1d4ed8] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              Practice new set
            </button>
            <button
              onClick={repeatSet}
              className="bg-white border-[1.5px] border-brand-border text-brand text-[15px] font-semibold py-[14px] px-6 rounded-[10px] cursor-pointer flex items-center justify-center gap-2 hover:bg-brand-light transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                <path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
              </svg>
              Practice this set again
            </button>
          </div>
          {willWrap && (
            <div className="text-[12px] text-[#94a3b8] italic">
              Next set loops back to Question 1 ({questions.length} questions total).
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main practice UI
  return (
    <div className="bg-white">
      {/* Nav */}
      <NavBar maxWidth={1080} />

      {/* Top timer bar (visible during prep + recording) */}
      {(appState === "prep" || appState === "recording") && (
        <div className="border-b border-[#e8edf2]">
          <div className="h-1 bg-[#e2e8f0]">
            <div
              className="h-full bg-brand transition-[width] duration-500 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="max-w-[1080px] mx-auto px-8 py-[10px] flex items-center justify-center relative">
            <span className="text-[15px] font-bold text-brand tracking-[0.02em]">
              {fmtTimer(timeLeft)} remaining
            </span>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[13px] text-[#94a3b8] flex items-center gap-[5px] cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Help
            </div>
          </div>
        </div>
      )}

      {/* Help link (waiting + submitted state) */}
      {(appState === "waiting" || appState === "submitted") && (
        <div className="max-w-[1080px] mx-auto w-full px-8 flex justify-end pt-[10px]">
          <div className="text-[13px] text-[#94a3b8] flex items-center gap-[5px] cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Help
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-[1080px] mx-auto w-full px-8 grid grid-cols-[1fr_280px] gap-0 items-start">
        {/* Camera + question column */}
        <div className="flex flex-col">
          {appState !== "submitted" ? (
            <>
              {/* Camera box */}
              <div className="relative bg-[#1a1a1a] overflow-hidden aspect-video w-full">
                {/* Live video feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover block"
                  style={{ transform: "scaleX(-1)" }}
                />

                {/* Camera fallback */}
                {camError && (
                  <div className="absolute inset-0 bg-[#1a1a1a] flex flex-col items-center justify-center gap-[10px] text-white/30">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="2" y1="2" x2="22" y2="22" /><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h6" />
                      <path d="M16.5 13.5A4 4 0 0 0 12 8" />
                    </svg>
                    <span className="text-[13px]">Camera not available</span>
                  </div>
                )}

                {/* Waiting overlay */}
                {appState === "waiting" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/15 pointer-events-none">
                    <div className="text-[11px] font-bold text-white/80 tracking-[0.18em] uppercase">
                      Practice
                    </div>
                    <div className="text-[36px] font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                      Question {currentQ + 1}
                    </div>
                  </div>
                )}

                {/* Prep overlay */}
                {appState === "prep" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/15 pointer-events-none">
                    <div className="text-[28px] font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                      Preparation
                    </div>
                    {/* Green dots */}
                    <div className="absolute bottom-[10px] right-3 flex gap-[3px] items-center">
                      <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
                      <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
                      <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
                    </div>
                  </div>
                )}

                {/* Recording: just green dots */}
                {appState === "recording" && (
                  <div className="absolute bottom-[10px] right-3 flex gap-[3px] items-center">
                    <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
                    <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
                    <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]" />
                  </div>
                )}
              </div>

              {/* Question text (shown during prep + recording) */}
              {(appState === "prep" || appState === "recording") && currentQuestion && (
                <div className="pt-[14px]">
                  <p className="text-[15px] text-[#1e293b] leading-[1.65]">
                    <strong className="text-[#64748b] font-medium">Q{currentQ + 1}.</strong>{" "}
                    {currentQuestion.text}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Submitted screen */
            <div className="flex flex-col items-center gap-3 pt-[20px] pb-[32px] px-[40px] text-center bg-white">
              {/* Green check icon */}
              <div className="w-[60px] h-[60px] rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center text-[26px] text-[#16a34a]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="text-[20px] font-bold text-[#0f172a]">Response submitted</div>
              {/* Self-review checklist */}
              <ul className="text-left text-[13px] text-[#475569] max-w-[380px] w-full space-y-[6px] leading-[1.6]">
                <li className="flex items-start gap-2">
                  <span className="mt-[3px] text-brand">✓</span>
                  Did you sound confident and natural?
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[3px] text-brand">✓</span>
                  Did you smile?
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[3px] text-brand">✓</span>
                  Did you look at the camera, not the screen?
                </li>
              </ul>

              {/* Note */}
              <div className="text-[13px] text-[#475569] max-w-[400px] leading-[1.6] text-center">
                <span className="font-semibold">Note:</span> In the real Kira assessment, playback is not available. The next question will only appear when you click Next question.
              </div>

              {/* Video playback */}
              {recordedUrl ? (
                <div className="w-full max-w-[440px] rounded-[10px] overflow-hidden border border-[#e2e8f0] bg-black">
                  <video
                    ref={playbackVideoRef}
                    src={recordedUrl}
                    controls
                    playsInline
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="text-[13px] text-[#94a3b8]">Processing your recording…</div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="border-l border-[#e8edf2] min-h-[400px]">
          <div className="px-5 pt-4 pb-[10px] text-[13px] font-semibold text-[#334155]">
            Practice
          </div>
          <div className="px-[10px] pb-[10px] flex flex-col gap-[2px]">
            {Array.from({ length: school.batch_size }).map((_, i) => {
              const done = i < currentQ || (i === currentQ && appState === "submitted");
              const active = i === currentQ && appState !== "submitted";
              return (
                <div
                  key={i}
                  className={`flex items-center gap-[10px] py-[9px] px-[10px] rounded-lg cursor-default ${
                    active ? "bg-brand-light" : ""
                  }`}
                >
                  {/* Radio/check */}
                  <span
                    className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex-shrink-0 flex items-center justify-center ${
                      done
                        ? "bg-brand border-brand"
                        : active
                        ? "border-brand"
                        : "border-[#d1d9e6]"
                    }`}
                  >
                    {done ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : active ? (
                      <span className="w-[7px] h-[7px] rounded-full bg-brand" />
                    ) : null}
                  </span>
                  <span
                    className={`text-[13px] flex-1 font-medium ${
                      active ? "text-[#1e293b] font-semibold" : "text-[#64748b]"
                    }`}
                  >
                    Question {i + 1}
                  </span>
                  <span className="text-[12px] text-[#94a3b8]">Video</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#e8edf2] mt-0">
        <div className="max-w-[1080px] mx-auto px-8 py-4 flex items-center gap-8">
          <div>
            <div className="text-[18px] font-bold text-[#0f172a]">Video</div>
            <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#94a3b8] mt-[2px]">
              Type
            </div>
          </div>
          <div className="w-px h-8 bg-[#e8edf2]" />
          <div>
            <div className="text-[18px] font-bold text-[#0f172a]">
              {fmtLabel(school.prep_sec)}
            </div>
            <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#94a3b8] mt-[2px]">
              Preparation
            </div>
          </div>
          <div className="w-px h-8 bg-[#e8edf2]" />
          <div>
            <div className="text-[18px] font-bold text-[#0f172a]">
              {fmtLabel(school.answer_sec)}
            </div>
            <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#94a3b8] mt-[2px]">
              Response
            </div>
          </div>
          <div className="ml-auto">
            {appState === "prep" ? null : (
              <button
                onClick={handleMainBtn}
                className="bg-brand text-white text-[15px] font-semibold py-3 px-8 rounded-lg border-none cursor-pointer transition-all hover:bg-[#1d4ed8] hover:-translate-y-px disabled:bg-[#94a3b8] disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {appState === "waiting"
                  ? "Start question"
                  : appState === "recording"
                  ? "Submit"
                  : appState === "submitted" && currentQ >= school.batch_size - 1
                  ? "Finish set"
                  : "Start question"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
