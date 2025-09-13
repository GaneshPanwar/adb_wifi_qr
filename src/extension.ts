import * as vscode from "vscode";
import { initStatusBar, updateStatusBar } from "./helpers/statusBarHelper";
import { registerCommands } from "./helpers/commandHelper";

export function activate(context: vscode.ExtensionContext) {
  console.log("ADB WiFi Extension is now active!");

  // Initialize status bar items
  initStatusBar(context);

  // Update initial ADB device status
  updateStatusBar();

  // Register all extension commands
  registerCommands(context, updateStatusBar);
}

export function deactivate() {
  console.log("ADB WiFi Extension is now deactivated.");
}
