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

export const SEARCH_OR_FILTER_ANIME = gql`
  query SearchOrFilterAnime($page: Int, $perPage: Int, $type: MediaType, $genreIn: [String], $seasonYear: Int, $formatIn: [MediaFormat], $season: MediaSeason, $status: MediaStatus, $search: String) {
  Page(page: $page, perPage: $perPage) {
    media(type: $type, genre_in: $genreIn, seasonYear: $seasonYear, season: $season, format_in: $formatIn, status: $status, search: $search) {
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

export const GENRE_QUERY = gql`
  query GenreCollection {
    GenreCollection
  }
`;

export const EMPTY_QUERY = gql`
  query EmptyQuery {
  __typename
}
`;

