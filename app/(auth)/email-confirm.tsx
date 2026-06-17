import { NavBar } from "@/src/components/navbar";
import { Link, router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";
import { supabase } from "@/src/utils/supabase";
import { useEffect, useState } from "react";
import { showToast } from "@/src/components/showToast";

export default function EmailConfirm() {

  const { userEmail, flashMessage } = useLocalSearchParams<{ userEmail: string, flashMessage: string }>();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (flashMessage) {
      showToast(flashMessage);

      router.setParams({ flashMessage: undefined })
    }
  }, [flashMessage]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push({
            pathname: '/(main)/library',
            params: { flashMessage: 'Successfully logged in!' }
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data.user !== null) {
        router.push({
          pathname: '/(main)/library',
          params: { flashMesssage: 'Successfully logged in!' }
        });
      }
    }

    getCurrentUser();
  }, []);


  async function resendLink() {
    setProcessing(true);

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: userEmail
    });

    setProcessing(false);

    if (error) {
      showToast(error.message);
      return;
    }

    showToast('Email confirmation link sent!')
  }

  return (
    <View style={Styles.container}>
      <View style={Styles.emailConfirm}>
        <Text style={Styles.title}>Email Confirmation</Text>
        <Text>Check your email for the confirmation link.</Text>

        {!processing ? (
          <Button
            title="Resend Confirmation Link"
            onPress={() => resendLink()}
          />
        ) : (
          <ActivityIndicator />
        )}

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

