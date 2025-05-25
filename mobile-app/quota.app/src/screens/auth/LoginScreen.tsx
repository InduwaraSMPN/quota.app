import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants';
import { validateEmail } from '../../utils';
import { Logo } from '../../components/ui';

const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    const success = await login({
      username: email.trim(),
      password: password.trim(),
    });

    if (!success) {
      // Error handling is done in the auth context
      setPassword(''); // Clear password on failed login
    }
  };

  const handleForgotPassword = (): void => {
    Alert.alert(
      'Forgot Password',
      'Please contact your administrator to reset your password.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Logo width={240} height={48} />
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.instructionText}>
              Sign in to your fuel station account
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.gray400}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors({ ...errors, email: undefined });
                    }
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.gray400}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined });
                    }
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.gray400}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.gray400}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordButton}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loginButtonText}>Signing In...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.footerLink}>Contact Administrator</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  appTitle: {
    fontSize: TYPOGRAPHY.fontSizes['3xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  appSubtitle: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
  },
  formSection: {
    flex: 1,
    paddingTop: SPACING.lg,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.fontSizes['2xl'],
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    height: 50,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSizes.base,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  passwordToggle: {
    padding: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  loginButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.base,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.textInverse,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.textSecondary,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeights.medium,
  },
});

export default LoginScreen;
