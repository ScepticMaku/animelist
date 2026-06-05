import { NavBar } from "@/src/components/navbar";
import { navItems } from "@/src/config/navConfig";
import { router } from "expo-router";
import { Button, Image, StyleSheet, Text, View } from "react-native";

const appLogo = require('@/assets/images/gojolist_logo.webp');

export default function Index() {
  return (
    <View
      style={Styles.container}
    >
      <Image style={Styles.logo} source={appLogo} />
      <Text>GojoList</Text>
      <Button title="Browse Anime" onPress={() => router.navigate("/browse")} />
      <Button title="Join Now" onPress={() => router.navigate("/(auth)/signup")} />
    </View>
  );
}

const Styles = StyleSheet.create({
  container: {
    gap: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200
  }
});
