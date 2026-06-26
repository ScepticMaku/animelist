import { DocumentNode } from '@apollo/client';
import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';
import { useQuery } from '@apollo/client/react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image, ImageBackground, ScrollView, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

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
  // 🌟 Added support for dynamic view mode toggling
  viewMode?: 'grid' | 'list';
}

interface PageData {
  Page: {
    media: [{
      id: number;
      title: {
        romaji: string;
      };
      coverImage: {
        large: string;
      };
      // 🌟 Added structural metadata properties for list view formats
      format?: string;
      genres?: string[];
    }];
  };
}

export function GetAnimeCoverArts({
  query,
  variables = {},
  style,
  isHorizontal,
  hideVerticalScroll,
  viewMode = 'grid', // Default fallback configuration
}: GetAnimeCoverArtsProps) {

  const selectAnime = (id: number) => {
    router.push({
      pathname: '/anime-info',
      params: { animeId: id }
    });
  };

  const { loading, error, data } = useQuery<PageData>(query, {
    variables: { ...variables },
    fetchPolicy: 'no-cache',
  });

  if (loading) return <Text style={Styles.statusFallbackText}>Loading...</Text>;
  if (error) return <Text style={Styles.statusFallbackText}>Error fetching anime: {error.message}</Text>;

  const isGrid = viewMode === 'grid';

  return (
    <ScrollView
      // When tracking horizontal rows (like Trending segments), block if the layout converts to vertical lists
      horizontal={isHorizontal && isGrid}
      showsHorizontalScrollIndicator={!(isHorizontal && isGrid)}
      showsVerticalScrollIndicator={!hideVerticalScroll}
    >
      {/* 🌟 Dynamic structural style switching container mapping */}
      <View style={isGrid ? style : Styles.listWrapperContainer}>
        {data?.Page.media && data?.Page?.media.length > 0 ? (
          data?.Page.media.map((anime) => (
            <TouchableOpacity
              key={anime.id}
              style={isGrid ? null : Styles.animeCardListRow}
              onPress={() => selectAnime(anime.id)}
            >
              {isGrid ? (
                /* Grid Structural Component Layout Block */
                <ImageBackground
                  style={[Styles.animeCoverSize, { justifyContent: 'flex-end', overflow: 'hidden' }]} 
                  source={{ uri: anime.coverImage.large }}
                  imageStyle={{ borderRadius: 8 }} 
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0, 0, 0, 0.85)']}
                    style={{
                      paddingHorizontal: 6,
                      paddingBottom: 8,
                      paddingTop: 32, 
                      borderBottomLeftRadius: 8,
                      borderBottomRightRadius: 8,
                    }}
                  >
                    <Text 
                      style={{ 
                        color: '#ffffff', 
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: 11,      
                        lineHeight: 15,    
                      }}
                      numberOfLines={2}    
                      ellipsizeMode="tail"  
                    >
                      {anime.title.romaji}
                    </Text>
                  </LinearGradient>
                </ImageBackground>
              ) : (
                /* 🌟 List Structural Row Component Layout Block */
                <>
                  <Image 
                    source={{ uri: anime.coverImage.large }} 
                    style={Styles.coverImageList} 
                  />
                  <View style={Styles.listMetaDetails}>
                    <Text numberOfLines={1} style={Styles.animeTitleListText}>
                      {anime.title.romaji}
                    </Text>
                    <Text style={Styles.animeSubMetaListText}>
                      {anime.format || "TV"} • {anime.genres?.slice(0, 2).join(', ') || 'Anime'}
                    </Text>
                  </View>
                </>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={Styles.statusFallbackText}>No anime found.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const Styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  animeCoverSize: {
    width: 123,
    height: 210,
    borderRadius: 8
  },
  statusFallbackText: {
    paddingVertical: 14,
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center'
  },
  
  // List Structural Elements Definitions
  listWrapperContainer: {
    flexDirection: 'column',
    width: '100%',
    gap: 10,
    paddingBottom: 20,
  },
  animeCardListRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
  },
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
});