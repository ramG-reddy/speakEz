import {
  BleManager,
  Device,
  Characteristic,
  State,
} from "react-native-ble-plx";
import { Platform } from "react-native";
import {
  CHARACTERISTIC_UUID,
  ESP32_NAME,
  SERVICE_UUID,
} from "../constants/Config";

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
  private deviceListeners: Array<(devices: Device[]) => void> = [];
  private discoveredDevices: Device[] = [];

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

  // Start scanning for all BLE devices
  async startScan(): Promise<void> {
    if (this.isScanning || Platform.OS === "web" || !this.manager) return;

    this.isScanning = true;
    this.discoveredDevices = []; // Clear previous results
    this.notifyDeviceListeners(); // Notify listeners about empty list

    try {
      // Enhanced scan options specifically for ESP-32 devices
      const scanOptions = {
        allowDuplicates: false,
        scanMode: 1, // SCAN_MODE_LOW_LATENCY for Android
        // On iOS, increasing the scan timeout can help find more devices
        timeoutInterval: Platform.OS === "ios" ? 10000 : undefined,
      };

      await this.manager.startDeviceScan(null, scanOptions, (error, device) => {
        if (error) {
          console.error("BLE scan error:", error);
          this.isScanning = false;

          // Notify device listeners about error by passing empty array
          this.notifyDeviceListeners();

          // Rethrow error to be caught by caller
          throw error;
        }

        if (device) {
          // Include unnamed devices too, as some ESP-32 might not have a name
          // but filter out devices with very low RSSI (signal strength)
          const rssiThreshold = -90; // Adjust if needed

          if (
            (device.name || device.localName || device.id) &&
            (device.rssi === null || device.rssi > rssiThreshold)
          ) {
            // Check for duplication
            const isDuplicate = this.discoveredDevices.some(
              (d) => d.id === device.id
            );

            if (!isDuplicate) {
              // Prioritize ESP-32 devices
              if (
                device.name?.includes("ESP") ||
                device.localName?.includes("ESP")
              ) {
                // Add ESP devices to the front of the array
                this.discoveredDevices.unshift(device);
              } else {
                this.discoveredDevices.push(device);
              }
              this.notifyDeviceListeners();
            }
          }
        }
      });
    } catch (error) {
      console.error("Failed to start BLE scan:", error);
      this.isScanning = false;
      throw error; // Rethrow to allow caller to handle
    }
  }

  // Stop scanning for devices
  stopScan(): void {
    if (!this.isScanning || Platform.OS === "web" || !this.manager) return;

    this.manager.stopDeviceScan();
    this.isScanning = false;
  }

  // Connect to a selected device
  async connectToDevice(device: Device): Promise<void> {
    if (this.isConnected || Platform.OS === "web" || !this.manager) return;

    try {
      this.stopScan();

      // Connect to device with options optimized for ESP-32
      const connectionOptions = {
        timeout: 10000, // 10 seconds
        autoConnect: true, // Try to auto-connect if connection is lost
      };

      // Connect to device
      const connectedDevice = await device.connect(connectionOptions);

      // Add a short delay to ensure proper connection
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Discover services and characteristics
      const discoveredDevice =
        await connectedDevice.discoverAllServicesAndCharacteristics();

      // Setup notification listener for our service/characteristic
      await this.setupNotifications(discoveredDevice);

      this.device = discoveredDevice;
      this.isConnected = true;

      console.log(`Connected to ESP-32 device: ${device.name || device.id}`);
    } catch (error) {
      console.error("Failed to connect to ESP-32 device:", error);
      this.isConnected = false;
      throw error; // Rethrow so caller can handle it
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

  // Add device list listener
  addDeviceListener(callback: (devices: Device[]) => void): void {
    this.deviceListeners.push(callback);
    // Immediately notify with current devices
    callback(this.discoveredDevices);
  }

  // Remove device list listener
  removeDeviceListener(callback: (devices: Device[]) => void): void {
    this.deviceListeners = this.deviceListeners.filter(
      (listener) => listener !== callback
    );
  }

  // Notify all listeners
  private notifyListeners(action: NavigationAction): void {
    this.listeners.forEach((listener) => listener(action));
  }

  // Notify device listeners
  private notifyDeviceListeners(): void {
    this.deviceListeners.forEach((listener) =>
      listener([...this.discoveredDevices])
    );
  }

  // Get connection status
  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  // Get scanning status
  isScanningDevices(): boolean {
    return this.isScanning;
  }

  // Get discovered devices
  getDiscoveredDevices(): Device[] {
    return [...this.discoveredDevices];
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
