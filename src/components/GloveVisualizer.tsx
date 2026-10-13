import React from 'react';
import { FingerSensorState } from '../types';
import { Activity, Compass, Cpu, BatteryCharging } from 'lucide-react';

interface GloveVisualizerProps {
  sensors: FingerSensorState;
  activeGestureName?: string;
  batteryMv?: number;
}

export const GloveVisualizer: React.FC<GloveVisualizerProps> = ({
  sensors,
  activeGestureName = 'Neutral Hand Position',
  batteryMv = 3850,
}) => {
  const fingerSensors = [
    { label: 'Thumb', key: 'thumb', value: sensors.thumb, code: 'F1' },
    { label: 'Index', key: 'index', value: sensors.index, code: 'F2' },
    { label: 'Middle', key: 'middle', value: sensors.middle, code: 'F3' },
    { label: 'Ring', key: 'ring', value: sensors.ring, code: 'F4' },
    { label: 'Pinky', key: 'pinky', value: sensors.pinky, code: 'F5' },
  ];

  return (
    <div className="glove-visualizer-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={16} style={{ color: 'var(--cyan-400)' }} />
          <span>Glove Hardware Telemetry</span>
        </div>
        <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
          {activeGestureName}
        </span>
      </div>

      {/* Flex Sensor Level Tracks */}
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Flex Resistor Deflection (0% Straight → 100% Clenched)
        </div>
        <div className="sensor-bars-grid">
          {fingerSensors.map((f) => (
            <div key={f.key} className="sensor-bar-item">
              <span className="sensor-bar-label">{f.label}</span>
              <div className="sensor-bar-track" title={`${f.label} (${f.code}): ${f.value}% deflection`}>
                <div
                  className="sensor-bar-fill"
                  style={{
                    height: `${f.value}%`,
                    background: f.value > 60
                      ? 'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)'
                      : 'linear-gradient(180deg, #00e5ff 0%, #0284c7 100%)',
                  }}
                />
              </div>
              <span className="sensor-bar-val">{f.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* IMU 6-DOF Orientation */}
      <div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Compass size={13} style={{ color: 'var(--cyan-400)' }} />
          <span>MPU-6050 Accelerometer & Gyro Tilt</span>
        </div>
        <div className="imu-telemetry-row">
          <div className="imu-item">
            <div className="imu-label">Pitch</div>
            <div className="imu-val">{sensors.pitch > 0 ? `+${sensors.pitch}°` : `${sensors.pitch}°`}</div>
          </div>
          <div className="imu-item">
            <div className="imu-label">Roll</div>
            <div className="imu-val">{sensors.roll > 0 ? `+${sensors.roll}°` : `${sensors.roll}°`}</div>
          </div>
          <div className="imu-item">
            <div className="imu-label">Yaw / Heading</div>
            <div className="imu-val">{sensors.yaw}°</div>
          </div>
        </div>
      </div>

      {/* Glove Circuitry Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.9rem', background: 'rgba(7, 13, 30, 0.7)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Cpu size={14} style={{ color: 'var(--emerald-400)' }} />
          <span>Arduino Nano + DFPlayer Mini</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
          <BatteryCharging size={14} style={{ color: 'var(--cyan-400)' }} />
          <span className="font-mono">{batteryMv} mV (LiPo)</span>
        </div>
      </div>
    </div>
  );
};
