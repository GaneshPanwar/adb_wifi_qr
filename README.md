# ADB WiFi Connect VSCode Extension

This Visual Studio Code extension helps you connect Android devices over **ADB WiFi** easily.  
It provides commands to enable TCP/IP, connect/disconnect devices, and also generate QR codes for easier sharing.

---

## 📦 Features

- 📱 List connected devices (`adb devices`)
- 📡 Enable WiFi debugging (`adb tcpip 5555`)
- 🔗 Connect to devices by **IP:PORT**
- ❌ Disconnect devices
- 💻 Run ADB shell commands
- 🔲 Generate **QR code** for `IP:PORT` (scan on another machine/device)
- 🖥️ Cross-platform helper (Windows, macOS, Linux)

---

## 🚀 Installation

1. Download the [Latest Version](adb-wifi-qr-0.1.0.vsix)`.vsix` package from the releases (or build manually).
2. In VSCode, run:

   ```bash
   code --install-extension adb-wifi-qr-0.1.1.vsix

3. Reload VSCode.

---

## 🔧 Requirements

* **Android SDK Platform Tools** (`adb`) must be installed.
* Ensure `adb` is in your system `PATH`, or set the environment variable `ADB_PATH`.

---

## 📖 Usage

### 1. Enable WiFi Debugging

1. Connect your device via USB.
2. Run in command palette (**Ctrl+Shift+P** / **Cmd+Shift+P**):

   ```
   ADB: Enable TCP/IP Mode
   ```

   This defaults to port `5555`.

---

### 2. Connect via IP\:PORT

1. Find your device’s IP in **Settings > About phone > Status > IP address**.
2. Run:

   ```
   ADB: Connect Device
   ```
3. Enter `<ip>:5555`.

---

### 3. Disconnect Device

Run:

```
ADB: Disconnect Device
```

---

### 4. List Devices

Run:

```
ADB: List Devices
```

---

### 5. Run Shell Command

Run:

```
ADB: Shell Command
```

and enter the shell command (e.g. `pm list packages`).

---

### 6. Generate QR for IP\:PORT

1. Run:

   ```
   ADB: Generate QR
   ```
2. Enter your **device IP\:PORT**.
3. A QR code will be shown (share/scan with another system for quick connect).

---

## ⚙️ Environment Variables

* `ADB_PATH` → Custom adb binary path (optional).
  Example:

  ```bash
  export ADB_PATH=/Users/username/Library/Android/sdk/platform-tools/adb
  ```

---

## 🛠 Development

Clone the repo and install dependencies:

```bash
git clone https://github.com/GaneshPanwar/adb_wifi_qr.git
cd adb_wifi_qr
npm install
```

Build and run:

```bash
npm run compile
code .
```

Press **F5** to launch a new Extension Development Host.

---

## 📦 Packaging

Build `.vsix`:

```bash
vsce package
```

The `.vsix` file will be created in the project root.

---

## 🐞 Troubleshooting

* **`no devices/emulators found`**
  → Ensure USB debugging is enabled on your device.
  → Check `adb devices` in terminal.

* **`failed to connect to <ip>:5555`**
  → Make sure device and PC are on the same WiFi network.
  → Check firewall settings.

* **Windows users (CRLF warnings)**
  → Git may warn about `LF will be replaced by CRLF`. Safe to ignore.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE.md).
