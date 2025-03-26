import {
  BleManager,
  Device,
  Characteristic,
  State,
} from "react-native-ble-plx";
import { Platform } from "react-native";

// ESP32 BLE identifiers
const ESP32_NAME = "ESP32-S3-Touch";
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

// Navigation actions
export type NavigationAction =
  | "up"
  | "down"
  | "left"
  | "right"
  | "action"
  | "none";

export class BLEService {
  private manager: BleManager | null = null;
  private device: Device | null = null;
  private isScanning = false;
  private isConnected = false;
  private listeners: Array<(action: NavigationAction) => void> = [];

  constructor() {
    // Only create BleManager for native platforms
    if (Platform.OS !== "web") {
      try {
        this.manager = new BleManager();
      } catch (error) {
        console.warn("Failed to initialize BleManager:", error);
        this.manager = null;
      }
    } else {
      console.warn("BLE functionality is not supported on web");
    }
  }

  // Initialize BLE functionality
  async initialize(): Promise<boolean> {
    if (Platform.OS === "web" || !this.manager) {
      console.warn("BLE is not supported on this platform");
      return false;
    }

    return new Promise((resolve) => {
      this.manager!.onStateChange((state) => {
        if (state === State.PoweredOn) {
          resolve(true);
        } else if (state === State.PoweredOff) {
          resolve(false);
        }
      }, true);
    });
  }

  // Start scanning for ESP32 device
  async startScan(): Promise<void> {
    if (this.isScanning || Platform.OS === "web" || !this.manager) return;

    this.isScanning = true;

    try {
      await this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error("BLE scan error:", error);
          this.isScanning = false;
          return;
        }

        // Found our device
        if (device?.name === ESP32_NAME) {
          this.connectToDevice(device);
        }
      });
    } catch (error) {
      console.error("Failed to start BLE scan:", error);
      this.isScanning = false;
    }
  }

  // Stop scanning for devices
  stopScan(): void {
    if (!this.isScanning || Platform.OS === "web" || !this.manager) return;

    this.manager.stopDeviceScan();
    this.isScanning = false;
  }

  // Connect to the ESP32 device
  private async connectToDevice(device: Device): Promise<void> {
    if (this.isConnected || Platform.OS === "web" || !this.manager) return;

    try {
      this.stopScan();

      // Connect to device
      const connectedDevice = await device.connect();

      // Discover services and characteristics
      const discoveredDevice =
        await connectedDevice.discoverAllServicesAndCharacteristics();

      // Setup notification listener
      await this.setupNotifications(discoveredDevice);

      this.device = discoveredDevice;
      this.isConnected = true;

      console.log("Connected to ESP32 device");
    } catch (error) {
      console.error("Failed to connect to device:", error);
      this.isConnected = false;
    }
  }

  // Setup notifications for sensor data
  private async setupNotifications(device: Device): Promise<void> {
    if (Platform.OS === "web" || !this.manager) return;

    try {
      // Monitor the characteristic for notifications
      device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error("Notification error:", error);
            return;
          }

          if (characteristic?.value) {
            const action = this.parseCharacteristicData(characteristic);
            this.notifyListeners(action);
          }
        }
      );
    } catch (error) {
      console.error("Failed to setup notifications:", error);
    }
  }

  // Parse the data received from ESP32
  private parseCharacteristicData(
    characteristic: Characteristic
  ): NavigationAction {
    try {
      // Decode base64 data
      const base64Value = characteristic.value;
      if (!base64Value) return "none";

      const decodedValue = Buffer.from(base64Value, "base64").toString();
      console.log("Received BLE data:", decodedValue);

      // Parse the binary format from ESP32
      if (decodedValue === "00") return "up";
      if (decodedValue === "01") return "right";
      if (decodedValue === "10") return "down";
      if (decodedValue === "11") return "left";

      return "action"; // Default to action if none of the above patterns match
    } catch (error) {
      console.error("Failed to parse characteristic data:", error);
      return "none";
    }
  }

  // Disconnect from the device
  async disconnect(): Promise<void> {
    if (
      !this.isConnected ||
      !this.device ||
      Platform.OS === "web" ||
      !this.manager
    )
      return;

    try {
      await this.device.cancelConnection();
      this.isConnected = false;
      this.device = null;
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }

  // Add listener for navigation actions
  addListener(callback: (action: NavigationAction) => void): void {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback: (action: NavigationAction) => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  // Notify all listeners
  private notifyListeners(action: NavigationAction): void {
    this.listeners.forEach((listener) => listener(action));
  }

  // Get connection status
  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  // Clean up BLE manager
  destroy(): void {
    this.disconnect();
    if (this.manager && Platform.OS !== "web") {
      this.manager.destroy();
    }
  }
}

// Create a singleton instance
export const bleService = new BLEService();
