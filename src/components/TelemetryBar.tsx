import React from 'react';
import {
  Activity,
  Layers,
  ShieldAlert,
  BatteryCharging,
  Radio,
  Clock,
} from 'lucide-react';
import { TelemetryMetrics } from '../types';

interface TelemetryBarProps {
  metrics: TelemetryMetrics;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ metrics }) => {
  return (
    <div className="telemetry-grid" role="region" aria-label="SignoVox Telemetry Metrics">
      {/* Total Recognized */}
      <div className="stat-card">
        <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Activity size={14} style={{ color: 'var(--cyan-400)' }} />
          <span>Gestures Spoken</span>
        </div>
        <div className="stat-value gradient-text">{metrics.validGesturesCount}</div>
        <div className="stat-subtext">Total sentences delivered</div>
      </div>

      {/* Recognition Confidence */}
      <div className="stat-card">
        <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Radio size={14} style={{ color: 'var(--emerald-400)' }} />
          <span>Avg Confidence</span>
        </div>
        <div className="stat-value" style={{ color: 'var(--emerald-400)' }}>
          {metrics.avgConfidence}%
        </div>
        <div className="stat-subtext">Sensor signature match</div>
      </div>

      {/* Protocol Sequence Number */}
      <div className="stat-card">
        <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Layers size={14} style={{ color: 'var(--purple-400)' }} />
          <span>Active Sequence</span>
        </div>
        <div className="stat-value" style={{ color: 'var(--purple-400)' }}>
          #{metrics.lastSequenceNumber || 0}
        </div>
        <div className="stat-subtext">Monotonic packet counter</div>
      </div>

      {/* Duplicates Dropped */}
      <div className="stat-card">
        <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ShieldAlert size={14} style={{ color: 'var(--amber-400)' }} />
          <span>Duplicates Filtered</span>
        </div>
        <div className="stat-value" style={{ color: 'var(--amber-400)' }}>
          {metrics.duplicateCount}
        </div>
        <div className="stat-subtext">Deduplication active</div>
      </div>

      {/* Glove Battery */}
      <div className="stat-card">
        <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <BatteryCharging size={14} style={{ color: 'var(--cyan-400)' }} />
          <span>Glove Battery</span>
        </div>
        <div className="stat-value" style={{ color: 'var(--cyan-400)' }}>
          {metrics.gloveBatteryPercent}%
        </div>
        <div className="stat-subtext">{metrics.gloveBatteryMv} mV LiPo</div>
      </div>

      {/* Latency */}
      <div className="stat-card">
        <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={14} style={{ color: 'var(--rose-400)' }} />
          <span>Avg Latency</span>
        </div>
        <div className="stat-value" style={{ color: 'var(--text-white)' }}>
          {metrics.lastLatencyMs || 22}ms
        </div>
        <div className="stat-subtext">Recognition to speech</div>
      </div>
    </div>
  );
};
