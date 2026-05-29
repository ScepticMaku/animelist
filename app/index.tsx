import { router } from "expo-router";
import { Button, Image, StyleSheet, Text, View } from "react-native";

const appLogo = require('@/assets/images/GojoList Logo.webp');

export default function Index() {
  return (
    <View
      style={{
        gap: 10,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image style={Styles.logo} source={appLogo} />
      <Text>GojoList</Text>
      <Button title="Browse Anime" onPress={() => router.navigate("/(auth)/signup")} />
      <Button title="Join Now" onPress={() => router.navigate("/(auth)/signup")} />
    </View>
  );
}

const Styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 200
  }
});
