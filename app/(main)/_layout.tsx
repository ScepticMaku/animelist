import { supabase } from "@/src/utils/supabase";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Linking, View } from "react-native";
import { createSessionFromUrl } from "@/src/components/createSessionFromUrl";
import { NavBar } from "@/src/components/navbar";
import { navItems } from "@/src/config/navConfig";

export default function RootLayout() {

  useEffect(() => {
    // Handle the URL if the app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) createSessionFromUrl(url);
    });

    // Listen for subsequent deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      createSessionFromUrl(url);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const getCurrentSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("error getting user session: ", error.message);
        return;
      }

      if (data.session === null) {
        router.push({
          pathname: '/(auth)/login',
          params: { flashMessage: 'You are logged out, please login again.' }
        });
      }
    }

    getCurrentSession();
  }, []);

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <Stack screenOptions={{ headerShown: false }} />
      <NavBar items={navItems.mainNavItems} />
    </View>
  );
}
