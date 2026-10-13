import { BleConfig, BleConnectionStatus } from '../types';
import { sharedGestureEngine } from './gestureEngine';

type StatusChangeListener = (status: BleConnectionStatus, message?: string) => void;
type DeviceInfoListener = (name: string | null, id: string | null) => void;

// Standard HM-10 CC2541 BLE UART Service & Characteristic UUIDs
export const DEFAULT_HM10_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
export const DEFAULT_HM10_CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  private status: BleConnectionStatus = 'disconnected';
  private statusListeners: Set<StatusChangeListener> = new Set();
  private deviceInfoListeners: Set<DeviceInfoListener> = new Set();

  private config: BleConfig = {
    serviceUuid: DEFAULT_HM10_SERVICE_UUID,
    characteristicUuid: DEFAULT_HM10_CHARACTERISTIC_UUID,
    deviceNamePrefix: 'SignoVox',
    autoReconnect: true,
    baudRateInfo: '9600 bps (HM-10 Default)',
  };

  private textDecoder = new TextDecoder('utf-8');
  private textEncoder = new TextEncoder();
  private userExplicitDisconnect = false;

  constructor() {
    this.loadConfig();
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public getStatus(): BleConnectionStatus {
    return this.status;
  }

  public getConfig(): BleConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<BleConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  public getDeviceName(): string | null {
    return this.device?.name || null;
  }

  public getDeviceId(): string | null {
    return this.device?.id || null;
  }

  public subscribeStatus(listener: StatusChangeListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public subscribeDeviceInfo(listener: DeviceInfoListener): () => void {
    this.deviceInfoListeners.add(listener);
    listener(this.getDeviceName(), this.getDeviceId());
    return () => this.deviceInfoListeners.delete(listener);
  }

  private setStatus(status: BleConnectionStatus, message?: string): void {
    this.status = status;
    this.statusListeners.forEach((fn) => {
      try {
        fn(status, message);
      } catch (err) {
        console.error('Error in status listener:', err);
      }
    });
  }

  private notifyDeviceInfo(): void {
    const name = this.getDeviceName();
    const id = this.getDeviceId();
    this.deviceInfoListeners.forEach((fn) => {
      try {
        fn(name, id);
      } catch (err) {
        console.error('Error in device info listener:', err);
      }
    });
  }

  /**
   * Request device & initiate BLE connection
   */
  public async connect(): Promise<void> {
    if (!this.isSupported()) {
      this.setStatus(
        'error',
        'Web Bluetooth is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Opera over HTTPS/localhost.'
      );
      return;
    }

    try {
      this.userExplicitDisconnect = false;
      this.setStatus('requesting', 'Scanning for nearby SignoVox HM-10 Bluetooth devices...');

      const serviceUuid = this.config.serviceUuid.trim().toLowerCase();

      // Build options for requestDevice
      const options: RequestDeviceOptions = {
        filters: [
          { services: [serviceUuid] },
        ],
        optionalServices: [serviceUuid],
      };

      try {
        this.device = await navigator.bluetooth.requestDevice(options);
      } catch (err) {
        // Fallback: accept all devices if filter didn't match peripheral advertising packet
        console.warn('Direct UUID filter failed or rejected, trying acceptAllDevices fallback:', err);
        this.device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [serviceUuid, '0000ffe0-0000-1000-8000-00805f9b34fb', 'ffe0'],
        });
      }

      if (!this.device) {
        throw new Error('No device selected.');
      }

      this.notifyDeviceInfo();
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      this.setStatus('connecting', `Connecting to GATT server on ${this.device.name || 'HM-10 Device'}...`);

      if (!this.device.gatt) {
        throw new Error('Device does not have a GATT server.');
      }

      this.server = await this.device.gatt.connect();

      this.setStatus('connecting', 'Locating HM-10 UART Service...');
      const primaryService = await this.server.getPrimaryService(serviceUuid);

      this.setStatus('connecting', 'Locating UART RX/TX Characteristic...');
      const charUuid = this.config.characteristicUuid.trim().toLowerCase();
      this.characteristic = await primaryService.getCharacteristic(charUuid);

      this.setStatus('connecting', 'Enabling incoming gesture telemetry notifications...');
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', this.handleNotification.bind(this));

      this.setStatus('connected', `Live connected to ${this.device.name || 'SignoVox Glove'} via HM-10 BLE.`);
    } catch (err: unknown) {
      console.error('BLE connection error:', err);
      const error = err as Error;
      if (error.name === 'NotFoundError') {
        this.setStatus('disconnected', 'Device selection cancelled.');
      } else if (error.name === 'SecurityError') {
        this.setStatus('error', 'Bluetooth permission was blocked by browser security.');
      } else {
        this.setStatus('error', `Connection failed: ${error.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * Handle incoming BLE characteristic notifications from HM-10
   */
  private handleNotification(event: Event): void {
    try {
      const char = event.target as BluetoothRemoteGATTCharacteristic;
      if (!char.value) return;

      const chunk = this.textDecoder.decode(char.value);
      sharedGestureEngine.ingestRawChunk(chunk, 'LIVE_BLE');
    } catch (err) {
      console.error('Error decoding BLE notification:', err);
    }
  }

  /**
   * Send text command to Arduino via HM-10 UART TX
   */
  public async sendData(text: string): Promise<boolean> {
    if (!this.characteristic || this.status !== 'connected') {
      console.warn('Cannot send data: BLE not connected.');
      return false;
    }

    try {
      const data = this.textEncoder.encode(text);
      if (this.characteristic.writeValueWithResponse) {
        await this.characteristic.writeValueWithResponse(data);
      } else {
        await this.characteristic.writeValue(data);
      }
      return true;
    } catch (err) {
      console.error('Error transmitting to HM-10:', err);
      return false;
    }
  }

  /**
   * Disconnect from BLE device
   */
  public disconnect(): void {
    this.userExplicitDisconnect = true;
    if (this.device?.gatt && this.device.gatt.connected) {
      this.setStatus('disconnecting', 'Disconnecting from BLE glove...');
      this.device.gatt.disconnect();
    } else {
      this.onDisconnected();
    }
  }

  private onDisconnected(): void {
    this.server = null;
    this.characteristic = null;

    if (this.userExplicitDisconnect) {
      this.setStatus('disconnected', 'Disconnected by user.');
    } else {
      this.setStatus('error', 'Glove connection was lost. Ensure glove is powered on and within range.');
      if (this.config.autoReconnect && this.device) {
        console.log('Attempting auto-reconnect in 3 seconds...');
        setTimeout(() => {
          if (!this.userExplicitDisconnect && this.status !== 'connected') {
            this.connect().catch((e) => console.warn('Auto-reconnect attempt failed:', e));
          }
        }, 3000);
      }
    }
  }

  private loadConfig(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem('signovox_ble_config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore parse error
    }
  }

  private saveConfig(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('signovox_ble_config', JSON.stringify(this.config));
    } catch {
      // Ignore storage error
    }
  }
}

export const bluetoothService = new BluetoothService();
