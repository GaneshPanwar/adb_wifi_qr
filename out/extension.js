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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
function getSettingAdbPath() {
    const config = vscode.workspace.getConfiguration("adbWifi");
    const val = config.get("adbPath");
    return val && val.trim().length > 0 ? val : undefined;
}
function findAdbOnCommonPaths() {
    const env = process.env;
    const candidates = [];
    const home = os.homedir();
    const sdkRoots = [
        env["ANDROID_SDK_ROOT"],
        env["ANDROID_HOME"],
        env["ANDROID_SDK_HOME"],
    ];
    for (const r of sdkRoots) {
        if (r)
            candidates.push(path.join(r || "", "platform-tools", process.platform === "win32" ? "adb.exe" : "adb"));
    }
    if (process.platform === "win32") {
        const local = process.env["LOCALAPPDATA"];
        const programFiles = process.env["ProgramFiles"];
        const programFilesx86 = process.env["ProgramFiles(x86)"];
        if (local)
            candidates.push(path.join(local, "Android", "Sdk", "platform-tools", "adb.exe"));
        if (programFiles)
            candidates.push(path.join(programFiles, "Android", "Sdk", "platform-tools", "adb.exe"));
        if (programFilesx86)
            candidates.push(path.join(programFilesx86, "Android", "Sdk", "platform-tools", "adb.exe"));
    }
    else {
        candidates.push("/usr/bin/adb", "/usr/local/bin/adb", path.join(home, "Android", "Sdk", "platform-tools", "adb"));
    }
    for (const c of candidates) {
        if (c && fs.existsSync(c))
            return c;
    }
    return undefined;
}
async function resolveAdbExecutable() {
    const setting = getSettingAdbPath();
    if (setting && fs.existsSync(setting))
        return setting;
    const found = findAdbOnCommonPaths();
    if (found)
        return found;
    return undefined; // let helper use PATH
}
function getHelperPath(context) {
    const extPath = context.extensionPath;
    const platform = process.platform;
    let binPath = "";
    if (platform === "win32")
        binPath = path.join(extPath, "bin", "win", "adb_helper.exe");
    else if (platform === "darwin")
        binPath = path.join(extPath, "bin", "mac", "adb_helper");
    else
        binPath = path.join(extPath, "bin", "linux", "adb_helper");
    if (fs.existsSync(binPath)) {
        return { cmd: binPath, args: [] };
    }
    // fallback to dart run
    const dartPath = "dart";
    const dartArgs = [
        "run",
        path.join(extPath, "flutter_backend", "bin", "adb_helper.dart"),
    ];
    return { cmd: dartPath, args: dartArgs };
}
function runHelper(context, args, adbPath) {
    return new Promise((resolve, reject) => {
        const helper = getHelperPath(context);
        const finalArgs = [...helper.args, ...args]; // combine Dart args + helper args
        const env = { ...process.env };
        if (adbPath)
            env["ADB_PATH"] = adbPath;
        (0, child_process_1.execFile)(helper.cmd, finalArgs, { maxBuffer: 10 * 1024 * 1024, env }, (err, stdout, stderr) => {
            if (err && (!stdout || stdout === "")) {
                reject(err);
                return;
            }
            try {
                const parsed = JSON.parse(stdout.toString().trim());
                resolve(parsed);
            }
            catch {
                resolve({
                    stdout: stdout.toString(),
                    stderr: stderr.toString(),
                    error: err?.message,
                });
            }
        });
    });
}
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand("adbWifi.listDevices", async () => {
        try {
            const adb = await resolveAdbExecutable();
            const res = await runHelper(context, ["devices"], adb);
            const channel = vscode.window.createOutputChannel("ADB WiFi");
            channel.show(true);
            channel.appendLine(JSON.stringify(res, null, 2));
            vscode.window.showInformationMessage("ADB devices result written to Output (ADB WiFi).");
        }
        catch (e) {
            vscode.window.showErrorMessage(`Error: ${e.message}`);
        }
    }), vscode.commands.registerCommand("adbWifi.tcpip", async () => {
        const port = await vscode.window.showInputBox({
            prompt: "Enter TCP/IP port",
            value: "5555",
        });
        if (!port) {
            return;
        }
        try {
            const adb = await resolveAdbExecutable();
            const res = await runHelper(context, ["tcpip", port], adb);
            const channel = vscode.window.createOutputChannel("ADB WiFi");
            channel.show(true);
            channel.appendLine(JSON.stringify(res, null, 2));
            vscode.window.showInformationMessage("Set device to tcpip mode. See output channel.");
        }
        catch (e) {
            vscode.window.showErrorMessage(`Error: ${e.message}`);
        }
    }), vscode.commands.registerCommand("adbWifi.connectWifi", async () => {
        const ip = await vscode.window.showInputBox({
            prompt: "Enter device IP:PORT (e.g. 192.168.1.100:5555)",
        });
        if (!ip) {
            return;
        }
        try {
            const adb = await resolveAdbExecutable();
            const res = await runHelper(context, ["connect", ip], adb);
            vscode.window.showInformationMessage(`Connect result: ${res.stdout || JSON.stringify(res)}`);
        }
        catch (e) {
            vscode.window.showErrorMessage(`Error: ${e.message}`);
        }
    }), vscode.commands.registerCommand("adbWifi.connectAutoWifi", async () => {
        try {
            const adb = await resolveAdbExecutable();
            const res = await runHelper(context, ["wifi_ip_auto"], adb);
            // stdout may contain multiple JSON lines, one per device
            const lines = (res.stdout || "").trim().split("\n");
            for (const line of lines) {
                try {
                    const info = JSON.parse(line);
                    if (info.ip && info.port) {
                        const connectRes = await runHelper(context, ["connect", `${info.ip}:${info.port}`], adb);
                        vscode.window.showInformationMessage(`Device ${info.serial} connected to ${info.ip}:${info.port}`);
                    }
                    else if (info.error) {
                        vscode.window.showWarningMessage(`Device ${info.serial} error: ${info.error}`);
                    }
                }
                catch (e) {
                    console.warn("Failed to parse line from helper:", line);
                }
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Auto Wi-Fi connect failed: ${err.message}`);
        }
    }), vscode.commands.registerCommand("adbWifi.connectQr", async () => {
        const panel = vscode.window.createWebviewPanel("adbQrScan", "ADB QR Connect", vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: false,
        });
        const htmlPath = path.join(context.extensionPath, "webview", "qr.html");
        let html = fs.readFileSync(htmlPath, "utf8");
        panel.webview.html = html;
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === "scanned") {
                const ip = message.text;
                panel.dispose();
                try {
                    const adb = await resolveAdbExecutable();
                    const res = await runHelper(context, ["connect", ip], adb);
                    vscode.window.showInformationMessage(`ADB connect: ${res.stdout || JSON.stringify(res)}`);
                }
                catch (e) {
                    vscode.window.showErrorMessage(`Error connecting to ${ip}: ${e.message}`);
                }
            }
            else if (message.command === "error") {
                vscode.window.showErrorMessage(`Scanner error: ${message.text}`);
            }
        }, undefined, context.subscriptions);
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map