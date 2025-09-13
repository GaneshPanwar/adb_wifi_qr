import { exec } from "child_process";
import * as util from "util";
import * as vscode from "vscode";

export const execPromise = util.promisify(exec);

/**
 * Run an ADB command and show an error message if the command fails.
 * @param {string} command - The ADB command to run.
 * @param {string} [successMessage] - The message to show to the user if the command succeeds.
 * @param {() => void} [callback] - The callback to call if the command succeeds.
 */
export function runCommand(command: string, successMessage?: string, callback?: () => void) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      vscode.window.showErrorMessage(`Error: ${stderr || error.message}`);
      return;
    }

    if (successMessage) {
      vscode.window.showInformationMessage(successMessage);
    }

    if (callback) {
      callback();
    }
  });
}

/**
 * Connect to an ADB device using its IP address and port.
 * This function will call the `adb connect` command which will connect to the device at the specified IP address and port.
 * @param {string} ip - The IP address of the device.
 * @param {string} port - The port number of the device.
 * @returns {Promise<void>} A promise that resolves when the command has finished executing.
 */
export function connectToAdbDevice(ip: string, port: string) {
  return execPromise(`adb connect ${ip}:${port}`);
}

/**
 * Disconnect from all devices connected using ADB Wi-Fi.
 * This function will call the `adb disconnect` command which will disconnect from all devices connected using ADB Wi-Fi.
 * @returns {Promise<void>} A promise that resolves when the command has finished executing.
 */
export function disconnectAllDevices() {
  return execPromise("adb disconnect");
}

/**
 * Get the model of an Android device connected using ADB Wi-Fi.
 * This function will call the `adb shell getprop ro.product.model` command which will return the model of the device.
 * @param {string} ip - The IP address of the device.
 * @param {string} port - The port number of the device.
 * @returns {Promise<string>} A promise that resolves with the model of the device.
 */
export async function getDeviceModel(ip: string, port: string): Promise<string> {
  // Call the `adb shell getprop ro.product.model` command to get the model of the device.
  const { stdout } = await execPromise(`adb -s ${ip}:${port} shell getprop ro.product.model`);

  // Trim the output and return it.
  return stdout.trim() || "Unknown Device";
}
