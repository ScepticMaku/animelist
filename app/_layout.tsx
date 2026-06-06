import { router, Stack } from "expo-router";
import * as Linking from 'expo-linking';
import { supabase } from "@/src/utils/supabase";
import { useEffect } from "react";
import { ApolloClient, gql, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from "@apollo/client/react";


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

  const client = new ApolloClient({
    link: new HttpLink({ uri: 'https://graphql.anilist.co' }),
    cache: new InMemoryCache()
  });


  return (
    <ApolloProvider client={client}>
      <Stack screenOptions={{ headerShown: false }} />
    </ApolloProvider>
  );
}
