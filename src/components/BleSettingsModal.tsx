import React, { useState } from 'react';
import { X, SlidersHorizontal, Save, RotateCcw, Check } from 'lucide-react';
import {
  bluetoothService,
  DEFAULT_HM10_SERVICE_UUID,
  DEFAULT_HM10_CHARACTERISTIC_UUID,
} from '../services/bluetooth';

interface BleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BleSettingsModal: React.FC<BleSettingsModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = bluetoothService.getConfig();

  const [serviceUuid, setServiceUuid] = useState(currentConfig.serviceUuid);
  const [characteristicUuid, setCharacteristicUuid] = useState(currentConfig.characteristicUuid);
  const [deviceNamePrefix, setDeviceNamePrefix] = useState(currentConfig.deviceNamePrefix);
  const [autoReconnect, setAutoReconnect] = useState(currentConfig.autoReconnect);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    bluetoothService.updateConfig({
      serviceUuid: serviceUuid.trim(),
      characteristicUuid: characteristicUuid.trim(),
      deviceNamePrefix: deviceNamePrefix.trim(),
      autoReconnect,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetDefaults = () => {
    setServiceUuid(DEFAULT_HM10_SERVICE_UUID);
    setCharacteristicUuid(DEFAULT_HM10_CHARACTERISTIC_UUID);
    setDeviceNamePrefix('SignoVox');
    setAutoReconnect(true);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="ble-modal-title">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <SlidersHorizontal size={20} style={{ color: 'var(--cyan-400)' }} />
            <h2 id="ble-modal-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Bluetooth Low Energy (HM-10) Configuration
            </h2>
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

        <form onSubmit={handleSave}>
          <div style={{ background: 'rgba(14, 26, 56, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-white)' }}>Configurable Hardware UUIDs:</strong> Because CC2541 clones (HM-10, MLT-BT05, AT-09) may vary in firmware revisions, you can customize GATT Service and Characteristic UUIDs here until physically validated.
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="serviceUuid">
              Primary UART Service UUID:
            </label>
            <input
              id="serviceUuid"
              type="text"
              className="form-input"
              value={serviceUuid}
              onChange={(e) => setServiceUuid(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
              Default HM-10: <code>0000ffe0-0000-1000-8000-00805f9b34fb</code>
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="charUuid">
              UART Characteristic UUID (Read / Write / Notify):
            </label>
            <input
              id="charUuid"
              type="text"
              className="form-input"
              value={characteristicUuid}
              onChange={(e) => setCharacteristicUuid(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
              Default HM-10: <code>0000ffe1-0000-1000-8000-00805f9b34fb</code>
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="namePrefix">
              Device Name Filter / Prefix:
            </label>
            <input
              id="namePrefix"
              type="text"
              className="form-input"
              value={deviceNamePrefix}
              onChange={(e) => setDeviceNamePrefix(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            <input
              id="autoReconnect"
              type="checkbox"
              style={{ width: '18px', height: '18px', accentColor: 'var(--cyan-500)', cursor: 'pointer' }}
              checked={autoReconnect}
              onChange={(e) => setAutoReconnect(e.target.checked)}
            />
            <label htmlFor="autoReconnect" style={{ fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Enable Automatic Reconnection upon unexpected signal drop
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetDefaults}
            >
              <RotateCcw size={14} />
              <span>Reset Defaults</span>
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {savedSuccess ? (
                  <>
                    <Check size={16} style={{ color: 'var(--emerald-400)' }} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
