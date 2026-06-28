import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import validator from 'validator'
import { supabase } from "@/src/utils/supabase";
import { showToast } from "@/src/components/showToast";

export default function Login() {

  const { flashMessage } = useLocalSearchParams<{ flashMessage: string }>();

  const [inputErrors, setInputErrors] = useState({
    emailEmpty: '',
    emailInvalid: '',
    passwordEmpty: '',
    passwordTooShort: '',
    passwordTooLong: '',
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (flashMessage) {
      showToast(flashMessage);
      router.setParams({ flashMessage: undefined });
    }
  }, [flashMessage]);

  function validateInput() {
    const errors = {
      emailEmpty: '',
      emailInvalid: '',
      passwordEmpty: '',
      passwordTooShort: '',
      passwordTooLong: '',
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

    return true;
  }

  async function loginUser() {
    if (!validateInput()) return

    setProcessing(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      if (error.code === 'email_not_confirmed') {
        setProcessing(false);
        router.push({
          pathname: '/(auth)/email-confirm',
          params: {
            flashMessage: 'You have to confirm your email to continue.',
            userEmail: email
          }
        });
        return;
      } else {
        setProcessing(false);
        showToast(error.message);
        return;
      }
    }

    setProcessing(false);
    router.push({
      pathname: '/(main)/library',
      params: {
        flashMessage: 'Successfully logged in!'
      }
    });
  }

  const hasEmailError = !validator.isEmpty(inputErrors.emailEmpty.trim()) || !validator.isEmpty(inputErrors.emailInvalid.trim());
  const hasPasswordError = !validator.isEmpty(inputErrors.passwordEmpty.trim()) || !validator.isEmpty(inputErrors.passwordTooShort.trim()) || !validator.isEmpty(inputErrors.passwordTooLong.trim());

  return (
    <KeyboardAvoidingView
      style={Styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={Styles.innerContainer}>
        {/* Header Section */}
        <View style={Styles.headerSection}>
          <View style={Styles.logoContainer}>
            <Ionicons name="play-circle" size={48} color="#3d85f1" />
          </View>
          <Text style={Styles.title}>Welcome Back</Text>
          <Text style={Styles.subtitle}>Sign in to continue to your library</Text>
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

          {/* Password Input */}
          <View style={Styles.inputWrapper}>
            <Text style={Styles.inputLabel}>Password</Text>
            <View style={[Styles.inputContainer, hasPasswordError && Styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} style={Styles.inputIcon} />
              <TextInput
                style={Styles.textInput}
                placeholder="Enter your password"
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

          {/* Forgot Password Link */}
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={Styles.forgotPasswordContainer}>
            <Text style={Styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[Styles.loginButton, processing && Styles.loginButtonDisabled]}
            onPress={() => loginUser()}
            disabled={processing}
            activeOpacity={0.8}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={Styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
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
      </View>
    </KeyboardAvoidingView>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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

  // Error Text
  errorText: {
    color: '#f43f5e',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 4,
  },

  // Forgot Password
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3d85f1',
    fontSize: 14,
    fontWeight: '600',
  },

  // Login Button
  loginButton: {
    backgroundColor: '#3d85f1',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3d85f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
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
  signUpLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3d85f1',
  },
});
