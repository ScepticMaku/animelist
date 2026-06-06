import { GetAnimeCoverArts } from "@/src/components/getAnimeCoverArts";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { gql } from "@apollo/client";


const GET_TRENDING_ANIME = gql`
  query GetTrendingAnime($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType) {
  Page(page: $page, perPage: $perPage) {
    media(sort: $sort, type: $type) {
      id
      title {
        romaji
      }
      coverImage {
        large
      }
    }
  }
}
`;

const GET_POPULAR_THIS_SEASON = gql`
  query GetTrendingAnime($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType, $seasonYear: Int, $status: MediaStatus) {
  Page(page: $page, perPage: $perPage) {
    media(sort: $sort, type: $type, seasonYear: $seasonYear, status: $status) {
      id
      title {
        romaji
      }
      coverImage {
        large
      }
    }
  }
}
`;

const GET_ALL_TIME_POPULAR = gql`
  query GetTrendingAnime($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType) {
  Page(page: $page, perPage: $perPage) {
    media(sort: $sort, type: $type) {
      id
      title {
        romaji
      }
      coverImage {
        large
      }
    }
  }
}
`;

const currentYear = new Date().getFullYear();

export default function Browse() {
  return (
    <View style={Styles.container}>
      <ScrollView>
        <Text style={Styles.title}>Browse Anime</Text>
        <View style={Styles.spacer} />
        <Text style={Styles.HeaderText}>Trending Anime</Text>
        <GetAnimeCoverArts query={GET_TRENDING_ANIME} variables={{ page: 1, sort: "TRENDING_DESC", type: "ANIME" }} />
        <View style={Styles.spacer} />
        <Text style={Styles.HeaderText}>Popular This Season</Text>
        <GetAnimeCoverArts query={GET_POPULAR_THIS_SEASON} variables={{ page: 1, sort: "POPULARITY_DESC", type: "ANIME", seasonYear: currentYear, status: "RELEASING" }} />
        <View style={Styles.spacer} />
        <Text style={Styles.HeaderText}>All Time Popular</Text>
        <GetAnimeCoverArts query={GET_ALL_TIME_POPULAR} variables={{ page: 1, sort: "POPULARITY_DESC", type: "ANIME" }} />
      </ScrollView>
    </View>
  );
}

const Styles = StyleSheet.create({
  HeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
    paddingBottom: 5
  },
  spacer: {
    height: 20
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24
  },
  container: {
    paddingTop: 50,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

