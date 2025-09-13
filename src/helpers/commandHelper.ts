import * as vscode from "vscode";
import * as keys from "../config/global-state-keys"
import { runCommand, connectToAdbDevice, disconnectAllDevices, getDeviceModel } from "./adbHelper";
import { getIPAddressList, extractIPRegex } from "./networkHelper";

/**
 * Registers all commands for the ADB WiFi Connect extension.
 * @param {vscode.ExtensionContext} context - Extension context.
 * @param {() => void} updateStatusBar - Function to update status bar.
 */
export function registerCommands(context: vscode.ExtensionContext, updateStatusBar: () => void) {
  context.subscriptions.push(
    // Connect to a device via Wi-Fi using IP and Port
    connectWifi(context, updateStatusBar),
    // Connect to the last connected device using Wi-Fi
    connectAutoWifi(context, updateStatusBar),
    // Disconnect all devices
    disconnect(updateStatusBar),
    // List all connected devices on the network
    listDevices(context, updateStatusBar),
    // Enable TCP/IP mode on the device
    tcpip(updateStatusBar),
    // Connect to a device using pairing code
    connectPairing(context, updateStatusBar),
    // Connect to a device from the list of connected devices
    connectFromList(context, updateStatusBar)
  );
}

/**
 * Register command to connect to a device via Wi-Fi using IP and Port.
 * @param {vscode.ExtensionContext} context - Extension context.
 * @param {() => void} updateStatusBar - Function to update status bar.
 * @returns {vscode.Disposable} Disposable object.
 */
export function connectWifi(context: vscode.ExtensionContext, updateStatusBar: () => void): vscode.Disposable {
  return vscode.commands.registerCommand("adbWifi.connectWifi", async () => {
    /**
     * Get last used IP Address and Port from global state.
     */
    const lastIP = context.globalState.get(keys.lastUsedIP(), "192.168.0.101");
    const lastPort = context.globalState.get(keys.lastUsedPort(), "5555");

    /**
     * Prompt user to enter device IP Address and Port.
     */
    const ip = await vscode.window.showInputBox({
      prompt: "Enter device IP Address",
      value: lastIP
    });
    if (!ip) return;

    const port = await vscode.window.showInputBox({
      prompt: "Enter device Port",
      value: lastPort
    });
    if (!port) return;

    /**
     * Save entered IP Address and Port in global state.
     */
    context.globalState.update(keys.lastUsedIP(), ip);
    context.globalState.update(keys.lastUsedPort(), port);

    /**
     * Run adb command to connect to the device.
     */
    runCommand(`adb connect ${ip}:${port}`, `Connected to ${ip}:${port}`, updateStatusBar);
  });
}

/**
 * Register command to connect to the last connected device using ADB Wi-Fi.
 * This command will attempt to connect to the last connected device using the
 * IP address and port stored in the global state.
 * @param {vscode.ExtensionContext} context - Extension context.
 * @param {() => void} updateStatusBar - Function to update status bar.
 * @returns {vscode.Disposable} Disposable object.
 */
export function connectAutoWifi(context: vscode.ExtensionContext, updateStatusBar: () => void): vscode.Disposable {
  return vscode.commands.registerCommand("adbWifi.connectAutoWifi", async () => {
    /**
     * Get last used IP Address and Port from global state.
     * These values are stored in the global state when the user connects to a device
     * using the "ADB: Connect via Wi-Fi" command.
     */
    const lastIP = context.globalState.get<string>(keys.lastUsedIP(), "192.168.0.101");
    const lastPort = context.globalState.get<string>(keys.lastUsedPort(), "5555");

    /**
     * Run adb command to connect to the last connected device.
     * This command will use the last used IP address and port to connect to the device.
     */
    runCommand(`adb connect ${lastIP}:${lastPort}`, `Auto-connected to ${lastIP}:${lastPort}`, updateStatusBar);
  });
}

/**
 * Register command to disconnect all devices.
 * @param {() => void} updateStatusBar - Function to update status bar.
 * @returns {vscode.Disposable} Disposable object.
 */
export function disconnect(updateStatusBar: () => void): vscode.Disposable {
  return vscode.commands.registerCommand("adbWifi.disconnect", async () => {
    /**
     * Disconnect all devices.
     */
    await disconnectAllDevices();

    /**
     * Show information message to the user.
     */
    vscode.window.showInformationMessage("All devices disconnected");

    /**
     * Update the status bar.
     */
    updateStatusBar();
  });
}

/**
 * Register command to list all connected devices.
 * @returns {vscode.Disposable} Disposable object.
 */

export function listDevices(
  _context: vscode.ExtensionContext,
  _updateStatusBar: () => void
): vscode.Disposable {
  return vscode.commands.registerCommand("adbWifi.listDevices", async () => {
    const devices = await getIPAddressList();

    if (devices.length === 0) {
      vscode.window.showInformationMessage("No devices found on network");
      return;
    }

    // Build QuickPick items with friendly labels
    const quickPickItems = await Promise.all(
      devices.map(async (device) => {
        const [ip, port] = device.split(":");
        let model: string;
        try {
          model = await getDeviceModel(ip, port || "5555");
        } catch {
          model = "Unknown Device";
        }
        return {
          label: `${model}`,
          description: `${ip}:${port || "5555"}`, // keeps raw info visible
        } as vscode.QuickPickItem;
      })
    );

    const selected = await vscode.window.showQuickPick(quickPickItems, {
      placeHolder: "Select a device to connect",
    });

    if (selected) {
      const [ip, port] = (selected as any).description.split(":");
      try {
        await connectToAdbDevice(ip, port || "5555");
        vscode.window.showInformationMessage(`✅ Connected to ${selected.label} (${selected.description})`);
        _updateStatusBar();
      } catch (err: any) {
        vscode.window.showErrorMessage(`❌ Failed to connect: ${err.message}`);
      }
    }
  });
}



/**
 * Register command to enable TCP/IP mode on the device.
 * @param {() => void} updateStatusBar - Function to update status bar.
 * @returns {vscode.Disposable} Disposable object.
 */
export function tcpip(updateStatusBar: () => void): vscode.Disposable {
  return vscode.commands.registerCommand("adbWifi.tcpip", async () => {
    /**
     * Run adb command to enable TCP/IP mode on the device.
     */
    runCommand("adb tcpip 5555", "TCP/IP mode enabled", updateStatusBar);
  });
}

/**
 * Register command to connect to a device using pairing code.
 * @param {vscode.ExtensionContext} context - Extension context.
 * @param {() => void} updateStatusBar - Function to update status bar.
 * @returns {vscode.Disposable} Disposable object.
 */
export function connectPairing(context: vscode.ExtensionContext, updateStatusBar: () => void): vscode.Disposable {
  return vscode.commands.registerCommand("adbWifi.connectPairing", async () => {
    /**
     * Prompt user to enter device IP:Port.
     */
    const ipPort = await vscode.window.showInputBox({ prompt: "Enter device IP:Port (e.g. 192.168.1.100:5555)" });
    if (!ipPort) return;

    /**
     * Prompt user to enter pairing code from device.
     */
    const pairingCode = await vscode.window.showInputBox({ prompt: "Enter pairing code from device" });
    if (!pairingCode) return;

    /**
     * Split IP and port from input string.
     */
    const [ip, port] = ipPort.split(":");

    /**
     * Save last used IP and port in global state.
     */
    context.globalState.update(keys.lastUsedIP(), ip);
    context.globalState.update(keys.lastUsedPort(), port);

    /**
     * Run adb command to pair with the device using pairing code.
     */
    runCommand(`adb pair ${ip}:${port} ${pairingCode}`, `Paired with ${ip}:${port}`, updateStatusBar);
  });
}

/**
 * Register command to connect to a device from the list of connected devices.
 * @param {vscode.ExtensionContext} context - Extension context.
 * @param {() => void} updateStatusBar - Function to update status bar.
 * @returns {vscode.Disposable} Disposable object.
 */
export function connectFromList(context: vscode.ExtensionContext, updateStatusBar: () => void): vscode.Disposable {
  return vscode.commands.registerCommand("adbWifi.connectFromList", async () => {
    /**
     * Get list of connected devices on the network.
     */
    const devices = await getIPAddressList();
    if (devices.length === 0) {
      vscode.window.showWarningMessage("No devices found on the network");
      return;
    }

    /**
     * Show a quick pick list to the user with all connected devices.
     */
    let selectedIP = await vscode.window.showQuickPick(devices, { placeHolder: "Select a device to connect" });
    if (!selectedIP) return;

    /**
     * Extract IP from selected device string.
     */
    selectedIP = extractIPRegex(selectedIP) ?? undefined;
    if (!selectedIP) {
      vscode.window.showWarningMessage("Invalid IP selected");
      return;
    }

    /**
     * Prompt user to enter device Port.
     */
    const lastPort = context.globalState.get(keys.lastUsedPort(), "5555");
    const port = await vscode.window.showInputBox({ prompt: "Enter device Port", value: lastPort });
    if (!port) return;

    /**
     * Save last used IP and port in global state.
     */
    context.globalState.update(keys.lastUsedIP(), selectedIP);
    context.globalState.update(keys.lastUsedPort(), port);

    /**
     * Run adb command to connect to the device.
     */
    runCommand(`adb connect ${selectedIP}:${port}`, `Connected to ${selectedIP}:${port}`, updateStatusBar);
  });
}
