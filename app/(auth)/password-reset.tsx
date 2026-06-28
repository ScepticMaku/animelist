import { supabase } from "@/src/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import validator from 'validator';
import * as Linking from 'expo-linking';
import { showToast } from "@/src/components/showToast";

export default function PasswordReset() {

  const { flashMessage } = useLocalSearchParams<{ flashMessage: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [inputErrors, setInputErrors] = useState({
    passwordEmpty: '',
    passwordTooShort: '',
    passwordTooLong: '',
    confirmPasswordEmpty: '',
    passwordDoesntMatch: ''
  });

  function validateInput() {
    const errors = {
      passwordEmpty: '',
      passwordTooShort: '',
      passwordTooLong: '',
      confirmPasswordEmpty: '',
      passwordDoesntMatch: ''
    };

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

  useEffect(() => {
    if (flashMessage) {
      showToast(flashMessage);
      router.setParams({ flashMessage: undefined });
    }
  }, [flashMessage]);

  const resetPassword = async () => {
    if (!validateInput()) return;

    setProcessing(true);

    const { error } = await supabase.auth
      .updateUser({ password: confirmPassword });

    if (error) {
      setProcessing(false);
      showToast(error.message);
      return;
    }

    setProcessing(false);
    router.push({
      pathname: '/(main)/library',
      params: { flashMessage: 'Password successfully updated!' }
    });
  };

  // Check for errors
  const hasPasswordError = !validator.isEmpty(inputErrors.passwordEmpty.trim()) ||
    !validator.isEmpty(inputErrors.passwordTooShort.trim()) ||
    !validator.isEmpty(inputErrors.passwordTooLong.trim());
  const hasConfirmPasswordError = !validator.isEmpty(inputErrors.confirmPasswordEmpty.trim()) ||
    !validator.isEmpty(inputErrors.passwordDoesntMatch.trim());

  // Password strength indicator - returns numeric values instead of strings
  const getPasswordStrength = () => {
    if (!password) return null;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    // Return numeric values (0-1 scale for flex basis/width)
    if (strength <= 1) return { level: 'Weak', color: '#ef4444', progress: 0.33 };
    if (strength <= 3) return { level: 'Fair', color: '#f59e0b', progress: 0.66 };
    return { level: 'Strong', color: '#10b981', progress: 1 };
  };

  const passwordStrength = getPasswordStrength();

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
            <Ionicons name="lock-closed-outline" size={42} color="#3d85f1" />
          </View>
          <Text style={Styles.title}>Reset Password</Text>
          <Text style={Styles.subtitle}>
            Enter your new password below. Make sure it's strong and secure.
          </Text>
        </View>

        {/* Security Tips Card */}
        <View style={Styles.tipsCard}>
          <View style={Styles.tipsHeader}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#10b981" />
            <Text style={Styles.tipsTitle}>Password Requirements</Text>
          </View>
          <View style={Styles.requirementsList}>
            <View style={Styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={16} color={password.length >= 8 ? "#10b981" : "#cbd5e1"} />
              <Text style={[Styles.requirementText, password.length >= 8 && Styles.requirementMet]}>
                At least 8 characters
              </Text>
            </View>
            <View style={Styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={16} color={(password.length >= 8 && password.length <= 16) ? "#10b981" : "#cbd5e1"} />
              <Text style={[Styles.requirementText, password.length <= 16 && password.length > 0 && Styles.requirementMet]}>
                Maximum 16 characters
              </Text>
            </View>
            <View style={Styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={16} color={validator.equals(password, confirmPassword) && confirmPassword ? "#10b981" : "#cbd5e1"} />
              <Text style={[Styles.requirementText, validator.equals(password, confirmPassword) && confirmPassword && Styles.requirementMet]}>
                Both passwords match
              </Text>
            </View>
          </View>
        </View>

        {/* Form Card */}
        <View style={Styles.formCard}>

          {/* New Password Input */}
          <View style={Styles.inputWrapper}>
            <Text style={Styles.inputLabel}>New Password</Text>
            <View style={[Styles.inputContainer, hasPasswordError && Styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} style={Styles.inputIcon} />
              <TextInput
                style={Styles.textInput}
                placeholder="Enter new password"
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

            {/* Password Strength Indicator - FIXED: using flex instead of width % */}
            {passwordStrength && (
              <View style={Styles.strengthContainer}>
                <View style={Styles.strengthBarBackground}>
                  <View
                    style={[
                      Styles.strengthBarFill,
                      {
                        flex: passwordStrength.progress,
                        backgroundColor: passwordStrength.color
                      }
                    ]}
                  />
                  {/* Invisible filler to take remaining space */}
                  <View style={{ flex: 1 - passwordStrength.progress }} />
                </View>
                <Text style={[Styles.strengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.level}
                </Text>
              </View>
            )}

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
            <Text style={Styles.inputLabel}>Confirm New Password</Text>
            <View style={[Styles.inputContainer, hasConfirmPasswordError && Styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} style={Styles.inputIcon} />
              <TextInput
                style={Styles.textInput}
                placeholder="Confirm new password"
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

          {/* Submit Button */}
          <TouchableOpacity
            style={[Styles.submitButton, processing && Styles.submitButtonDisabled]}
            onPress={() => resetPassword()}
            disabled={processing}
            activeOpacity={0.8}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                <Text style={Styles.submitButtonText}>Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Note Card */}
        <View style={Styles.securityNoteCard}>
          <Ionicons name="information-circle-outline" size={18} color="#3d85f1" />
          <Text style={Styles.securityNoteText}>
            After resetting, you'll be logged in automatically with your new password.
          </Text>
        </View>

        {/* Footer */}
        <View style={Styles.footer}>
          <TouchableOpacity
            style={Styles.backToLoginContainer}
            onPress={() => { }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back-outline" size={18} color="#64748b" />
            <Text style={Styles.backToLoginText}>Back to Sign In</Text>
          </TouchableOpacity>
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
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3d85f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
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
    paddingHorizontal: 12,
  },

  // Security Tips Card
  tipsCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  requirementsList: {
    gap: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirementText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '500',
  },
  requirementMet: {
    fontWeight: '700',
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
    marginBottom: 20,
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

  // Password Strength Indicator - FIXED: using flex layout
  strengthContainer: {
    marginTop: 10,
    marginBottom: 6,
  },
  strengthBarBackground: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',  // Changed to row for flex-based width
    marginBottom: 6,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
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
    marginTop: 8,
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

  // Security Note Card
  securityNoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 24,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    marginLeft: 10,
    lineHeight: 19,
    fontWeight: '500',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});
