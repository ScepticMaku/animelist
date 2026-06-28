import { useRoute } from '@react-navigation/native';
import { RelativePathString, router, usePathname } from 'expo-router';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface NavItem {
  label?: string;
  screenName: string;
  icon?: ImageSourcePropType;
  ioniconName?: string;
  isButton?: boolean;
  profileImage?: ImageSourcePropType;
}

interface NavBarProps {
  items: NavItem[];
}

const isRouteActive = (screenName: string, currentRoute: string): boolean => {
  if (screenName === '/') {
    return currentRoute === '/' || currentRoute === 'index';
  }

  const normalizedScreen = screenName
    .replace(/^\//, '')
    .replace(/\([^)]*\)\//g, '')
    .replace(/\/$/, '');

  if (!normalizedScreen) return false;

  return currentRoute.toLowerCase().includes(normalizedScreen.toLowerCase());
};

export const NavBar: React.FC<NavBarProps> = ({ items }) => {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.navContent}>
        {items.map((item) => {
          const isActive = isRouteActive(item.screenName, pathname);

          console.log('isActive: ', isActive);


          return (
            <TouchableOpacity
              key={item.screenName}
              style={[
                styles.navButton,
                isActive && styles.activeNavButton
              ]}
              onPress={() => router.navigate(item.screenName as RelativePathString)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <View style={[
                styles.iconContainer,
                isActive && styles.activeIconContainer
              ]}>
                {item.profileImage ? (
                  <Image
                    style={[
                      styles.profileImage,
                      isActive && { borderColor: '#3d85f1' }  // ✅ Dynamic border here
                    ]}
                    source={item.profileImage}
                  />
                ) : item.icon ? (
                  <Image
                    style={[styles.logoIcon, isActive && styles.activeLogoIcon]}
                    source={item.icon}
                    resizeMode="contain"
                  />
                ) : item.ioniconName ? (
                  <Ionicons
                    name={item.ioniconName as any}
                    size={24}
                    color={isActive ? '#3d85f1' : '#64748b'}
                  />
                ) : item.isButton ? (
                  <Ionicons
                    name="log-in-outline"
                    size={24}
                    color={isActive ? '#3d85f1' : '#64748b'}
                  />
                ) : null}
              </View>

              {item.label && (
                <Text style={[styles.label, isActive && styles.activeLabel]}>
                  {item.label}
                </Text>
              )}

              {isActive && !item.isButton && !item.profileImage && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.safeAreaSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1000,
    paddingBottom: 8,
  },

  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 8,
  },

  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
    gap: 5,
    position: 'relative',
  },

  activeNavButton: {},

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },

  activeIconContainer: {
    backgroundColor: '#eff6ff',
    shadowColor: '#3d85f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  logoIcon: {
    width: 32,
    height: 32,
    opacity: 0.7,
  },

  activeLogoIcon: {
    opacity: 1,
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#e2e8f0',  // ✅ Default (inactive) color only
  },

  label: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  activeLabel: {
    color: '#3d85f1',
    fontWeight: '700',
  },

  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3d85f1',
  },

  safeAreaSpacer: {
    height: 10,
  },
});
