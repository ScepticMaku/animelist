import { supabase } from "@/src/utils/supabase";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const appLogo = require('@/assets/images/gojolist_logo.webp');

export default function Index() {

  useEffect(() => {
    const getCurrentSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("error getting user session: ", error.message);
        return;
      }

      if (data.session !== null) {
        router.push({
          pathname: '/(main)/library',
        });
      }
    }

    getCurrentSession();
  }, []);


  return (
    <SafeAreaView style={Styles.container}>
      <ScrollView
        style={Styles.scrollView}
        contentContainerStyle={Styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* Hero Section */}
        <View style={Styles.heroSection}>
          {/* Logo Container */}
          <View style={Styles.logoContainer}>
            <Image style={Styles.logo} source={appLogo} resizeMode="contain" />
          </View>

          {/* Branding */}
          <Text style={Styles.appName}>GojoList</Text>
          <Text style={Styles.tagline}>Your ultimate anime tracking companion</Text>

          {/* Feature Highlights */}
          <View style={Styles.featuresRow}>
            <View style={Styles.featureBadge}>
              <Ionicons name="bookmark-outline" size={18} color="#3d85f1" />
              <Text style={Styles.featureText}>Track</Text>
            </View>
            <View style={Styles.featureBadge}>
              <Ionicons name="heart-outline" size={18} color="#3d85f1" />
              <Text style={Styles.featureText}>Favorite</Text>
            </View>
            <View style={Styles.featureBadge}>
              <Ionicons name="list-outline" size={18} color="#3d85f1" />
              <Text style={Styles.featureText}>Organize</Text>
            </View>
          </View>
        </View>

        {/* Action Cards */}
        <View style={Styles.actionsContainer}>
          {/* Browse Button */}
          <TouchableOpacity
            style={Styles.primaryButton}
            onPress={() => router.navigate("/browse")}
            activeOpacity={0.8}
          >
            <View style={Styles.buttonContent}>
              <Ionicons name="search" size={22} color="#ffffff" />
              <Text style={Styles.primaryButtonText}>Browse Anime</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* Join Now Button */}
          <TouchableOpacity
            style={Styles.secondaryButton}
            onPress={() => router.navigate("/(auth)/signup")}
            activeOpacity={0.8}
          >
            <View style={Styles.buttonContent}>
              <Ionicons name="person-add-outline" size={22} color="#3d85f1" />
              <Text style={Styles.secondaryButtonText}>Join Now</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#3d85f1" />
          </TouchableOpacity>

          {/* Sign In Link */}
          <TouchableOpacity
            onPress={() => router.navigate("/(auth)/login")}
            activeOpacity={0.7}
          >
            <Text style={Styles.signInText}>
              Already have an account? <Text style={Styles.signInLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards Section */}
        <View style={Styles.infoSection}>
          <View style={Styles.infoCard}>
            <View style={Styles.infoIconContainer}>
              <Ionicons name="library-outline" size={24} color="#3d85f1" />
            </View>
            <View style={Styles.infoContent}>
              <Text style={Styles.infoTitle}>Personal Library</Text>
              <Text style={Styles.infoDescription}>Keep track of all your anime in one place</Text>
            </View>
          </View>

          <View style={Styles.infoCard}>
            <View style={Styles.infoIconContainer}>
              <Ionicons name="star-outline" size={24} color="#f59e0b" />
            </View>
            <View style={Styles.infoContent}>
              <Text style={Styles.infoTitle}>Smart Recommendations</Text>
              <Text style={Styles.infoDescription}>Discover new anime based on your taste</Text>
            </View>
          </View>

          <View style={Styles.infoCard}>
            <View style={Styles.infoIconContainer}>
              <Ionicons name="cloud-upload-outline" size={24} color="#10b981" />
            </View>
            <View style={Styles.infoContent}>
              <Text style={Styles.infoTitle}>Sync Everywhere</Text>
              <Text style={Styles.infoDescription}>Access your data on any device</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={Styles.footer}>
          <Text style={Styles.footerText}>Made with ❤️ for anime fans</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },

  // Feature Badges
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3d85f1',
  },

  // Actions Container
  actionsContainer: {
    gap: 14,
    marginBottom: 32,
  },

  // Primary Button (Browse)
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3d85f1',
    borderRadius: 16,
    padding: 18,
    paddingHorizontal: 20,
    shadowColor: '#3d85f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Secondary Button (Join)
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#3d85f1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#3d85f1',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Sign In Link
  signInText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  signInLink: {
    color: '#3d85f1',
    fontWeight: '700',
  },

  // Info Section
  infoSection: {
    gap: 12,
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
