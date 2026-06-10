import { useState, useRef, useEffect, useCallback } from 'react';

export interface Track {
  id: number;
  name: string;
  duration: string;
  description: string;
  icon: string;
  category: string;
  baseFrequency: number;
  beatFrequency: number;
}

export const useAudioGenerator = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const leftOscRef = useRef<OscillatorNode | null>(null);
  const rightOscRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const pannerLeftRef = useRef<StereoPannerNode | null>(null);
  const pannerRightRef = useRef<StereoPannerNode | null>(null);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume;
      gainNodeRef.current.connect(audioContextRef.current.destination);

      pannerLeftRef.current = audioContextRef.current.createStereoPanner();
      pannerLeftRef.current.pan.value = -1;
      pannerLeftRef.current.connect(gainNodeRef.current);

      pannerRightRef.current = audioContextRef.current.createStereoPanner();
      pannerRightRef.current.pan.value = 1;
      pannerRightRef.current.connect(gainNodeRef.current);
    }
  }, [volume]);

  const startTrack = useCallback((baseFreq: number, beatFreq: number) => {
    if (!audioContextRef.current) initAudio();
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    stopTrack();

    const ctx = audioContextRef.current!;
    
    leftOscRef.current = ctx.createOscillator();
    leftOscRef.current.type = 'sine';
    leftOscRef.current.frequency.setValueAtTime(baseFreq - beatFreq / 2, ctx.currentTime);
    leftOscRef.current.connect(pannerLeftRef.current!);
    leftOscRef.current.start();

    rightOscRef.current = ctx.createOscillator();
    rightOscRef.current.type = 'sine';
    rightOscRef.current.frequency.setValueAtTime(baseFreq + beatFreq / 2, ctx.currentTime);
    rightOscRef.current.connect(pannerRightRef.current!);
    rightOscRef.current.start();

    setIsPlaying(true);
  }, [initAudio]);

  const stopTrack = useCallback(() => {
    if (leftOscRef.current) {
      leftOscRef.current.stop();
      leftOscRef.current.disconnect();
      leftOscRef.current = null;
    }
    if (rightOscRef.current) {
      rightOscRef.current.stop();
      rightOscRef.current.disconnect();
      rightOscRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback((baseFreq: number, beatFreq: number) => {
    if (isPlaying) {
      stopTrack();
    } else {
      startTrack(baseFreq, beatFreq);
    }
  }, [isPlaying, startTrack, stopTrack]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioContextRef.current?.currentTime || 0, 0.1);
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopTrack();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopTrack]);

  return {
    isPlaying,
    volume,
    setVolume,
    togglePlay,
    startTrack,
    stopTrack
  };
};
