/**
 * Store all keys for extension state management
 *
 * These keys are used to store the state of the extension in
 * the VSCode configuration.
 */

/**
 * Key to store the last used app package name
 *
 * @returns {string} The key to store the last used app package name
 */
export function allPackages() {
  return 'last_app_package_name'
}

/**
 * Key to store the last used IP address
 *
 * This key is used to store the last used IP address in the VSCode configuration.
 *
 * @returns {string} The key to store the last used IP address
 */
export function lastUsedIP(): string {
  return 'lastIPAddress'
}

/**
 * Key to store the last used device port
 *
 * This key is used to store the last used device port in the VSCode configuration.
 *
 * @returns {string} The key to store the last used device port
 */
export function lastUsedPort(): string {
  return 'last_used_port'
}

/**
 * Key to store the custom ADB path set by the user
 *
 * This key is used to store the custom ADB path set by the user in the VSCode configuration.
 *
 * @returns {string} The key to store the custom ADB path
 */
export function customADBPathKey(): string {
  return 'user_adb_path'
}
