import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class StationDropDown extends StatefulWidget {
  final Function(int) onStationSelected;
  final int? selectedStationId;

  const StationDropDown({Key? key, required this.onStationSelected, this.selectedStationId}) : super(key: key);

  @override
  _StationDropDownState createState() => _StationDropDownState();
}

class _StationDropDownState extends State<StationDropDown> {
  final List<Map<String, dynamic>> _stations = [
    {'id': 1, 'name': 'Colombo Central Station'},
    {'id': 2, 'name': 'Kandy Main Depot'},
    {'id': 3, 'name': 'Galle Fuel Center'},
    {'id': 4, 'name': 'Jaffna Distribution Point'},
    {'id': 5, 'name': 'Batticaloa Station'},
  ];

  late List<Map<String, dynamic>> _filteredStations;
  String _searchText = '';

  @override
  void initState() {
    super.initState();
    _filteredStations = _stations;
  }

  void _filterStations(String searchText) {
    setState(() {
      _searchText = searchText.toLowerCase();
      _filteredStations = _stations.where((station) {
        final nameLower = station['name'].toLowerCase();
        return nameLower.contains(_searchText);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Fuel Station',
          style: GoogleFonts.poppins(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          decoration: InputDecoration(
            hintText: 'Search station',
            prefixIcon: const Icon(Icons.search, color: Color(0xFF9F0707)),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade300, width: 1),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade300, width: 1),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF9F0707), width: 1.5),
            ),
            contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
            filled: true,
            fillColor: Colors.white,
          ),
          onChanged: _filterStations,
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade300),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<int>(
              isExpanded: true,
              value: widget.selectedStationId,
              hint: Text(
                'Select your station',
                style: GoogleFonts.poppins(
                  fontSize: 15,
                  color: Colors.grey.shade500,
                ),
              ),
              icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF9F0707)),
              items: _filteredStations.map((station) {
                return DropdownMenuItem<int>(
                  value: station['id'],
                  child: Text(
                    station['name'],
                    style: GoogleFonts.poppins(
                      fontSize: 15,
                      color: Colors.black87,
                    ),
                  ),
                );
              }).toList(),
              onChanged: (int? newValue) {
                if (newValue != null) {
                  widget.onStationSelected(newValue);
                }
              },
            ),
          ),
        ),
      ],
    );
  }
}
