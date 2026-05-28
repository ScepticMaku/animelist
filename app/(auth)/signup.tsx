import { Link } from "expo-router";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function Signup() {
  return (
    <View style={Styles.container}>
      <Text style={Styles.title}>Signup</Text>
      <TextInput style={Styles.textInput} placeholder="Email" />
      <TextInput style={Styles.textInput} placeholder="Username" />
      <TextInput style={Styles.textInput} placeholder="Password" secureTextEntry />
      <TextInput style={Styles.textInput} placeholder="Confirm Password" secureTextEntry />
      <Button title="Signup" />
      <Text>Already have an account? <Link style={Styles.link} href={'/(auth)/login'}>Login</Link></Text>
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

