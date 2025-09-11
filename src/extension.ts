import * as vscode from 'vscode';
import { execFile } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

function getSettingAdbPath(): string | undefined {
    const config = vscode.workspace.getConfiguration('adbWifi');
    const val = config.get<string>('adbPath');
    return val && val.trim().length > 0 ? val : undefined;
}

function findAdbOnCommonPaths(): string | undefined {
    const env = process.env;
    const candidates: string[] = [];
    const home = os.homedir();

    const sdkRoots = [env['ANDROID_SDK_ROOT'], env['ANDROID_HOME'], env['ANDROID_SDK_HOME']];
    for (const r of sdkRoots) {
        if (r) candidates.push(path.join(r || '', 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb'));
    }

    if (process.platform === 'win32') {
        const local = process.env['LOCALAPPDATA'];
        const programFiles = process.env['ProgramFiles'];
        const programFilesx86 = process.env['ProgramFiles(x86)'];
        if (local) candidates.push(path.join(local, 'Android', 'Sdk', 'platform-tools', 'adb.exe'));
        if (programFiles) candidates.push(path.join(programFiles, 'Android', 'Sdk', 'platform-tools', 'adb.exe'));
        if (programFilesx86) candidates.push(path.join(programFilesx86, 'Android', 'Sdk', 'platform-tools', 'adb.exe'));
    } else {
        candidates.push('/usr/bin/adb', '/usr/local/bin/adb', path.join(home, 'Android', 'Sdk', 'platform-tools', 'adb'));
    }

    for (const c of candidates) {
        if (c && fs.existsSync(c)) return c;
    }
    return undefined;
}

async function resolveAdbExecutable(): Promise<string | undefined> {
    const setting = getSettingAdbPath();
    if (setting && fs.existsSync(setting)) return setting;
    const found = findAdbOnCommonPaths();
    if (found) return found;
    return undefined; // let helper use PATH
}

function getHelperPath(context: vscode.ExtensionContext) {
    const extPath = context.extensionPath;
    const platform = process.platform;
    if (platform === 'win32') {
        return path.join(extPath, 'bin', 'win', 'adb_helper.exe');
    } else if (platform === 'darwin') {
        return path.join(extPath, 'bin', 'mac', 'adb_helper');
    } else {
        return path.join(extPath, 'bin', 'linux', 'adb_helper');
    }
}

function runHelper(context: vscode.ExtensionContext, args: string[], adbPath?: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const helper = getHelperPath(context);
        if (!fs.existsSync(helper)) {
            reject(new Error(`ADB helper not found at ${helper}. Please compile and place the binary.`));
            return;
        }
        const env = Object.assign({}, process.env);
        if (adbPath) env['ADB_PATH'] = adbPath;
        execFile(helper, args, { maxBuffer: 10 * 1024 * 1024, env }, (err, stdout, stderr) => {
            if (err && (stdout === undefined || stdout === '')) {
                reject(err);
                return;
            }
            try {
                const parsed = JSON.parse(stdout.toString().trim());
                resolve(parsed);
            } catch (e) {
                resolve({ stdout: stdout.toString(), stderr: stderr.toString(), error: err ? err.message : undefined });
            }
        });
    });
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('adbWifi.listDevices', async () => {
            try {
                const adb = await resolveAdbExecutable();
                const res = await runHelper(context, ['devices'], adb);
                const channel = vscode.window.createOutputChannel('ADB WiFi');
                channel.show(true);
                channel.appendLine(JSON.stringify(res, null, 2));
                vscode.window.showInformationMessage('ADB devices result written to Output (ADB WiFi).');
            } catch (e: any) {
                vscode.window.showErrorMessage(`Error: ${e.message}`);
            }
        }),

        vscode.commands.registerCommand('adbWifi.tcpip', async () => {
            const port = await vscode.window.showInputBox({ prompt: 'Enter TCP/IP port', value: '5555' });
            if (!port) { return; }
            try {
                const adb = await resolveAdbExecutable();
                const res = await runHelper(context, ['tcpip', port], adb);
                const channel = vscode.window.createOutputChannel('ADB WiFi');
                channel.show(true);
                channel.appendLine(JSON.stringify(res, null, 2));
                vscode.window.showInformationMessage('Set device to tcpip mode. See output channel.');
            } catch (e: any) {
                vscode.window.showErrorMessage(`Error: ${e.message}`);
            }
        }),

        vscode.commands.registerCommand('adbWifi.connectWifi', async () => {
            const ip = await vscode.window.showInputBox({ prompt: 'Enter device IP:PORT (e.g. 192.168.1.100:5555)' });
            if (!ip) { return; }
            try {
                const adb = await resolveAdbExecutable();
                const res = await runHelper(context, ['connect', ip], adb);
                vscode.window.showInformationMessage(`Connect result: ${res.stdout || JSON.stringify(res)}`);
            } catch (e: any) {
                vscode.window.showErrorMessage(`Error: ${e.message}`);
            }
        }),

        vscode.commands.registerCommand('adbWifi.connectQr', async () => {
            const panel = vscode.window.createWebviewPanel(
                'adbQrScan',
                'ADB QR Connect',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: false
                }
            );

            const htmlPath = path.join(context.extensionPath, 'webview', 'qr.html');
            let html = fs.readFileSync(htmlPath, 'utf8');
            panel.webview.html = html;

            panel.webview.onDidReceiveMessage(async message => {
                if (message.command === 'scanned') {
                    const ip = message.text;
                    panel.dispose();
                    try {
                        const adb = await resolveAdbExecutable();
                        const res = await runHelper(context, ['connect', ip], adb);
                        vscode.window.showInformationMessage(`ADB connect: ${res.stdout || JSON.stringify(res)}`);
                    } catch (e: any) {
                        vscode.window.showErrorMessage(`Error connecting to ${ip}: ${e.message}`);
                    }
                } else if (message.command === 'error') {
                    vscode.window.showErrorMessage(`Scanner error: ${message.text}`);
                }
            }, undefined, context.subscriptions);
        })
    );
}

export function deactivate() {}
