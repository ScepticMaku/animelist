import { supabase } from "@/src/utils/supabase";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Profile() {

  async function signOut() {
    const { error } = await supabase.auth.signOut();
  }

  return (
    <View style={Styles.container}>
      <Text style={Styles.title}>Profile</Text>
      <Button title="Logout" onPress={() => signOut()} />
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
    alignItems: "center",
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

