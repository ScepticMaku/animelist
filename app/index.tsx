import { NavBar } from "@/src/components/navbar";
import { navItems } from "@/src/config/navConfig";
import { supabase } from "@/src/utils/supabase";
import { router } from "expo-router";
import { useEffect } from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";

const appLogo = require('@/assets/images/gojolist_logo.webp');

export default function Index() {

  useEffect(() => {
    const getCurrentSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("error getting user session: ", error.message);
        return;
      }

      if (data.session !== null) {
        router.push({
          pathname: '/(main)/library',
        });
      }
    }

    getCurrentSession();
  }, []);


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
