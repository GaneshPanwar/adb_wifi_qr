import * as vscode from "vscode";
import { exec } from "child_process";
import { getDeviceModel } from "./adbHelper";

export let statusBarItem: vscode.StatusBarItem;
export let reconnectItem: vscode.StatusBarItem;

export function initStatusBar(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.text = "$(debug-disconnect) ADB: Init";
  statusBarItem.show();

  reconnectItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
  reconnectItem.text = "$(refresh) Reconnect Last Device";
  reconnectItem.tooltip = "Reconnect to the last connected device";
  reconnectItem.command = "adbWifi.connectAutoWifi";
  reconnectItem.show();

  context.subscriptions.push(statusBarItem, reconnectItem);
}

export function updateStatusBar() {
  exec("adb devices", async (error, stdout) => {
    if (error) {
      statusBarItem.text = "$(debug-disconnect) ADB: Error";
      statusBarItem.tooltip = "Failed to fetch devices";
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
            const model = await getDeviceModel(ip, port || "5555");
            return `${model} (${device})`;
          } catch {
            return `Unknown Device (${device})`;
          }
        })
      );

      // If multiple devices → show count
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
