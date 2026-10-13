import React, { useState, useEffect, useCallback } from 'react';
import {
  GestureDataSource,
  RecognizedGestureEvent,
  TelemetryMetrics,
  GestureDefinition,
} from './types';
import { sharedGestureEngine } from './services/gestureEngine';
import { audioSynthesizer } from './services/audioSynthesizer';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ModeSwitcher } from './components/ModeSwitcher';
import { CaptionDisplay } from './components/CaptionDisplay';
import { TelemetryBar } from './components/TelemetryBar';
import { DemoModePanel } from './components/DemoModePanel';
import { LiveGlovePanel } from './components/LiveGlovePanel';
import { CommunicationHistory } from './components/CommunicationHistory';
import { BleSettingsModal } from './components/BleSettingsModal';
import { ProtocolDocsModal } from './components/ProtocolDocsModal';
import { ArduinoCodeModal } from './components/ArduinoCodeModal';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<GestureDataSource>('SIMULATED');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const [lastEvent, setLastEvent] = useState<RecognizedGestureEvent | null>(null);
  const [history, setHistory] = useState<RecognizedGestureEvent[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryMetrics>(sharedGestureEngine.getMetrics());
  const [activeGesture, setActiveGesture] = useState<GestureDefinition | null>(null);

  // Modals state
  const [isBleModalOpen, setIsBleModalOpen] = useState(false);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [isArduinoModalOpen, setIsArduinoModalOpen] = useState(false);

  // Initialize accessibility & user preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setReducedMotion(prefersReduced);
    }
  }, []);

  // Subscribe to shared gesture engine events & telemetry
  useEffect(() => {
    const unsubGesture = sharedGestureEngine.subscribe((event) => {
      setLastEvent(event);
      setHistory(sharedGestureEngine.getHistory());
    });

    const unsubTelemetry = sharedGestureEngine.subscribeTelemetry((metrics) => {
      setTelemetry(metrics);
    });

    return () => {
      unsubGesture();
      unsubTelemetry();
    };
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      audioSynthesizer.setEnabled(next);
      return next;
    });
  }, []);

  const handleToggleReducedMotion = useCallback(() => {
    setReducedMotion((prev) => !prev);
  }, []);

  const handleTriggerSimulatedGesture = useCallback((gesture: GestureDefinition) => {
    setActiveGesture(gesture);
    sharedGestureEngine.triggerSimulatedGesture(gesture.id, 97, 3850);
  }, []);

  const handleClearHistory = useCallback(() => {
    sharedGestureEngine.clearHistory();
    setHistory([]);
    setLastEvent(null);
  }, []);

  return (
    <div className={`app-container ${reducedMotion ? 'reduced-motion' : ''}`}>
      <div className="cyber-grid-overlay" aria-hidden="true" />

      {/* Top Navigation */}
      <Navbar
        currentMode={currentMode}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={handleToggleReducedMotion}
        onOpenBleSettings={() => setIsBleModalOpen(true)}
        onOpenProtocolDocs={() => setIsProtocolModalOpen(true)}
        onOpenArduinoCode={() => setIsArduinoModalOpen(true)}
      />

      <main className="main-content" role="main">
        {/* Atmospheric Blue Hero */}
        <HeroSection />

        {/* Mode Switcher Segmented Control */}
        <ModeSwitcher
          currentMode={currentMode}
          onSelectMode={(mode) => setCurrentMode(mode)}
        />

        {/* Live Speech Caption Display Box */}
        <CaptionDisplay lastEvent={lastEvent} />

        {/* Telemetry Metrics Bar */}
        <TelemetryBar metrics={telemetry} />

        {/* Dual Mode View: Demo Simulator vs Live BLE Glove */}
        {currentMode === 'SIMULATED' ? (
          <DemoModePanel
            onTriggerGesture={handleTriggerSimulatedGesture}
            activeGesture={activeGesture}
          />
        ) : (
          <LiveGlovePanel
            onOpenBleSettings={() => setIsBleModalOpen(true)}
            onOpenArduinoCode={() => setIsArduinoModalOpen(true)}
          />
        )}

        {/* Communication History Transcript */}
        <CommunicationHistory
          history={history}
          onClearHistory={handleClearHistory}
        />
      </main>

      {/* Modals */}
      <BleSettingsModal
        isOpen={isBleModalOpen}
        onClose={() => setIsBleModalOpen(false)}
      />

      <ProtocolDocsModal
        isOpen={isProtocolModalOpen}
        onClose={() => setIsProtocolModalOpen(false)}
      />

      <ArduinoCodeModal
        isOpen={isArduinoModalOpen}
        onClose={() => setIsArduinoModalOpen(false)}
      />

      {/* Modern Tech Footer */}
      <Footer />
    </div>
  );
};

export default App;
