export const navItems = {
  guestNavItems: [
    { label: 'Browse', screenName: '/', icon: require('../../assets/images/gojolist_logo.webp') },
    { label: 'Browse', screenName: '/browse' },
    { screenName: '/(auth)/login', isButton: true }
  ],
  mainNavItems: [
    { screenName: '/(main)/library', icon: require('../../assets/images/gojolist_logo.webp') },
    { label: 'Browse', screenName: '/browse' },
    { screenName: '/(user)/profile', profileImage: require('../../assets/images/profile_picture.webp') }
  ]
}
