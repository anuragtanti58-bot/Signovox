import React, { useState, useEffect } from 'react';
import {
  Bluetooth,
  BluetoothOff,
  RefreshCw,
  Cpu,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { BleConnectionStatus } from '../types';
import { bluetoothService } from '../services/bluetooth';
import { sharedGestureEngine } from '../services/gestureEngine';

interface LiveGlovePanelProps {
  onOpenBleSettings: () => void;
  onOpenArduinoCode: () => void;
}

export const LiveGlovePanel: React.FC<LiveGlovePanelProps> = ({
  onOpenBleSettings,
  onOpenArduinoCode,
}) => {
  const [status, setStatus] = useState<BleConnectionStatus>(bluetoothService.getStatus());
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [deviceName, setDeviceName] = useState<string | null>(bluetoothService.getDeviceName());
  const [rawLogs, setRawLogs] = useState<Array<{ text: string; time: string; dir: 'IN' | 'OUT' }>>([]);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    setIsSupported(bluetoothService.isSupported());

    const unsubStatus = bluetoothService.subscribeStatus((newStatus, msg) => {
      setStatus(newStatus);
      if (msg) setStatusMessage(msg);
    });

    const unsubDevice = bluetoothService.subscribeDeviceInfo((name) => {
      setDeviceName(name);
    });

    const unsubRaw = sharedGestureEngine.subscribeRawStream((data, dir) => {
      setRawLogs((prev) => [
        ...prev.slice(-80),
        {
          text: data.trim(),
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          dir,
        },
      ]);
    });

    return () => {
      unsubStatus();
      unsubDevice();
      unsubRaw();
    };
  }, []);

  const handleConnect = async () => {
    await bluetoothService.connect();
  };

  const handleDisconnect = () => {
    bluetoothService.disconnect();
  };

  const handleClearLogs = () => {
    setRawLogs([]);
  };

  const getStatusBannerClass = () => {
    switch (status) {
      case 'connected':
        return 'banner-connected';
      case 'connecting':
      case 'requesting':
        return 'banner-connecting';
      case 'error':
        return 'banner-error';
      default:
        return 'banner-disconnected';
    }
  };

  return (
    <div id="live-panel" role="tabpanel" aria-labelledby="tab-live">
      {/* Real Hardware Disclaimer Banner */}
      <div className="ble-status-banner banner-connecting" style={{ background: 'rgba(37, 99, 235, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
        <AlertTriangle size={20} style={{ color: 'var(--cyan-400)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-white)', marginBottom: '0.2rem' }}>
            HM-10 Bluetooth Low Energy (BLE) Client Ready
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <strong>Important Notice:</strong> Physical Bluetooth communication requires the real SignoVox hardware glove with an HM-10 BLE module and Arduino Nano. Connection cannot be verified until tested with the assembled physical module.
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: BLE Connection Card & Controls */}
        <div className="glass-card rising-card">
          <div className="section-header">
            <h2 className="section-title">
              <Bluetooth size={18} style={{ color: 'var(--cyan-400)' }} />
              <span>Glove BLE Transceiver Connection</span>
            </h2>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenBleSettings}
              title="Edit BLE Service and Characteristic UUIDs"
            >
              <SlidersHorizontal size={14} />
              <span>Configure UUIDs</span>
            </button>
          </div>

          {/* Connection Status Box */}
          <div className={`ble-status-banner ${getStatusBannerClass()}`}>
            {status === 'connected' ? (
              <CheckCircle2 size={18} style={{ color: 'var(--emerald-400)', flexShrink: 0 }} />
            ) : status === 'connecting' || status === 'requesting' ? (
              <RefreshCw size={18} className="spin" style={{ color: 'var(--cyan-400)', flexShrink: 0 }} />
            ) : status === 'error' ? (
              <AlertTriangle size={18} style={{ color: 'var(--rose-400)', flexShrink: 0 }} />
            ) : (
              <BluetoothOff size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            )}

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                Status: {status}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                {statusMessage ||
                  (status === 'disconnected'
                    ? 'No Bluetooth device connected. Click below to pair with your HM-10 module.'
                    : status === 'connected'
                    ? `Active UART stream connected to ${deviceName || 'SignoVox Glove'}.`
                    : '')}
              </div>
            </div>
          </div>

          {/* Browser Support Check */}
          {!isSupported && (
            <div className="ble-status-banner banner-error">
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem' }}>
                <strong>Browser Unsupported:</strong> Web Bluetooth is not available in your current browser. Please launch in Google Chrome, Microsoft Edge, or Bluefy (iOS) over HTTPS / localhost.
              </div>
            </div>
          )}

          {/* Connection Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {status === 'connected' ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDisconnect}
                style={{ flex: 1 }}
              >
                <BluetoothOff size={16} />
                <span>Disconnect Glove</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConnect}
                disabled={!isSupported || status === 'connecting' || status === 'requesting'}
                style={{ flex: 1 }}
              >
                {status === 'connecting' || status === 'requesting' ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>Searching for Glove...</span>
                  </>
                ) : (
                  <>
                    <Bluetooth size={16} />
                    <span>Pair & Connect HM-10 Glove</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Glove Independence Architecture Callout */}
          <div className="hardware-callout">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '0.35rem' }}>
              <Volume2 size={15} style={{ color: 'var(--cyan-400)' }} />
              <span>Independent Speech Audio Principle</span>
            </div>
            <p>
              The SignoVox glove operates <strong>standalone</strong>. When a user forms a gesture, the onboard Arduino Nano instantly commands the DFPlayer Mini MP3 module to play the sentence through the glove's speaker.
            </p>
            <p style={{ marginTop: '0.4rem' }}>
              The website acts as a real-time visual teleprompter, caption display, and telemetry recorder, but is <strong>not required</strong> for the physical glove to speak.
            </p>
          </div>
        </div>

        {/* Right Column: Live Serial Terminal & Protocol Monitor */}
        <div className="glass-card rising-card">
          <div className="section-header">
            <h2 className="section-title">
              <Terminal size={18} style={{ color: 'var(--cyan-400)' }} />
              <span>HM-10 Raw Serial Stream Monitor</span>
            </h2>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleClearLogs}
                title="Clear serial monitor console"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div className="terminal-box" aria-label="Raw Serial Console Output" role="log">
            {rawLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                // Awaiting incoming Bluetooth UART stream from HM-10...
                // Baud: 9600 bps | RX Buffer: 128 bytes | Delimiter: \n
                // Example frame: $SV1,104,G02,98,3840*4A
              </div>
            ) : (
              rawLogs.map((log, idx) => (
                <div key={idx} style={{ marginBottom: '2px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>[{log.time}]</span>{' '}
                  <span style={{ color: log.dir === 'IN' ? 'var(--cyan-400)' : 'var(--emerald-400)' }}>
                    {log.dir === 'IN' ? '« RX' : '» TX'}:
                  </span>{' '}
                  <span style={{ color: log.text.startsWith('$SV1') ? '#ffffff' : 'var(--cyan-400)' }}>
                    {log.text}
                  </span>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              HM-10 CC2541 UART RX/TX Stream
            </span>
            <button
              type="button"
              className="btn btn-cyan btn-sm"
              onClick={onOpenArduinoCode}
              style={{ fontSize: '0.74rem' }}
            >
              <Cpu size={13} />
              <span>View Arduino Firmware</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
