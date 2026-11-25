import {
  AudioWaveform,
  Brain,
  Headphones,
  ShieldCheck,
  Sliders,
  Speaker,
} from "lucide-react";
import { WAVE_BAND_SPECS } from "@/data/soundLibrary";

export function ScienceSection() {
  const pillars = [
    {
      icon: Headphones,
      eyebrow: "Stereo Differential",
      title: "Binaural Beats (Headphones)",
      description:
        "Two pure sine oscillators panned hard left and right at baseFreq ± beatFreq/2. The auditory cortex perceives the phase differential as a gentle rhythmic pulse without harsh volume spikes.",
    },
    {
      icon: Speaker,
      eyebrow: "Speaker-Safe Entrainment",
      title: "Isochronic Amplitude Pulses",
      description:
        "When headphones aren't practical, switch to Isochronic mode. An LFO modulates a single carrier tone cleanly at the target frequency—delivering crisp cadence through laptop or desk speakers.",
    },
    {
      icon: Sliders,
      eyebrow: "Sensory Gating",
      title: "Brown & Pink Noise Masking",
      description:
        "ADHD nervous systems are easily pulled off-track by sudden ambient sounds. Real-time low-pass shaped Brown and Pink noise smooths environmental spikes and makes sustained listening comfortable.",
    },
    {
      icon: ShieldCheck,
      eyebrow: "Zero-Server Architecture",
      title: "100% Local Browser DSP",
      description:
        "Zero MP3 streaming lag, zero account walls, and zero server uploads. All oscillators, noise buffers, brain-dump items, and session telemetry execute deterministically on your own device.",
    },
  ];

  return (
    <section id="science" className="border-t border-white/[0.08] py-20 bg-[#0A1022]/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="max-w-2xl space-y-3">
          <div className="fw-eyebrow">
            <Brain className="w-3.5 h-3.5" />
            Acoustic Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#EEF4FA]">
            Engineered Around ADHD Sensory &amp; Executive Friction
          </h2>
          <p className="text-sm sm:text-base text-[#97A7C0]">
            Rather than looping static audio files, FocusWaves synthesizes real-time acoustic environments tuned to lower task-initiation friction and mask environmental noise.
          </p>
        </div>

        {/* Four Engineering Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="fw-card rounded-2xl p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#43B0F8]/30 bg-[#43B0F8]/12 text-[#7AC8FF]">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D4E78A]">
                  {pillar.eyebrow}
                </div>
                <h3 className="text-base font-display font-bold text-[#EEF4FA]">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#97A7C0] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Frequency Spectrum Reference Matrix */}
        <div className="fw-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <AudioWaveform className="w-4 h-4 text-[#43B0F8]" />
              <h3 className="text-base font-display font-bold text-[#EEF4FA]">
                Target Brainwave Band Matrix
              </h3>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#6B7E9E]">
              0.5 Hz – 50 Hz Spectrum
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07] bg-[#070C1B] font-mono text-[11px] uppercase tracking-wider text-[#6B7E9E]">
                  <th className="px-6 py-3.5">Band</th>
                  <th className="px-6 py-3.5">Frequency</th>
                  <th className="px-6 py-3.5">Cognitive State</th>
                  <th className="px-6 py-3.5">ADHD Application</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-sm">
                {WAVE_BAND_SPECS.map((row) => (
                  <tr key={row.band} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4 font-display font-bold whitespace-nowrap">
                      <span className="inline-flex items-center gap-2 text-[#EEF4FA]">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: row.accent }}
                        />
                        {row.band}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#7AC8FF] whitespace-nowrap">
                      {row.range}
                    </td>
                    <td className="px-6 py-4 text-[#EEF4FA] font-medium">
                      {row.state}
                    </td>
                    <td className="px-6 py-4 text-[#97A7C0] text-xs sm:text-sm">
                      {row.adhdRole}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
