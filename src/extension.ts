import * as vscode from "vscode";
import { initStatusBar, updateStatusBar } from "./helpers/statusBarHelper";
import { registerCommands } from "./helpers/commandHelper";

/**
 * Activate the ADB WiFi Connect extension.
 * @param {vscode.ExtensionContext} context - VS Code extension context.
 */
export function activate(context: vscode.ExtensionContext) {
  console.log("ADB WiFi Extension is now active!");

  // Initialize status bar items
  /**
   * Initialize the status bar items.
   * @param {vscode.ExtensionContext} context - VS Code extension context.
   */
  initStatusBar(context);

  // Update initial ADB device status
  /**
   * Update the status bar with the current ADB device status.
   */
  updateStatusBar();

  // Register all extension commands
  /**
   * Register all the extension commands.
   * @param {vscode.ExtensionContext} context - VS Code extension context.
   * @param {() => void} updateStatusBar - Function to update the status bar.
   */
  registerCommands(context, updateStatusBar);
}

export function deactivate() {
  console.log("ADB WiFi Extension is now deactivated.");
}
