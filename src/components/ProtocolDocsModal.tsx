import React from 'react';
import { X, FileCode2, ShieldCheck, Layers, Copy, Check } from 'lucide-react';
import { SIGN_GESTURES } from '../data/gestures';

interface ProtocolDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProtocolDocsModal: React.FC<ProtocolDocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedSample, setCopiedSample] = React.useState(false);

  if (!isOpen) return null;

  const sampleFrame = '$SV1,104,G02,98,3840*4A\\n';

  const copySample = () => {
    navigator.clipboard.writeText('$SV1,104,G02,98,3840*4A\n');
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="proto-modal-title">
      <div className="modal-content" style={{ maxWidth: '860px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileCode2 size={22} style={{ color: 'var(--cyan-400)' }} />
            <div>
              <h2 id="proto-modal-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                SignoVox Communication Protocol Specification
              </h2>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Version: SV1.0 | Transport: HM-10 BLE UART (9600-115200 bps)
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1: Standard Frame Spec */}
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-white)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} style={{ color: 'var(--emerald-400)' }} />
              <span>1. Standard Telemetry Frame Format ($SV1)</span>
            </h3>

            <div style={{ background: '#030712', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '1rem', position: 'relative' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--cyan-400)', marginBottom: '0.5rem' }}>
                $SV1,&lt;seq&gt;,&lt;gesture_id&gt;,&lt;confidence&gt;,&lt;battery_mv&gt;*&lt;CHECKSUM&gt;\n
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#ffffff' }}>
                Example: {sampleFrame}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ position: 'absolute', right: '0.75rem', top: '0.75rem', fontSize: '0.72rem' }}
                onClick={copySample}
              >
                {copiedSample ? <Check size={12} style={{ color: 'var(--emerald-400)' }} /> : <Copy size={12} />}
                <span>{copiedSample ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <table style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.4rem' }}>Field</th>
                  <th style={{ padding: '0.4rem' }}>Type</th>
                  <th style={{ padding: '0.4rem' }}>Description</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text-secondary)' }}>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>$SV1</td>
                  <td style={{ padding: '0.4rem' }}>Header</td>
                  <td style={{ padding: '0.4rem' }}>Protocol identifier and version prefix</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>&lt;seq&gt;</td>
                  <td style={{ padding: '0.4rem' }}>UInt16</td>
                  <td style={{ padding: '0.4rem' }}>Monotonically increasing sequence number for duplicate detection</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>&lt;gesture_id&gt;</td>
                  <td style={{ padding: '0.4rem' }}>String</td>
                  <td style={{ padding: '0.4rem' }}>Predefined Gesture Code (<code>G01</code> through <code>G20</code>)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>&lt;confidence&gt;</td>
                  <td style={{ padding: '0.4rem' }}>UInt8</td>
                  <td style={{ padding: '0.4rem' }}>Sensor pattern match confidence percentage (0 to 100)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>&lt;battery_mv&gt;</td>
                  <td style={{ padding: '0.4rem' }}>UInt16</td>
                  <td style={{ padding: '0.4rem' }}>Glove Li-Po battery voltage in millivolts (e.g. 3850 mV)</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>*&lt;CHECKSUM&gt;</td>
                  <td style={{ padding: '0.4rem' }}>Hex (2)</td>
                  <td style={{ padding: '0.4rem' }}>8-bit XOR checksum over payload characters between $ and *</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Deduplication & Stream Buffer */}
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-white)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={16} style={{ color: 'var(--cyan-400)' }} />
              <span>2. Deduplication & MTU Stream Buffer Handling</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              BLE GATT notifications transmit chunks of up to 20 bytes (standard BLE MTU). SignoVox incorporates a <strong>line-buffering stream accumulator</strong> that seamlessly reassembles split chunks across packet boundaries.
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '0.4rem' }}>
              The deduplication engine maintains a sliding window of recent sequence numbers to prevent duplicate spoken triggers when BLE packets are retransmitted over noisy RF links.
            </p>
          </div>

          {/* Section 3: 20 Gesture Dictionary Specs */}
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-white)', marginBottom: '0.6rem' }}>
              3. Predefined Gestures & Sentences (≤ 5 Words Enforced)
            </h3>
            <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(8, 15, 32, 0.9)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>ID</th>
                    <th style={{ padding: '0.5rem' }}>Gesture Name</th>
                    <th style={{ padding: '0.5rem' }}>Category</th>
                    <th style={{ padding: '0.5rem' }}>Spoken Sentence</th>
                    <th style={{ padding: '0.5rem' }}>Words</th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--text-secondary)' }}>
                  {SIGN_GESTURES.map((g) => (
                    <tr key={g.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>{g.id}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 600, color: '#ffffff' }}>{g.name}</td>
                      <td style={{ padding: '0.5rem' }}>{g.category}</td>
                      <td style={{ padding: '0.5rem', fontStyle: 'italic', color: '#ffffff' }}>"{g.sentence}"</td>
                      <td style={{ padding: '0.5rem', color: 'var(--emerald-400)', fontWeight: 700 }}>{g.wordCount} / 5</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
