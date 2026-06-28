import { supabase } from "@/src/utils/supabase";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { router } from "expo-router";
import { useEffect, useState } from 'react';
import { ActivityIndicator, DimensionValue, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showToast } from "@/src/components/showToast";

// 🌟 REAL DATA INTERFACES
interface UserActivity {
  id: number;
  user_id: string;
  anime_id: number;
  description: string;
  created_at: string;
}

interface UserProfile {
  name: string;
  username: string;
  joinDate: string;
}

export default function Profile() {
  const navigation = useNavigation();

  // State for real data
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [isSigningOut, setIsSigningOut] = useState(false);

  // ✨ NEW: Username editing states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // Fetch user activities and profile on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    setIsLoading(true);

    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.error('Authentication failed:', error?.message);
        return;
      }

      // Set profile directly from user object
      setUserProfile({
        name: user.user_metadata?.username || 'Anime Fan',
        username: user.email || 'unknown@email.com',
        joinDate: `Joined ${new Date(user.created_at).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })}`
      });

      // Initialize newUsername with current value
      setNewUsername(user.user_metadata?.username || '');

      // Fetch activities in parallel with Promise.all for speed!
      const [activitiesResult] = await Promise.all([
        supabase
          .from('user_anime_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      if (activitiesResult.error) {
        console.error('Error:', activitiesResult.error.message);
      } else {
        setActivities(activitiesResult.data || []);
      }

    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // ✨ NEW: Update username function
  async function handleUpdateUsername() {
    // Validation
    if (!newUsername.trim()) {
      showToast('Username cannot be empty');
      return;
    }

    if (newUsername.length < 3) {
      showToast('Username must be at least 3 characters');
      return;
    }

    if (newUsername.length > 20) {
      showToast('Username must not exceed 20 characters');
      return;
    }

    // Check for alphanumeric only (optional - remove if you want special chars)
    const alphanumericRegex = /^[a-zA-Z0-9_]+$/;
    if (!alphanumericRegex.test(newUsername)) {
      showToast('Username can only contain letters, numbers, and underscores');
      return;
    }

    setIsUpdatingUsername(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          username: newUsername.trim()
        }
      });

      if (error) {
        console.error('Error updating username:', error.message);
        showToast(error.message || 'Failed to update username');
        return;
      }

      // ✅ Success! Update local state
      setUserProfile(prev => prev ? {
        ...prev,
        name: newUsername.trim()
      } : null);

      showToast('Username updated successfully! ✨');
      setIsEditingUsername(false);

    } catch (err) {
      console.error('Unexpected error:', err);
      showToast('Something went wrong');
    } finally {
      setIsUpdatingUsername(false);
    }
  }

  // Cancel editing
  function cancelEditUsername() {
    setNewUsername(userProfile?.name || '');
    setIsEditingUsername(false);
  }

  async function signOut() {
    setIsSigningOut(true); // ✨ Show loading

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error.message);
        showToast(error.message || 'Failed to sign out');
        setIsSigningOut(false); // Hide loading on error
        return;
      }

      // Success - navigate away (loading will stop when component unmounts)
      router.replace('/');
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      showToast('Something went wrong');
      setIsSigningOut(false);
    }
  }

  // 🌟 ANALYTICS CALCULATIONS BASED ON ACTIVITIES
  const totalActivities = activities.length;

  // Count different action types
  const addedToListCount = activities.filter(a =>
    a.description.includes('Added') && !a.description.includes('note')
  ).length;

  const updatedProgressCount = activities.filter(a =>
    a.description.includes('Updated') || a.description.includes('Progress updated')
  ).length;

  const favoritedCount = activities.filter(a =>
    a.description.includes('Favorited')
  ).length;

  const completedCount = activities.filter(a =>
    a.description.toLowerCase().includes('completed')
  ).length;

  // Get unique anime count from activities
  const uniqueAnimeIds = [...new Set(activities.map(a => a.anime_id))];
  const uniqueAnimeCount = uniqueAnimeIds.length;

  // Calculate activity frequency (last 7 days vs before)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentActivityCount = activities.filter(a =>
    new Date(a.created_at) >= sevenDaysAgo
  ).length;

  // Format date helper
  function formatActivityDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffTime / (1000 * 60));
        return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  // Get icon for activity type
  function getActivityIcon(description: string): { name: keyof typeof Ionicons.glyphMap; color: string } {
    if (description.includes('Added')) return { name: 'add-circle', color: '#22c55e' };
    if (description.includes('Updated')) return { name: 'refresh', color: '#3b82f6' };
    if (description.includes('Favorited')) return { name: 'heart', color: '#ef4444' };
    if (description.includes('Removed') || description.includes('Unfavorited')) return { name: 'trash-outline', color: '#94a3b8' };
    if (description.toLowerCase().includes('completed')) return { name: 'checkmark-circle', color: '#a855f7' };
    if (description.includes('note')) return { name: 'create-outline', color: '#f59e0b' };

    // Default fallback - MUST be a valid Ionicons name!
    return { name: 'pulse-outline', color: '#64748b' };
  }

  if (isLoading) {
    return (
      <View style={Styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3d85f1" />
        <Text style={Styles.loadingText}>Loading your activity...</Text>
      </View>
    );
  }

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

        <TouchableOpacity
          style={[
            Styles.logoutButton,
            isSigningOut && Styles.logoutButtonDisabled
          ]}
          onPress={signOut}
          disabled={isSigningOut}
          activeOpacity={isSigningOut ? 1 : 0.7}
        >
          {isSigningOut ? (
            <>
              <ActivityIndicator size="small" color="#ef4444" />
              <Text style={[Styles.logoutButtonText, { marginLeft: 6 }]}>Signing out...</Text>
            </>
          ) : (
            <>
              <Text style={Styles.logoutButtonText}>Logout</Text>
              <Ionicons name="log-out-outline" size={16} color="#ef4444" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* 👤 USER PROFILE CARD WITH USERNAME EDITING */}
      <View style={Styles.profileHeaderCard}>
        <View style={Styles.avatarPlaceholder}>
          <Ionicons name="person" size={40} color="#94a3b8" />
        </View>

        <View style={Styles.profileMetaInfo}>
          {/* ✨ Username Display or Edit Mode */}
          {isEditingUsername ? (
            <View style={Styles.editContainer}>
              <TextInput
                style={Styles.usernameInput}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Enter new username"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
                editable={!isUpdatingUsername}
              />

              <View style={Styles.editActionsRow}>
                <TouchableOpacity
                  style={[Styles.actionButton, Styles.saveButton]}
                  onPress={handleUpdateUsername}
                  disabled={isUpdatingUsername}
                  activeOpacity={0.7}
                >
                  {isUpdatingUsername ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                      <Text style={Styles.actionButtonText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[Styles.actionButton, Styles.cancelButton]}
                  onPress={cancelEditUsername}
                  disabled={isUpdatingUsername}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={16} color="#64748b" />
                  <Text style={[Styles.actionButtonText, Styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={Styles.displayNameRow}>
              <Text style={Styles.profileDisplayName}>{userProfile?.name || 'Anime Fan'}</Text>
              <TouchableOpacity
                style={Styles.editIconButton}
                onPress={() => setIsEditingUsername(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>
          )}

          <Text style={Styles.profileHandle}>{userProfile?.username || '@user'}</Text>
          <Text style={Styles.profileJoinDate}>{userProfile?.joinDate || 'Recently joined'}</Text>
        </View>
      </View>

      {/* 📊 ACTIVITY ANALYTICS CARD */}
      <View style={Styles.dashboardCard}>
        <Text style={Styles.cardSectionTitle}>Activity Analytics</Text>

        {/* Main Stats Row */}
        <View style={Styles.statsMetricsRow}>
          <View style={Styles.statCell}>
            <Text style={Styles.statMetricValue}>{totalActivities}</Text>
            <Text style={Styles.statMetricLabel}>Total Actions</Text>
          </View>
          <View style={Styles.statCell}>
            <Text style={Styles.statMetricValue}>{uniqueAnimeCount}</Text>
            <Text style={Styles.statMetricLabel}>Anime Tracked</Text>
          </View>
          <View style={Styles.statCell}>
            <Text style={Styles.statMetricValue}>{recentActivityCount}</Text>
            <Text style={Styles.statMetricLabel}>This Week</Text>
          </View>
        </View>

        {/* Action Breakdown */}
        <View style={Styles.actionBreakdownContainer}>
          <Text style={Styles.breakdownTitle}>Action Breakdown</Text>

          <View style={Styles.actionRowItem}>
            <View style={[Styles.actionDot, { backgroundColor: '#22c55e' }]} />
            <Text style={Styles.actionLabel}>Added to List</Text>
            <Text style={Styles.actionCount}>{addedToListCount}</Text>
          </View>

          <View style={Styles.actionRowItem}>
            <View style={[Styles.actionDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={Styles.actionLabel}>Progress Updated</Text>
            <Text style={Styles.actionCount}>{updatedProgressCount}</Text>
          </View>

          <View style={Styles.actionRowItem}>
            <View style={[Styles.actionDot, { backgroundColor: '#ef4444' }]} />
            <Text style={Styles.actionLabel}>Favorited</Text>
            <Text style={Styles.actionCount}>{favoritedCount}</Text>
          </View>

          <View style={Styles.actionRowItem}>
            <View style={[Styles.actionDot, { backgroundColor: '#a855f7' }]} />
            <Text style={Styles.actionLabel}>Completed</Text>
            <Text style={Styles.actionCount}>{completedCount}</Text>
          </View>
        </View>

        {/* Activity Level Indicator */}
        <View style={Styles.activityLevelContainer}>
          <Text style={Styles.levelLabel}>Activity Level</Text>
          <View style={Styles.levelBarBackground}>
            <View
              style={[
                Styles.levelBarFill,
                {
                  width: `${Math.min((recentActivityCount / 10) * 100, 100)}%` as DimensionValue,
                  backgroundColor: recentActivityCount >= 10 ? '#22c55e' :
                    recentActivityCount >= 5 ? '#3b82f6' : '#f59e0b'
                }
              ]}
            />
          </View>
          <Text style={Styles.levelText}>
            {recentActivityCount >= 10 ? '🔥 Very Active' :
              recentActivityCount >= 5 ? '💪 Active' :
                recentActivityCount > 0 ? '📊 Moderate' : '😴 Quiet'}
          </Text>
        </View>
      </View>

      {/* 📝 RECENT ACTIVITY LIST */}
      <View style={Styles.dashboardCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={Styles.cardSectionTitle}>Recent Activity</Text>
          <Text style={Styles.activityCountBadge}>{activities.length} actions</Text>
        </View>

        {activities.length === 0 ? (
          <View style={Styles.emptyStateContainer}>
            <Ionicons name="time-outline" size={48} color="#cbd5e1" />
            <Text style={Styles.emptyStateTitle}>No activity yet</Text>
            <Text style={Styles.emptyStateSubtitle}>
              Start tracking anime to see your activity here!
            </Text>
          </View>
        ) : (
          <View style={Styles.activityListContainer}>
            {activities.slice(0, 15).map((activity) => {
              const icon = getActivityIcon(activity.description);
              return (
                <View key={activity.id} style={Styles.activityListItem}>
                  <View style={[Styles.activityIconContainer, { backgroundColor: `${icon.color}15` }]}>
                    <Ionicons name={icon.name} size={18} color={icon.color} />
                  </View>

                  <View style={Styles.activityContent}>
                    <Text style={Styles.activityDescription} numberOfLines={2}>
                      {activity.description}
                    </Text>
                    <Text style={Styles.activityTimestamp}>
                      {formatActivityDate(activity.created_at)}
                    </Text>
                  </View>
                </View>
              );
            })}

            {activities.length > 15 && (
              <TouchableOpacity style={Styles.loadMoreButton}>
                <Text style={Styles.loadMoreText}>View all {activities.length} activities</Text>
                <Ionicons name="chevron-forward" size={16} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        )}
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

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
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
  // ✨ NEW: Disabled state style
  logoutButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#fef2f2',
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

  // ✨ NEW: Username Edit Styles
  displayNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  editIconButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  editContainer: {
    gap: 10,
    marginBottom: 4,
  },
  usernameInput: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    borderBottomWidth: 2,
    borderBottomColor: '#3d85f1',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: '#3d85f1',
    borderColor: '#2563eb',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  cancelButtonText: {
    color: '#64748b',
  },

  profileDisplayName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
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
    marginBottom: 20,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },

  // Stats Metrics
  statsMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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

  // Action Breakdown
  actionBreakdownContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  actionRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  actionLabel: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  actionCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },

  // Activity Level
  activityLevelContainer: {
    marginTop: 4,
  },
  levelLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  levelBarBackground: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  levelBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },

  // Activity List
  activityCountBadge: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityListContainer: {
    gap: 12,
  },
  activityListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 4,
  },
  activityTimestamp: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 12,
    marginTop: 4,
  },
  loadMoreText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },

  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
