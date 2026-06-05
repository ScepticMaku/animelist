import { router, Stack } from "expo-router";
import * as Linking from 'expo-linking';
import { supabase } from "@/src/utils/supabase";
import { useEffect } from "react";

export default function RootLayout() {

  /*
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.push({
          pathname: '/(auth)/password-reset',
          params: { flashMessage: 'Please update your password.' }
        });
      }
    })
  });
  */

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
