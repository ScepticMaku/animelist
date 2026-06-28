import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
      errors.confirmPasswordEmpty = "Confirm Password must not be empty.";
      setInputErrors(errors);
      return false;
    }

    if (!validator.equals(password, confirmPassword)) {
      errors.passwordDoesntMatch = "Passwords does not match.";
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
        // ✅ ADD THIS: Save username to user metadata!
        data: {
          username: username.trim(),
          // You can add more metadata here if needed:
          // display_name: username.trim(),
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

  return (
    <View style={Styles.container}>
      <View style={Styles.signup}>
        <Text style={Styles.title}>Signup</Text>

        <TextInput
          style={Styles.textInput}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {!validator.isEmpty((inputErrors.emailEmpty).trim()) && (
          <Text style={Styles.errorText}>{inputErrors.emailEmpty}</Text>
        )}

        {!validator.isEmpty((inputErrors.emailInvalid).trim()) && (
          <Text style={Styles.errorText}>{inputErrors.emailInvalid}</Text>
        )}

        <TextInput
          style={Styles.textInput}
          placeholder="Username"
          keyboardType="default"
          value={username}
          onChangeText={setUsername}
        />


        {!validator.isEmpty((inputErrors.usernameEmpty).trim()) && (
          <Text style={Styles.errorText}>{inputErrors.usernameEmpty}</Text>
        )}

        {!validator.isEmpty((inputErrors.usernameInvalid).trim()) && (
          <Text style={Styles.errorText}>{inputErrors.usernameInvalid}</Text>
        )}

        <View
          style={{ position: 'relative' }}

        >
          <TextInput
            style={Styles.textInput}
            placeholder="Password"
            keyboardType="default"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={showPassword}
          />
          {!validator.isEmpty(password.trim()) && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 10,
                top: 8,
              }}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={26} />
            </TouchableOpacity>
          )}
        </View>

        {!validator.isEmpty((inputErrors.passwordEmpty).trim()) && (
          <Text style={Styles.errorText}>{inputErrors.passwordEmpty}</Text>
        )}

        {!validator.isEmpty((inputErrors.passwordTooShort).trim()) && (
          <Text style={Styles.errorText}>{inputErrors.passwordTooShort}</Text>
        )}

        {!validator.isEmpty((inputErrors.passwordTooLong).trim()) && (
          <Text style={Styles.errorText}>{inputErrors.passwordTooLong}</Text>
        )}

        <View
          style={{ position: 'relative' }}
        >
          <TextInput
            style={Styles.textInput}
            placeholder="Confirm Password"
            keyboardType="default"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={showConfirmPassword}
          />
          {!validator.isEmpty(confirmPassword.trim()) && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 10,
                top: 8,
              }}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={26} />
            </TouchableOpacity>
          )}

        </View>

        {!validator.isEmpty((inputErrors.confirmPasswordEmpty).trim()) && (
          <Text style={Styles.errorText}>{inputErrors.confirmPasswordEmpty}</Text>
        )}

        {!validator.isEmpty((inputErrors.passwordDoesntMatch).trim()) && (
          <Text style={Styles.errorText}>{inputErrors.passwordDoesntMatch}</Text>
        )}

        {!processing ? (
          <Button
            title="signup"
            disabled={processing}
            onPress={() => signUpUser()}
          />
        ) : (
          <ActivityIndicator />
        )}

        <Text>Already have an account? <Link style={Styles.link} href={'/(auth)/login'}>Login</Link></Text>
      </View>
    </View >
  );
}

const Styles = StyleSheet.create({
  title: {
    fontSize: 24
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center'
  },
  signup: {
    gap: 10,
    width: 300
  },
  textInput: {
    borderRadius: 1,
    borderStyle: "solid",
    borderWidth: 1
  },
  link: {
    color: "blue"
  },
  errorText: {
    color: "red"
  }
})

