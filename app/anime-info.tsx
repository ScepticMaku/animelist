import { NavBar } from "@/src/components/navbar";
import { showToast } from "@/src/components/showToast";
import { navItems } from "@/src/config/navConfig";
import { GET_ANIME_INFO } from "@/src/config/queryConfig";
import { supabase } from "@/src/utils/supabase";
import { useQuery } from "@apollo/client/react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
// 🌟 Added router reference for history back steps
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { stripHtml } from 'string-strip-html';

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
  const [userId, setUserId] = useState<string | null>(null);

  const [userAnime, setUserAnime] = useState<any[] | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [episodeValue, setEpisodeValue] = useState('0');
  const [value, setValue] = useState<string | null>('1');
  const [isFocus, setIsFocus] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFavorite, setIsFavorite] = useState<boolean | undefined>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const animeStatuses = [
    { label: 'Watching', value: 1 },
    { label: 'Plan to watch', value: 2 },
    { label: 'Completed', value: 3 },
    { label: 'Rewatching', value: 4 },
    { label: 'Paused', value: 5 },
    { label: 'Dropped', value: 6 },
  ];

  useEffect(() => {
    setIsLoading(true);
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
        setUserId(data.session.user.id);

        const [favoritesResult, animeResult] = await Promise.all([
          supabase
            .from('user_anime_favorites')
            .select('*')
            .eq('user_id', data.session.user.id),
          supabase
            .from('user_animes')
            .select(`
              *,
              anime_statuses:anime_status_id(*)`)
            .eq('anime_id', animeId)
            .eq('user_id', data.session.user.id),
        ]);

        const favoritesData = favoritesResult.data;

        if (animeResult.data) {
          setUserAnime(animeResult.data);
          animeResult.data.map((a) => (
            setValue(a.anime_status_id),
            setHasValue(true),
            setEpisodeValue(a.anime_episodes.toString()),
            setNoteValue(a.notes)
          ));
        }

        setIsLoading(false);
        setIsFavorite(favoritesData?.some(
          (f) => f.anime_id === parseInt(animeId)
        ));
      }
    }
    getCurrentSession();
  }, [setIsLoggedIn, setIsLoading, setUserId, setIsFavorite]);

  async function toggleFavorite(isFav: boolean | undefined, anime_id: number, user_id: string | null) {
    setIsFavoriteLoading(true);

    if (!isFav) {
      const { error } = await supabase
        .from('user_anime_favorites')
        .insert([{
          anime_id: anime_id,
          user_id: user_id
        }]);

      if (error) {
        console.error(error);
        showToast('Error adding to favorites: ' + error.message);
      }

      setIsFavorite(true);
    } else {
      const { error } = await supabase
        .from('user_anime_favorites')
        .delete()
        .eq('anime_id', animeId);

      if (error) {
        console.error(error);
        showToast('Error removing to favorites: ' + error.message);
      }

      setIsFavorite(false);
    }

    setIsFavoriteLoading(false);
  }

  async function saveAnime(status: string | null, episode: number, note: string) {
    setSaveLoading(true);

    const { data, error } = await supabase
      .from('user_animes')
      .insert({
        user_id: userId,
        anime_id: animeId,
        anime_status_id: status,
        anime_episodes: episode,
        notes: note
      })
      .select(`
              *,
              anime_statuses:anime_status_id(*)`)
      .eq('anime_id', animeId)
      .eq('user_id', userId);

    if (error) {
      console.error(error);
      showToast('Error adding to list: ' + error.message);
    }

    setSaveLoading(false);
    setUserAnime(data);
    data?.map((a) => (
      setValue(a.anime_status_id),
      setHasValue(true),
      setEpisodeValue(a.anime_episodes.toString()),
      setNoteValue(a.notes)
    ));
    setModalVisible(false);
  }

  async function updateAnime(status: string | null, episode: number, note: string) {
    setSaveLoading(true);

    const { error } = await supabase
      .from('user_animes')
      .update({
        anime_status_id: status,
        anime_episodes: episode,
        notes: note
      })
      .eq('anime_id', animeId);

    if (error) {
      console.error(error);
      showToast('Error updating anime: ' + error.message);
    }

    setSaveLoading(false);
    showToast('Successfully updated!');
  }

  async function deleteAnime() {
    setDeleteLoading(true);

    const { error } = await supabase
      .from('user_animes')
      .delete()
      .eq('anime_id', animeId);

    if (error) {
      console.error(error);
      showToast('Error updating anime: ' + error.message);
    }

    setDeleteLoading(false);
    setUserAnime(null);
    setValue('1');
    setEpisodeValue('0');
    setNoteValue('');
    setHasValue(false);
    setModalVisible(false);
  }

  const { loading, error, data } = useQuery<AnimeData>(GET_ANIME_INFO, {
    variables: { mediaId: animeId, isMain: true },
    fetchPolicy: 'network-only'
  });

  if (loading) return <View style={Styles.centered}><ActivityIndicator size="large" color="#3d85f1" /></View>
  if (error) return <View style={Styles.centered}><Text>Error fetching anime: {error.name}</Text></View>

  const anime = data?.Media;

  return (
    <>
      <ScrollView style={Styles.container} contentContainerStyle={{ paddingBottom: 160 }}>
        
        {/* 🌟 Navigation Back Button Control Bar */}
        <View style={Styles.backButtonContainer}>
          <TouchableOpacity 
            style={Styles.backButtonCircle}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#1e293b" />
          </TouchableOpacity>
        </View>

        <View style={Styles.mainInfo}>
          <Image
            style={Styles.animeCoverSize}
            source={{ uri: anime?.coverImage.large }}
          />
          <View style={Styles.headerTextContainer}>
            <Text style={Styles.titleText}>{anime?.title.romaji}</Text>
            {anime?.title.english && <Text style={Styles.englishTitleText}>{anime?.title.english}</Text>}
            
            {isLoggedIn && (
              <View style={Styles.actionRow}>
                {isLoading ? (
                  <ActivityIndicator color="#3d85f1" />
                ) : (
                  <>
                    <TouchableOpacity 
                      style={Styles.customButton} 
                      onPress={() => setModalVisible(true)}
                    >
                      <Text style={Styles.customButtonText}>
                        {userAnime && userAnime.length > 0 
                          ? userAnime[0].anime_statuses.name 
                          : 'Add to List'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[Styles.favoriteButton, isFavorite && Styles.favoriteActive]}
                      onPress={() => toggleFavorite(isFavorite, animeId, userId)}
                    >
                      {isFavoriteLoading ? (
                        <ActivityIndicator color='white' size={20} />
                      ) : (
                        <Ionicons 
                          name={isFavorite ? 'heart' : 'heart-outline'} 
                          color='white' 
                          size={22} 
                        />
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={Styles.divider} />
        
        <Text style={Styles.sectionTitle}>Description</Text>
        <Text style={Styles.descriptionText}>{stripHtml(anime?.description || '').result}</Text>

        <View style={Styles.divider} />

        <Text style={Styles.sectionTitle}>Genres</Text>
        <View style={Styles.genresContainer}>
          {anime?.genres.map((g) => (
            <View key={g} style={Styles.genreTag}>
              <Text style={Styles.genreText}>{g}</Text>
            </View>
          ))}
        </View>

        <View style={Styles.divider} />

        <Text style={Styles.sectionTitle}>Details</Text>
        <View style={Styles.gridContainer}>
          <View style={Styles.gridItem}><Text style={Styles.gridLabel}>Format</Text><Text style={Styles.gridValue}>{anime?.format || '-'}</Text></View>
          <View style={Styles.gridItem}><Text style={Styles.gridLabel}>Episodes</Text><Text style={Styles.gridValue}>{anime?.episodes || '-'}</Text></View>
          <View style={Styles.gridItem}><Text style={Styles.gridLabel}>Duration</Text><Text style={Styles.gridValue}>{anime?.duration ? `${anime.duration}m` : '-'}</Text></View>
          <View style={Styles.gridItem}><Text style={Styles.gridLabel}>Status</Text><Text style={Styles.gridValue}>{anime?.status || '-'}</Text></View>
          <View style={Styles.gridItem}><Text style={Styles.gridLabel}>Season</Text><Text style={Styles.gridValue}>{anime?.season || '-'}</Text></View>
          <View style={Styles.gridItem}><Text style={Styles.gridLabel}>Score</Text><Text style={Styles.gridValue}>⭐ {anime?.averageScore ? `${anime.averageScore}%` : '-'}</Text></View>
        </View>

        {anime?.studios?.nodes && anime.studios.nodes.length > 0 && (
          <View style={{ marginTop: 15 }}>
            <Text style={Styles.gridLabel}>Studios</Text>
            <Text style={Styles.gridValue}>{anime.studios.nodes.map(n => n.name).join(', ')}</Text>
          </View>
        )}

        <View style={Styles.divider} />
        
        <Text style={Styles.sectionTitle}>Relations</Text>
        <View style={Styles.relationsGrid}>
          {anime?.relations.nodes.map((relation) => (
            <View key={relation.id} style={Styles.relationCard}>
              <Image
                style={Styles.relationCover}
                source={{ uri: relation.coverImage.large }} 
              />
              <View style={Styles.relationMeta}>
                <Text numberOfLines={2} style={Styles.relationTitle}>{relation.title.romaji}</Text>
                <Text style={Styles.relationSub}>{relation.format} • {relation.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
      >
        <View style={Styles.modalOverlay}>
          <View style={Styles.modalContent}>
            <View style={Styles.modalHeader}>
              <Text style={Styles.modalTitle}>Update Tracker</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={Styles.inputLabel}>Status</Text>
            <Dropdown
              style={[Styles.dropdown, isFocus && { borderColor: '#3d85f1' }]}
              placeholderStyle={Styles.placeholderStyle}
              selectedTextStyle={Styles.selectedTextStyle}
              data={animeStatuses}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Status"
              value={value}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                setValue(item.value);
                setIsFocus(false);
              }}
            />

            <Text style={Styles.inputLabel}>Episode Progress</Text>
            <TextInput
              style={Styles.textInput}
              value={episodeValue}
              onChangeText={setEpisodeValue}
              keyboardType="number-pad"
            />

            <Text style={Styles.inputLabel}>Notes</Text>
            <TextInput
              style={[Styles.textInput, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
              multiline={true}
              value={noteValue}
              onChangeText={setNoteValue}
            />

            <View style={{ marginTop: 20, gap: 10 }}>
              {userAnime && userAnime.length > 0 ? (
                <>
                  <TouchableOpacity 
                    style={Styles.btnUpdate} 
                    onPress={() => updateAnime(value, parseInt(episodeValue), noteValue)}
                  >
                    {saveLoading ? <ActivityIndicator color="white" /> : <Text style={Styles.btnText}>Update Changes</Text>}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={Styles.btnDelete} 
                    onPress={() => deleteAnime()}
                  >
                    {deleteLoading ? <ActivityIndicator color="white" /> : <Text style={Styles.btnText}>Remove from List</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={Styles.btnSave} 
                  onPress={() => saveAnime(value, parseInt(episodeValue), noteValue)}
                >
                  {saveLoading ? <ActivityIndicator color="white" /> : <Text style={Styles.btnText}>Save Tracker</Text>}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <NavBar items={isLoggedIn ? navItems.mainNavItems : navItems.guestNavItems} />
    </>
  );
}

const Styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  // 🌟 Clean UI styles for Back navigation button layout
  backButtonContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  mainInfo: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  animeCoverSize: {
    width: 110,
    height: 165,
    borderRadius: 12,
    backgroundColor: '#cbd5e1',
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 26,
    marginBottom: 4,
  },
  englishTitleText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
    marginBottom: 4,
  },
  customButton: {
    backgroundColor: '#3d85f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  favoriteButton: {
    backgroundColor: '#94a3b8',
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteActive: {
    backgroundColor: '#e11d48',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  genreTag: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
    columnGap: '4%',
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  gridLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  relationsGrid: {
    gap: 10,
  },
  relationCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  relationCover: {
    width: 50,
    height: 75,
    backgroundColor: '#cbd5e1',
  },
  relationMeta: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  relationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  relationSub: {
    fontSize: 11,
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    width: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
    marginBottom: 6,
  },
  dropdown: {
    height: 44,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  placeholderStyle: { fontSize: 14, color: '#94a3b8' },
  selectedTextStyle: { fontSize: 14, color: '#1e293b' },
  textInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  },
  btnSave: { 
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    backgroundColor: '#3d85f1' 
  },
  btnUpdate: { 
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    backgroundColor: '#10b981' 
  },
  btnDelete: { 
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    backgroundColor: '#ef4444' 
  },
  btnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});