import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class UpdateFuelQuota extends StatefulWidget {
  final String vehicleId; // This will come from QR scan

  const UpdateFuelQuota({super.key, required this.vehicleId});

  @override
  State<UpdateFuelQuota> createState() => _UpdateFuelQuotaState();
}

class _UpdateFuelQuotaState extends State<UpdateFuelQuota> {
  bool _isLoading = true;
  bool _isRefueling = false;

  // Mock data - in real app, you would fetch this from API based on vehicleId
  late Map<String, dynamic> _vehicleDetails;
  final _fuelAmountController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Simulate API call to fetch vehicle details
    _fetchVehicleDetails();
  }

  @override
  void dispose() {
    _fuelAmountController.dispose();
    super.dispose();
  }

  Future<void> _fetchVehicleDetails() async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    // Mock data - replace with actual API call
    setState(() {
      _vehicleDetails = {
        'vehicleNumber': 'ABC-1234',
        'vehicleType': 'Car',
        'ownerName': 'John Doe',
        'ownerNIC': '991234567V',
        'ownerPhone': '0771234567',
        'totalQuota': 20.0, // Liters
        'remainingQuota': 15.5, // Liters
        'lastRefill': DateTime.now().subtract(const Duration(days: 5)),
      };
      _isLoading = false;
    });
  }

  void _submitRefueling() {
    // Validate input
    if (_fuelAmountController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter fuel amount')),
      );
      return;
    }

    final double fuelAmount = double.tryParse(_fuelAmountController.text) ?? 0;

    if (fuelAmount <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid fuel amount')),
      );
      return;
    }

    if (fuelAmount > _vehicleDetails['remainingQuota']) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Amount exceeds remaining quota')),
      );
      return;
    }

    setState(() {
      _isRefueling = true;
    });

    // Simulate API call to update fuel quota
    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        _isRefueling = false;
        // Update remaining quota
        _vehicleDetails['remainingQuota'] -= fuelAmount;
        _vehicleDetails['lastRefill'] = DateTime.now();
      });

      // Show success dialog
      _showSuccessDialog(fuelAmount);
    });
  }

  void _showSuccessDialog(double amount) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.check_circle, color: Color(0xFF9F0707), size: 28),
            const SizedBox(width: 8),
            Text(
              'Success!',
              style: GoogleFonts.poppins(
                fontWeight: FontWeight.bold,
                color: const Color(0xFF9F0707),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Fuel dispensed successfully',
              style: GoogleFonts.poppins(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Amount: ${amount.toStringAsFixed(1)} L',
              style: GoogleFonts.poppins(fontSize: 14),
            ),
            Text(
              'Vehicle: ${_vehicleDetails['vehicleNumber']}',
              style: GoogleFonts.poppins(fontSize: 14),
            ),
            Text(
              'Remaining Quota: ${_vehicleDetails['remainingQuota'].toStringAsFixed(1)} L',
              style: GoogleFonts.poppins(fontSize: 14),
            ),
            const SizedBox(height: 8),
            Text(
              'Date: ${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year}',
              style: GoogleFonts.poppins(fontSize: 14),
            ),
            Text(
              'Time: ${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
              style: GoogleFonts.poppins(fontSize: 14),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Return to dashboard
            },
            child: Text(
              'Done',
              style: GoogleFonts.poppins(
                color: const Color(0xFF9F0707),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE9E6DC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF9F0707),
        title: Text(
          'Update Fuel Quota',
          style: GoogleFonts.poppins(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(
        child: CircularProgressIndicator(
          color: Color(0xFF9F0707),
        ),
      )
          : SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Vehicle Information Card
            _buildInfoCard(
              title: 'Vehicle Information',
              icon: Icons.directions_car,
              children: [
                _buildInfoRow('Vehicle Number:', _vehicleDetails['vehicleNumber']),
                _buildInfoRow('Vehicle Type:', _vehicleDetails['vehicleType']),
              ],
            ),

            const SizedBox(height: 16),

            // Owner Information Card
            _buildInfoCard(
              title: 'Owner Information',
              icon: Icons.person,
              children: [
                _buildInfoRow('Name:', _vehicleDetails['ownerName']),
                _buildInfoRow('NIC:', _vehicleDetails['ownerNIC']),
                _buildInfoRow('Phone:', _vehicleDetails['ownerPhone']),
              ],
            ),

            const SizedBox(height: 16),

            // Fuel Quota Card
            _buildInfoCard(
              title: 'Fuel Quota',
              icon: Icons.local_gas_station,
              children: [
                _buildInfoRow(
                  'Total Quota:',
                  '${_vehicleDetails['totalQuota'].toStringAsFixed(1)} L',
                ),
                _buildInfoRow(
                  'Remaining Quota:',
                  '${_vehicleDetails['remainingQuota'].toStringAsFixed(1)} L',
                  valueColor: _vehicleDetails['remainingQuota'] < 5
                      ? Colors.red
                      : const Color(0xFF9F0707),
                  valueFontWeight: FontWeight.bold,
                ),
                _buildInfoRow(
                  'Last Refill:',
                  '${_vehicleDetails['lastRefill'].day}/${_vehicleDetails['lastRefill'].month}/${_vehicleDetails['lastRefill'].year}',
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Refuel Section
            Text(
              'Refuel Vehicle',
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),

            // Fuel Amount Input
            TextField(
              controller: _fuelAmountController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Fuel Amount (Liters)',
                labelStyle: GoogleFonts.poppins(),
                hintText: 'Enter amount to dispense',
                hintStyle: GoogleFonts.poppins(color: Colors.grey[400]),
                prefixIcon: const Icon(Icons.local_gas_station, color: Color(0xFF9F0707)),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF9F0707), width: 2),
                ),
                filled: true,
                fillColor: Colors.white,
              ),
            ),

            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isRefueling ? null : _submitRefueling,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF9F0707),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isRefueling
                    ? const SizedBox(
                  height: 24,
                  width: 24,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 3,
                  ),
                )
                    : Text(
                  'Confirm Refueling',
                  style: GoogleFonts.poppins(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: const Color(0xFF9F0707), size: 24),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(
      String label,
      String value, {
        Color? valueColor,
        FontWeight? valueFontWeight,
      }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: 14,
              color: Colors.black87,
            ),
          ),
          Text(
            value,
            style: GoogleFonts.poppins(
              fontSize: 14,
              fontWeight: valueFontWeight ?? FontWeight.w500,
              color: valueColor ?? Colors.black87,
            ),
          ),
        ],
      ),
    );
  }
}
