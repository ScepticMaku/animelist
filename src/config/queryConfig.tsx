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

export const GET_ALL_TRENDING_ANIME = gql`
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
  query SearchOrFilterAnime($type: MediaType, $genreIn: [String], $seasonYear: Int, $formatIn: [MediaFormat], $season: MediaSeason, $status: MediaStatus, $search: String, $sort: [MediaSort]) {
  Page{
    media(type: $type, genre_in: $genreIn, seasonYear: $seasonYear, season: $season, format_in: $formatIn, status: $status, search: $search, sort: $sort) {
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

export const GET_ANIME_INFO = gql`
query ShowAnimeInfo($mediaId: Int, $isMain: Boolean) {
  Media(id: $mediaId) {
    coverImage {
      large
    }
    description
    episodes
    averageScore
    duration
    format
    genres
    season
    relations {
      nodes {
        id
        coverImage {
          large
        }
        title {
          romaji
        }
        format
        status
      }
    }
    title {
      romaji
    }
    status
    studios(isMain: $isMain) {
      nodes {
        name
      }
    }
  }
}
`
