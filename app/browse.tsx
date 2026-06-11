import { GetAnimeCoverArts } from "@/src/components/getAnimeCoverArts";
import { AnimeFilters } from '@/src/components/AnimeFilters';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { GET_ALL_TIME_POPULAR, GENRE_QUERY, GET_POPULAR_THIS_SEASON, GET_TRENDING_ANIME, SEARCH_OR_FILTER_ANIME } from "@/src/config/queryConfig";

const currentYear = new Date().getFullYear();

export default function Browse() {

  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [genres, setGenres] = useState<[] | null>(null);
  const [formats, setFormats] = useState<[] | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [season, setSeason] = useState<string | null>(null);
  const [airingStatus, setAiringStatus] = useState<string | null>(null);

  useEffect(() => {
    if (showFilterOptions === false || genres && genres.length === 0) {
      setGenres(null);
    }

    if (showFilterOptions === false || formats && formats.length === 0) {
      setFormats(null);
    }

    if (season) {
      setYear(currentYear);
    }

  }, [showFilterOptions, genres, season, currentYear, formats]);

  return (
    <ScrollView style={Styles.container}>
      <View
        style={{ width: 400 }}
      >
        <Text style={Styles.title}>Browse Anime</Text>
        <View style={Styles.spacer} />
        <View style={{ gap: 5 }}>
          <View
            style={Styles.searchInput}
          >
            <TextInput
              style={Styles.searchBar}
              placeholder="Search animes..."
              keyboardType="default"
              value={searchValue as string}
              onChangeText={(text) => setSearchValue(text)}
            />
            <Ionicons
              name="search"
              size={26}
              style={Styles.searchIcon}
            />
          </View>
          <Button title="Filters" onPress={() => setShowFilterOptions(!showFilterOptions)} />
          {showFilterOptions && (
            <>
              <AnimeFilters
                query={GENRE_QUERY}
                label="Genre"
                filterType="genre"
                canSearch={true}
                isMulti={true}
                onValueChange={(value) => { setGenres(value as []) }}
              />
              <AnimeFilters
                label="Year"
                filterType="year"
                setSelectedValue={year}
                canSearch={true}
                onValueChange={(value) => setYear(value as number)}
              />
              <AnimeFilters
                label="Season"
                filterType="season"
                onValueChange={(value => setSeason(value as string))}
              />
              <AnimeFilters
                label="Format"
                filterType="format"
                isMulti={true}
                onValueChange={(value) => setFormats(value as [])}
              />
              <AnimeFilters
                label="Airing Status"
                filterType="airing-status"
                onValueChange={(value) => setAiringStatus(value as string)}
              />
            </>
          )}
        </View>
      </View>
      {(searchValue === null && genres === null && year === null && formats === null && airingStatus === null) ? (
        <View
        >
          <View style={Styles.spacer} />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', }}>
            <Text style={Styles.HeaderText}>Trending</Text>
            <Text style={{ color: 'blue' }}>Show All</Text>
          </View>
          <GetAnimeCoverArts
            query={GET_TRENDING_ANIME}
            variables={{ page: 1, perPage: 5, sort: "TRENDING_DESC", type: "ANIME" }}
            style={{ flexDirection: 'row', gap: 10 }}
            isHorizontal={true}
          />
          <View style={Styles.spacer} />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', }}>
            <Text style={Styles.HeaderText}>Popular This Season</Text>
            <Text style={{ color: 'blue' }}>Show All</Text>
          </View>
          <GetAnimeCoverArts
            query={GET_POPULAR_THIS_SEASON}
            variables={{ page: 1, perPage: 5, sort: "POPULARITY_DESC", type: "ANIME", seasonYear: currentYear, status: "RELEASING" }}
            style={{ flexDirection: 'row', gap: 10 }}
            isHorizontal={true}
          />
          <View style={Styles.spacer} />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', }}>
            <Text style={Styles.HeaderText}>All Time Popular</Text>
            <Text style={{ color: 'blue' }}>Show All</Text>
          </View>
          <GetAnimeCoverArts
            query={GET_ALL_TIME_POPULAR}
            variables={{ page: 1, perPage: 5, sort: "POPULARITY_DESC", type: "ANIME" }}
            style={{ flexDirection: 'row', gap: 10 }}
            isHorizontal={true}
          />
        </View>
      ) : (
        <GetAnimeCoverArts
          query={SEARCH_OR_FILTER_ANIME}
          variables={{
            page: 1,
            perPage: 50,
            type: "ANIME",
            search: searchValue !== null ? searchValue : undefined,
            genreIn: (genres && genres.length > 0) ? genres : undefined,
            seasonYear: year !== null ? year : undefined,
            season: season !== null ? season : undefined,
            formatIn: (formats && formats.length > 0) ? formats : undefined,
            status: airingStatus !== null ? airingStatus : undefined
          }}
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}
        />
      )}
    </ScrollView>
  );
}

const Styles = StyleSheet.create({
  scrollView: {
    height: 500
  },
  searchIcon: {
    position: 'absolute',
    top: 7,
    right: 8
  },
  searchInput: {
    position: 'relative'
  },
  searchBar: {
    borderRadius: 1,
    borderStyle: "solid",
    borderWidth: 1
  },
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
    paddingTop: 40,
    paddingBottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
    flex: 1,
  },
});

