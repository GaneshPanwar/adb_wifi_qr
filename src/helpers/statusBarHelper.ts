import * as vscode from "vscode";
import { exec } from "child_process";

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
  exec("adb devices", (error, stdout) => {
    if (error) {
      statusBarItem.text = "$(debug-disconnect) ADB: Error";
      statusBarItem.tooltip = "Error checking devices";
      statusBarItem.command = undefined;
      statusBarItem.show();
      return;
    }

    const devices = stdout
      .split("\n")
      .filter(line => line.includes("device") && !line.includes("List of devices"))
      .map(line => line.split("\t")[0]);

    if (devices.length > 0) {
      if (devices.length === 1) {
        // Show single device
        statusBarItem.text = `$(device-mobile) ${devices[0]}`;
        statusBarItem.tooltip = "Click to list device";
      } else {
        // Show multiple devices count
        statusBarItem.text = `$(device-mobile) ${devices.length} devices`;
        statusBarItem.tooltip = devices.join("\n");
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
