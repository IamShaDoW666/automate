import type { RawData } from "ws";

export const decodeWebSocketMessage = (message: RawData): string => {
  if (Buffer.isBuffer(message)) {
    return message.toString("utf-8"); // Convert Buffer to string
  } else if (message instanceof ArrayBuffer) {
    return new TextDecoder().decode(new Uint8Array(message)); // Convert ArrayBuffer to string
  } else if (message instanceof Uint8Array) {
    return new TextDecoder().decode(message); // Convert Uint8Array to string
  } else {
    return message.toString(); // If it's already a string
  }
};

export const stringToJson = (data: string) => {
  try {    
    const fixedInput = data.replace(/(\w+):/g, '"$1":'); // Add quotes around keys
    return JSON.parse(fixedInput);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return { light: false };
  }
};
