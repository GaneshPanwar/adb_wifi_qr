// dart file: flutter_backend/bin/adb_helper.dart
import 'dart:convert';
import 'dart:io';

/// Prints help information for the script.
///
/// The help information includes the usage, available commands, and
/// their respective arguments.
void printHelp() {
  print(jsonEncode({
    'usage': 'adb_helper <command> [args]',
    'commands': {
      'devices': 'List connected adb devices',
      /// Enables TCP/IP on the device. If no port is specified, it defaults to 5555.
      'tcpip': 'Enable tcpip on device: tcpip [port]',
      /// Connect to the device at the specified IP address and port.
      'connect': 'Connect to device: connect <ip:port>',
      /// Disconnect the device at the specified IP address and port.
      'disconnect': 'Disconnect device: disconnect [ip:port]',
      /// Run the specified ADB shell command.
      'shell': 'Run adb shell command: shell <cmd>',
      /// Auto-detect the device IP address and enable Wi-Fi ADB.
      'wifi_ip_auto': 'Auto-detect device IP and enable Wi-Fi ADB'
    }
  }));
}

Future<int> main(List<String> args) async {
  if (args.isEmpty) {
    printHelp();
    return 0;
  }

  final command = args[0];

  try {
    switch (command) {
      case 'devices':
        return await _runAdb(['devices']);
      case 'tcpip':
        final port = args.length > 1 ? args[1] : '5555';
        return await _runAdb(['tcpip', port]);
      case 'connect':
        if (args.length < 2) {
          print(jsonEncode(
              {'error': 'missing_arg', 'message': 'connect requires ip:port'}));
          return 2;
        }
        return await _runAdb(['connect', args[1]]);
      case 'disconnect':
        final param = args.length > 1 ? args[1] : '';
        final a = param.isEmpty ? ['disconnect'] : ['disconnect', param];
        return await _runAdb(a);
      case 'shell':
        if (args.length < 2) {
          print(jsonEncode(
              {'error': 'missing_arg', 'message': 'shell requires command'}));
          return 2;
        }
        return await _runAdb(['shell', ...args.sublist(1)]);
      case 'wifi_ip_auto':
        return await _wifiIpAuto();
      default:
        print(jsonEncode({
          'error': 'unknown_command',
          'message': 'Unknown command: $command'
        }));
        return 3;
    }
  } catch (e) {
    print(jsonEncode({'error': 'exception', 'message': e.toString()}));
    return 4;
  }
}

/// Enables TCP/IP on the device and prints the device's IP.
///
/// This function first lists all connected USB devices using `adb devices`.
/// It then iterates over each device and enables TCP/IP on the device using `adb tcpip <port>`.
/// After enabling TCP/IP, it runs the command `ip addr show wlan0` to get the device's IP.
/// The IP is extracted from the output using a regular expression and printed to the console.
///
/// If the IP is not found, an error message is printed to the console.
///
/// Returns 0 on success.
Future<int> _wifiIpAuto() async {
  // List connected USB devices
  final resultDevices = await Process.run(_adbPath(), ['devices']);
  final lines = (resultDevices.stdout?.toString() ?? '').split('\n');

  for (var line in lines) {
    if (line.endsWith('\tdevice')) {
      final serial = line.split('\t')[0];

      // Enable TCP/IP on port 5555
      await Process.run(_adbPath(), ['-s', serial, 'tcpip', '5555']);

      // Get device IP from wlan0
      final ipResult = await Process.run(_adbPath(),
          ['-s', serial, 'shell', 'ip', '-f', 'inet', 'addr', 'show', 'wlan0']);
      final ipMatch = RegExp(r'inet (\d+\.\d+\.\d+\.\d+)/')
          .firstMatch(ipResult.stdout ?? '');

      if (ipMatch != null) {
        final ip = ipMatch.group(1);
        print(jsonEncode({'serial': serial, 'ip': ip, 'port': '5555'}));
      } else {
        print(jsonEncode({'serial': serial, 'error': 'IP not found'}));
      }
    }
  }

  return 0;
}

/// Returns the path to the `adb` executable.
///
/// The path is determined by checking the `ADB_PATH` environment variable.
/// If the variable is not set, it defaults to `adb`.
String _adbPath() {
  /// The path to the `adb` executable.
  ///
  /// The path is determined by checking the `ADB_PATH` environment variable.
  /// If the variable is not set, it defaults to `adb`.
  final adbPath = Platform.environment['ADB_PATH'];

  if (adbPath != null) {
    return adbPath;
  }

  return 'adb';
}

/// Runs an ADB command and prints the output and exit code to the console.
///
/// [args] is the list of arguments to pass to the `adb` command.
///
/// Returns the exit code of the command.
Future<int> _runAdb(List<String> args) async {
  /// The path to the `adb` executable.
  final adbPath = _adbPath();

  /// Run the ADB command.
  final result = await Process.run(adbPath, args);

  /// Get the output, error, and exit code of the command.
  final out = result.stdout?.toString() ?? '';
  final err = result.stderr?.toString() ?? '';
  final exitCode = result.exitCode ?? 0;

  /// Print the output and exit code to the console.
  print(jsonEncode({
    'exitCode': exitCode,
    'args': [adbPath, ...args],
    'stdout': out,
    'stderr': err,
  }));

  /// Return the exit code.
  return exitCode;
}
