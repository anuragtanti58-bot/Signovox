# SignoVox 🧤⚡

> **Smart Gesture-to-Speech Communication Platform**  
> Giving voice to sign language through intelligent sensory gloves and accessible real-time Bluetooth Low Energy communication.

---

## 🌟 Overview

**SignoVox** is an assistive technology platform designed to bridge communication gaps for individuals who use sign language. By interfacing with smart sensor gloves equipped with flex sensors and inertial measurement units (MPU-6050) connected to an Arduino Nano and HM-10 Bluetooth module, SignoVox translates physical gestures into visual captions and audible synthesized speech in real-time.

---

## 🚀 Key Features

- **Dual-Mode Operation**:
  - **Live Hardware Mode**: Connect via Web Bluetooth API directly to HM-10 BLE modules paired with microcontroller hardware (Arduino Nano/ESP32).
  - **Interactive Simulation Mode**: Explore pre-configured American Sign Language (ASL) and custom gesture libraries with interactive hand visualizers.
- **3D Glove Visualizer**: Real-time visualization of finger flex angles, sensor resistances, and hand tilt/orientation.
- **Text-to-Speech (TTS) Engine**: Immediate auditory feedback using browser speech synthesis with customizable speech rates and pitch.
- **Communication History**: Log of transcribed gestures with timestamps, playback options, and transcript export.
- **Microcontroller Integration**:
  - Embedded Arduino C++ firmware sketches ready to upload.
  - Comprehensive custom BLE packet protocol documentation.
- **Dark Neon Cyberpunk Aesthetic**: Responsive, accessible, high-contrast UI built with modern CSS and fluid typography.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Hardware Protocol**: Web Bluetooth API (`BluetoothDevice`, GATT Services & Characteristics)
- **Embedded Target**: Arduino Nano / ATmega328P, HM-10 BLE 4.0, Flex Sensors, MPU-6050 6-DOF IMU

---

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/anuragtanti58-bot/Signovox.git

# Navigate to project directory
cd Signovox

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be running locally at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

---

## 📜 License

MIT License.
