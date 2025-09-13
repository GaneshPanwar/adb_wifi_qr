"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customADBPathKey = exports.lastUsedPort = exports.lastUsedIP = exports.allPackages = void 0;
/**
 * Store all keys for extension state management
 */
function allPackages() {
    return 'last_app_package_name';
}
exports.allPackages = allPackages;
function lastUsedIP() {
    return 'lastIPAddress';
}
exports.lastUsedIP = lastUsedIP;
function lastUsedPort() {
    return 'last_used_port';
}
exports.lastUsedPort = lastUsedPort;
function customADBPathKey() {
    return 'user_adb_path';
}
exports.customADBPathKey = customADBPathKey;
//# sourceMappingURL=global-state-keys.js.map