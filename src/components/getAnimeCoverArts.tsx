import { useQuery } from '@apollo/client/react';
import { DocumentNode, WatchQueryFetchPolicy } from '@apollo/client';
import { Image, ImageSourcePropType, ScrollView, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { router } from 'expo-router';

if (__DEV__) {
  loadDevMessages();
  loadErrorMessages();
}

interface GetAnimeCoverArtsProps {
  query: DocumentNode;
  variables?: Record<string, any>;
  perPage?: number;
  style?: StyleProp<ViewStyle>;
  isHorizontal?: boolean;
  hideVerticalScroll?: boolean;
}

interface PageData {
  Page: {
    media: [{
      id: number,
      title: {
        romaji: string,
      },
      coverImage: {
        large: string,
      },
    }];
  };
}

export function GetAnimeCoverArts({
  query,
  variables = {},
  style,
  isHorizontal,
  hideVerticalScroll,
}: GetAnimeCoverArtsProps) {

  const selectAnime = (id: number) => {
    router.push({
      pathname: '/anime-info',
      params: { animeId: id }
    });
  }

  const { loading, error, data } = useQuery<PageData>(query, {
    variables: { ...variables },
    fetchPolicy: 'no-cache',
  });

  if (loading) return <Text>Loading...</Text>
  if (error) return <Text>Error fetching anime: {error.message}</Text>

  return (
    <ScrollView
      horizontal={isHorizontal}
      showsHorizontalScrollIndicator={!isHorizontal}
      showsVerticalScrollIndicator={!hideVerticalScroll}
    >
      <View
        style={style}
      >
        {data?.Page.media && data?.Page?.media.length > 0 ? (
          data?.Page.media.map((anime) => (
            <TouchableOpacity
              key={anime.id}
              onPress={() => selectAnime(anime.id)}
            >
              <Image
                style={Styles.animeCoverSize}
                source={{
                  uri: anime.coverImage.large
                }} />
              <Text
                style={Styles.animeTitle}
              >{anime.title.romaji}</Text>
            </TouchableOpacity>
          ))

        ) : (
          <Text>No anime found.</Text>
        )}
      </View>
    </ScrollView>
  )
}

const Styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  animeCoverSize: {
    width: 123,
    height: 210,
    borderRadius: 5
  },
  animeTitle: {
    width: 123,
  }
});
