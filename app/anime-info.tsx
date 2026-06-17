import { NavBar } from "@/src/components/navbar";
import { navItems } from "@/src/config/navConfig";
import { GET_ANIME_INFO } from "@/src/config/queryConfig";
import { supabase } from "@/src/utils/supabase";
import { useQuery } from "@apollo/client/react";
import { stripHtml } from 'string-strip-html';
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Button, ScrollView, StyleSheet, Text, TouchableOpacity, View, Pressable, ActivityIndicator, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { showToast } from "@/src/components/showToast";
import { Dropdown } from "react-native-element-dropdown";

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
            {isLoggedIn && (
              <View>
                <Text style={Styles.titleText}>{anime?.title.romaji}</Text>
                <Text style={Styles.englishTitleText}>{anime?.title.english}</Text>
                <View style={{ flexDirection: 'row', marginLeft: 5, gap: 5 }}>
                  {isLoading ? (
                    <View style={{ width: 200 }}>
                      <ActivityIndicator />
                    </View>
                  ) : (
                    <>
                      <View style={{ width: 200 }}>
                        {userAnime && userAnime.length > 0 ? (
                          userAnime?.map((anime) => (
                            <Button key={anime.id} title={anime.anime_statuses.name} onPress={() => setModalVisible(true)} />
                          ))
                        ) : (
                          <Button title='add to list' onPress={() => setModalVisible(true)} />
                        )}
                      </View>
                      <TouchableOpacity
                        style={Styles.favoriteButton}
                        onPress={() => toggleFavorite(isFavorite, animeId, userId)}
                      >
                        {isFavoriteLoading ? (
                          <ActivityIndicator color='white' size={32} />
                        ) : (
                          <Ionicons name={isFavorite ? 'heart-dislike-circle-outline' : 'heart-circle-outline'} color={'white'} size={32} />
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            )}

            <Modal
              animationType="slide"
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
              transparent={true}
            >
              <View style={Styles.modalOverlay}>
                <View style={Styles.modalContent}>
                  <Pressable
                    onPress={() => setModalVisible(false)}
                  >
                    <View>
                      <Text style={{ fontWeight: 'bold' }}>Add to list</Text>
                      <View style={Styles.spacer} />
                      <Text style={{ paddingBottom: 5 }}>Status</Text>
                      <Dropdown
                        style={[Styles.dropdown, isFocus && { borderColor: 'blue' }]}
                        placeholderStyle={Styles.placeholderStyle}
                        selectedTextStyle={Styles.selectedTextStyle}
                        inputSearchStyle={Styles.inputSearchStyle}
                        iconStyle={Styles.iconStyle}
                        data={animeStatuses}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder="Select"
                        searchPlaceholder="Search..."
                        value={value}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={item => {
                          setValue(item.value);
                          setIsFocus(false);
                        }}
                        renderRightIcon={() => (
                          hasValue ? (
                            <Ionicons onPress={() => setValue(null)} name="close-outline" size={26} style={{ paddingLeft: 10 }} />
                          ) : (
                            <Ionicons name="chevron-down-outline" size={20} style={{ paddingLeft: 10 }} />
                          )
                        )}
                      />
                      <View style={Styles.spacer} />
                      <Text style={{ paddingBottom: 5 }}>Episode Progress</Text>
                      <TextInput
                        style={Styles.textInput}
                        value={episodeValue}
                        onChangeText={setEpisodeValue}
                        keyboardType="number-pad"
                      />
                      <View style={Styles.spacer} />
                      <Text style={{ paddingBottom: 5 }}>Note</Text>
                      <TextInput
                        style={Styles.textInput}
                        multiline={true}
                        keyboardType="default"
                        value={noteValue}
                        onChangeText={setNoteValue}
                      />
                      <View style={Styles.spacer} />
                      {userAnime && userAnime.length > 0 ? (
                        <View style={{ gap: 5 }}>
                          {saveLoading ? (
                            <ActivityIndicator />
                          ) : (
                            <Button
                              onPress={() => updateAnime(value, parseInt(episodeValue), noteValue)}
                              title="update"
                            />
                          )}
                          {deleteLoading ? (
                            <ActivityIndicator />
                          ) : (
                            <Button
                              color="#C80815"
                              onPress={() => deleteAnime()}
                              title="delete"
                            />
                          )}
                        </View>
                      ) : (
                        saveLoading ? (
                          <ActivityIndicator />
                        ) : (
                          <Button
                            onPress={() => saveAnime(value, parseInt(episodeValue), noteValue)}
                            title="save"
                          />
                        )
                      )}
                    </View>
                  </Pressable>
                </View>
              </View>
            </Modal>

          </View>
          <View style={Styles.spacer} />
          <Text style={Styles.descriptionText}>{stripHtml(anime?.description || '').result}</Text>
        </View>
        <View style={Styles.spacer} />
        <View style={Styles.additionalInfo}>
          <View style={Styles.miscInfo}>
            <Text style={{ fontWeight: 'bold' }}>Format</Text>
            <Text>{anime?.format}</Text>
            <Text style={{ fontWeight: 'bold' }}>Episodes</Text>
            <Text>{anime?.episodes}</Text>
            <Text style={{ fontWeight: 'bold' }}>Episode Duration</Text>
            <Text>{anime?.duration}</Text>
            <Text style={{ fontWeight: 'bold' }}>Status</Text>
            <Text>{anime?.status}</Text>
            <Text style={{ fontWeight: 'bold' }}>Season</Text>
            <Text>{anime?.season}</Text>
            <Text style={{ fontWeight: 'bold' }}>Average Score</Text>
            <Text>{anime?.averageScore}</Text>
            <Text style={{ fontWeight: 'bold' }}>Studios</Text>
            {anime && anime?.studios.nodes.map((n) => (
              <Text key={n.name}>{n.name}</Text>
            ))}
          </View>
          <View style={Styles.genreInfo}>
            <Text style={{ fontWeight: 'bold' }}>Genres</Text>
            <View style={Styles.genres}>
              {anime && anime?.genres.map((g) => (
                <Text key={g}>{g}</Text>
              ))}
            </View>
          </View>
        </View>
        <View style={Styles.spacer} />
        <Text style={{ fontWeight: 'bold', paddingBottom: 5 }}>Relations</Text>
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
              <Text style={{ width: 123 }}>{anime.title.romaji}</Text>
              <Text style={{ fontSize: 12 }}>{anime.format} - {anime.status}</Text>
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
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',              // Prevents it from taking full width
    shadowColor: '#000',       // Optional: Adds a nice shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,              // Shadow for Android
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',  // Centers the modal vertically
    alignItems: 'center',      // Centers the modal horizontally
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dims the screen behind the modal
  },
  addModal: {
  },
  spacer: {
    height: 20
  },
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
    marginRight: 10,
    flex: 1,
  },
  mainInfo: {
    flexDirection: 'row',
    paddingBottom: 5
  },
  titleText: {
    flexWrap: 'wrap',
    fontWeight: 'bold',
    paddingBottom: 5,
    paddingLeft: 5
  },
  englishTitleText: {
    flex: 1,
    paddingLeft: 5,
  },
  descriptionText: {
    flex: 1,
    flexWrap: 'wrap'
  },
  additionalInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  miscInfo: {

  },
  genreInfo: {
  },
  genres: {
  },
  genreTag: {
    marginRight: 8,
    marginBottom: 8
  },
  relations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 200
  },
  favoriteButton: {
    backgroundColor: '#E66386',
    borderRadius: 3
  },
  addButton: {
    width: 200,
  },
  textInput: {
    borderRadius: 5,
    borderStyle: "solid",
    borderWidth: 1
  },
})
