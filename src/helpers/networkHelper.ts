import * as os from "os";
import * as net from "net";

export function getLocalSubnet(): string | null {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === "IPv4" && !iface.internal) {
        const parts = iface.address.split(".");
        parts.pop();
        return parts.join(".");
      }
    }
  }
  return null;
}

export function checkPortOpen(ip: string, port = 5555, timeout = 200): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isAvailable = false;

    socket.setTimeout(timeout);
    socket.on("connect", () => { isAvailable = true; socket.destroy(); });
    socket.on("timeout", () => socket.destroy());
    socket.on("error", () => {});
    socket.on("close", () => resolve(isAvailable));

    socket.connect(port, ip);
  });
}

export async function getIPAddressList(): Promise<string[]> {
  const subnet = getLocalSubnet();
  if (!subnet) return [];
  const devices: string[] = [];
  const promises: Promise<void>[] = [];

  for (let i = 1; i <= 254; i++) {
    const ip = `${subnet}.${i}`;
    promises.push(checkPortOpen(ip, 5555).then(isOpen => { if (isOpen) devices.push(ip); }));
  }

  await Promise.all(promises);
  return devices;
}

export function extractIPRegex(ipString: string | undefined): string | null {
  if (!ipString) return null;
  const match = ipString.match(/(\d{1,3}\.){3}\d{1,3}/);
  return match ? match[0] : null;
}
