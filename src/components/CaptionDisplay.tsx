import React, { useState } from 'react';
import {
  Volume2,
  Copy,
  Check,
  Radio,
  Clock,
  Zap,
  Activity,
} from 'lucide-react';
import { RecognizedGestureEvent } from '../types';
import { audioSynthesizer } from '../services/audioSynthesizer';

interface CaptionDisplayProps {
  lastEvent: RecognizedGestureEvent | null;
}

export const CaptionDisplay: React.FC<CaptionDisplayProps> = ({ lastEvent }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!lastEvent?.sentence) return;
    navigator.clipboard.writeText(lastEvent.sentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplayAudio = () => {
    if (!lastEvent?.sentence) return;
    audioSynthesizer.speak(lastEvent.sentence);
  };

  const formattedTime = lastEvent
    ? new Date(lastEvent.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--';

  return (
    <section
      className="caption-box"
      aria-label="Live Recognized Speech Output"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="caption-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: lastEvent ? 'var(--cyan-500)' : 'var(--text-muted)',
              boxShadow: lastEvent ? '0 0 10px var(--cyan-500)' : 'none',
            }}
          />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Recognized Glove Speech
          </span>

          {lastEvent && (
            <span
              className={`badge ${
                lastEvent.source === 'SIMULATED' ? 'badge-simulated' : 'badge-live'
              }`}
            >
              {lastEvent.source === 'SIMULATED' ? 'Simulated Glove' : 'Live BLE Glove'}
            </span>
          )}

          {lastEvent?.isDuplicate && (
            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              Duplicate Dropped
            </span>
          )}
        </div>

        {lastEvent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="g-id-badge">{lastEvent.gestureId}</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              ({lastEvent.name})
            </span>
          </div>
        )}
      </div>

      <div className="caption-sentence">
        {lastEvent ? (
          <span>"{lastEvent.sentence}"</span>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 400 }}>
            Ready for input. Trigger a simulated gesture below or connect live BLE glove...
          </span>
        )}
      </div>

      <div className="caption-meta">
        <div className="meta-stats">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
            <span>{formattedTime}</span>
          </div>

          {lastEvent && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Activity size={14} style={{ color: 'var(--cyan-400)' }} />
                <span>Confidence: {lastEvent.confidence}%</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Zap size={14} style={{ color: 'var(--emerald-400)' }} />
                <span>Seq: #{lastEvent.sequenceNumber}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Radio size={14} style={{ color: 'var(--purple-400)' }} />
                <span>Latency: {lastEvent.latencyMs || 22}ms</span>
              </div>
            </>
          )}
        </div>

        {lastEvent && (
          <div className="caption-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleReplayAudio}
              title="Speak sentence aloud via Web Audio"
              aria-label="Replay speech audio"
            >
              <Volume2 size={15} />
              <span>Speak</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopy}
              title="Copy recognized sentence to clipboard"
              aria-label="Copy sentence to clipboard"
            >
              {copied ? <Check size={15} style={{ color: 'var(--emerald-400)' }} /> : <Copy size={15} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
