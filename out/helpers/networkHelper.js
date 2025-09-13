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
function getLocalSubnet() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                const parts = iface.address.split(".");
                parts.pop();
                return parts.join(".");
            }
        }
    }
    return null;
}
exports.getLocalSubnet = getLocalSubnet;
function checkPortOpen(ip, port = 5555, timeout = 200) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        let isAvailable = false;
        socket.setTimeout(timeout);
        socket.on("connect", () => { isAvailable = true; socket.destroy(); });
        socket.on("timeout", () => socket.destroy());
        socket.on("error", () => { });
        socket.on("close", () => resolve(isAvailable));
        socket.connect(port, ip);
    });
}
exports.checkPortOpen = checkPortOpen;
async function getIPAddressList() {
    const subnet = getLocalSubnet();
    if (!subnet)
        return [];
    const devices = [];
    const promises = [];
    for (let i = 1; i <= 254; i++) {
        const ip = `${subnet}.${i}`;
        promises.push(checkPortOpen(ip, 5555).then(isOpen => { if (isOpen)
            devices.push(ip); }));
    }
    await Promise.all(promises);
    return devices;
}
exports.getIPAddressList = getIPAddressList;
function extractIPRegex(ipString) {
    if (!ipString)
        return null;
    const match = ipString.match(/(\d{1,3}\.){3}\d{1,3}/);
    return match ? match[0] : null;
}
exports.extractIPRegex = extractIPRegex;
//# sourceMappingURL=networkHelper.js.map