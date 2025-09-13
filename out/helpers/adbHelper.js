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
exports.getDeviceModel = exports.disconnectAllDevices = exports.connectToAdbDevice = exports.runCommand = exports.execPromise = void 0;
const child_process_1 = require("child_process");
const util = __importStar(require("util"));
const vscode = __importStar(require("vscode"));
exports.execPromise = util.promisify(child_process_1.exec);
function runCommand(command, successMessage, callback) {
    (0, child_process_1.exec)(command, (error, stdout, stderr) => {
        if (error)
            return vscode.window.showErrorMessage(`Error: ${stderr || error.message}`);
        if (successMessage)
            vscode.window.showInformationMessage(successMessage);
        if (callback)
            callback();
    });
}
exports.runCommand = runCommand;
function connectToAdbDevice(ip, port) {
    return (0, exports.execPromise)(`adb connect ${ip}:${port}`);
}
exports.connectToAdbDevice = connectToAdbDevice;
function disconnectAllDevices() {
    return (0, exports.execPromise)("adb disconnect");
}
exports.disconnectAllDevices = disconnectAllDevices;
async function getDeviceModel(ip, port) {
    const { stdout } = await (0, exports.execPromise)(`adb -s ${ip}:${port} shell getprop ro.product.model`);
    return stdout.trim() || "Unknown Device";
}
exports.getDeviceModel = getDeviceModel;
//# sourceMappingURL=adbHelper.js.map