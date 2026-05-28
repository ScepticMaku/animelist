import { Link } from "expo-router";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function Login() {
  return (
    <View style={Styles.container}>
      <Text style={Styles.title}>Login</Text>
      <TextInput style={Styles.textInput} placeholder="Email" />
      <TextInput style={Styles.textInput} placeholder="Password" secureTextEntry />
      <Link href={'/(auth)/forgot-password'}>Forgot password?</Link>
      <Button title="Login" />
      <Text>Don't have an account? <Link style={Styles.link} href={'/(auth)/signup'}>Register</Link></Text>
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
    margin: 50
  },
  textInput: {
    borderRadius: 1,
    borderStyle: "solid",
    borderWidth: 1
  },
  link: {
    color: "blue"
  }
})

