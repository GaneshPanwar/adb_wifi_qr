import { exec } from "child_process";
import * as util from "util";
import * as vscode from "vscode";

export const execPromise = util.promisify(exec);

export function runCommand(command: string, successMessage?: string, callback?: () => void) {
  exec(command, (error, stdout, stderr) => {
    if (error) return vscode.window.showErrorMessage(`Error: ${stderr || error.message}`);
    if (successMessage) vscode.window.showInformationMessage(successMessage);
    if (callback) callback();
  });
}

export function connectToAdbDevice(ip: string, port: string) {
  return execPromise(`adb connect ${ip}:${port}`);
}

export function disconnectAllDevices() {
  return execPromise("adb disconnect");
}

export async function getDeviceModel(ip: string, port: string): Promise<string> {
  const { stdout } = await execPromise(`adb -s ${ip}:${port} shell getprop ro.product.model`);
  return stdout.trim() || "Unknown Device";
}