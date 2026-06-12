"use client";

import { useEffect, useRef, useState } from "react";

export default function Webcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setError(true);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-gray-800 text-gray-400">
        <div className="text-center">
          <p className="text-lg">Camera not available</p>
          <p className="mt-1 text-sm">
            Allow camera access to simulate the Kira experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="aspect-[4/3] w-full rounded-xl bg-black object-cover"
      style={{ transform: "scaleX(-1)" }}
    />
  );
}
