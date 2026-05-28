import { StyleSheet, Text, View } from "react-native";

export default function Login() {
  return (
    <View style={Styles.container}>
      <Text style={Styles.title}>Browse Anime</Text>
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

