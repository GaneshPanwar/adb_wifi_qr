"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusBar = exports.initStatusBar = exports.reconnectItem = exports.statusBarItem = void 0;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const adbHelper_1 = require("./adbHelper");
/**
 * Initializes the status bar items.
 * @param {vscode.ExtensionContext} context - Extension context.
 */
function initStatusBar(context) {
    /**
     * Status bar item to show the connection status of the devices.
     */
    exports.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    exports.statusBarItem.text = "$(debug-disconnect) ADB: Init";
    exports.statusBarItem.show();
    /**
     * Status bar item to reconnect to the last connected device.
     */
    exports.reconnectItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    exports.reconnectItem.text = "$(refresh) Reconnect Last Device";
    exports.reconnectItem.tooltip = "Reconnect to the last connected device";
    exports.reconnectItem.command = "adbWifi.connectAutoWifi";
    exports.reconnectItem.show();
    context.subscriptions.push(exports.statusBarItem, exports.reconnectItem);
}
exports.initStatusBar = initStatusBar;
/**
 * Updates the status bar item with the current connection status of the devices.
 * The status bar item will show the model of the connected device(s) and the number of devices connected.
 * If no devices are connected, it will show "No Device" and the tooltip will show "No device connected".
 * If there is an error fetching the devices, it will show "ADB: Error" and the tooltip will show the error message.
 * @returns {void}
 */
function updateStatusBar() {
    (0, child_process_1.exec)("adb devices", async (error, stdout) => {
        if (error) {
            exports.statusBarItem.text = "$(debug-disconnect) ADB: Error";
            exports.statusBarItem.tooltip = `Failed to fetch devices: ${error.message}`;
            exports.statusBarItem.show();
            return;
        }
        const devices = stdout
            .split("\n")
            .filter(line => line.includes("device") && !line.includes("List of devices"))
            .map(line => line.split("\t")[0]); // ["192.168.1.101:5555", "192.168.1.102:5555"]
        if (devices.length > 0) {
            // Resolve models for each connected device
            const labels = await Promise.all(devices.map(async (device) => {
                const [ip, port] = device.split(":");
                try {
                    // Fetch device model using ADB
                    const model = await (0, adbHelper_1.getDeviceModel)(ip, port || "5555");
                    return `${model} (${device})`; // e.g. "Samsung Galaxy S21 (192.168.1.101:5555)"
                }
                catch {
                    // If device model cannot be fetched, show "Unknown Device"
                    return `Unknown Device (${device})`;
                }
            }));
            // If multiple devices, show count
            if (labels.length === 1) {
                exports.statusBarItem.text = `$(device-mobile) ${labels[0].split(" ")[0]}`; // Just model
                exports.statusBarItem.tooltip = labels[0];
            }
            else {
                exports.statusBarItem.text = `$(device-mobile) ${labels.length} Devices`;
                exports.statusBarItem.tooltip = labels.join("\n"); // show all models & IPs
            }
            exports.statusBarItem.command = "adbWifi.listDevices";
        }
        else {
            exports.statusBarItem.text = "$(debug-disconnect) No Device";
            exports.statusBarItem.tooltip = "No device connected";
            exports.statusBarItem.command = undefined;
        }
        exports.statusBarItem.show();
    });
}
exports.updateStatusBar = updateStatusBar;
//# sourceMappingURL=statusBarHelper.js.map