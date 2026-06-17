import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { NavBar } from "@/src/components/navbar";
import { navItems } from "@/src/config/navConfig";
import { AnimeFilters } from "@/src/components/AnimeFilters";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GENRE_QUERY } from "@/src/config/queryConfig";

export default function Browse() {

  const [watchingStatus, setWatchingStatus] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [genres, setGenres] = useState<[] | null>(null);
  const [formats, setFormats] = useState<[] | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [season, setSeason] = useState<string | null>(null);
  const [airingStatus, setAiringStatus] = useState<string | null>(null);
  const [sortFilter, setSortFilter] = useState<string | null>(null);
  const [filterTitle, setFilterTitle] = useState('');

  return (
    <>
      <ScrollView style={Styles.container}>
        <View
        >
          <Text style={Styles.title}>Library</Text>
          <View style={Styles.spacer} />
          <View style={{ gap: 5 }}>
            <AnimeFilters
              label="Watching Status"
              filterType="watching-status"
              setSelectedValue={watchingStatus}
              onValueChange={(value) => setWatchingStatus(value as string)}
            />
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
                  setSelectedValue={season}
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
      </ScrollView>
      <NavBar items={navItems.mainNavItems} />
    </>
  );
}

const Styles = StyleSheet.create({
  spacer: {
    height: 20
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24
  },
  container: {
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 120,
    paddingLeft: 10,
    paddingRight: 10,
    flex: 1,
  },
  searchInput: {
    position: 'relative'
  },
  searchBar: {
    borderRadius: 1,
    borderStyle: "solid",
    borderWidth: 1
  },
  searchIcon: {
    position: 'absolute',
    top: 7,
    right: 8
  }
});

