import { NavAction } from "@/lib/types";
import {
  TOUCH_SENSOR_IDENTIFIER_PREFIX,
  SENSOR_DATA_DELIMITER,
  GYRO_SENSOR_IDENTIFIER_PREFIX,
  EMG_SENSOR_IDENTIFIER_PREFIX,
} from "@/lib/Config";

export const handleDecodedValue = (value: string): NavAction => {
  const parts = value.split(SENSOR_DATA_DELIMITER);
  if (parts.length !== 2) {
    throw new Error("Invalid Data format Recieved");
  }
  const sensorType = parts[0].trim();
  const data = parts[1].trim();
  switch (sensorType) {
    case TOUCH_SENSOR_IDENTIFIER_PREFIX:
      return handleTouchSensorData(data);
    case GYRO_SENSOR_IDENTIFIER_PREFIX:
      return handleGyroSensorData(data);
    case EMG_SENSOR_IDENTIFIER_PREFIX:
      return handleEMGSensorData(data);
    default:
      console.warn("Unknown sensor type:", sensorType);
      return "none";
  }
};

const handleTouchSensorData = (data: string): NavAction => {
  if (data === "0,0,0,0") return "none";

  if (data === "1,0,0,0") return "left";
  if (data === "0,0,0,1") return "right";
  if (data === "0,1,0,0") return "up";
  if (data === "0,0,1,0") return "down";
  return "action";
};

const handleGyroSensorData = (data: string): NavAction => {
  // TODO: Handle gyro sensor data here
  if(data === "1") return "action";
  return "none";
};

const handleEMGSensorData = (data: string): NavAction => {
  // TODO: Handle EMG sensor data here
  if(data === "1") return "action";
  return "none";
};
