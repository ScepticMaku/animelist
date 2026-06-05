import { NavBar } from "@/src/components/navbar";
import { Link, router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/src/utils/supabase";
import { showToast } from "@/src/components/showToast";
import { supabaseWeb } from "@/src/utils/supabase.web";

export default function EmailConfirmed() {

  const { userEmail, flashMessage } = useLocalSearchParams<{ userEmail: string, flashMessage: string }>();

  useEffect(() => {
    if (flashMessage) {
      showToast(flashMessage);

      router.setParams({ flashMessage: undefined })
    }
  }, [flashMessage]);

  return (
    <View style={Styles.container}>
      <View style={Styles.emailConfirm}>
        <Text style={Styles.title}>Email Confirmation Success</Text>
        <Text>You can now close this page.</Text>

      </View>
    </View>
  );
}

const Styles = StyleSheet.create({
  title: {
    fontSize: 24
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center',
  },
  emailConfirm: {
    gap: 10,
    width: 300,
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

