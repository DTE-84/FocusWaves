import {
  BatteryCharging,
  Brain,
  CloudMoon,
  Compass,
  Cpu,
  Flame,
  HeartPulse,
  Lightbulb,
  Moon,
  Sparkles,
  Sunrise,
  Trophy,
  Waves,
  Wind,
  Zap,
} from "lucide-react";
import type { TrackIconName } from "@/data/soundLibrary";

interface TrackIconProps {
  name: TrackIconName;
  className?: string;
}

const ICON_MAP = {
  brain: Brain,
  waves: Waves,
  sparkles: Sparkles,
  wind: Wind,
  sunrise: Sunrise,
  lightbulb: Lightbulb,
  moon: Moon,
  cpu: Cpu,
  compass: Compass,
  "heart-pulse": HeartPulse,
  "cloud-moon": CloudMoon,
  zap: Zap,
  flame: Flame,
  trophy: Trophy,
  "battery-charging": BatteryCharging,
} as const;

export function TrackIcon({ name, className = "w-5 h-5" }: TrackIconProps) {
  const Icon = ICON_MAP[name] ?? Brain;
  return <Icon className={className} />;
}
