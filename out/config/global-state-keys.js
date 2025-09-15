"use strict";
/**
 * Store all keys for extension state management
 *
 * These keys are used to store the state of the extension in
 * the VSCode configuration.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.customADBPathKey = exports.lastUsedPort = exports.lastUsedIP = exports.allPackages = void 0;
/**
 * Key to store the last used app package name
 *
 * @returns {string} The key to store the last used app package name
 */
function allPackages() {
    return 'last_app_package_name';
}
exports.allPackages = allPackages;
/**
 * Key to store the last used IP address
 *
 * This key is used to store the last used IP address in the VSCode configuration.
 *
 * @returns {string} The key to store the last used IP address
 */
function lastUsedIP() {
    return 'lastIPAddress';
}
exports.lastUsedIP = lastUsedIP;
/**
 * Key to store the last used device port
 *
 * This key is used to store the last used device port in the VSCode configuration.
 *
 * @returns {string} The key to store the last used device port
 */
function lastUsedPort() {
    return 'last_used_port';
}
exports.lastUsedPort = lastUsedPort;
/**
 * Key to store the custom ADB path set by the user
 *
 * This key is used to store the custom ADB path set by the user in the VSCode configuration.
 *
 * @returns {string} The key to store the custom ADB path
 */
function customADBPathKey() {
    return 'user_adb_path';
}
exports.customADBPathKey = customADBPathKey;
//# sourceMappingURL=global-state-keys.js.map