import { AnimeFilters } from '@/src/components/AnimeFilters';
import { GetAnimeCoverArts } from "@/src/components/getAnimeCoverArts";
import { NavBar } from "@/src/components/navbar";
import { navItems } from "@/src/config/navConfig";
import { GENRE_QUERY, GET_ALL_TIME_POPULAR, GET_POPULAR_THIS_SEASON, GET_TRENDING_ANIME, SEARCH_OR_FILTER_ANIME } from "@/src/config/queryConfig";
import { supabase } from "@/src/utils/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const currentYear = new Date().getFullYear();

export default function Browse() {
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [genres, setGenres] = useState<[] | null>(null);
  const [formats, setFormats] = useState<[] | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [season, setSeason] = useState<string | null>(null);
  const [airingStatus, setAiringStatus] = useState<string | null>(null);
  const [sortFilter, setSortFilter] = useState<string | null>(null);
  const [filterTitle, setFilterTitle] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 🌟 Format Changer State for Browse Page
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (showFilterOptions === false || (genres && genres.length === 0)) {
      setGenres(null);
    }
    if (showFilterOptions === false || (formats && formats.length === 0)) {
      setFormats(null);
    }
    if (season) {
      setYear(currentYear);
    }
  }, [showFilterOptions, genres, season, formats]);

  const clearFilters = () => {
    setSearchValue(null);
    setGenres(null);
    setYear(null);
    setSeason(null);
    setFormats(null);
    setAiringStatus(null);
    setSortFilter(null);
    setFilterTitle('');
    setShowFilterOptions(false);
  };

  useEffect(() => {
    const getCurrentSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("error getting user session: ", error.message);
        return;
      }
      setIsLoggedIn(data.session !== null);
    };
    getCurrentSession();
  }, []);

  const hasActiveFilters = searchValue !== null || genres !== null || year !== null || formats !== null || airingStatus !== null || sortFilter !== null;

  return (
    <>
      <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
        <View style={Styles.headerWrapper}>
          <Text style={Styles.title}>Browse Anime</Text>
          
          {/* Main Search Row */}
          <View style={Styles.searchRow}>
            <View style={Styles.searchFieldContainer}>
              <Ionicons name="search" size={20} style={Styles.searchInnerIcon} />
              <TextInput
                style={Styles.searchBar}
                placeholder="Search animes..."
                placeholderTextColor="#94a3b8"
                value={searchValue ?? ""}
                onChangeText={(text) => setSearchValue(text || null)}
              />
            </View>
            
            {/* 🌟 Dynamic Format Changer Interchange Button */}
            <TouchableOpacity 
              style={Styles.controlActionRowButton}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={viewMode === 'grid' ? "list" : "grid"} 
                size={20} 
                color="#3d85f1" 
              />
            </TouchableOpacity>

            {/* Elegant Filter Drawer Toggle Button */}
            <TouchableOpacity 
              style={[Styles.filterToggleButton, showFilterOptions && Styles.filterToggleButtonActive]}
              onPress={() => setShowFilterOptions(!showFilterOptions)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="funnel"
                size={20}
                color={showFilterOptions ? "#ffffff" : "#3d85f1"}
              />
            </TouchableOpacity>
          </View>

          {/* New Horizontal Filter Expansion Panel */}
          {showFilterOptions && (
            <View style={Styles.filterPanelCard}>
              <View style={Styles.filterPanelHeader}>
                <Text style={Styles.filterPanelTitle}>Refine Search</Text>
                {hasActiveFilters && (
                  <TouchableOpacity onPress={clearFilters}>
                    <Text style={Styles.clearTextLink}>Reset All</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={Styles.filterScrollTrack}
              >
                <View style={Styles.filterComponentWrapper}>
                  <AnimeFilters
                    query={GENRE_QUERY}
                    label="Genre"
                    filterType="genre"
                    canSearch={true}
                    isMulti={true}
                    onValueChange={(value) => setGenres(value as [])}
                  />
                </View>

                <View style={Styles.filterComponentWrapper}>
                  <AnimeFilters
                    label="Year"
                    filterType="year"
                    setSelectedValue={year}
                    canSearch={true}
                    onValueChange={(value) => setYear(value as number)}
                  />
                </View>

                <View style={Styles.filterComponentWrapper}>
                  <AnimeFilters
                    label="Season"
                    filterType="season"
                    setSelectedValue={season}
                    onValueChange={(value) => setSeason(value as string)}
                  />
                </View>

                <View style={Styles.filterComponentWrapper}>
                  <AnimeFilters
                    label="Format"
                    filterType="format"
                    isMulti={true}
                    onValueChange={(value) => setFormats(value as [])}
                  />
                </View>

                <View style={Styles.filterComponentWrapper}>
                  <AnimeFilters
                    label="Airing Status"
                    filterType="airing-status"
                    onValueChange={(value) => setAiringStatus(value as string)}
                  />
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Content Feeds */}
        {!hasActiveFilters ? (
          <View style={Styles.feedSection}>
            {/* Trending Section */}
            <View style={Styles.sectionHeaderRow}>
              <Text style={Styles.HeaderText}>Trending</Text>
              <TouchableOpacity
                onPress={() => {
                  setSortFilter("TRENDING_DESC");
                  setFilterTitle("Trending Anime");
                }}
              >
                <Text style={Styles.showAllText}>Show All</Text>
              </TouchableOpacity>
            </View>
            <GetAnimeCoverArts
              query={GET_TRENDING_ANIME}
              variables={{ page: 1, perPage: 5, sort: "TRENDING_DESC", type: "ANIME" }}
              style={Styles.resultsGrid}
              isHorizontal={true}
              viewMode={viewMode}
            />

            <View style={Styles.spacer} />

            {/* Popular This Season */}
            <View style={Styles.sectionHeaderRow}>
              <Text style={Styles.HeaderText}>Popular This Season</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowFilterOptions(true);
                  setSortFilter("POPULARITY_DESC");
                  setFilterTitle("Popular This Season");
                  setYear(currentYear);
                  setSeason("SPRING");
                }}
              >
                <Text style={Styles.showAllText}>Show All</Text>
              </TouchableOpacity>
            </View>
            <GetAnimeCoverArts
              query={GET_POPULAR_THIS_SEASON}
              variables={{ page: 1, perPage: 5, sort: "POPULARITY_DESC", type: "ANIME", seasonYear: currentYear, status: "RELEASING" }}
              style={Styles.resultsGrid}
              isHorizontal={true}
              viewMode={viewMode}
            />

            <View style={Styles.spacer} />

            {/* All Time Popular */}
            <View style={Styles.sectionHeaderRow}>
              <Text style={Styles.HeaderText}>All Time Popular</Text>
              <TouchableOpacity
                onPress={() => {
                  setSortFilter("POPULARITY_DESC");
                  setFilterTitle("All Time Popular");
                }}
              >
                <Text style={Styles.showAllText}>Show All</Text>
              </TouchableOpacity>
            </View>
            <GetAnimeCoverArts
              query={GET_ALL_TIME_POPULAR}
              variables={{ page: 1, perPage: 5, sort: "POPULARITY_DESC", type: "ANIME" }}
              style={Styles.resultsGrid}
              isHorizontal={true}
              viewMode={viewMode}
            />
          </View>

        ) : (
          /* Filtered Results Output Screen */
          <View style={Styles.resultsSection}>
            <View style={Styles.resultsHeaderBar}>
              <Text style={Styles.HeaderText}>{sortFilter ? filterTitle : "Filtered Results"}</Text>
              <TouchableOpacity style={Styles.clearButtonInline} onPress={clearFilters}>
                <Text style={Styles.clearButtonInlineText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
            
            <GetAnimeCoverArts
              query={SEARCH_OR_FILTER_ANIME}
              variables={{
                type: "ANIME",
                search: searchValue !== null ? searchValue : undefined,
                genreIn: (genres && genres.length > 0) ? genres : undefined,
                seasonYear: year !== null ? year : undefined,
                season: season !== null ? season : undefined,
                formatIn: (formats && formats.length > 0) ? formats : undefined,
                status: airingStatus !== null ? airingStatus : undefined,
                sort: sortFilter !== null ? sortFilter : undefined
              }}
              style={viewMode === 'grid' ? Styles.resultsGrid : Styles.listScrollContainer}
              viewMode={viewMode}
            />
          </View>
        )}
      </ScrollView>
      <NavBar items={isLoggedIn ? navItems.mainNavItems : navItems.guestNavItems} />
    </>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 60,
  },
  headerWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontWeight: '800',
    color: "#1e293b",
    fontSize: 28,
    letterSpacing: -0.5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  searchFieldContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInnerIcon: {
    paddingLeft: 12,
    color: "#94a3b8",
  },
  searchBar: {
    flex: 1,
    height: 46,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#1e293b',
  },
  
  // 🌟 Shared Styles for formatting button configuration
  controlActionRowButton: {
    height: 46,
    width: 46,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  filterToggleButton: {
    height: 46,
    width: 46,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  filterToggleButtonActive: {
    backgroundColor: '#3d85f1',
    borderColor: '#3d85f1',
  },
  filterPanelCard: {
    marginTop: 14,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  filterPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterPanelTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  clearTextLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
  filterScrollTrack: {
    gap: 10,
    paddingRight: 10,
  },
  filterComponentWrapper: {
    minWidth: 125,
  },
  feedSection: {
    paddingHorizontal: 16,
    marginTop: 12,
    paddingBottom: 150
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  HeaderText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#1e293b',
  },
  showAllText: {
    color: '#3d85f1',
    fontWeight: '600',
    fontSize: 14,
  },
  resultsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
    paddingBottom: 150
  },
  resultsHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  // 🌟 Vertical list wrapper style context block
  listScrollContainer: {
    gap: 10,
    paddingBottom: 20,
  },
  clearButtonInline: {
    backgroundColor: '#fee2e2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearButtonInlineText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 13,
  },
  spacer: {
    height: 24,
  },
});