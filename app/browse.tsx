import { GetAnimeCoverArts } from "@/src/components/getAnimeCoverArts";
import { AnimeFilters } from '@/src/components/AnimeFilters';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import validator from 'validator';
import { SEARCH_ANIME, GET_ALL_TIME_POPULAR, GENRE_QUERY, GET_POPULAR_THIS_SEASON, GET_TRENDING_ANIME } from "@/src/config/queryConfig";

const currentYear = new Date().getFullYear();

export default function Browse() {

  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500);

    return () => {
      clearTimeout(timer)
    };
  }, [searchValue]);

  return (
    <View style={Styles.container}>
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
              value={searchValue}
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
              <AnimeFilters query={GENRE_QUERY} label="Genre" filterType="genre" />
              <AnimeFilters label="Year" filterType="year" />
            </>
          )}
        </View>
      </View>
      {validator.isEmpty(searchValue.trim()) ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          <View style={Styles.spacer} />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', }}>
            <Text style={Styles.HeaderText}>Trending</Text>
            <Text style={{ color: 'blue' }}>Show All</Text>
          </View>
          <GetAnimeCoverArts query={GET_TRENDING_ANIME} variables={{ page: 1, perPage: 5, sort: "TRENDING_DESC", type: "ANIME" }} style={{ flexDirection: 'row', gap: 10 }} isHorizontal={true} />
          <View style={Styles.spacer} />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', }}>
            <Text style={Styles.HeaderText}>Popular This Season</Text>
            <Text style={{ color: 'blue' }}>Show All</Text>
          </View>
          <GetAnimeCoverArts query={GET_POPULAR_THIS_SEASON} variables={{ page: 1, perPage: 5, sort: "POPULARITY_DESC", type: "ANIME", seasonYear: currentYear, status: "RELEASING" }} style={{ flexDirection: 'row', gap: 10 }} isHorizontal={true} />
          <View style={Styles.spacer} />
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', }}>
            <Text style={Styles.HeaderText}>All Time Popular</Text>
            <Text style={{ color: 'blue' }}>Show All</Text>
          </View>
          <GetAnimeCoverArts query={GET_ALL_TIME_POPULAR} variables={{ page: 1, perPage: 5, sort: "POPULARITY_DESC", type: "ANIME" }} style={{ flexDirection: 'row', gap: 10 }} isHorizontal={true} />
        </ScrollView>
      ) : (
        <GetAnimeCoverArts
          query={SEARCH_ANIME}
          variables={{ page: 1, perPage: 50, type: "ANIME", search: debouncedSearch }}
          fetchPolicy="network-only"
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}
        />
      )}
    </View>
  );
}

const Styles = StyleSheet.create({
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
    justifyContent: "center",
    alignItems: "center",
  },
});

