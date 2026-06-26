import { supabase } from "@/src/utils/supabase";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { DimensionValue, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 🌟 PLACEHOLDER DATA STRUCTURES
const MOCK_USER = {
  name: "OtakuExplorer",
  username: "@otaku_dev_99",
  joinDate: "Joined June 2026"
};

const MOCK_STATS = {
  anime: { total: 1, daysWatched: 0.2, episodes: 12, currentProgress: 12, maxTarget: 24 },
  manga: { total: 76, chapters: 7063, volumes: 277, currentProgress: 7063, maxTarget: 10000 }
};

const MOCK_GENRES = [
  { id: '1', name: 'Comedy', count: 69, color: '#22c55e' },
  { id: '2', name: 'Romance', count: 53, color: '#0ea5e9' },
  { id: '3', name: 'Slice of Life', count: 36, color: '#a855f7' },
  { id: '4', name: 'Fantasy', count: 10, color: '#f43f5e' },
];

const MOCK_ACTIVITY_GRID = Array.from({ length: 90 }, (_, index) => {
  const intensities = [0, 0, 0, 1, 0, 2, 0, 0, 3];
  return intensities[index % intensities.length];
});

export default function Profile() {
  const navigation = useNavigation();
  
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
  }

  const totalGenreEntries = MOCK_GENRES.reduce((sum, item) => sum + item.count, 0);

  return (
    <ScrollView style={Styles.screenContainer} contentContainerStyle={Styles.scrollContent}>
      
      {/* HEADER BAR */}
      <View style={Styles.headerRow}>
        <View style={Styles.titleContainer}>
          {/* ↩️ BACK BUTTON */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            activeOpacity={0.6}
            style={Styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={Styles.screenTitle}>Dashboard</Text>
        </View>
        
        <TouchableOpacity style={Styles.logoutButton} onPress={signOut} activeOpacity={0.7}>
          <Text style={Styles.logoutButtonText}>Logout</Text>
          <Ionicons name="log-out-outline" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* 👤 USER PROFILE CARD (Avatar, Name, Username) */}
      <View style={Styles.profileHeaderCard}>
        <View style={Styles.avatarPlaceholder}>
          <Ionicons name="person" size={40} color="#94a3b8" />
        </View>
        <View style={Styles.profileMetaInfo}>
          <Text style={Styles.profileDisplayName}>{MOCK_USER.name}</Text>
          <Text style={Styles.profileHandle}>{MOCK_USER.username}</Text>
          <Text style={Styles.profileJoinDate}>{MOCK_USER.joinDate}</Text>
        </View>
      </View>

      {/* SYMMETRICAL UNIFORM VERTICAL CONTAINER STACK */}
      <View style={Styles.dashboardLayoutGrid}>
        
        {/* ANIME METRICS CARD */}
        <View style={Styles.dashboardCard}>
          <Text style={Styles.cardSectionTitle}>Anime Statistics</Text>
          <View style={Styles.statsMetricsRow}>
            <View style={Styles.statCell}>
              <Text style={Styles.statMetricValue}>{MOCK_STATS.anime.total}</Text>
              <Text style={Styles.statMetricLabel}>Total Anime</Text>
            </View>
            <View style={Styles.statCell}>
              <Text style={Styles.statMetricValue}>{MOCK_STATS.anime.daysWatched}</Text>
              <Text style={Styles.statMetricLabel}>Days Watched</Text>
            </View>
            <View style={Styles.statCell}>
              <Text style={Styles.statMetricValue}>{MOCK_STATS.anime.episodes}</Text>
              <Text style={Styles.statMetricLabel}>Episodes</Text>
            </View>
          </View>
          
          <View style={Styles.progressTrackBarBackground}>
            <View 
              style={[
                Styles.progressTrackBarFill, 
                { width: `${(MOCK_STATS.anime.currentProgress / MOCK_STATS.anime.maxTarget) * 100}%` as DimensionValue }
              ]} 
            />
          </View>
        </View>

        {/* MANGA METRICS CARD */}
        <View style={Styles.dashboardCard}>
          <Text style={Styles.cardSectionTitle}>Manga Statistics</Text>
          <View style={Styles.statsMetricsRow}>
            <View style={Styles.statCell}>
              <Text style={Styles.statMetricValue}>{MOCK_STATS.manga.total}</Text>
              <Text style={Styles.statMetricLabel}>Total Manga</Text>
            </View>
            <View style={Styles.statCell}>
              <Text style={Styles.statMetricValue}>{MOCK_STATS.manga.chapters}</Text>
              <Text style={Styles.statMetricLabel}>Chapters Read</Text>
            </View>
            <View style={Styles.statCell}>
              <Text style={Styles.statMetricValue}>{MOCK_STATS.manga.volumes}</Text>
              <Text style={Styles.statMetricLabel}>Volumes Read</Text>
            </View>
          </View>

          <View style={Styles.progressTrackBarBackground}>
            <View 
              style={[
                Styles.progressTrackBarFill, 
                { width: `${(MOCK_STATS.manga.currentProgress / MOCK_STATS.manga.maxTarget) * 100}%` as DimensionValue }
              ]} 
            />
          </View>
        </View>

        {/* GENRE OVERVIEW CARD */}
        <View style={Styles.dashboardCard}>
          <Text style={Styles.cardSectionTitle}>Genre Overview</Text>
          
          <View style={Styles.genresChipsWrapper}>
            {MOCK_GENRES.map((genre) => (
              <View key={genre.id} style={Styles.genreMetaRowItem}>
                <View style={[Styles.genreBadge, { backgroundColor: genre.color }]}>
                  <Text style={Styles.genreBadgeText}>{genre.name}</Text>
                </View>
                <Text style={Styles.genreCountText}>{genre.count} Entries</Text>
              </View>
            ))}
          </View>

          <View style={Styles.distributionBarContainer}>
            {MOCK_GENRES.map((genre) => {
              const widthPercent = `${(genre.count / totalGenreEntries) * 100}%` as DimensionValue;
              return (
                <View 
                  key={genre.id} 
                  style={{ backgroundColor: genre.color, width: widthPercent, height: '100%' }} 
                />
              );
            })}
          </View>
        </View>

        {/* ACTIVITY HISTORY CARD */}
        <View style={Styles.dashboardCard}>
          <Text style={Styles.cardSectionTitle}>Activity History</Text>
          <View style={Styles.activityGrid}>
            {MOCK_ACTIVITY_GRID.map((intensity, i) => (
              <View 
                key={i} 
                style={[
                  Styles.gridSquare,
                  intensity === 1 && Styles.intensityLow,
                  intensity === 2 && Styles.intensityMed,
                  intensity === 3 && Styles.intensityHigh,
                ]} 
              />
            ))}
          </View>
        </View>

        {/* QUICK STATUS BOX */}
        <View style={Styles.dashboardCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={Styles.cardSectionTitle}>Social Activity</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '500' }}>Filter</Text>
              <Ionicons name="chevron-down" size={12} color="#64748b" />
            </TouchableOpacity>
          </View>
          <View style={Styles.statusBoxPlaceholder}>
            <Text style={Styles.statusInputTextPlaceholder}>Write a status...</Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const Styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f2',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  
  // 👤 User Header Card Styles
  profileHeaderCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 16,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  profileMetaInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileDisplayName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  profileHandle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 6,
  },
  profileJoinDate: {
    fontSize: 12,
    color: '#94a3b8',
  },

  dashboardLayoutGrid: {
    flexDirection: 'column',
    gap: 20,
  },
  dashboardCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'space-between',
  },
  gridSquare: {
    width: 11,
    height: 11,
    borderRadius: 2,
    backgroundColor: '#edf2f7',
  },
  intensityLow: { backgroundColor: '#86efac' },
  intensityMed: { backgroundColor: '#22c55e' },
  intensityHigh: { backgroundColor: '#15803d' },
  genresChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  genreMetaRowItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  genreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  genreBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  genreCountText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
  },
  distributionBarContainer: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
  },
  statsMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCell: {
    alignItems: 'flex-start',
    flex: 1,
  },
  statMetricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  statMetricLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  progressTrackBarBackground: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressTrackBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  statusBoxPlaceholder: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 14,
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusInputTextPlaceholder: {
    color: '#94a3b8',
    fontSize: 14,
  },
});