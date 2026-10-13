import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Play,
  Pause,
  Search,
  Sparkles,
  Send,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  Droplets,
  Utensils,
  HelpCircle,
  AlertCircle,
  Stethoscope,
  Smile,
  Clock,
  Bed,
  Ear,
  ThumbsUp,
  Flame,
  Sun,
  Moon,
  Lightbulb,
  Zap,
  Hand,
} from 'lucide-react';
import { SIGN_GESTURES } from '../data/gestures';
import { GestureCategory, GestureDefinition } from '../types';
import { sharedGestureEngine } from '../services/gestureEngine';
import { GloveVisualizer } from './GloveVisualizer';

interface DemoModePanelProps {
  onTriggerGesture: (gesture: GestureDefinition) => void;
  activeGesture: GestureDefinition | null;
}

// Icon helper mapping
const GESTURE_ICONS: Record<string, React.ElementType> = {
  Hand,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  XCircle,
  Droplets,
  Utensils,
  HelpCircle,
  AlertCircle,
  Stethoscope,
  Smile,
  Clock,
  Bed,
  Ear,
  ThumbsUp,
  Flame,
  Sun,
  Moon,
  Lightbulb,
  Zap,
};

const CATEGORIES: ('All' | GestureCategory)[] = [
  'All',
  'Essential',
  'Emergency',
  'Social',
  'Assistance',
  'Daily',
];

export const DemoModePanel: React.FC<DemoModePanelProps> = ({
  onTriggerGesture,
  activeGesture,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | GestureCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customPacketInput, setCustomPacketInput] = useState('$SV1,201,G01,98,3820*48');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayIndexRef = useRef(0);
  const autoPlayTimerRef = useRef<number | null>(null);

  const filteredGestures = SIGN_GESTURES.filter((g) => {
    const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory;
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.sentence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Keyboard shortcut listener (keys 1-9 trigger first 9 gestures)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input fields
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        const targetGesture = SIGN_GESTURES.find((g) => g.numericId === num);
        if (targetGesture) {
          onTriggerGesture(targetGesture);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTriggerGesture]);

  // Auto-play Scenario Runner
  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      setIsAutoPlaying(false);
    } else {
      setIsAutoPlaying(true);
      autoPlayIndexRef.current = 0;
      runNextAutoPlay();
      autoPlayTimerRef.current = window.setInterval(runNextAutoPlay, 3200);
    }
  };

  const runNextAutoPlay = () => {
    const gesture = SIGN_GESTURES[autoPlayIndexRef.current % SIGN_GESTURES.length];
    onTriggerGesture(gesture);
    autoPlayIndexRef.current++;
  };

  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  const handleInjectCustomPacket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPacketInput.trim()) return;
    sharedGestureEngine.injectPacket(customPacketInput.trim(), 'SIMULATED');
  };

  const activeSensors = activeGesture
    ? activeGesture.targetSensors
    : { thumb: 15, index: 15, middle: 15, ring: 15, pinky: 15, pitch: 0, roll: 0, yaw: 0 };

  return (
    <div id="demo-panel" role="tabpanel" aria-labelledby="tab-demo">
      {/* Simulation Notice Banner */}
      <div className="ble-status-banner banner-disconnected" style={{ marginBottom: '1.5rem' }}>
        <Gamepad2 size={18} style={{ color: 'var(--amber-400)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--amber-400)', marginBottom: '0.2rem' }}>
            SIMULATED GLOVE HARNESS (HARDWARE STAND-IN)
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            The physical SignoVox glove has not been assembled yet. This interactive simulator emulates all 20 flex/IMU sensor profiles, verifies sentence bounds (≤ 5 words), tests duplicate sequence filtering, and formats protocol packets.
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: 20-Gesture Trigger Board */}
        <div className="glass-card rising-card">
          <div className="section-header">
            <h2 className="section-title">
              <Sparkles size={18} style={{ color: 'var(--cyan-400)' }} />
              <span>Interactive Gesture Trigger Grid</span>
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${isAutoPlaying ? 'btn-danger' : 'btn-primary'}`}
                onClick={toggleAutoPlay}
                title="Automatically step through gestures with simulated delay"
              >
                {isAutoPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isAutoPlaying ? 'Stop Auto-Demo' : 'Auto Scenario'}</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="search-input"
                style={{ paddingLeft: '2.2rem', maxWidth: '100%' }}
                placeholder="Search 20 gestures or sentences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Filter gestures by keyword"
              />
            </div>

            <div className="filter-tabs" style={{ marginBottom: 0, paddingBottom: 0 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Gesture Button Grid */}
          <div className="gesture-grid" role="group" aria-label="Predefined gestures list">
            {filteredGestures.map((g) => {
              const IconComponent = GESTURE_ICONS[g.iconName] || Hand;
              const isTriggered = activeGesture?.id === g.id;

              return (
                <button
                  key={g.id}
                  type="button"
                  className={`gesture-card-btn ${isTriggered ? 'active-trigger' : ''}`}
                  onClick={() => onTriggerGesture(g)}
                  title={`${g.name} - "${g.sentence}" (Word count: ${g.wordCount})`}
                  aria-label={`Trigger gesture ${g.id}: ${g.name}, speaking "${g.sentence}"`}
                >
                  <div className="g-card-top">
                    <span className="g-id-badge">{g.id}</span>
                    <IconComponent size={16} style={{ color: 'var(--cyan-400)' }} />
                  </div>
                  <div>
                    <div className="g-card-title">{g.name}</div>
                    <div className="g-card-sentence">"{g.sentence}"</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '0.9rem', fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Tip: Press keys <strong>1</strong> through <strong>9</strong> for instant one-touch triggers.</span>
            <span>Showing {filteredGestures.length} of 20 Gestures</span>
          </div>
        </div>

        {/* Right Column: Glove Sensor Visualizer & Packet Injector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card rising-card">
            <GloveVisualizer
              sensors={activeSensors}
              activeGestureName={activeGesture?.name || 'Resting / Neutral'}
            />
          </div>

          {/* Packet Injector Box */}
          <div className="glass-card rising-card">
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={15} style={{ color: 'var(--cyan-400)' }} />
              <span>Raw Protocol Packet Injector</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Inject raw ASCII frames to test parser handling, delimiter reassembly, or error rejection:
            </p>

            <form onSubmit={handleInjectCustomPacket} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1 }}
                value={customPacketInput}
                onChange={(e) => setCustomPacketInput(e.target.value)}
                placeholder="$SV1,seq,gid,conf,bat*CS"
              />
              <button type="submit" className="btn btn-cyan btn-sm">
                Inject
              </button>
            </form>

            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                onClick={() => setCustomPacketInput('$SV1,105,G02,96,3840*4A')}
              >
                Sample $SV1
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                onClick={() => setCustomPacketInput('G:G06#112')}
              >
                Sample Compact G:06
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                onClick={() => setCustomPacketInput('$SV1,105,G02,96,3840*99')}
              >
                Bad Checksum Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
