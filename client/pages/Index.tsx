import { useState, useEffect } from "react";
import { Play, Pause, Volume2, Clock, Brain, Music } from "lucide-react";
import { useAudioGenerator, Track } from "@/hooks/useAudioGenerator";
import { Slider } from "@/components/ui/slider";

const soundLibrary: Track[] = [
  {
    id: 1,
    name: "Deep Focus",
    duration: "45:32",
    description: "Engineered binaural beats for sustained concentration",
    icon: "🧠",
    category: "Focus",
    baseFrequency: 200,
    beatFrequency: 10, // Alpha
  },
  {
    id: 2,
    name: "Flow State",
    duration: "38:15",
    description: "Neural-optimized rhythms for creative work",
    icon: "🌊",
    category: "Focus",
    baseFrequency: 180,
    beatFrequency: 12, // Alpha/Beta
  },
  {
    id: 3,
    name: "Clarity",
    duration: "52:44",
    description: "Precision frequency patterns for enhanced cognition",
    icon: "✨",
    category: "Focus",
    baseFrequency: 220,
    beatFrequency: 14, // Beta
  },
  {
    id: 4,
    name: "Zen Mind",
    duration: "47:20",
    description: "Calming frequencies for stress reduction and mindfulness",
    icon: "🧘",
    category: "Calm",
    baseFrequency: 150,
    beatFrequency: 6, // Theta
  },
  {
    id: 5,
    name: "Morning Momentum",
    duration: "35:45",
    description: "Energizing tones to start your day with purpose",
    icon: "☀️",
    category: "Calm",
    baseFrequency: 250,
    beatFrequency: 18, // Beta
  },
  {
    id: 6,
    name: "Creative Spark",
    duration: "41:10",
    description: "Frequencies that unlock divergent thinking patterns",
    icon: "💡",
    category: "Creative",
    baseFrequency: 170,
    beatFrequency: 7, // Theta
  },
  {
    id: 7,
    name: "Night Mode",
    duration: "58:30",
    description: "Gentle, low-frequency waves for evening work sessions",
    icon: "🌙",
    category: "Creative",
    baseFrequency: 100,
    beatFrequency: 3, // Delta
  },
  {
    id: 8,
    name: "Deep Work",
    duration: "55:15",
    description: "Sustained alpha waves for immersive problem-solving",
    icon: "⚙️",
    category: "Creative",
    baseFrequency: 190,
    beatFrequency: 10, // Alpha
  },
  {
    id: 9,
    name: "Meditation Depth",
    duration: "60:00",
    description: "Theta wave harmonics for deep meditation states",
    icon: "🕉️",
    category: "Mindfulness",
    baseFrequency: 140,
    beatFrequency: 5, // Theta
  },
  {
    id: 10,
    name: "Body Scan",
    duration: "30:22",
    description: "Grounding frequencies for present-moment awareness",
    icon: "💆",
    category: "Mindfulness",
    baseFrequency: 130,
    beatFrequency: 4, // Delta/Theta
  },
  {
    id: 11,
    name: "Sleep Prep",
    duration: "25:40",
    description: "Delta wave patterns to transition into restful sleep",
    icon: "😴",
    category: "Mindfulness",
    baseFrequency: 90,
    beatFrequency: 2, // Delta
  },
  {
    id: 12,
    name: "Power Session",
    duration: "44:00",
    description: "Beta-dominant frequencies for high-intensity productivity",
    icon: "⚡",
    category: "Energy",
    baseFrequency: 300,
    beatFrequency: 20, // Beta
  },
  {
    id: 13,
    name: "Sustained Drive",
    duration: "50:30",
    description: "Consistent frequency patterns for marathon work sessions",
    icon: "🚀",
    category: "Energy",
    baseFrequency: 280,
    beatFrequency: 16, // Beta
  },
  {
    id: 14,
    name: "Peak Performance",
    duration: "42:15",
    description: "Optimized frequencies for athletic and cognitive peak states",
    icon: "🏆",
    category: "Energy",
    baseFrequency: 320,
    beatFrequency: 40, // Gamma
  },
  {
    id: 15,
    name: "Recovery Mode",
    duration: "36:48",
    description: "Restorative frequencies between intense work blocks",
    icon: "🔋",
    category: "Recovery",
    baseFrequency: 160,
    beatFrequency: 8, // Alpha/Theta
  },
];

export default function Index() {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const { isPlaying, volume, setVolume, togglePlay, startTrack, stopTrack } = useAudioGenerator();

  const currentTrack = soundLibrary[currentTrackIdx];

  const handleTogglePlay = () => {
    togglePlay(currentTrack.baseFrequency, currentTrack.beatFrequency);
  };

  const handleTrackSelect = (idx: number) => {
    setCurrentTrackIdx(idx);
    if (isPlaying) {
      startTrack(soundLibrary[idx].baseFrequency, soundLibrary[idx].beatFrequency);
    }
  };

  // Simulate progress when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 100 ? prev + 0.1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-playfair font-bold text-foreground">
                FocusWaves
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <button className="text-sm text-foreground/70 hover:text-foreground transition font-lora whitespace-nowrap">
                Browse
              </button>
              <button className="text-sm text-foreground/70 hover:text-foreground transition font-lora whitespace-nowrap">
                Science
              </button>
              <button className="px-4 py-2 rounded-lg bg-transparent border-2 border-primary text-primary font-semibold text-sm hover:shadow-lg hover:shadow-primary/50 transition duration-300 whitespace-nowrap">
                Launch
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Player */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-6xl font-playfair font-bold text-foreground leading-tight">
                Focus Engineered
              </h2>
              <p className="text-lg text-foreground/70 font-lora max-w-md">
                Neural-optimized sound scientifically designed to enhance focus
                and cognitive performance for ADHD and neurodivergent minds.
              </p>
            </div>

            <div className="flex items-center gap-6 text-foreground/60">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                <span className="font-lora">Binaural Beats</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                <span className="font-lora">Science-Backed</span>
              </div>
            </div>

            <button 
              onClick={handleTogglePlay}
              className="px-8 py-4 bg-transparent border-2 border-primary text-primary font-playfair font-semibold text-lg rounded-lg transition duration-300 transform hover:scale-105 w-fit hover:shadow-2xl hover:shadow-primary/60"
            >
              {isPlaying ? "Pause Session" : "Start Listening"}
            </button>
          </div>

          {/* Right - Player Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm bg-card border border-border/40 rounded-2xl p-8 shadow-lg space-y-8">
              {/* Visualizer */}
              <div className="h-48 flex items-end justify-center gap-2 bg-secondary/10 rounded-xl p-6 border border-secondary/20">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 bg-gradient-to-t from-secondary to-secondary/40 rounded-full ${isPlaying ? 'animate-wave' : ''}`}
                    style={{
                      height: isPlaying ? `${Math.random() * 60 + 40}%` : '10%',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  ></div>
                ))}
              </div>

              {/* Now Playing */}
              <div className="space-y-2">
                <h3 className="text-2xl font-playfair font-bold text-card-foreground">
                  {currentTrack.name}
                </h3>
                <p className="text-card-foreground/70 text-sm font-lora">
                  {currentTrack.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-card-foreground/60">
                  <span>0:00</span>
                  <span>{currentTrack.duration}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 mr-4">
                  <Volume2 className="w-5 h-5 text-secondary" />
                  <Slider 
                    value={[volume * 100]} 
                    max={100} 
                    step={1} 
                    onValueChange={(vals) => setVolume(vals[0] / 100)}
                    className="w-24"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleTogglePlay}
                    className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center transition transform hover:scale-110 hover:shadow-2xl hover:shadow-primary/60"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 ml-1 fill-current" />
                    )}
                  </button>
                </div>

                <div className="flex-1 flex justify-end">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary hover:bg-secondary/30 transition cursor-pointer border border-secondary/30">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sound Library Section */}
      <div className="border-t border-border py-20 bg-gradient-to-b from-background to-card/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-playfair font-bold text-foreground mb-2">
                Neural Sound Library
              </h2>
              <p className="text-foreground/70 font-lora">
                Curated experiences for different focus states
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {soundLibrary.map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => handleTrackSelect(idx)}
                  className={`p-6 rounded-xl border transition cursor-pointer transform hover:scale-105 ${
                    currentTrackIdx === idx
                      ? "bg-card border-primary shadow-lg shadow-primary/20 shadow-primary/10"
                      : "bg-card border-border/40 hover:border-border/60 hover:shadow-md"
                  }`}
                >
                  <div className="text-4xl mb-4">{track.icon}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-playfair font-bold text-card-foreground">
                      {track.name}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded bg-primary/15 text-secondary font-medium">
                      {track.category}
                    </span>
                  </div>
                  <p className="text-card-foreground/70 text-sm font-lora mb-4">
                    {track.description}
                  </p>
                  <div className="flex items-center gap-2 text-card-foreground/60">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-lora">{track.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl font-playfair font-bold text-foreground">
                Engineered for Your Brain
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Binaural Frequencies",
                  description:
                    "Precisely calibrated audio patterns that synchronize brain activity",
                  icon: "🔊",
                },
                {
                  title: "Adaptive Sessions",
                  description:
                    "Sessions that respond to your focus level and adapt in real-time",
                  icon: "📊",
                },
                {
                  title: "ADHD Optimized",
                  description:
                    "Designed with input from neurodivergent individuals and researchers",
                  icon: "🎯",
                },
              ].map((feature, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="text-5xl">{feature.icon}</div>
                  <h3 className="text-xl font-playfair font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/60 font-lora">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-border py-20 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-playfair font-bold text-foreground">
              Ready to Focus?
            </h2>
            <p className="text-lg text-foreground/70 font-lora">
              Join thousands optimizing their cognitive performance
            </p>
          </div>
          <button className="px-10 py-4 bg-transparent border-2 border-primary text-primary font-playfair font-semibold text-lg rounded-lg transition duration-300 transform hover:scale-105 inline-block hover:shadow-2xl hover:shadow-primary/60">
            Start Free Trial
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-playfair font-semibold text-foreground mb-4">
                Product
              </h4>
              <ul className="space-y-2 text-foreground/70 text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition font-lora">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition font-lora">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-playfair font-semibold text-foreground mb-4">
                Research
              </h4>
              <ul className="space-y-2 text-foreground/70 text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition font-lora">
                    Studies
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition font-lora">
                    Science
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-playfair font-semibold text-foreground mb-4">
                Legal
              </h4>
              <ul className="space-y-2 text-foreground/70 text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition font-lora">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition font-lora">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-playfair font-semibold text-foreground mb-4">
                Social
              </h4>
              <ul className="space-y-2 text-foreground/70 text-sm">
                <li>
                  <a href="#" className="hover:text-foreground transition font-lora">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition font-lora">
                    Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-foreground/70 text-sm font-lora">
            <p>&copy; 2024 FocusWaves. Neural optimization for focus.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
