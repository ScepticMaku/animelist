import { ImageSourcePropType } from 'react-native';

interface NavItem {
  label?: string;
  screenName: string;
  icon?: ImageSourcePropType;        // For logo images only
  ioniconName?: string;              // NEW: For Ionicons!
  isButton?: boolean;
  profileImage?: ImageSourcePropType;
}

export const navItems = {
  guestNavItems: [
    {
      screenName: '/',
      icon: require('../../assets/images/gojolist_logo.webp'),
      label: 'Home'
    },
    {
      label: 'Browse',
      screenName: '/browse',
      ioniconName: 'search-outline'           // 🔍 Search icon
    },
    {
      label: 'Sign In',
      screenName: '/(auth)/login',
      isButton: true,
      ioniconName: 'log-in-outline'            // 👤 Login icon
    }
  ],
  mainNavItems: [
    {
      label: 'Library',
      screenName: '/(main)/library',
      ioniconName: 'library-outline',
    },
    {
      label: 'Browse',
      screenName: '/browse',
      ioniconName: 'compass-outline'           // 🧭 Compass/Explore icon
    },
    {
      label: 'Profile',
      screenName: '/(user)/profile',
      ioniconName: 'person-circle-outline'     // 👤 Profile fallback icon
    }
  ]
};
