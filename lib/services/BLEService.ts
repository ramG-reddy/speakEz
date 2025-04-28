import { CHARACTERISTIC_UUID, SERVICE_UUID } from "@/lib/Config";
import { NavAction } from "@/lib/types";
import { Platform } from "react-native";
import {
  BleManager,
  Characteristic,
  Device,
  State,
} from "react-native-ble-plx";
import { handleDecodedValue } from "@/lib/utils/handleDecodedValue";

export class BLEService {
  private manager: BleManager | null = null;
  private device: Device | null = null;
  private isScanning = false;
  private isConnected = false;
  private listeners: Array<(action: NavAction) => void> = [];
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
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error("BLE scan error:", error);
          this.stopScan(); // Ensure scanning stops on error
          return;
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
      this.stopScan(); // Ensure scanning stops on exception
    }
  }

  // Stop scanning for devices
  stopScan(): void {
    if (!this.isScanning || Platform.OS === "web" || !this.manager) return;

    this.manager.stopDeviceScan();
    this.isScanning = false;
    console.log("Scanning stopped");
  }

  // Connect to a selected device
  async connectToDevice(device: Device): Promise<void> {
    if (this.isConnected || Platform.OS === "web" || !this.manager) return;

    try {
      this.stopScan();

      const connectedDevice = await device.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();

      const services = await connectedDevice.services();
      // console.log("Discovered services:", services);

      const service = services.find((s) => s.uuid === SERVICE_UUID);
      if (!service) {
        throw new Error(`Service with UUID ${SERVICE_UUID} not found`);
      }

      await this.setupNotifications(connectedDevice);
      this.device = connectedDevice;
      this.isConnected = true;

      console.log(`Connected to device: ${device.name || device.id}`);
    } catch (error) {
      console.error("Failed to connect to device:", error);
      this.isConnected = false;
      throw error;
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
  private parseCharacteristicData(characteristic: Characteristic): NavAction {
    try {
      // Decode base64 data
      const base64Value = characteristic.value;
      if (!base64Value) return "none";

      const decodedValue = atob(base64Value);
      // console.log("Received BLE data:", decodedValue);

      try {
        const action = handleDecodedValue(decodedValue);
        return action;
      } catch (error) {
        console.error("DECODE ERROR:", error);
        return "none";
      }
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
      throw new Error("An unexpected error occurred while disconnecting.");
    }
  }

  // Add listener for navigation actions
  addListener(callback: (action: NavAction) => void): void {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback: (action: NavAction) => void): void {
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
  private notifyListeners(action: NavAction): void {
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
