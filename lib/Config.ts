import { NavAction } from "@/lib/types";

export const ORDER_OF_HIGHLIGHTS: NavAction[] = [
  "action",
  "up",
  "right",
  "down",
  "left",
];

export let CHANGE_DELAY_ms: number = 1500;

export const setChangeDelay = (newDelay: number) => {
  CHANGE_DELAY_ms = newDelay;
};

// Bluetooth configuration
export const ESP32_NAME = "ESP32-S3-Touch";
export const SERVICE_UUID = "4fafc201-1d5a-459e-8fcc-c5c9c331914b";
export const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

// Sensor identifiers
export const SENSOR_DATA_DELIMITER = "::";
export const TOUCH_SENSOR_IDENTIFIER_PREFIX = "TOUCH";
export const GYRO_SENSOR_IDENTIFIER_PREFIX = "GYRO";
export const EMG_SENSOR_IDENTIFIER_PREFIX = "EMG";

// Local storage keys
export const ONBOARDING_COMPLETE_KEY = "onboarding_complete";
export const PATIENT_INFO_KEY = "patient_info";
export const PHRASES_KEY = "patient_phrases";
export const CHANGE_DELAY_KEY = "change_delay";
