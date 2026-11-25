export type WaveBand = "Delta" | "Theta" | "Alpha" | "Beta" | "Gamma";

export type TrackCategory =
  | "Focus"
  | "Calm"
  | "Creative"
  | "Mindfulness"
  | "Energy"
  | "Recovery";

export type NoiseColor = "off" | "brown" | "pink" | "white";

export type EntrainmentMode = "binaural" | "isochronic";

export type TrackIconName =
  | "brain"
  | "waves"
  | "sparkles"
  | "wind"
  | "sunrise"
  | "lightbulb"
  | "moon"
  | "cpu"
  | "compass"
  | "heart-pulse"
  | "cloud-moon"
  | "zap"
  | "flame"
  | "trophy"
  | "battery-charging";

export interface Track {
  id: number;
  name: string;
  duration: string;
  recommendedMinutes: number;
  description: string;
  adhdUseCase: string;
  icon: TrackIconName;
  category: TrackCategory;
  band: WaveBand;
  baseFrequency: number;
  beatFrequency: number;
  recommendedNoise: NoiseColor;
}

export const TRACK_CATEGORIES: Array<"All" | TrackCategory> = [
  "All",
  "Focus",
  "Calm",
  "Creative",
  "Mindfulness",
  "Energy",
  "Recovery",
];

export const WAVE_BAND_SPECS: Array<{
  band: WaveBand;
  range: string;
  state: string;
  adhdRole: string;
  accent: string;
}> = [
  {
    band: "Delta",
    range: "0.5 – 4 Hz",
    state: "Deep Rest & Nervous System Downregulation",
    adhdRole: "Late-night racing-thought decompression and sleep transition.",
    accent: "#7C93FF",
  },
  {
    band: "Theta",
    range: "4 – 8 Hz",
    state: "Divergent Ideation & Emotional Reset",
    adhdRole: "Reduces sensory overwhelm and unlocks associative brainstorming.",
    accent: "#B69DF8",
  },
  {
    band: "Alpha",
    range: "8 – 13 Hz",
    state: "Calm Alertness & Flow Entry",
    adhdRole: "Bridges task-initiation friction without overstimulation.",
    accent: "#43B0F8",
  },
  {
    band: "Beta",
    range: "13 – 30 Hz",
    state: "Active Execution & Analytical Focus",
    adhdRole: "Sustains executive attention during structured or repetitive tasks.",
    accent: "#D4E78A",
  },
  {
    band: "Gamma",
    range: "30 – 50 Hz",
    state: "High-Order Cognitive Binding",
    adhdRole: "Short sprints requiring rapid synthesis and peak working memory.",
    accent: "#F5C26B",
  },
];

export const soundLibrary: Track[] = [
  {
    id: 1,
    name: "Deep Focus",
    duration: "45:00",
    recommendedMinutes: 45,
    description: "Calibrated 10 Hz alpha carrier for sustained, calm concentration.",
    adhdUseCase: "Deep Work & Distraction Filtering",
    icon: "brain",
    category: "Focus",
    band: "Alpha",
    baseFrequency: 200,
    beatFrequency: 10,
    recommendedNoise: "brown",
  },
  {
    id: 2,
    name: "Flow State",
    duration: "40:00",
    recommendedMinutes: 40,
    description: "Upper-alpha rhythm engineered to lock into uninterrupted momentum.",
    adhdUseCase: "Writing, Coding & Design Sprints",
    icon: "waves",
    category: "Focus",
    band: "Alpha",
    baseFrequency: 180,
    beatFrequency: 12,
    recommendedNoise: "brown",
  },
  {
    id: 3,
    name: "Clarity",
    duration: "25:00",
    recommendedMinutes: 25,
    description: "Low-beta precision frequency designed to cut through mental fog.",
    adhdUseCase: "Task Initiation & Inbox Clearing",
    icon: "sparkles",
    category: "Focus",
    band: "Beta",
    baseFrequency: 220,
    beatFrequency: 14,
    recommendedNoise: "pink",
  },
  {
    id: 4,
    name: "Zen Mind",
    duration: "25:00",
    recommendedMinutes: 25,
    description: "Grounding 6 Hz theta entrainment to cool sensory overstimulation.",
    adhdUseCase: "Overstimulation Reset",
    icon: "wind",
    category: "Calm",
    band: "Theta",
    baseFrequency: 150,
    beatFrequency: 6,
    recommendedNoise: "brown",
  },
  {
    id: 5,
    name: "Morning Momentum",
    duration: "15:00",
    recommendedMinutes: 15,
    description: "Crisp 18 Hz beta cadence to overcome executive inertia fast.",
    adhdUseCase: "Morning Startup & Activation",
    icon: "sunrise",
    category: "Calm",
    band: "Beta",
    baseFrequency: 250,
    beatFrequency: 18,
    recommendedNoise: "pink",
  },
  {
    id: 6,
    name: "Creative Spark",
    duration: "45:00",
    recommendedMinutes: 45,
    description: "7 Hz theta harmonics tuned for divergent thinking and ideation.",
    adhdUseCase: "Brainstorming & Architecture",
    icon: "lightbulb",
    category: "Creative",
    band: "Theta",
    baseFrequency: 170,
    beatFrequency: 7,
    recommendedNoise: "pink",
  },
  {
    id: 7,
    name: "Night Mode",
    duration: "60:00",
    recommendedMinutes: 60,
    description: "Warm 3 Hz low-carrier waves for quiet late-evening sessions.",
    adhdUseCase: "Late-Night Quiet Focus",
    icon: "moon",
    category: "Creative",
    band: "Delta",
    baseFrequency: 100,
    beatFrequency: 3,
    recommendedNoise: "brown",
  },
  {
    id: 8,
    name: "Deep Work",
    duration: "60:00",
    recommendedMinutes: 60,
    description: "Steady 10 Hz alpha baseline built for complex problem-solving.",
    adhdUseCase: "Long Analytical Blocks",
    icon: "cpu",
    category: "Creative",
    band: "Alpha",
    baseFrequency: 190,
    beatFrequency: 10,
    recommendedNoise: "brown",
  },
  {
    id: 9,
    name: "Meditation Depth",
    duration: "25:00",
    recommendedMinutes: 25,
    description: "Slow 5 Hz theta carrier for breathwork and attention anchoring.",
    adhdUseCase: "Guided Breathwork & Reset",
    icon: "compass",
    category: "Mindfulness",
    band: "Theta",
    baseFrequency: 140,
    beatFrequency: 5,
    recommendedNoise: "brown",
  },
  {
    id: 10,
    name: "Body Scan",
    duration: "15:00",
    recommendedMinutes: 15,
    description: "4 Hz delta-theta threshold for somatic grounding between meetings.",
    adhdUseCase: "Midday Nervous System Reset",
    icon: "heart-pulse",
    category: "Mindfulness",
    band: "Theta",
    baseFrequency: 130,
    beatFrequency: 4,
    recommendedNoise: "brown",
  },
  {
    id: 11,
    name: "Sleep Prep",
    duration: "45:00",
    recommendedMinutes: 45,
    description: "2 Hz deep delta oscillation to quiet intrusive pre-sleep loops.",
    adhdUseCase: "Evening Wind-Down",
    icon: "cloud-moon",
    category: "Mindfulness",
    band: "Delta",
    baseFrequency: 90,
    beatFrequency: 2,
    recommendedNoise: "brown",
  },
  {
    id: 12,
    name: "Power Session",
    duration: "25:00",
    recommendedMinutes: 25,
    description: "20 Hz high-beta cadence for deadline-driven sprint execution.",
    adhdUseCase: "Time-Boxed Deadline Sprints",
    icon: "zap",
    category: "Energy",
    band: "Beta",
    baseFrequency: 300,
    beatFrequency: 20,
    recommendedNoise: "pink",
  },
  {
    id: 13,
    name: "Sustained Drive",
    duration: "45:00",
    recommendedMinutes: 45,
    description: "16 Hz mid-beta carrier for steady output across admin workflows.",
    adhdUseCase: "Admin, Docs & Repetitive Ops",
    icon: "flame",
    category: "Energy",
    band: "Beta",
    baseFrequency: 280,
    beatFrequency: 16,
    recommendedNoise: "brown",
  },
  {
    id: 14,
    name: "Peak Performance",
    duration: "15:00",
    recommendedMinutes: 15,
    description: "40 Hz gamma entrainment for high-intensity cognitive binding.",
    adhdUseCase: "High-Complexity Problem Sprints",
    icon: "trophy",
    category: "Energy",
    band: "Gamma",
    baseFrequency: 320,
    beatFrequency: 40,
    recommendedNoise: "pink",
  },
  {
    id: 15,
    name: "Recovery Mode",
    duration: "15:00",
    recommendedMinutes: 15,
    description: "8 Hz alpha-theta bridge to restore executive bandwidth on breaks.",
    adhdUseCase: "Pomodoro Break Restoration",
    icon: "battery-charging",
    category: "Recovery",
    band: "Alpha",
    baseFrequency: 160,
    beatFrequency: 8,
    recommendedNoise: "brown",
  },
];
