## ADB WiFi Connect VS Code Extension

Connect your Android devices over **ADB Wi-Fi** directly from **Visual Studio Code**.  
Easily connect, disconnect, list devices, enable TCP/IP, and generate QR codes for faster sharing.

---

### 📦 Features

- 📱 List connected devices (`adb devices`)  
- 📡 Enable WiFi debugging (`adb tcpip 5555`)  
- 🔗 Connect to devices by **IP:PORT**  
- ❌ Disconnect devices  
- 💻 Run ADB shell commands  
- 🔲 Generate **QR code** for `IP:PORT`  
- 🖥️ Cross-platform (Windows, macOS, Linux)  
- 🌐 Auto-discovery and reconnect last device  
- 📊 Status bar integration showing connected devices  

---

### 🎥 Demo

#### 1. Connect Device via Wi-Fi
![Connect via WiFi](assets/demo/connect_wifi.gif)

#### 2. Connect Device using QR Code (Android 11+)
![QR Connect](assets/demo/qr_connect.gif)

#### 3. List Connected Devices
![List Devices](assets/demo/list_devices.gif)

#### 4. Status Bar Integration
![Status Bar](assets/demo/status_bar.gif)

---

### 🚀 Installation

#### From Marketplace
Install directly from **[VS Code Marketplace](https://marketplace.visualstudio.com/manage/publishers/ganesh-panwar)**.

#### From `.vsix`
1. Download the latest release [`Latest Release`](https://github.com/GaneshPanwar/adb_wifi_qr/releases/latest).  
2. Run in VSCode:

```bash
code --install-extension adb-wifi-qr-0.1.x.vsix
```
Reload VSCode.

### 🔧 Requirements
Android SDK Platform Tools (adb) installed.

Ensure adb is in your system PATH or set the environment variable ADB_PATH.

Example (macOS/Linux):
```bash
export ADB_PATH=/Users/username/Library/Android/sdk/platform-tools/adb
```
### 📖 Usage
#### 1. Enable WiFi Debugging
   1. Connect device via USB.
   2. Run command palette (Ctrl+Shift+P / Cmd+Shift+P):
   ```bash
   ADB: Enable TCP/IP Mode
   ```
   3. Defaults to port 5555.

#### 2. Connect via IP:PORT
   1. Find your device IP: Settings > About phone > Status > IP address.
   2. Run:
   ```bash
   ADB: Connect Device
   ```
   3. Enter <ip>:5555.

#### 3. Disconnect Device
Run:
   ```bash
   ADB: Disconnect Device
   ```
#### 4. List Devices
Run:

ADB: List Devices
#### 5. Run Shell Command
Run:
```bash
ADB: Shell Command
```
Enter shell command (e.g., pm list packages).

#### 6. Generate QR for IP:PORT
   1. Run:
   ```bash
   ADB: Generate QR
   ```
2. Enter your device IP:PORT.
3. A QR code will be shown for scanning/sharing.

### ⚙️ Environment Variables
ADB_PATH → Custom adb binary path (optional).

### 🛠 Development
```bash
git clone https://github.com/GaneshPanwar/adb_wifi_qr.git
cd adb_wifi_qr
npm install
npm run compile
code .
```
Press F5 to launch Extension Development Host.

### 📦 Packaging
```bash
vsce package
```
Creates .vsix file in project root.

###🐞 Troubleshooting
1. no devices/emulators found → Enable USB debugging; check adb devices.
2. failed to connect to <ip>:5555 → Ensure device and PC are on the same WiFi; check firewall.
3. Windows users (CRLF warnings) → Safe to ignore LF will be replaced by CRLF.

📜 License
This project is licensed under the (MIT License)[LICENSE].

👨‍💻 Author
Developed by (Ganesh Panwar)[https://marketplace.visualstudio.com/publishers/ganesh-panwar]

⭐ If this extension helps you, consider rating it on the Marketplace!
