import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image, ImageSourcePropType, Button } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { RelativePathString, router } from 'expo-router';
import { supabase } from '../utils/supabase';

interface NavItem {
  label?: string;
  screenName: string;
  icon?: ImageSourcePropType;
  isButton?: boolean;
}

interface NavBarProps {
  items: NavItem[];
}

export const NavBar: React.FC<NavBarProps> = ({ items }) => {
  const route = useRoute();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const getCurrentSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("error getting user session: ", error.message);
        return;
      }

      if (data.session !== null) {
        setIsLoggedIn(true);
      }
    }

    getCurrentSession();
  }, []);

  return (
    <View style={Styles.container}>
      {items.map((item) => {
        const isActive = route.name === item.screenName;

        return (
          <TouchableOpacity
            key={item.screenName}
            style={Styles.navButton}
            onPress={() => router.navigate(item.screenName as RelativePathString)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            {item.icon && (
              <Image style={Styles.navLogo} source={item.icon} />
            )}

            {item.label && (
              <Text style={[Styles.label, isActive && Styles.activeLabel]}>
                {item.label}
              </Text>
            )}

            {item.isButton && (
              <Button
                title='Login'
                onPress={() => router.navigate('/(auth)/login')}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}


const Styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingBottom: 25,
    paddingTop: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500'
  },
  activeLabel: {
    color: '#007AFF',
    fontWeight: '600'
  },
  activeIndicator: {
    marginTop: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#007AFF'
  },
  navLogo: {
    height: 50,
    width: 50
  }
});
