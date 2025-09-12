# ADB WiFi VSCode Extension

A Visual Studio Code extension to manage Android devices over **ADB via Wi-Fi**.  
It supports listing devices, enabling TCP/IP mode, connecting via IP, auto-discovery, and QR code scanning — all directly from VSCode.

---

## Features

- 📱 **List connected devices** (`adb devices`)  
- 🌐 **Enable TCP/IP mode** on a device  
- 🔌 **Connect to device by IP:PORT**  
- ⚡ **Auto-connect** to all devices on Wi-Fi  
- 📷 **Scan QR code** (for IP/PORT) and connect instantly  
- 🔍 **Auto-detects adb executable** from Android SDK, PATH, or custom settings  

---

## Installation

1. Install the VSIX:
   - Run:  
     ```sh
     code --install-extension adb-wifi.vsix
     ```
   - Or from **VSCode → Extensions → Install from VSIX…**

2. Ensure you have **ADB installed**:
   - Either via [Android SDK Platform Tools](https://developer.android.com/studio/releases/platform-tools)  
   - Or already in your `PATH`.

3. Optionally, configure custom path:  
   - Go to **Settings → Extensions → ADB WiFi → adbPath**  

---

## Commands (Command Palette)

Open the **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS) and type:

- `ADB WiFi: List Devices`  
  Shows all connected devices.  
  ![List Devices](images/devices.png)

- `ADB WiFi: TCPIP`  
  Switches a connected device to TCP/IP mode (default port `5555`).  
  ![TCPIP](images/tcpip.png)

- `ADB WiFi: Connect WiFi`  
  Connect manually to `IP:PORT`.  
  ![Connect WiFi](images/connect.png)

- `ADB WiFi: Auto Connect WiFi`  
  Finds device IPs and connects automatically.  
  ![Auto WiFi](images/autoconnect.png)

- `ADB WiFi: Connect via QR`  
  Scan a QR code containing `IP:PORT` (e.g., `192.168.1.100:5555`) and connect.  
  ![QR Connect](images/qr.png)

---

## Typical Workflow (Demo)

1. Connect your device via **USB**.  
2. Run **`ADB WiFi: List Devices`** → ensure device is visible.  
3. Run **`ADB WiFi: TCPIP`** → device switches to TCP/IP mode.  
4. Disconnect USB cable.  
5. Run **`ADB WiFi: Auto Connect WiFi`** → device connects wirelessly.  
6. (Optional) Use **`ADB WiFi: Connect via QR`** for faster connections.

---

## Troubleshooting

- ❌ *“No adb found”*  
  → Install **platform-tools** and check PATH or set custom path in settings.  

- ❌ *“Connection refused”*  
  → Ensure device and PC are on the same Wi-Fi network, and TCP/IP mode is enabled.  

- ❌ *Auto connect fails*  
  → Use manual **`Connect WiFi`** with the device IP shown in `adb shell ip addr`.  

---

## Development

Clone repo and install dependencies:

```sh
npm install
npm run compile
