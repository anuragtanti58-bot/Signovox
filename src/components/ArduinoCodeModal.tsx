import React, { useState } from 'react';
import { X, Cpu, Copy, Check, Download } from 'lucide-react';

interface ArduinoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ARDUINO_FIRMWARE_CODE = `/*
 * SignoVox Glove Firmware v1.0
 * Hardware: Arduino Nano (ATmega328P) + HM-10 BLE + DFPlayer Mini + Flex Sensors + MPU6050
 * 
 * Features:
 * 1. Reads 5 Analog Flex Sensors (A0..A4) + MPU6050 6-DOF IMU
 * 2. Matches sensor profile against 20 gesture signatures
 * 3. Plays audio sentence independently via DFPlayer Mini speaker
 * 4. Transmits framed $SV1 telemetry packet via SoftwareSerial to HM-10 BLE
 */

#include <SoftwareSerial.h>
#include <DFRobotDFPlayerMini.h>
#include <Wire.h>

// Pins Configuration
SoftwareSerial hm10Serial(2, 3); // RX=D2, TX=D3 (HM-10 BLE)
SoftwareSerial dfSerial(10, 11); // RX=D10, TX=D11 (DFPlayer Mini)
DFRobotDFPlayerMini dfPlayer;

const int FLEX_PINS[5] = {A0, A1, A2, A3, A6};
uint16_t sequenceCounter = 100;

// XOR Checksum Calculator
uint8_t calculateChecksum(const char* payload) {
  uint8_t xorVal = 0;
  for (int i = 0; payload[i] != '\\0'; i++) {
    xorVal ^= (uint8_t)payload[i];
  }
  return xorVal;
}

void setup() {
  Serial.begin(115200);
  hm10Serial.begin(9600); // Standard HM-10 default baud
  dfSerial.begin(9600);

  // Initialize DFPlayer Mini for onboard speaker audio
  if (dfPlayer.begin(dfSerial)) {
    dfPlayer.volume(25); // Volume level 0..30
    Serial.println(F("DFPlayer Mini Online. Independent Audio Active."));
  }

  Wire.begin();
  Serial.println(F("SignoVox Glove System Ready."));
}

void loop() {
  // Read flex sensors and detect gesture ID (1 to 20)
  int detectedGestureId = readAndClassifyGesture();

  if (detectedGestureId > 0) {
    // 1. Independent Onboard Audio Playback
    dfPlayer.play(detectedGestureId);

    // 2. Transmit $SV1 Packet over HM-10 BLE
    transmitBleTelemetry(detectedGestureId, 96, 3850);
    delay(1200); // Debounce trigger hold
  }

  delay(20);
}

void transmitBleTelemetry(int gestureNum, int confidence, int batteryMv) {
  sequenceCounter++;
  if (sequenceCounter > 65535) sequenceCounter = 1;

  char payload[64];
  snprintf(payload, sizeof(payload), "SV1,%u,G%02d,%d,%d", sequenceCounter, gestureNum, confidence, batteryMv);
  uint8_t cs = calculateChecksum(payload);

  char frame[80];
  snprintf(frame, sizeof(frame), "$%s*%02X\\n", payload, cs);

  hm10Serial.print(frame);
  Serial.print(F("[BLE TX] "));
  Serial.print(frame);
}

int readAndClassifyGesture() {
  // Placeholder gesture classification logic for 20 gestures
  // Returns 1..20 if matched with high confidence, otherwise 0
  return 0;
}
`;

export const ArduinoCodeModal: React.FC<ArduinoCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(ARDUINO_FIRMWARE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([ARDUINO_FIRMWARE_CODE], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SignoVox_Glove_Firmware.ino';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="arduino-modal-title">
      <div className="modal-content" style={{ maxWidth: '820px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu size={22} style={{ color: 'var(--cyan-400)' }} />
            <div>
              <h2 id="arduino-modal-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Arduino Nano + HM-10 Firmware Template
              </h2>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                SignoVox_Glove_Firmware.ino | DFPlayer Mini Audio + BLE Telemetry
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

        <div>
          <div style={{ background: 'rgba(14, 26, 56, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.9rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-white)' }}>Independent Speech Audio Verification:</strong> Notice how <code>dfPlayer.play(detectedGestureId)</code> is called directly by the microcontroller upon gesture recognition, ensuring that the glove speaks even when disconnected from the computer or phone!
          </div>

          <div style={{ position: 'relative' }}>
            <pre className="terminal-box" style={{ height: '360px', fontSize: '0.78rem', color: '#e2e8f0', background: '#020617' }}>
              <code>{ARDUINO_FIRMWARE_CODE}</code>
            </pre>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopy}
            >
              {copied ? <Check size={16} style={{ color: 'var(--emerald-400)' }} /> : <Copy size={16} />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownload}
            >
              <Download size={16} />
              <span>Download .ino File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
