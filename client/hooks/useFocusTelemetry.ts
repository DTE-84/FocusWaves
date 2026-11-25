import { useState, useEffect, useCallback, useMemo } from "react";
import type { WaveBand } from "@/data/soundLibrary";

export interface FocusSessionRecord {
  id: string;
  trackName: string;
  band: WaveBand;
  minutes: number;
  objective: string;
  completedAt: string;
}

export interface ParkingLotItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

const SESSIONS_KEY = "focuswaves.sessions.v1";
const PARKING_KEY = "focuswaves.parkinglot.v1";
const OBJECTIVE_KEY = "focuswaves.objective.v1";

function safeReadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function useFocusTelemetry() {
  const [sessions, setSessions] = useState<FocusSessionRecord[]>(() =>
    safeReadJSON<FocusSessionRecord[]>(SESSIONS_KEY, [])
  );
  const [parkingItems, setParkingItems] = useState<ParkingLotItem[]>(() =>
    safeReadJSON<ParkingLotItem[]>(PARKING_KEY, [])
  );
  const [activeObjective, setActiveObjective] = useState<string>(() => {
    try {
      return window.localStorage.getItem(OBJECTIVE_KEY) ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch {
      // Ignore storage quota errors
    }
  }, [sessions]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PARKING_KEY, JSON.stringify(parkingItems));
    } catch {
      // Ignore storage quota errors
    }
  }, [parkingItems]);

  useEffect(() => {
    try {
      window.localStorage.setItem(OBJECTIVE_KEY, activeObjective);
    } catch {
      // Ignore storage quota errors
    }
  }, [activeObjective]);

  const recordSession = useCallback(
    (trackName: string, band: WaveBand, minutes: number, objective: string) => {
      if (minutes < 1) return;
      const entry: FocusSessionRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        trackName,
        band,
        minutes: Math.round(minutes),
        objective: objective.trim() || "Unstructured Focus Block",
        completedAt: new Date().toISOString(),
      };
      setSessions((prev) => [entry, ...prev].slice(0, 100));
    },
    []
  );

  const addParkingItem = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const item: ParkingLotItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: trimmed,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setParkingItems((prev) => [item, ...prev]);
  }, []);

  const toggleParkingItem = useCallback((id: string) => {
    setParkingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  }, []);

  const removeParkingItem = useCallback((id: string) => {
    setParkingItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCompletedParking = useCallback(() => {
    setParkingItems((prev) => prev.filter((item) => !item.done));
  }, []);

  const clearTelemetry = useCallback(() => {
    setSessions([]);
  }, []);

  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
    const totalSessions = sessions.length;

    // Calculate active day streak
    const uniqueDays = new Set(sessions.map((s) => getDayKey(new Date(s.completedAt))));
    let streakDays = 0;
    const cursor = new Date();
    if (!uniqueDays.has(getDayKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (uniqueDays.has(getDayKey(cursor))) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Dominant wave band
    const bandCounts = new Map<WaveBand, number>();
    for (const s of sessions) {
      bandCounts.set(s.band, (bandCounts.get(s.band) ?? 0) + s.minutes);
    }
    let topBand: WaveBand | "—" = "—";
    let topMinutes = 0;
    bandCounts.forEach((mins, band) => {
      if (mins > topMinutes) {
        topMinutes = mins;
        topBand = band;
      }
    });

    return {
      totalMinutes,
      totalSessions,
      streakDays,
      topBand,
    };
  }, [sessions]);

  return {
    sessions,
    stats,
    activeObjective,
    setActiveObjective,
    recordSession,
    clearTelemetry,
    parkingItems,
    addParkingItem,
    toggleParkingItem,
    removeParkingItem,
    clearCompletedParking,
  };
}
