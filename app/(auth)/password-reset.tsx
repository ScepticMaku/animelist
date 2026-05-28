import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function PasswordReset() {
  return (
    <View style={Styles.container}>
      <Text style={Styles.title}>Forgot password</Text>
      <TextInput style={Styles.textInput} placeholder="New Password" />
      <TextInput style={Styles.textInput} placeholder="Confirm Password" />
      <Button title="Submit" />
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

