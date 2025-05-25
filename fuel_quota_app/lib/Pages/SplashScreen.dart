import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart'; // For SVG support
import 'dart:async';
import 'package:google_fonts/google_fonts.dart';
import "package:fuel_quota_app/Pages/LoginPage.dart";

class SplashScreen extends StatefulWidget { // Fixed class name spelling
  const SplashScreen({super.key});

  @override
  _SplashScreenState createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Color(0xFFE9E6DC), // Match background
      statusBarIconBrightness: Brightness.dark,
    ));

    Future.delayed(const Duration(seconds: 3), () { // Reduced to 3s
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginPage()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE9E6DC), // Hex converted
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SvgPicture.asset( // SVG implementation
                'images/quota.app.logo.svg',
                height: MediaQuery.of(context).size.height * 0.05,
              ),


            ],
          ),
        ),
      ),
    );
  }


}
