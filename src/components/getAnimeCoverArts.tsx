import { useQuery } from '@apollo/client/react';
import { DocumentNode } from '@apollo/client';
import { Image, ImageSourcePropType, ScrollView, StyleSheet, Text, View } from 'react-native';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';

if (__DEV__) {
  loadDevMessages();
  loadErrorMessages();
}

interface GetAnimeCoverArtsProps {
  query: DocumentNode;
  variables?: Record<string, any>;
  perPage?: number;
}

export function GetAnimeCoverArts({
  query,
  variables = {},
  perPage = 5
}: GetAnimeCoverArtsProps) {

  interface PageData {
    Page: {
      media: [{
        id: string,
        title: {
          romaji: string,
        },
        coverImage: {
          large: string,
        },
      }];
    };
  }

  const { loading, error, data } = useQuery<PageData>(query, {
    variables: { ...variables, perPage },
  });

  if (loading) return <Text>Loading...</Text>
  if (error) return <Text>Error fetching anime: {error.message}</Text>

  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      style={Styles.container}
    >
      <View
        style={Styles.animeList}
      >
        {data?.Page.media.map((anime) => (
          <View
            key={anime.id}
          >
            <Image
              style={Styles.animeCoverSize}
              source={{
                uri: anime.coverImage.large
              }} />
            <Text
              style={Styles.animeTitle}
            >{anime.title.romaji}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const Styles = StyleSheet.create({
  container: {
    flexGrow: 0
  },
  animeList: {
    flexDirection: 'row',
  },
  animeCoverSize: {
    width: 140,
    height: 210,
    borderRadius: 5
  },
  animeTitle: {
    width: 150,
  }
});
