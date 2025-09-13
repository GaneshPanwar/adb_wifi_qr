"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const statusBarHelper_1 = require("./helpers/statusBarHelper");
const commandHelper_1 = require("./helpers/commandHelper");
function activate(context) {
    console.log("ADB WiFi Extension is now active!");
    // Initialize status bar items
    (0, statusBarHelper_1.initStatusBar)(context);
    // Update initial ADB device status
    (0, statusBarHelper_1.updateStatusBar)();
    // Register all extension commands
    (0, commandHelper_1.registerCommands)(context, statusBarHelper_1.updateStatusBar);
}
exports.activate = activate;
function deactivate() {
    console.log("ADB WiFi Extension is now deactivated.");
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map