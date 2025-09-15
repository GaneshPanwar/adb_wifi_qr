"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const statusBarHelper_1 = require("./helpers/statusBarHelper");
const commandHelper_1 = require("./helpers/commandHelper");
/**
 * Activate the ADB WiFi Connect extension.
 * @param {vscode.ExtensionContext} context - VS Code extension context.
 */
function activate(context) {
    console.log("ADB WiFi Extension is now active!");
    // Initialize status bar items
    /**
     * Initialize the status bar items.
     * @param {vscode.ExtensionContext} context - VS Code extension context.
     */
    (0, statusBarHelper_1.initStatusBar)(context);
    // Update initial ADB device status
    /**
     * Update the status bar with the current ADB device status.
     */
    (0, statusBarHelper_1.updateStatusBar)();
    // Register all extension commands
    /**
     * Register all the extension commands.
     * @param {vscode.ExtensionContext} context - VS Code extension context.
     * @param {() => void} updateStatusBar - Function to update the status bar.
     */
    (0, commandHelper_1.registerCommands)(context, statusBarHelper_1.updateStatusBar);
}
exports.activate = activate;
function deactivate() {
    console.log("ADB WiFi Extension is now deactivated.");
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map