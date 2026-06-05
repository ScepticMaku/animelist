import { Link } from "expo-router";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from "react-native";
import * as Linking from 'expo-linking'
import { useEffect, useState } from "react";
import { supabase } from "@/src/utils/supabase";
import { showToast } from "@/src/components/showToast";
import validator from "validator";
import { createSessionFromUrl } from "@/src/components/createSessionFromUrl";
import { makeRedirectUri } from 'expo-auth-session';

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

  return (
    <View style={Styles.container}>
      <View style={Styles.forgotpassword}>
        <Text style={Styles.title}>Forgot password</Text>
        <Text>Enter your email below to request an email reset.</Text>
        <TextInput
          style={Styles.textInput}
          placeholder="Email"
          value={userEmail}
          keyboardType="email-address"
          onChangeText={setEmail}
        />

        {!validator.isEmpty((inputErrors.emailEmpty).trim()) && (
          <Text style={Styles.errorText}>{inputErrors.emailEmpty}</Text>
        )}

        {!validator.isEmpty((inputErrors.emailInvalid).trim()) && (
          <Text style={Styles.errorText}>{inputErrors.emailInvalid}</Text>
        )}

        {!processing ? (
          <Button
            title="Submit"
            onPress={() => sendPasswordReset()}
            disabled={processing}
          />
        ) : (
          <ActivityIndicator />
        )}
        <Text>Don't have an account? <Link style={Styles.link} href={'/(auth)/signup'}>Register</Link></Text>
      </View>
    </View>
  );
}

const Styles = StyleSheet.create({
  title: {
    fontSize: 24
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center',
  },
  forgotpassword: {
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

