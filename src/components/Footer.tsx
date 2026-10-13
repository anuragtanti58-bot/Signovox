import React from 'react';
import { Radio, Cpu, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <div className="logo-symbol" style={{ width: '28px', height: '28px' }}>
              <Radio size={14} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>
              Signo<span style={{ color: '#00e5ff' }}>Vox</span>
            </span>
          </div>
          <p className="footer-text">
            Giving voice to sign language through intelligent sensory gloves & accessible real-time communication.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Cpu size={14} style={{ color: 'var(--cyan-400)' }} />
            <span>Arduino Nano + HM-10</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} style={{ color: 'var(--emerald-400)' }} />
            <span>SignoVox Protocol v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
