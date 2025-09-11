# ADB WiFi / QR Connect - Ready package

This archive contains a ready-to-run VS Code extension scaffold that supports ADB Wi-Fi connection via IP or QR code.

WHAT'S INCLUDED
- `package.json`, `tsconfig.json`, `src/extension.ts` (full extension source)
- `webview/qr.html` and `webview/jsqr.min.js` (placeholder + downloader)
- `flutter_backend/bin/adb_helper.dart` (Dart helper with help output)
- `.github/workflows/build.yml` (CI to build native binaries and VSIX)
- helper `download_jsqr.sh` to fetch real jsQR for offline use

IMPORTANT: I could not fetch the jsQR library inside this environment reliably, so `webview/jsqr.min.js` is currently a placeholder that throws if used. To vendor the real jsQR file, run the included script from the extension root (requires internet & curl):

```
./download_jsqr.sh
```

After that, build steps:
1. Install Node deps: `npm install`
2. Compile TS: `npm run compile`
3. Compile Dart helper for your platform: `dart compile exe flutter_backend/bin/adb_helper.dart -o bin/<platform>/adb_helper` and place binaries in `bin/{win,mac,linux}`
4. Open in VS Code and press F5 to run the Extension Development Host.

