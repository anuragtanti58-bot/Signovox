import React, { useState } from 'react';
import {
  History,
  Search,
  Download,
  Trash2,
  Volume2,
  Copy,
  Check,
} from 'lucide-react';
import { RecognizedGestureEvent } from '../types';
import { audioSynthesizer } from '../services/audioSynthesizer';

interface CommunicationHistoryProps {
  history: RecognizedGestureEvent[];
  onClearHistory: () => void;
}

export const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({
  history,
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'SIMULATED' | 'LIVE_BLE'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = history.filter((item) => {
    const matchesSource = sourceFilter === 'ALL' || item.source === sourceFilter;
    const matchesSearch =
      item.sentence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.gestureId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesSearch;
  });

  const handleCopy = (item: RecognizedGestureEvent) => {
    navigator.clipboard.writeText(item.sentence);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReplay = (item: RecognizedGestureEvent) => {
    audioSynthesizer.speak(item.sentence);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signovox_transcript_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'GestureID', 'Name', 'Sentence', 'Source', 'Confidence', 'SequenceNumber', 'Duplicate'];
    const rows = history.map((item) => [
      new Date(item.timestamp).toISOString(),
      item.gestureId,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.sentence.replace(/"/g, '""')}"`,
      item.source,
      item.confidence,
      item.sequenceNumber,
      item.isDuplicate,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signovox_transcript_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="history-card rising-card" aria-label="Communication History Log">
      <div className="section-header">
        <h2 className="section-title">
          <History size={18} style={{ color: 'var(--cyan-400)' }} />
          <span>Communication History & Captions Transcript</span>
        </h2>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={exportCSV}
            disabled={history.length === 0}
            title="Export conversation history as CSV spreadsheet"
          >
            <Download size={13} />
            <span>CSV</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={exportJSON}
            disabled={history.length === 0}
            title="Export conversation history as JSON"
          >
            <Download size={13} />
            <span>JSON</span>
          </button>

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={onClearHistory}
            disabled={history.length === 0}
            title="Clear all recorded sentences"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="history-controls">
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search
            size={15}
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="search-input"
            style={{ paddingLeft: '2.2rem', maxWidth: '100%' }}
            placeholder="Search transcript history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search conversation history"
          />
        </div>

        <div className="filter-tabs" style={{ marginBottom: 0, paddingBottom: 0 }}>
          <button
            type="button"
            className={`tab-btn ${sourceFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setSourceFilter('ALL')}
          >
            All Sources ({history.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${sourceFilter === 'SIMULATED' ? 'active' : ''}`}
            onClick={() => setSourceFilter('SIMULATED')}
          >
            Simulated ({history.filter((i) => i.source === 'SIMULATED').length})
          </button>
          <button
            type="button"
            className={`tab-btn ${sourceFilter === 'LIVE_BLE' ? 'active' : ''}`}
            onClick={() => setSourceFilter('LIVE_BLE')}
          >
            Live BLE ({history.filter((i) => i.source === 'LIVE_BLE').length})
          </button>
        </div>
      </div>

      {/* History Items List */}
      <div className="history-list" role="feed" aria-label="Transcript events list">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            No transcript events recorded yet. Trigger gestures from the simulator or connect live glove.
          </div>
        ) : (
          filtered.map((item) => (
            <article
              key={item.id}
              className={`history-item ${item.isDuplicate ? 'duplicate' : ''}`}
            >
              <div className="history-left">
                <span className="g-id-badge">{item.gestureId}</span>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="history-sentence" title={item.sentence}>
                    "{item.sentence}"
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span>{item.name}</span>
                    <span>•</span>
                    <span style={{ color: 'var(--cyan-400)' }}>{item.confidence}% Match</span>
                    <span>•</span>
                    <span>Seq #{item.sequenceNumber}</span>
                  </div>
                </div>
              </div>

              <div className="history-right">
                <span
                  className={`badge ${
                    item.source === 'SIMULATED' ? 'badge-simulated' : 'badge-live'
                  }`}
                  style={{ fontSize: '0.7rem' }}
                >
                  {item.source === 'SIMULATED' ? 'Simulated' : 'Live BLE'}
                </span>

                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>

                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  style={{ width: '30px', height: '30px' }}
                  onClick={() => handleReplay(item)}
                  title="Speak this sentence aloud"
                  aria-label={`Speak "${item.sentence}" aloud`}
                >
                  <Volume2 size={14} />
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  style={{ width: '30px', height: '30px' }}
                  onClick={() => handleCopy(item)}
                  title="Copy sentence to clipboard"
                  aria-label={`Copy "${item.sentence}" to clipboard`}
                >
                  {copiedId === item.id ? (
                    <Check size={14} style={{ color: 'var(--emerald-400)' }} />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};
