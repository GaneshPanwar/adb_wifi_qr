// dart file: flutter_backend/bin/adb_helper.dart
import 'dart:convert';
import 'dart:io';

void printHelp() {
  print(jsonEncode({
    'usage': 'adb_helper <command> [args]',
    'commands': {
      'devices': 'List connected adb devices',
      'tcpip': 'Enable tcpip on device: tcpip [port]',
      'connect': 'Connect to device: connect <ip:port>',
      'disconnect': 'Disconnect device: disconnect [ip:port]',
      'shell': 'Run adb shell command: shell <cmd>',
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
          print(jsonEncode({'error': 'missing_arg', 'message': 'connect requires ip:port'}));
          return 2;
        }
        return await _runAdb(['connect', args[1]]);
      case 'disconnect':
        final param = args.length > 1 ? args[1] : '';
        final a = param.isEmpty ? ['disconnect'] : ['disconnect', param];
        return await _runAdb(a);
      case 'shell':
        if (args.length < 2) {
          print(jsonEncode({'error': 'missing_arg', 'message': 'shell requires command'}));
          return 2;
        }
        return await _runAdb(['shell', ...args.sublist(1)]);
      case 'wifi_ip_auto':
        return await _wifiIpAuto();
      default:
        print(jsonEncode({'error': 'unknown_command', 'message': 'Unknown command: $command'}));
        return 3;
    }
  } catch (e) {
    print(jsonEncode({'error': 'exception', 'message': e.toString()}));
    return 4;
  }
}

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
      final ipResult = await Process.run(
          _adbPath(), ['-s', serial, 'shell', 'ip', '-f', 'inet', 'addr', 'show', 'wlan0']);
      final ipMatch = RegExp(r'inet (\d+\.\d+\.\d+\.\d+)/').firstMatch(ipResult.stdout ?? '');

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

String _adbPath() {
  return Platform.environment['ADB_PATH'] ?? 'adb';
}

Future<int> _runAdb(List<String> args) async {
  final adbPath = _adbPath();
  final result = await Process.run(adbPath, args);
  final out = result.stdout?.toString() ?? '';
  final err = result.stderr?.toString() ?? '';
  final exitCode = result.exitCode ?? 0;

  print(jsonEncode({
    'exitCode': exitCode,
    'args': [adbPath, ...args],
    'stdout': out,
    'stderr': err,
  }));

  return exitCode;
}
