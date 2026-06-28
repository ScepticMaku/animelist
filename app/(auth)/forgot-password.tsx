import { Link } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import * as Linking from 'expo-linking'
import { useEffect, useState } from "react";
import { supabase } from "@/src/utils/supabase";
import { showToast } from "@/src/components/showToast";
import validator from "validator";
import Ionicons from '@expo/vector-icons/Ionicons';

const redirectUrl = Linking.createURL('/password-reset');

export default function ForgotPassword() {

  const [userEmail, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    emailEmpty: '',
    emailInvalid: '',
  });

  function validateInput() {
    const errors = {
      emailEmpty: '',
      emailInvalid: '',
    };

    if (validator.isEmpty(userEmail.trim())) {
      errors.emailEmpty = "Email is required.";
      setInputErrors(errors);
      return false;
    }

    if (!validator.isEmail(userEmail.trim())) {
      errors.emailInvalid = "Must be a valid email.";
      setInputErrors(errors);
      return false;
    }

    return true;
  }

  async function sendPasswordReset() {
    if (!validateInput()) return;

    setProcessing(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      userEmail, { redirectTo: redirectUrl }
    );

    if (error) {
      setProcessing(false);
      showToast(error.message);
      return;
    }

    setProcessing(false);
    showToast('Password reset request successfully sent!');
  }

  // Check for errors
  const hasEmailError = !validator.isEmpty(inputErrors.emailEmpty.trim()) || !validator.isEmpty(inputErrors.emailInvalid.trim());

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
          <View style={Styles.iconContainer}>
            <Ionicons name="key-outline" size={42} color="#3d85f1" />
          </View>
          <Text style={Styles.title}>Forgot Password?</Text>
          <Text style={Styles.subtitle}>
            No worries! Enter your email address and we'll send you instructions to reset your password.
          </Text>
        </View>

        {/* Info Card */}
        <View style={Styles.infoCard}>
          <View style={Styles.infoRow}>
            <Ionicons name="mail-unread-outline" size={20} color="#64748b" />
            <Text style={Styles.infoText}>
              You'll receive an email with a secure link to create a new password.
            </Text>
          </View>
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
                placeholder="Enter your registered email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                value={userEmail}
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

          {/* Submit Button */}
          <TouchableOpacity
            style={[Styles.submitButton, processing && Styles.submitButtonDisabled]}
            onPress={() => sendPasswordReset()}
            disabled={processing}
            activeOpacity={0.8}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="send-outline" size={20} color="#ffffff" />
                <Text style={Styles.submitButtonText}>Send Reset Link</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <TouchableOpacity
            style={Styles.backToLoginContainer}
            onPress={() => { }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back-outline" size={18} color="#64748b" />
            <Link href={'/(auth)/login'} asChild>
              <Text style={Styles.backToLoginText}>Back to Sign In</Text>
            </Link>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={Styles.helpSection}>
          <Text style={Styles.helpTitle}>Need Help?</Text>
          <Text style={Styles.helpText}>
            If you don't receive the email within a few minutes, please check your spam folder or contact support.
          </Text>
        </View>

        {/* Footer */}
        <View style={Styles.footer}>
          <Text style={Styles.footerText}>Don't have an account? </Text>
          <Link href={'/(auth)/signup'} asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={Styles.signUpLink}>Create Account</Text>
            </TouchableOpacity>
          </Link>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const Styles = StyleSheet.create({
  container: {
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
    marginBottom: 28,
  },
  iconContainer: {
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
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#fefce8',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde047',
    marginBottom: 28,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#854d0e',
    lineHeight: 19,
    fontWeight: '500',
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
    marginBottom: 24,
  },

  // Input Styles
  inputWrapper: {
    marginBottom: 22,
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

  // Error Text
  errorText: {
    color: '#f43f5e',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },

  // Submit Button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#3d85f1',
    borderRadius: 12,
    height: 52,
    shadowColor: '#3d85f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Back to Login
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },

  // Help Section
  helpSection: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3d85f1',
  },
});
