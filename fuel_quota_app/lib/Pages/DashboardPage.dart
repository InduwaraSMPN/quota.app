import 'package:flutter/material.dart';
import 'package:qr_code_scanner_plus/qr_code_scanner_plus.dart';

import 'package:google_fonts/google_fonts.dart';

import 'UpdateFuelQuota.dart';

class Dashboardpage extends StatefulWidget {
  const Dashboardpage({super.key});

  @override
  State<Dashboardpage> createState() => _DashboardpageState();
}

class _DashboardpageState extends State<Dashboardpage> {
  final String employeeName = "Nadun"; // Replace with actual employee name from login
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  QRViewController? controller;
  String? qrResult;
  bool isScanning = false;

  // Sample data for vehicles refilled today
  final List<VehicleRefill> todayRefills = [
    VehicleRefill(
      vehicleNumber: "KA-3456",
      refillTime: DateTime.now().subtract(const Duration(hours: 2)),
      liters: 12.5,
    ),
    VehicleRefill(
      vehicleNumber: "GH-7890",
      refillTime: DateTime.now().subtract(const Duration(hours: 4)),
      liters: 8.2,
    ),
    VehicleRefill(
      vehicleNumber: "WP-1234",
      refillTime: DateTime.now().subtract(const Duration(minutes: 45)),
      liters: 15.0,
    ),
  ];

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) {
      setState(() {
        qrResult = scanData.code;
        isScanning = false;
        controller.pauseCamera();

        // Navigate directly to UpdateFuelQuota page
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => UpdateFuelQuota(vehicleId: scanData.code ?? ""),
          ),
        );
      });
    });
  }


  void _showQRResultDialog(String result) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('QR Code Result'),
        content: Text('Vehicle ID: $result'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _startRefueling(result);
            },
            child: const Text('Proceed to Refuel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  void _startRefueling(String vehicleId) {
    // Implement refueling logic here
    // This would typically navigate to a refueling page or show a refueling form
  }

  void _startQRScan() {
    setState(() {
      isScanning = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE9E6DC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF9F0707),
        elevation: 0,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Hello, $employeeName',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.notifications, color: Colors.white),
              onPressed: () {
                // Notification action
              },
            ),
          ],
        ),
      ),
      body: isScanning
          ? _buildQRScanner()
          : _buildDashboardContent(),
    );
  }

  Widget _buildQRScanner() {
    return Column(
      children: [
        Expanded(
          flex: 4,
          child: QRView(
            key: qrKey,
            onQRViewCreated: _onQRViewCreated,
            overlay: QrScannerOverlayShape(
              borderColor: const Color(0xFF9F0707),
              borderRadius: 10,
              borderLength: 30,
              borderWidth: 10,
              cutOutSize: MediaQuery.of(context).size.width * 0.8,
            ),
          ),
        ),
        Expanded(
          flex: 1,
          child: Container(
            color: Colors.white,
            width: double.infinity,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  qrResult ?? 'Scan vehicle QR code',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      isScanning = false;
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF9F0707),
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                  ),
                  child: const Text('Cancel Scan'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDashboardContent() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // QR Scan Card
          Card(
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Refuel Vehicle',
                    style: GoogleFonts.poppins(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Scan vehicle QR code to begin the refueling process',
                    style: GoogleFonts.poppins(
                      fontSize: 14,
                      color: Colors.grey[700],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      icon: const Icon(Icons.qr_code_scanner),
                      label: Text(
                        'Scan QR Code',
                        style: GoogleFonts.poppins(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      onPressed: _startQRScan,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF9F0707),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Today's Refills Section
          Text(
            'Vehicles Refilled Today',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),

          // List of refilled vehicles
          Expanded(
            child: VehicleRefillList(refills: todayRefills),
          ),
        ],
      ),
    );
  }
}

// Vehicle Refill Model and List Widget
class VehicleRefill {
  final String vehicleNumber;
  final DateTime refillTime;
  final double liters;

  VehicleRefill({
    required this.vehicleNumber,
    required this.refillTime,
    required this.liters
  });
}

class VehicleRefillList extends StatelessWidget {
  final List<VehicleRefill> refills;

  const VehicleRefillList({super.key, required this.refills});

  @override
  Widget build(BuildContext context) {
    if (refills.isEmpty) {
      return Center(
        child: Text(
          'No vehicles refilled today',
          style: GoogleFonts.poppins(
            fontSize: 16,
            color: Colors.grey[600],
          ),
        ),
      );
    }

    return ListView.builder(
      itemCount: refills.length,
      itemBuilder: (context, index) {
        final refill = refills[index];
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: ListTile(
            leading: const Icon(
              Icons.local_gas_station,
              color: Color(0xFF9F0707),
              size: 28,
            ),
            title: Text(
              refill.vehicleNumber,
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.w600,
              ),
            ),
            subtitle: Text(
              'Refilled at: ${refill.refillTime.hour}:${refill.refillTime.minute.toString().padLeft(2, '0')}',
              style: GoogleFonts.poppins(
                fontSize: 13,
              ),
            ),
            trailing: Text(
              '${refill.liters} L',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        );
      },
    );
  }
}
