import { useEffect, useRef, type RefObject } from "react";
import type { EntrainmentMode, NoiseColor, WaveBand } from "@/data/soundLibrary";

interface AudioVisualizerProps {
  analyserRef: RefObject<AnalyserNode | null>;
  isPlaying: boolean;
  baseFrequency: number;
  beatFrequency: number;
  band: WaveBand;
  entrainmentMode: EntrainmentMode;
  noiseColor: NoiseColor;
}

export function AudioVisualizer({
  analyserRef,
  isPlaying,
  baseFrequency,
  beatFrequency,
  band,
  entrainmentMode,
  noiseColor,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let phase = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const midY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Horizontal acoustic staff lines echoing the FocusWaves circular emblem
      ctx.strokeStyle = "rgba(148, 184, 230, 0.07)";
      ctx.lineWidth = 1;
      for (let line = 1; line <= 3; line++) {
        const y = (height / 4) * line;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const analyser = analyserRef.current;

      if (isPlaying && analyser) {
        const freqData = new Uint8Array(analyser.frequencyBinCount);
        const timeData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);

        // Background cerulean-to-citron spectrum bars
        const barCount = 32;
        const barGap = 4;
        const barWidth = Math.max(2, (width - barGap * (barCount - 1)) / barCount);

        for (let i = 0; i < barCount; i++) {
          const binIdx = Math.floor((i / barCount) * (freqData.length * 0.65));
          const mag = freqData[binIdx] / 255;
          const barHeight = Math.max(4, mag * (height * 0.72));
          const x = i * (barWidth + barGap);
          const y = height - barHeight;

          const grad = ctx.createLinearGradient(0, y, 0, height);
          grad.addColorStop(0, "rgba(212, 231, 138, 0.48)");
          grad.addColorStop(0.45, "rgba(67, 176, 248, 0.42)");
          grad.addColorStop(1, "rgba(67, 176, 248, 0.06)");
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barWidth, barHeight);
        }

        // Foreground live time-domain oscilloscope curve in Cerulean Wave
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = "#5CC0FF";
        ctx.shadowColor = "rgba(67, 176, 248, 0.6)";
        ctx.shadowBlur = 12;

        const sliceWidth = width / timeData.length;
        for (let i = 0; i < timeData.length; i++) {
          const v = (timeData[i] - 128) / 128;
          const x = i * sliceWidth;
          const y = midY + v * (height * 0.42);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

        // Warm Citron-Sage phase entrainment harmonic overlay
        phase += Math.min(0.18, 0.025 + beatFrequency * 0.004);
        ctx.beginPath();
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = "rgba(212, 231, 138, 0.68)";
        for (let x = 0; x <= width; x += 4) {
          const norm = x / width;
          const env = Math.sin(norm * Math.PI);
          const y =
            midY +
            Math.sin(norm * Math.PI * 6 + phase) * (height * 0.16) * env;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Calm idle acoustic horizon preview
        phase += 0.016;
        ctx.beginPath();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = "rgba(67, 176, 248, 0.42)";
        for (let x = 0; x <= width; x += 4) {
          const norm = x / width;
          const env = Math.sin(norm * Math.PI);
          const y = midY + Math.sin(norm * Math.PI * 4 + phase) * 14 * env;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(212, 231, 138, 0.28)";
        for (let x = 0; x <= width; x += 4) {
          const norm = x / width;
          const env = Math.sin(norm * Math.PI);
          const y = midY + Math.cos(norm * Math.PI * 3 - phase * 0.8) * 9 * env;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [analyserRef, isPlaying, beatFrequency]);

  const leftHz = Math.max(40, baseFrequency - beatFrequency / 2);
  const rightHz = baseFrequency + beatFrequency / 2;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#43B0F8]/20 bg-[#070C1B] p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isPlaying
                ? "bg-[#43B0F8] shadow-[0_0_10px_#43B0F8] animate-pulse"
                : "bg-slate-600"
            }`}
          />
          <span className="uppercase tracking-[0.14em] text-[#97A7C0]">
            {isPlaying ? "DSP Signal Live" : "Oscillator Standby"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#97A7C0]">
          <span className="rounded bg-[#43B0F8]/12 px-2 py-0.5 text-[#7AC8FF] border border-[#43B0F8]/30">
            {band.toUpperCase()} · {beatFrequency} Hz
          </span>
          {noiseColor !== "off" && (
            <span className="rounded bg-[#D4E78A]/12 px-2 py-0.5 text-[#D4E78A] border border-[#D4E78A]/30 uppercase">
              {noiseColor} Noise
            </span>
          )}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="h-32 w-full block"
        aria-label="Live acoustic waveform visualizer"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-2.5 font-mono text-[11px] text-[#6B7E9E]">
        {entrainmentMode === "binaural" ? (
          <>
            <span>L: {leftHz.toFixed(1)} Hz</span>
            <span className="text-[#97A7C0]">Δ {beatFrequency} Hz Binaural Differential</span>
            <span>R: {rightHz.toFixed(1)} Hz</span>
          </>
        ) : (
          <>
            <span>Carrier: {baseFrequency} Hz</span>
            <span className="text-[#97A7C0]">LFO Pulse: {beatFrequency} Hz Isochronic</span>
            <span className="text-[#D4E78A]">Speaker Safe</span>
          </>
        )}
      </div>
    </div>
  );
}
