import { supabase } from "@/src/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import validator from 'validator';
import * as Linking from 'expo-linking';
import { showToast } from "@/src/components/showToast";
import { createSessionFromUrl } from "@/src/components/createSessionFromUrl";


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

  useEffect(() => {
    if (flashMessage) {
      showToast(flashMessage);

      router.setParams({ flashMessage: undefined });
    }
  }, [flashMessage]);

  const resetPassword = async () => {
    if (!validateInput()) return

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
      pathname: '/(main)/dashboard',
      params: { flashMessage: 'Password successfully updated!' }
    });
  }

  return (
    <View style={Styles.container}>
      <View style={Styles.passwordreset}>
        <Text style={Styles.title}>Forgot password</Text>

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
            title="Submit"
            disabled={processing}
            onPress={() => resetPassword()}
          />
        ) : (
          <ActivityIndicator />
        )}
      </View>
    </View>
  );
}

const Styles = StyleSheet.create({
  title: {
    fontSize: 24
  },
  container: {
    gap: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: 'center',
  },
  passwordreset: {
    gap: 10,
    width: 300,
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

