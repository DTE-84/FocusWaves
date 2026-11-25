import { useState, useRef, useEffect, useCallback } from "react";
import type { EntrainmentMode, NoiseColor, Track } from "@/data/soundLibrary";

export type { Track, EntrainmentMode, NoiseColor };

interface ActiveConfig {
  baseFreq: number;
  beatFreq: number;
  mode: EntrainmentMode;
}

// Tiny silent PCM WAV (~0.25s) used exclusively while playing to anchor mobile OS
// Media Session / lock-screen controls on iOS Safari & Android Chrome.
const SILENT_WAV_DATA_URI =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

function createNoiseBuffer(ctx: AudioContext, color: Exclude<NoiseColor, "off">): AudioBuffer {
  const durationSeconds = 3;
  const bufferSize = ctx.sampleRate * durationSeconds;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const output = buffer.getChannelData(channel);

    if (color === "white") {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.25;
      }
    } else if (color === "pink") {
      // Paul Kellet's refined pink noise filter
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      let b3 = 0;
      let b4 = 0;
      let b5 = 0;
      let b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.065;
        b6 = white * 0.115926;
      }
    } else {
      // Brown (Brownian / Red) noise — warm, deep low-frequency masking for ADHD
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 1.8;
      }
    }

    // Apply subtle 32ms crossfade at loop boundaries to avoid loop clicks
    const fadeSamples = Math.min(Math.floor(ctx.sampleRate * 0.032), Math.floor(bufferSize / 4));
    for (let i = 0; i < fadeSamples; i++) {
      const t = i / fadeSamples;
      output[i] = output[i] * t + output[bufferSize - fadeSamples + i] * (1 - t);
    }
  }

  return buffer;
}

export const useAudioGenerator = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.55);
  const [noiseColor, setNoiseColor] = useState<NoiseColor>("brown");
  const [noiseMix, setNoiseMix] = useState(0.38);
  const [entrainmentMode, setEntrainmentMode] = useState<EntrainmentMode>("binaural");

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const toneBusGainRef = useRef<GainNode | null>(null);
  const noiseBusGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const activeNodesRef = useRef<AudioNode[]>([]);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseBuffersRef = useRef<Partial<Record<Exclude<NoiseColor, "off">, AudioBuffer>>>({});
  const activeConfigRef = useRef<ActiveConfig | null>(null);
  const isPlayingRef = useRef(false);
  const keepAliveAudioRef = useRef<HTMLAudioElement | null>(null);

  const startKeepAlive = useCallback(() => {
    try {
      if (!keepAliveAudioRef.current) {
        const audio = new Audio(SILENT_WAV_DATA_URI);
        audio.loop = true;
        audio.volume = 0.001;
        keepAliveAudioRef.current = audio;
      }
      void keepAliveAudioRef.current.play().catch(() => {
        // Autoplay restriction — ignore gracefully
      });
    } catch {
      // Ignore unsupported audio element environments
    }
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveAudioRef.current) {
      try {
        keepAliveAudioRef.current.pause();
      } catch {
        // Ignore pause errors
      }
    }
  }, []);

  const ensureAudioGraph = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;

      const toneBus = ctx.createGain();
      toneBus.gain.setValueAtTime(0.32, ctx.currentTime);

      const noiseBus = ctx.createGain();
      noiseBus.gain.setValueAtTime(noiseColor === "off" ? 0 : noiseMix * 0.65, ctx.currentTime);

      toneBus.connect(masterGain);
      noiseBus.connect(masterGain);
      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      masterGainRef.current = masterGain;
      toneBusGainRef.current = toneBus;
      noiseBusGainRef.current = noiseBus;
      analyserRef.current = analyser;
    }
    return audioContextRef.current;
  }, [noiseColor, noiseMix]);

  const cleanupToneNodes = useCallback(() => {
    for (const node of activeNodesRef.current) {
      try {
        if ("stop" in node && typeof (node as OscillatorNode).stop === "function") {
          (node as OscillatorNode).stop();
        }
      } catch {
        // Node already stopped
      }
      try {
        node.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    }
    activeNodesRef.current = [];
  }, []);

  const cleanupNoiseNode = useCallback(() => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
      } catch {
        // Ignore already stopped
      }
      try {
        noiseSourceRef.current.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      noiseSourceRef.current = null;
    }
  }, []);

  const startNoiseLayer = useCallback(
    (color: NoiseColor) => {
      cleanupNoiseNode();
      const ctx = audioContextRef.current;
      const noiseBus = noiseBusGainRef.current;
      if (!ctx || !noiseBus) return;

      if (color === "off") {
        noiseBus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
        return;
      }

      if (!noiseBuffersRef.current[color]) {
        noiseBuffersRef.current[color] = createNoiseBuffer(ctx, color);
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffersRef.current[color]!;
      source.loop = true;

      // Gentle lowpass filter to keep noise silky and non-fatiguing
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(
        color === "brown" ? 420 : color === "pink" ? 2600 : 6500,
        ctx.currentTime
      );

      source.connect(filter);
      filter.connect(noiseBus);
      source.start();

      noiseSourceRef.current = source;
      noiseBus.gain.setTargetAtTime(noiseMix * 0.65, ctx.currentTime, 0.12);
    },
    [cleanupNoiseNode, noiseMix]
  );

  const buildEntrainmentNodes = useCallback(
    (ctx: AudioContext, baseFreq: number, beatFreq: number, mode: EntrainmentMode) => {
      cleanupToneNodes();
      const toneBus = toneBusGainRef.current;
      if (!toneBus) return;

      const created: AudioNode[] = [];

      if (mode === "binaural") {
        // True stereo binaural beats: left = base - beat/2, right = base + beat/2
        const leftOsc = ctx.createOscillator();
        const rightOsc = ctx.createOscillator();
        const panLeft = ctx.createStereoPanner();
        const panRight = ctx.createStereoPanner();

        leftOsc.type = "sine";
        rightOsc.type = "sine";
        leftOsc.frequency.setValueAtTime(Math.max(40, baseFreq - beatFreq / 2), ctx.currentTime);
        rightOsc.frequency.setValueAtTime(baseFreq + beatFreq / 2, ctx.currentTime);

        panLeft.pan.setValueAtTime(-1, ctx.currentTime);
        panRight.pan.setValueAtTime(1, ctx.currentTime);

        leftOsc.connect(panLeft);
        panLeft.connect(toneBus);

        rightOsc.connect(panRight);
        panRight.connect(toneBus);

        leftOsc.start();
        rightOsc.start();

        created.push(leftOsc, rightOsc, panLeft, panRight);
      } else {
        // Isochronic pulses: speaker-safe rhythmic amplitude modulation at beatFreq Hz
        const carrier = ctx.createOscillator();
        carrier.type = "sine";
        carrier.frequency.setValueAtTime(baseFreq, ctx.currentTime);

        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(0.5, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(beatFreq, ctx.currentTime);

        const lfoDepth = ctx.createGain();
        lfoDepth.gain.setValueAtTime(0.42, ctx.currentTime);

        lfo.connect(lfoDepth);
        lfoDepth.connect(modGain.gain);

        carrier.connect(modGain);
        modGain.connect(toneBus);

        carrier.start();
        lfo.start();

        created.push(carrier, lfo, lfoDepth, modGain);
      }

      activeNodesRef.current = created;
    },
    [cleanupToneNodes]
  );

  const startTrack = useCallback(
    (baseFreq: number, beatFreq: number, modeOverride?: EntrainmentMode, noiseOverride?: NoiseColor) => {
      const ctx = ensureAudioGraph();
      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const modeToUse = modeOverride ?? entrainmentMode;
      const noiseToUse = noiseOverride ?? noiseColor;

      activeConfigRef.current = { baseFreq, beatFreq, mode: modeToUse };
      buildEntrainmentNodes(ctx, baseFreq, beatFreq, modeToUse);
      startNoiseLayer(noiseToUse);

      if (masterGainRef.current) {
        const now = ctx.currentTime;
        masterGainRef.current.gain.cancelScheduledValues(now);
        masterGainRef.current.gain.setValueAtTime(
          Math.max(0.0001, masterGainRef.current.gain.value),
          now
        );
        masterGainRef.current.gain.linearRampToValueAtTime(volume, now + 0.35);
      }

      isPlayingRef.current = true;
      setIsPlaying(true);
      startKeepAlive();
    },
    [ensureAudioGraph, entrainmentMode, noiseColor, buildEntrainmentNodes, startNoiseLayer, volume, startKeepAlive]
  );

  const stopTrack = useCallback(() => {
    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;

    isPlayingRef.current = false;
    setIsPlaying(false);
    stopKeepAlive();

    if (ctx && masterGain) {
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(Math.max(0.0001, masterGain.gain.value), now);
      masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.22);

      window.setTimeout(() => {
        if (!isPlayingRef.current) {
          cleanupToneNodes();
          cleanupNoiseNode();
        }
      }, 240);
    } else {
      cleanupToneNodes();
      cleanupNoiseNode();
    }
  }, [cleanupToneNodes, cleanupNoiseNode, stopKeepAlive]);

  const togglePlay = useCallback(
    (baseFreq: number, beatFreq: number) => {
      if (isPlayingRef.current) {
        stopTrack();
      } else {
        startTrack(baseFreq, beatFreq);
      }
    },
    [startTrack, stopTrack]
  );

  const playCompletionChime = useCallback(() => {
    const ctx = ensureAudioGraph();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const notes = [528, 660];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.18 * volume, now + idx * 0.18 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 1.5);
    });
  }, [ensureAudioGraph, volume]);

  // Smooth master volume tracking
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current && isPlayingRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        Math.max(0.0001, volume),
        audioContextRef.current.currentTime,
        0.08
      );
    }
  }, [volume]);

  // Smooth noise mix tracking
  useEffect(() => {
    if (noiseBusGainRef.current && audioContextRef.current) {
      const target = noiseColor === "off" ? 0.0001 : Math.max(0.0001, noiseMix * 0.65);
      noiseBusGainRef.current.gain.setTargetAtTime(
        target,
        audioContextRef.current.currentTime,
        0.08
      );
    }
  }, [noiseMix, noiseColor]);

  // Live switch of noise color while playing
  useEffect(() => {
    if (isPlayingRef.current) {
      startNoiseLayer(noiseColor);
    }
  }, [noiseColor, startNoiseLayer]);

  // Live switch between Binaural & Isochronic while playing
  useEffect(() => {
    if (isPlayingRef.current && activeConfigRef.current && audioContextRef.current) {
      const { baseFreq, beatFreq } = activeConfigRef.current;
      activeConfigRef.current = { baseFreq, beatFreq, mode: entrainmentMode };
      buildEntrainmentNodes(audioContextRef.current, baseFreq, beatFreq, entrainmentMode);
    }
  }, [entrainmentMode, buildEntrainmentNodes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopKeepAlive();
      cleanupToneNodes();
      cleanupNoiseNode();
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, [stopKeepAlive, cleanupToneNodes, cleanupNoiseNode]);

  return {
    isPlaying,
    volume,
    setVolume,
    noiseColor,
    setNoiseColor,
    noiseMix,
    setNoiseMix,
    entrainmentMode,
    setEntrainmentMode,
    analyserRef,
    togglePlay,
    startTrack,
    stopTrack,
    playCompletionChime,
  };
};
