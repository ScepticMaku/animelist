import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
      pathname: '/(main)/dashboard',
      params: {
        flashMessage: 'Successfully logged in!'
      }
    });
  }

  return (
    <View style={Styles.container}>
      <View style={Styles.login}>
        <Text style={Styles.title}>Login</Text>

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

        <View
          style={{ position: 'relative', }}
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

        <Link href={'/(auth)/forgot-password'}>Forgot password?</Link>

        {!processing ? (
          <Button
            title="Login"
            disabled={processing}
            onPress={() => loginUser()}
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
    alignItems: 'center'
  },
  login: {
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

