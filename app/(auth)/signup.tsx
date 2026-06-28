import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import validator from 'validator'
import Ionicons from '@expo/vector-icons/Ionicons'
import { supabase } from "@/src/utils/supabase";
import * as Linking from 'expo-linking';
import { showToast } from "@/src/components/showToast";

export default function Signup() {

  const [inputErrors, setInputErrors] = useState({
    emailEmpty: '',
    emailInvalid: '',
    usernameEmpty: '',
    usernameInvalid: '',
    passwordEmpty: '',
    passwordTooShort: '',
    passwordTooLong: '',
    confirmPasswordEmpty: '',
    passwordDoesntMatch: ''
  });
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [processing, setProcessing] = useState(false);

  const redirectUrl = Linking.createURL('/library');

  function validateInput() {
    const errors = {
      emailEmpty: '',
      emailInvalid: '',
      usernameEmpty: '',
      usernameInvalid: '',
      passwordEmpty: '',
      passwordTooShort: '',
      passwordTooLong: '',
      confirmPasswordEmpty: '',
      passwordDoesntMatch: ''
    };

    if (validator.isEmpty(email.trim())) {
      errors.emailEmpty = "Email is required.";
      setInputErrors(errors);
      return false;
    }

    if (!validator.isEmail(email.trim())) {
      errors.emailInvalid = "Must be a valid email.";
      setInputErrors(errors);
      return false;
    }

    if (validator.isEmpty(username.trim())) {
      errors.usernameEmpty = "Username is required.";
      setInputErrors(errors);
      return false;
    }

    if (!validator.isAlphanumeric(username.trim())) {
      errors.usernameInvalid = "Username must only be letters and numbers.";
      setInputErrors(errors);
      return false;
    }

    if (validator.isEmpty(password.trim())) {
      errors.passwordEmpty = "Password is required.";
      setInputErrors(errors);
      return false;
    }

    if (password.length < 8) {
      errors.passwordTooShort = "Password must be at least 8 characters.";
      setInputErrors(errors);
      return false;
    }

    if (password.length > 16) {
      errors.passwordTooLong = "Password must not exceed 16 characters.";
      setInputErrors(errors);
      return false;
    }

    if (validator.isEmpty(confirmPassword.trim())) {
      errors.confirmPasswordEmpty = "Confirm Password is required.";
      setInputErrors(errors);
      return false;
    }

    if (!validator.equals(password, confirmPassword)) {
      errors.passwordDoesntMatch = "Passwords do not match.";
      setInputErrors(errors);
      return false;
    }

    return true;
  }

  async function signUpUser() {
    if (!validateInput()) return;

    setProcessing(true);

    const { error } = await supabase.auth.signUp({
      email: email,
      password: confirmPassword,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: username.trim(),
        }
      }
    });

    if (error) {
      setProcessing(false);
      showToast(error.message);
      return;
    }

    setProcessing(false);
    router.push({
      pathname: '/(auth)/email-confirm',
      params: {
        flashMessage: 'Please confirm your email address to continue.',
        userEmail: email
      },
    });
  }

  // Helper functions for error checking
  const hasEmailError = !validator.isEmpty(inputErrors.emailEmpty.trim()) || !validator.isEmpty(inputErrors.emailInvalid.trim());
  const hasUsernameError = !validator.isEmpty(inputErrors.usernameEmpty.trim()) || !validator.isEmpty(inputErrors.usernameInvalid.trim());
  const hasPasswordError = !validator.isEmpty(inputErrors.passwordEmpty.trim()) || !validator.isEmpty(inputErrors.passwordTooShort.trim()) || !validator.isEmpty(inputErrors.passwordTooLong.trim());
  const hasConfirmPasswordError = !validator.isEmpty(inputErrors.confirmPasswordEmpty.trim()) || !validator.isEmpty(inputErrors.passwordDoesntMatch.trim());

  return (
    <KeyboardAvoidingView
      style={Styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={Styles.scrollView}
        contentContainerStyle={Styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Header Section */}
        <View style={Styles.headerSection}>
          <View style={Styles.logoContainer}>
            <Ionicons name="person-add" size={42} color="#3d85f1" />
          </View>
          <Text style={Styles.title}>Create Account</Text>
          <Text style={Styles.subtitle}>Join GojoList and start tracking your anime</Text>
        </View>

        {/* Form Card */}
        <View style={Styles.formCard}>

          {/* Email Input */}
          <View style={Styles.inputWrapper}>
            <Text style={Styles.inputLabel}>Email Address</Text>
            <View style={[Styles.inputContainer, hasEmailError && Styles.inputError]}>
              <Ionicons name="mail-outline" size={20} style={Styles.inputIcon} />
              <TextInput
                style={Styles.textInput}
                placeholder="Enter your email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>
            {!validator.isEmpty(inputErrors.emailEmpty.trim()) && (
              <Text style={Styles.errorText}>{inputErrors.emailEmpty}</Text>
            )}
            {!validator.isEmpty(inputErrors.emailInvalid.trim()) && (
              <Text style={Styles.errorText}>{inputErrors.emailInvalid}</Text>
            )}
          </View>

          {/* Username Input */}
          <View style={Styles.inputWrapper}>
            <Text style={Styles.inputLabel}>Username</Text>
            <View style={[Styles.inputContainer, hasUsernameError && Styles.inputError]}>
              <Ionicons name="at-outline" size={20} style={Styles.inputIcon} />
              <TextInput
                style={Styles.textInput}
                placeholder="Choose a username"
                placeholderTextColor="#94a3b8"
                keyboardType="default"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {!validator.isEmpty(inputErrors.usernameEmpty.trim()) && (
              <Text style={Styles.errorText}>{inputErrors.usernameEmpty}</Text>
            )}
            {!validator.isEmpty(inputErrors.usernameInvalid.trim()) && (
              <Text style={Styles.errorText}>{inputErrors.usernameInvalid}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={Styles.inputWrapper}>
            <Text style={Styles.inputLabel}>Password</Text>
            <View style={[Styles.inputContainer, hasPasswordError && Styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} style={Styles.inputIcon} />
              <TextInput
                style={Styles.textInput}
                placeholder="Create a password"
                placeholderTextColor="#94a3b8"
                keyboardType="default"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={showPassword}
                autoCapitalize="none"
              />
              {!validator.isEmpty(password.trim()) && (
                <TouchableOpacity
                  style={Styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#64748b" />
                </TouchableOpacity>
              )}
            </View>
            {!validator.isEmpty(inputErrors.passwordEmpty.trim()) && (
              <Text style={Styles.errorText}>{inputErrors.passwordEmpty}</Text>
            )}
            {!validator.isEmpty(inputErrors.passwordTooShort.trim()) && (
              <Text style={Styles.errorText}>{inputErrors.passwordTooShort}</Text>
            )}
            {!validator.isEmpty(inputErrors.passwordTooLong.trim()) && (
              <Text style={Styles.errorText}>{inputErrors.passwordTooLong}</Text>
            )}
          </View>

          {/* Confirm Password Input */}
          <View style={Styles.inputWrapper}>
            <Text style={Styles.inputLabel}>Confirm Password</Text>
            <View style={[Styles.inputContainer, hasConfirmPasswordError && Styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} style={Styles.inputIcon} />
              <TextInput
                style={Styles.textInput}
                placeholder="Confirm your password"
                placeholderTextColor="#94a3b8"
                keyboardType="default"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={showConfirmPassword}
                autoCapitalize="none"
              />
              {!validator.isEmpty(confirmPassword.trim()) && (
                <TouchableOpacity
                  style={Styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#64748b" />
                </TouchableOpacity>
              )}
            </View>
            {!validator.isEmpty(inputErrors.confirmPasswordEmpty.trim()) && (
              <Text style={Styles.errorText}>{inputErrors.confirmPasswordEmpty}</Text>
            )}
            {!validator.isEmpty(inputErrors.passwordDoesntMatch.trim()) && (
              <Text style={Styles.errorText}>{inputErrors.passwordDoesntMatch}</Text>
            )}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[Styles.signupButton, processing && Styles.signupButtonDisabled]}
            onPress={() => signUpUser()}
            disabled={processing}
            activeOpacity={0.8}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={20} color="#ffffff" />
                <Text style={Styles.signupButtonText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Terms Note */}
          <Text style={Styles.termsText}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>

        {/* Footer */}
        <View style={Styles.footer}>
          <Text style={Styles.footerText}>Already have an account? </Text>
          <Link href={'/(auth)/login'} asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={Styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const Styles = StyleSheet.create({
  container: {
    marginBottom: 60,
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#3d85f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  // Form Card
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  // Input Styles
  inputWrapper: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 52,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#f43f5e',
    backgroundColor: '#fff1f2',
  },
  inputIcon: {
    color: '#94a3b8',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    height: '100%',
  },
  passwordToggle: {
    padding: 4,
  },

  // Error Text
  errorText: {
    color: '#f43f5e',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },

  // Sign Up Button
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#3d85f1',
    borderRadius: 12,
    height: 52,
    marginTop: 8,
    shadowColor: '#3d85f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Terms Text
  termsText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    paddingHorizontal: 10,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3d85f1',
  },
});
