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
exports.extractIPRegex = exports.getIPAddressList = exports.checkPortOpen = exports.getLocalSubnet = void 0;
const os = __importStar(require("os"));
const net = __importStar(require("net"));
/**
 * Returns the local subnet address, e.g. "192.168.1".
 * @returns {string | null} The local subnet address or null if not found.
 */
function getLocalSubnet() {
    /**
     * Iterate over all network interfaces.
     * @see https://nodejs.org/en/docs/guides/networking/#network-interfaces
     */
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            /**
             * Check if the interface is an IPv4 address and is not internal.
             * @see https://nodejs.org/en/docs/guides/networking/#network-interfaces
             */
            if (iface.family === "IPv4" && !iface.internal) {
                const parts = iface.address.split(".");
                parts.pop();
                /**
                 * Return the local subnet address by joining the parts with a dot.
                 * @example "192.168.1"
                 */
                return parts.join(".");
            }
        }
    }
    return null;
}
exports.getLocalSubnet = getLocalSubnet;
/**
 * Checks if a port is open on a given IP address.
 * @param {string} ip - The IP address to check.
 * @param {number} [port=5555] - The port number to check. Defaults to 5555.
 * @param {number} [timeout=200] - The timeout in milliseconds. Defaults to 200.
 * @returns {Promise<boolean>} A promise that resolves to true if the port is open, false otherwise.
 */
function checkPortOpen(ip, port = 5555, timeout = 200) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        let isAvailable = false;
        // Set the timeout for the socket
        socket.setTimeout(timeout);
        // Handle the "connect" event
        socket.on("connect", () => {
            isAvailable = true;
            // Destroy the socket to free up resources
            socket.destroy();
        });
        // Handle the "timeout" event
        socket.on("timeout", () => socket.destroy());
        // Handle the "error" event
        socket.on("error", () => { });
        // Handle the "close" event
        socket.on("close", () => resolve(isAvailable));
        // Connect to the port
        socket.connect(port, ip);
    });
}
exports.checkPortOpen = checkPortOpen;
/**
 * Returns a list of IP addresses on the local subnet that have
 * an open port 5555.
 * @returns {Promise<string[]>} A promise that resolves to an array of IP addresses.
 */
async function getIPAddressList() {
    const subnet = getLocalSubnet();
    if (!subnet)
        return [];
    const devices = [];
    const promises = [];
    // Iterate over all possible IP addresses on the local subnet
    for (let i = 1; i <= 254; i++) {
        const ip = `${subnet}.${i}`;
        // Check if the port 5555 is open on the current IP address
        promises.push(checkPortOpen(ip, 5555).then(isOpen => {
            if (isOpen)
                devices.push(ip);
        }));
    }
    // Wait for all the promises to resolve
    await Promise.all(promises);
    return devices;
}
exports.getIPAddressList = getIPAddressList;
/**
 * Extracts an IP address from a given string using a regular expression.
 * @param {string | undefined} ipString - The string to extract the IP address from.
 * @returns {string | null} The extracted IP address if found, null otherwise.
 */
function extractIPRegex(ipString) {
    if (!ipString)
        return null;
    // The regular expression pattern to match an IP address
    // (\d{1,3}\.){3}\d{1,3} matches an IP address in the format xxx.xxx.xxx.xxx
    const regexPattern = /(\d{1,3}\.){3}\d{1,3}/;
    const match = ipString.match(regexPattern);
    // If a match is found, return the matched IP address
    // Otherwise, return null
    return match ? match[0] : null;
}
exports.extractIPRegex = extractIPRegex;
//# sourceMappingURL=networkHelper.js.map