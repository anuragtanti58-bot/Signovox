import React from 'react';
import { Gamepad2, Radio, Info } from 'lucide-react';
import { GestureDataSource } from '../types';

interface ModeSwitcherProps {
  currentMode: GestureDataSource;
  onSelectMode: (mode: GestureDataSource) => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onSelectMode }) => {
  return (
    <div className="mode-switcher-container" role="region" aria-label="Glove Mode Selector">
      <div className="segmented-control">
        <button
          type="button"
          className={`segment-btn ${currentMode === 'SIMULATED' ? 'active' : ''}`}
          onClick={() => onSelectMode('SIMULATED')}
          role="tab"
          aria-selected={currentMode === 'SIMULATED'}
          aria-controls="demo-panel"
          id="tab-demo"
        >
          <Gamepad2 size={18} />
          <span>Demo Mode (Simulated Glove)</span>
        </button>

        <button
          type="button"
          className={`segment-btn ${currentMode === 'LIVE_BLE' ? 'active' : ''}`}
          onClick={() => onSelectMode('LIVE_BLE')}
          role="tab"
          aria-selected={currentMode === 'LIVE_BLE'}
          aria-controls="live-panel"
          id="tab-live"
        >
          <Radio size={18} />
          <span>Live Glove Mode (HM-10 BLE)</span>
        </button>

        <div
          className={`segment-indicator ${
            currentMode === 'SIMULATED' ? 'indicator-demo' : 'indicator-live'
          }`}
          style={{
            width: '50%',
            left: currentMode === 'SIMULATED' ? '0.35rem' : 'calc(50% - 0.35rem)',
          }}
          aria-hidden="true"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        <Info size={14} style={{ color: 'var(--cyan-400)' }} />
        {currentMode === 'SIMULATED' ? (
          <span>
            <strong>Simulated Stand-in:</strong> Test all 20 gestures, protocol telemetry & speech recognition before physical glove assembly.
          </span>
        ) : (
          <span>
            <strong>Hardware Ready:</strong> Connects to physical Arduino Nano + HM-10 BLE over Web Bluetooth API.
          </span>
        )}
      </div>
    </div>
  );
};
