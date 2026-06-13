import { showToast } from "@/src/components/showToast";
import { supabase } from "@/src/utils/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";

export default function Dashboard() {

  const { flashMessage } = useLocalSearchParams<{ flashMessage: string }>();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (flashMessage) {
      showToast(flashMessage);

      router.setParams({ flashMessage: undefined });
    }
  }, [flashMessage]);

  async function signOut() {

    setProcessing(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setProcessing(false);
      throw error;
    }

    setProcessing(false);
    router.push({
      pathname: '/(auth)/login',
      params: { flashMessage: 'Successfully logged out!' }
    });

  }

  return (
    <View style={Styles.container}>
      <Text style={Styles.title}>Dashboard</Text>
      {!processing ? (
        <Button title="Logout" onPress={() => signOut()} />
      ) : (
        <ActivityIndicator />
      )}
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

