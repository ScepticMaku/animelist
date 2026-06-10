import { gql } from "@apollo/client";

export const GET_TRENDING_ANIME = gql`
  query GetTrendingAnime($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType) {
  Page(page: $page, perPage: $perPage) {
    media(sort: $sort, type: $type) {
      id
      title {
        romaji
      }
      coverImage {
        large
      }
    }
  }
}
`;

export const GET_POPULAR_THIS_SEASON = gql`
  query GetPopularThisSeason($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType, $seasonYear: Int, $status: MediaStatus) {
  Page(page: $page, perPage: $perPage) {
    media(sort: $sort, type: $type, seasonYear: $seasonYear, status: $status) {
      id
      title {
        romaji
      }
      coverImage {
        large
      }
    }
  }
}
`;

export const GET_ALL_TIME_POPULAR = gql`
  query GetPopularThisSeason($page: Int, $perPage: Int, $sort: [MediaSort], $type: MediaType, $seasonYear: Int, $status: MediaStatus) {
  Page(page: $page, perPage: $perPage) {
    media(sort: $sort, type: $type, seasonYear: $seasonYear, status: $status) {
      id
      title {
        romaji
      }
      coverImage {
        large
      }
    }
  }
}
`;

export const SEARCH_ANIME_OR_FILTERS = gql`
  query SearchAnime(
  $page: Int, 
  $perPage: Int, 
  $type: MediaType, 
  $search: String,
  $genre: String,
  $year: Int,
  $season: MediaSeason,
  $format: MediaFormat,
  $status: MediaStatus
) {
  Page(page: $page, perPage: $perPage) {
    media(
      type: $type, 
      search: $search,
      genre: $genre,
      seasonYear: $year,
      season: $season,
      format: $format,
      status: $status
    ) {
      id
      title {
        romaji
      }
      coverImage {
        large
      }
    }
  }
}`;

export const GENRE_QUERY = gql`
  query GenreCollection {
    GenreCollection
  }
`;

