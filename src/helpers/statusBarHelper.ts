import * as vscode from "vscode";
import { exec } from "child_process";
import { getDeviceModel } from "./adbHelper";

export let statusBarItem: vscode.StatusBarItem;
export let reconnectItem: vscode.StatusBarItem;

/**
 * Initializes the status bar items.
 * @param {vscode.ExtensionContext} context - Extension context.
 */
export function initStatusBar(context: vscode.ExtensionContext) {
  /**
   * Status bar item to show the connection status of the devices.
   */
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = "$(debug-disconnect) ADB: Init";
  statusBarItem.show();

  /**
   * Status bar item to reconnect to the last connected device.
   */
  reconnectItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
  reconnectItem.text = "$(refresh) Reconnect Last Device";
  reconnectItem.tooltip = "Reconnect to the last connected device";
  reconnectItem.command = "adbWifi.connectAutoWifi";
  reconnectItem.show();

  context.subscriptions.push(statusBarItem, reconnectItem);
}

/**
 * Updates the status bar item with the current connection status of the devices.
 * The status bar item will show the model of the connected device(s) and the number of devices connected.
 * If no devices are connected, it will show "No Device" and the tooltip will show "No device connected".
 * If there is an error fetching the devices, it will show "ADB: Error" and the tooltip will show the error message.
 * @returns {void}
 */
export function updateStatusBar(): void {
  exec("adb devices", async (error, stdout) => {
    if (error) {
      statusBarItem.text = "$(debug-disconnect) ADB: Error";
      statusBarItem.tooltip = `Failed to fetch devices: ${error.message}`;
      statusBarItem.show();
      return;
    }

    const devices = stdout
      .split("\n")
      .filter(line => line.includes("device") && !line.includes("List of devices"))
      .map(line => line.split("\t")[0]); // ["192.168.1.101:5555", "192.168.1.102:5555"]

    if (devices.length > 0) {
      // Resolve models for each connected device
      const labels = await Promise.all(
        devices.map(async (device) => {
          const [ip, port] = device.split(":");
          try {
            // Fetch device model using ADB
            const model = await getDeviceModel(ip, port || "5555");
            return `${model} (${device})`; // e.g. "Samsung Galaxy S21 (192.168.1.101:5555)"
          } catch {
            // If device model cannot be fetched, show "Unknown Device"
            return `Unknown Device (${device})`;
          }
        })
      );

      // If multiple devices, show count
      if (labels.length === 1) {
        statusBarItem.text = `$(device-mobile) ${labels[0].split(" ")[0]}`; // Just model
        statusBarItem.tooltip = labels[0];
      } else {
        statusBarItem.text = `$(device-mobile) ${labels.length} Devices`;
        statusBarItem.tooltip = labels.join("\n"); // show all models & IPs
      }
      statusBarItem.command = "adbWifi.listDevices";
    } else {
      statusBarItem.text = "$(debug-disconnect) No Device";
      statusBarItem.tooltip = "No device connected";
      statusBarItem.command = undefined;
    }
    statusBarItem.show();
  });
}
