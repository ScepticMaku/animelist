import { NavBar } from "@/src/components/navbar";
import { navItems } from "@/src/config/navConfig";
import { GET_ANIME_INFO } from "@/src/config/queryConfig";
import { supabase } from "@/src/utils/supabase";
import { useQuery } from "@apollo/client/react";
import { stripHtml } from 'string-strip-html';
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    episodes: number,
    averageScore: string,
    duration: number,
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
        },
        format: string,
        status: string,
      }]
    },
    status: string,
    studios: {
      nodes: [{
        id: number,
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

  const selectAnime = (id: number) => {
    router.push({
      pathname: '/anime-info',
      params: { animeId: id }
    });
  }

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
          <View style={Styles.mainInfo}>
            <Image
              style={Styles.animeCoverSize}
              source={{ uri: anime?.coverImage.large }}
            />
            <Text style={Styles.titleText}>{anime?.title.romaji}</Text>
          </View>
          <Text style={Styles.descriptionText}>{stripHtml(anime?.description || '').result}</Text>
        </View>
        <View style={Styles.additionalInfo}>
          <View style={Styles.miscInfo}>
            <Text>Format</Text>
            <Text>{anime?.format}</Text>
            <Text>Episodes</Text>
            <Text>{anime?.episodes}</Text>
            <Text>Episode Duration</Text>
            <Text>{anime?.duration}</Text>
            <Text>Status</Text>
            <Text>{anime?.status}</Text>
            <Text>Season</Text>
            <Text>{anime?.season}</Text>
            <Text>Average Score</Text>
            <Text>{anime?.averageScore}</Text>
            <Text>Studios</Text>
            {anime && anime?.studios.nodes.map((n) => (
              <Text key={n.name}>{n.name}</Text>
            ))}
          </View>
          <Text>Genres</Text>
          <View style={Styles.genreInfo}>
            <View>
              {anime && anime?.genres.map((g) => (
                <Text>{g}</Text>
              ))}
            </View>
          </View>
        </View>
        <Text>Relations</Text>
        <View style={Styles.relations}>
          {anime?.relations.nodes.map((anime) => (
            <View
              key={anime.id}
            >
              <Image
                style={Styles.animeCoverSize}
                source={{
                  uri: anime.coverImage.large
                }} />
              <Text>{anime.title.romaji}</Text>
              <Text>{anime.format} - {anime.status}</Text>
            </View>
          ))}
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
  animeCoverSize: {
    width: 123,
    height: 210,
    borderRadius: 5
  },
  container: {
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 120,
    paddingLeft: 10,
    paddingRight: 10,
    flex: 1,
  },
  mainInfo: {
    flexDirection: 'row',
  },
  titleText: {
    flex: 1,
    flexWrap: 'wrap'
  },
  descriptionText: {
    flex: 1,
    flexWrap: 'wrap'
  },
  additionalInfo: {

  },
  miscInfo: {

  },
  genreInfo: {

  },
  relations: {

  }
})
