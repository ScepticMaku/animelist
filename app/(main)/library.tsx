import { AnimeFilters } from "@/src/components/AnimeFilters";
import { NavBar } from "@/src/components/navbar";
import { navItems } from "@/src/config/navConfig";
import { GENRE_QUERY } from "@/src/config/queryConfig";
import { supabase } from "@/src/utils/supabase";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const currentYear = new Date().getFullYear();

export const GET_FILTERED_USER_LIST = gql`
  query (
    $ids: [Int], 
    $search: String, 
    $genres: [String], 
    $seasonYear: Int, 
    $season: MediaSeason, 
    $format: [MediaFormat], 
    $status: MediaStatus
  ) {
    Page(page: 1, perPage: 25) {
      media(
        id_in: $ids, 
        search: $search, 
        genre_in: $genres, 
        seasonYear: $seasonYear, 
        season: $season, 
        format_in: $format, 
        status: $status
      ) {
        id
        title {
          romaji
        }
        coverImage {
          large
        }
        format
        genres
      }
    }
  }
`;

interface AniListDashboardResponse {
  Page: {
    media: Array<{
      id: number;
      title: { romaji: string };
      coverImage: { large: string };
      format?: string;
      genres?: string[];
    }>;
  };
}

const mapStatusToDbId = (status: string | null): number | null => {
  if (!status) return null;
  const normalized = status.toLowerCase().trim();
  switch (normalized) {
    case 'watching': case 'current': return 1;
    case 'plan to watch': case 'planning': return 2;
    case 'completed': return 3;
    case 'rewatching': return 4;
    case 'paused': return 5;
    case 'dropped': return 6;
    default:
      const parsed = parseInt(status, 10);
      return isNaN(parsed) ? null : parsed;
  }
};



export default function Browse() {
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteAnimeIds, setFavoriteAnimeIds] = useState<number[]>([]);
  const [watchingStatus, setWatchingStatus] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [genres, setGenres] = useState<string[] | null>(null);
  const [formats, setFormats] = useState<string[] | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [season, setSeason] = useState<string | null>(null);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [airingStatus, setAiringStatus] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [baseAnimeIds, setBaseAnimeIds] = useState<number[]>([]);
  const [supabaseLoading, setSupabaseLoading] = useState(true);


  useEffect(() => {
    if (showFilterOptions === false || (genres && genres.length === 0)) setGenres(null);
    if (showFilterOptions === false || (formats && formats.length === 0)) setFormats(null);
    if (season) setYear(currentYear);
  }, [showFilterOptions, genres, season, formats]);

  useEffect(() => {
    const getCurrentSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) return;
      setIsLoggedIn(data.session !== null);
    };
    getCurrentSession();
  }, []);

  useEffect(() => {
    async function fetchUserTrackingIds() {
      try {
        setSupabaseLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) {
          setBaseAnimeIds([]);
          return;
        }

        let query = supabase
          .from("user_animes")
          .select("anime_id")
          .eq("user_id", sessionData.session.user.id);

        if (watchingStatus) {
          const statusDbId = mapStatusToDbId(watchingStatus);
          if (statusDbId !== null) query = query.eq("anime_status_id", statusDbId);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data) {
          const ids = data.map((item: any) => parseInt(item.anime_id));
          setBaseAnimeIds(ids);
        } else {
          setBaseAnimeIds([]);
        }
      } catch (err) {
        console.error(err);
        setBaseAnimeIds([]);
      } finally {
        setSupabaseLoading(false);
      }
    }
    fetchUserTrackingIds();
  }, [watchingStatus]);

  const clearFilters = () => {
    setSearchValue(null);
    setWatchingStatus(null);
    setGenres(null);
    setYear(null);
    setSeason(null);
    setFormats(null);
    setAiringStatus(null);
    setShowFilterOptions(false);
    setShowFavorites(false);
  };

  const fetchFavoriteIds = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) return;

    const { data } = await supabase
      .from("user_anime_favorites")
      .select("anime_id")
      .eq("user_id", sessionData.session.user.id);

    if (data) {
      const ids = data.map(item => parseInt(item.anime_id));
      setFavoriteAnimeIds(ids);
    }
  };

  const handleToggleFavorites = async () => {
    if (!showFavorites) {
      setFavoritesLoading(true); // Start loading
      try {
        await fetchFavoriteIds();
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setFavoritesLoading(false); // Stop loading
      }
    }
    setShowFavorites(!showFavorites);
  };

  const hasActiveFilters = searchValue !== null || watchingStatus !== null || genres !== null || year !== null || season !== null || formats !== null || airingStatus !== null;

  return (
    <>
      <ScrollView style={Styles.container} showsVerticalScrollIndicator={false}>
        <View style={Styles.headerWrapper}>
          <Text style={Styles.title}>Library</Text>

          <View style={Styles.searchRow}>
            <View style={Styles.searchFieldContainer}>
              <Ionicons name="search" size={20} style={Styles.searchInnerIcon} />
              <TextInput
                style={Styles.searchBar}
                placeholder="Search your library..."
                placeholderTextColor="#94a3b8"
                value={searchValue ?? ""}
                onChangeText={(text) => setSearchValue(text || null)}
              />
            </View>

            <TouchableOpacity
              style={Styles.controlActionRowButton}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              activeOpacity={0.7}
            >
              <Ionicons name={viewMode === 'grid' ? "list" : "grid"} size={20} color="#3d85f1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[Styles.filterToggleButton, showFilterOptions && Styles.filterToggleButtonActive]}
              onPress={() => setShowFilterOptions(!showFilterOptions)}
              activeOpacity={0.7}
            >
              <Ionicons name="funnel" size={20} color={showFilterOptions ? "#ffffff" : "#3d85f1"} />
            </TouchableOpacity>
          </View>

          {showFilterOptions && (
            <View style={Styles.filterPanelCard}>
              <View style={Styles.filterPanelHeader}>
                <Text style={Styles.filterPanelTitle}>Refine Library</Text>
                {hasActiveFilters && (
                  <TouchableOpacity onPress={clearFilters}>
                    <Text style={Styles.clearTextLink}>Reset All</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={Styles.filterScrollTrack}>
                <View style={Styles.filterComponentWrapper}><AnimeFilters label="Watching Status" filterType="watching-status" setSelectedValue={watchingStatus} onValueChange={(value) => setWatchingStatus(value as string)} /></View>
                <View style={Styles.filterComponentWrapper}><AnimeFilters query={GENRE_QUERY} label="Genre" filterType="genre" canSearch={true} isMulti={true} onValueChange={(value) => setGenres(value as string[])} /></View>
                <View style={Styles.filterComponentWrapper}><AnimeFilters label="Year" filterType="year" setSelectedValue={year} canSearch={true} onValueChange={(value) => setYear(value as number)} /></View>
                <View style={Styles.filterComponentWrapper}><AnimeFilters label="Season" filterType="season" setSelectedValue={season} onValueChange={(value) => setSeason(value as string)} /></View>
                <View style={Styles.filterComponentWrapper}><AnimeFilters label="Format" filterType="format" isMulti={true} onValueChange={(value) => setFormats(value as string[])} /></View>
                <View style={Styles.filterComponentWrapper}><AnimeFilters label="Airing Status" filterType="airing-status" onValueChange={(value) => setAiringStatus(value as string)} /></View>
              </ScrollView>
            </View>
          )}
        </View>

        <UserWatchlist
          animeIds={showFavorites ? favoriteAnimeIds : baseAnimeIds}
          showFavorites={showFavorites}
          onToggleFavorites={handleToggleFavorites}
          favoritesLoading={favoritesLoading}
          supabaseLoading={supabaseLoading}
          viewMode={viewMode}
          filterVariables={{
            search: searchValue,
            genres: genres,
            seasonYear: year,
            season: season,
            format: formats,
            status: airingStatus
          }}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />
      </ScrollView>
      <NavBar items={isLoggedIn ? navItems.mainNavItems : navItems.guestNavItems} />
    </>
  );
}

interface WatchlistProps {
  animeIds: number[];
  supabaseLoading: boolean;
  hasActiveFilters: boolean;
  viewMode: 'grid' | 'list';
  clearFilters: () => void;
  filterVariables: {
    search: string | null;
    genres: string[] | null;
    seasonYear: number | null;
    season: string | null;
    format: string[] | null;
    status: string | null;
  };
  showFavorites: boolean;
  onToggleFavorites: () => void;
  favoritesLoading: boolean;
}

function UserWatchlist({ animeIds, supabaseLoading, filterVariables, hasActiveFilters, clearFilters, viewMode, showFavorites, onToggleFavorites, favoritesLoading }: WatchlistProps) {

  // 🌟 FIX 1: Skip if EITHER Supabase OR Favorites is loading
  const shouldSkipQuery = supabaseLoading || favoritesLoading;

  // 🌟 FIX 2: Generate a unique key based on animeIds to force refetch
  const queryKey = animeIds.join('-') + '-' + JSON.stringify(filterVariables);

  const { loading: aniListLoading, data } = useQuery<AniListDashboardResponse>(GET_FILTERED_USER_LIST, {
    variables: {
      ids: animeIds.length > 0 ? animeIds : [-1], // Fallback token item to prevent crashing dynamic GraphQL array parsers
      search: filterVariables.search || undefined,
      genres: filterVariables.genres?.length ? filterVariables.genres : undefined,
      seasonYear: filterVariables.seasonYear || undefined,
      season: filterVariables.season || undefined,
      format: filterVariables.format?.length ? filterVariables.format : undefined,
      status: filterVariables.status || undefined
    },
    skip: shouldSkipQuery,
    fetchPolicy: 'cache-and-network'
  });


  if (supabaseLoading || favoritesLoading || (aniListLoading && animeIds.length > 0)) {
    return <ActivityIndicator size="small" color="#3d85f1" style={{ marginVertical: 40 }} />;
  }

  // If Supabase is complete and we explicitly have 0 tracking IDs, we can break early without waiting on network data
  const animeList = animeIds.length === 0 ? [] : (data?.Page?.media || []);
  const isGrid = viewMode === 'grid';

  return (
    <View style={Styles.feedSection}>
      <View style={Styles.sectionHeaderRow}>
        <Text style={Styles.HeaderText}>
          {hasActiveFilters ? "Filtered" : showFavorites ? "My Favorites" : "My Watchlist"} ({animeList.length})
        </Text>

        <View style={Styles.headerActionsWrapper}>
          {hasActiveFilters ? (
            <TouchableOpacity style={Styles.clearButtonInline} onPress={clearFilters}>
              <Text style={Styles.clearButtonInlineText}>Clear</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onToggleFavorites}>
              <Text style={[Styles.showAllText, showFavorites && Styles.activeFavoritesText]}>{showFavorites ? 'Back to Watchlist' : 'Show Favorites'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal={isGrid}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isGrid ? Styles.scrollContainer : Styles.listScrollContainer}
      >
        {animeList.length === 0 ? (
          <Text style={Styles.emptyText}>No matching anime items found.</Text>
        ) : (
          animeList.map((anime: any) => (
            <TouchableOpacity
              key={anime.id}
              style={isGrid ? Styles.animeCard : Styles.animeCardListRow}
              onPress={() => router.push({ pathname: "/anime-info" as any, params: { animeId: anime.id } })}
            >
              <Image
                source={{ uri: anime.coverImage.large }}
                style={isGrid ? Styles.coverImage : Styles.coverImageList}
              />

              {isGrid ? (
                <View style={Styles.textOverlay}>
                  <Text numberOfLines={2} style={Styles.animeTitle}>
                    {anime.title.romaji}
                  </Text>
                </View>
              ) : (
                <View style={Styles.listMetaDetails}>
                  <Text numberOfLines={1} style={Styles.animeTitleListText}>
                    {anime.title.romaji}
                  </Text>
                  <Text style={Styles.animeSubMetaListText}>
                    {anime.format || "TV"} • {anime.genres?.slice(0, 2).join(', ')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const Styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 60 },
  headerWrapper: { paddingHorizontal: 16, marginBottom: 8 },
  title: { fontWeight: '800', color: "#1e293b", fontSize: 28, letterSpacing: -0.5 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  searchFieldContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  searchInnerIcon: { paddingLeft: 12, color: "#94a3b8" },
  searchBar: { flex: 1, height: 46, paddingHorizontal: 10, fontSize: 15, color: '#1e293b' },

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
  filterToggleButton: { height: 46, width: 46, backgroundColor: '#ffffff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  filterToggleButtonActive: { backgroundColor: '#3d85f1', borderColor: '#3d85f1' },

  filterPanelCard: { marginTop: 14, backgroundColor: '#ffffff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  filterPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  filterPanelTitle: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 },
  clearTextLink: { fontSize: 13, fontWeight: '600', color: '#ef4444' },
  filterScrollTrack: { gap: 10, paddingRight: 10 },
  filterComponentWrapper: { minWidth: 135 },
  feedSection: { paddingHorizontal: 16, marginTop: 20, marginBottom: 140 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  HeaderText: { fontWeight: '700', fontSize: 18, color: '#1e293b' },
  showAllText: { color: '#3d85f1', fontWeight: '600', fontSize: 14 },
  clearButtonInline: { backgroundColor: '#fff1f2', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  clearButtonInlineText: { color: '#f43f5e', fontWeight: '700', fontSize: 12 },
  scrollContainer: { gap: 12, paddingRight: 20 },

  headerActionsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listScrollContainer: {
    gap: 10,
    paddingBottom: 20,
  },
  animeCard: {
    width: 110, height: 165, borderRadius: 12, overflow: "hidden", backgroundColor: "#e2e8f0", position: 'relative',
    borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  animeCardListRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  coverImage: { width: "100%", height: "100%" },
  coverImageList: {
    width: 50,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#e2e8f0'
  },
  listMetaDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  animeTitleListText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  animeSubMetaListText: {
    fontSize: 12,
    color: '#64748b',
  },
  textOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(11, 15, 26, 0.82)", paddingVertical: 10, paddingHorizontal: 6, borderTopWidth: 0.5, borderColor: 'rgba(255, 255, 255, 0.1)' },
  animeTitle: { color: "#ffffff", fontSize: 11, fontWeight: "700", textAlign: "center", letterSpacing: -0.2 },
  emptyText: { color: "#64748b", fontSize: 13, paddingVertical: 20 },
  activeFavoritesText: {
    color: '#f59e0b',
    fontWeight: '700'
  }
});
