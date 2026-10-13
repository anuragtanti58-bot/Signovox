import React from 'react';
import { Sparkles, Radio, Volume2, ShieldCheck, Cpu } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="hero-section" id="top" aria-labelledby="hero-heading">
      <div className="hero-pill-badge">
        <Sparkles size={14} style={{ color: 'var(--cyan-400)' }} />
        <span>Next-Generation Sign Language Translation System</span>
      </div>

      <h1 id="hero-heading" className="hero-title">
        Giving Voice to <span className="gradient-text">Sign Language</span> with Intelligent Glove Sensing
      </h1>

      <p className="hero-subtitle">
        SignoVox translates hand gestures into clear spoken English. Powered by high-precision flex sensors, an MPU6050 IMU, and independent onboard audio synthesis with real-time Bluetooth telemetry streaming.
      </p>

      <div className="hero-highlights">
        <div className="highlight-item">
          <Cpu size={16} className="icon" />
          <span>Independent On-Glove Speaker Audio</span>
        </div>
        <div className="highlight-item">
          <Radio size={16} className="icon" />
          <span>HM-10 Bluetooth Low Energy Stream</span>
        </div>
        <div className="highlight-item">
          <Volume2 size={16} className="icon" />
          <span>20 Predefined Expressive Gestures</span>
        </div>
        <div className="highlight-item">
          <ShieldCheck size={16} className="icon" />
          <span>Framed Protocol with Deduplication</span>
        </div>
      </div>
    </section>
  );
};
