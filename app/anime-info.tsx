import { NavBar } from "@/src/components/navbar";
import { navItems } from "@/src/config/navConfig";
import { GET_ANIME_INFO } from "@/src/config/queryConfig";
import { supabase } from "@/src/utils/supabase";
import { useQuery } from "@apollo/client/react";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface AnimeData {
  Media: {
    coverImage: {
      large: string,
    },
    title: {
      romaji: string,
      english: string,
    },
    description: string,
    episodes: string,
    averageScore: string,
    duration: string,
    format: string,
    genres: [string],
    season: string,
    relations: {
      nodes: [{
        id: number,
        coverImage: {
          large: string,
        },
        title: {
          romaji: string,
        }
      }]
    },
    status: string,
    studios: {
      nodes: [{
        name: string
      }]
    }
  }
}

export default function AnimeInfo() {

  const { animeId } = useLocalSearchParams<{ animeId: any }>();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const getCurrentSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("error getting user session: ", error.message);
        return;
      }

      if (data.session === null) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
    }

    getCurrentSession();
  }, [setIsLoggedIn]);

  const { loading, error, data } = useQuery<AnimeData>(GET_ANIME_INFO, {
    variables: { mediaId: animeId, isMain: true },
    fetchPolicy: 'network-only'
  });

  if (loading) return <Text>Loading...</Text>
  if (error) {
    console.error(error.stack);

    return <Text>Error fetching anime: {error.name}</Text>
  }

  const anime = data?.Media;

  return (
    <>
      <ScrollView style={Styles.container}>
        <View>
          <Image
            source={{ uri: anime?.coverImage.large }}
          />
          <Text>{anime?.title.romaji}</Text>
        </View>
      </ScrollView>
      {isLoggedIn ? (
        <NavBar items={navItems.mainNavItems} />
      ) : (
        <NavBar items={navItems.guestNavItems} />
      )}

    </>
  );
}

const Styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 120,
    paddingLeft: 10,
    paddingRight: 10,
    flex: 1,
  },
})
