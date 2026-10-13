import React from 'react';
import {
  Volume2,
  VolumeX,
  FileCode2,
  Cpu,
  Eye,
  EyeOff,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { GestureDataSource } from '../types';

interface NavbarProps {
  currentMode: GestureDataSource;
  soundEnabled: boolean;
  onToggleSound: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onOpenProtocolDocs: () => void;
  onOpenArduinoCode: () => void;
  onOpenBleSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  soundEnabled,
  onToggleSound,
  reducedMotion,
  onToggleReducedMotion,
  onOpenProtocolDocs,
  onOpenArduinoCode,
  onOpenBleSettings,
}) => {
  return (
    <header className="navbar" role="banner">
      <div className="nav-container">
        <a href="#top" className="logo-link" aria-label="SignoVox Home">
          <div className="logo-symbol" aria-hidden="true">
            <Radio size={20} />
          </div>
          <div>
            <div className="logo-text">
              <span className="gradient-text">Signo</span>
              <span style={{ color: '#00e5ff' }}>Vox</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Smart Glove Communication
            </div>
          </div>
        </a>

        <div className="nav-actions">
          {/* Active Mode Pill */}
          {currentMode === 'SIMULATED' ? (
            <span className="badge badge-simulated" title="Operating with simulated gesture engine">
              <span className="badge-pulse" aria-hidden="true" />
              Demo Mode
            </span>
          ) : (
            <span className="badge badge-live" title="Operating with Web Bluetooth Low Energy">
              <span className="badge-pulse" aria-hidden="true" />
              Live BLE Mode
            </span>
          )}

          {/* Web Audio Toggle */}
          <button
            type="button"
            className={`btn btn-secondary btn-icon ${soundEnabled ? 'active' : ''}`}
            onClick={onToggleSound}
            title={soundEnabled ? 'Web audio speech preview: ON (Click to mute)' : 'Web audio speech preview: MUTED (Click to unmute)'}
            aria-label={soundEnabled ? 'Mute web audio speech preview' : 'Unmute web audio speech preview'}
          >
            {soundEnabled ? <Volume2 size={18} style={{ color: 'var(--cyan-400)' }} /> : <VolumeX size={18} style={{ color: 'var(--text-muted)' }} />}
          </button>

          {/* Reduced Motion Toggle */}
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={onToggleReducedMotion}
            title={reducedMotion ? 'Reduced motion: Enabled (Click to disable)' : 'Reduced motion: Disabled (Click to enable)'}
            aria-label="Toggle reduced motion"
          >
            {reducedMotion ? <EyeOff size={18} style={{ color: 'var(--amber-400)' }} /> : <Eye size={18} />}
          </button>

          {/* BLE Config Modal Toggle */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenBleSettings}
            title="Configure HM-10 Bluetooth Low Energy UUIDs"
          >
            <SlidersHorizontal size={15} />
            <span className="d-none-sm">BLE Config</span>
          </button>

          {/* Protocol Docs */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenProtocolDocs}
            title="View SignoVox Communication Protocol v1.0 Spec"
          >
            <FileCode2 size={15} />
            <span className="d-none-sm">Protocol</span>
          </button>

          {/* Arduino Code */}
          <button
            type="button"
            className="btn btn-cyan btn-sm"
            onClick={onOpenArduinoCode}
            title="View Arduino Nano + HM-10 Source Code"
          >
            <Cpu size={15} />
            <span className="d-none-sm">Arduino C++</span>
          </button>
        </div>
      </div>
    </header>
  );
};
