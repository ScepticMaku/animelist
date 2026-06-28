import { supabase } from "@/src/utils/supabase";
import { useState, useRef } from "react";
import { usePathname } from "expo-router";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import * as Linking from 'expo-linking';
import { View, ActivityIndicator } from "react-native";
import { NavBar } from "@/src/components/navbar";
import { navItems } from "@/src/config/navConfig";
import { showToast } from "@/src/components/showToast";
import { createSessionFromUrl } from "@/src/components/createSessionFromUrl";

export default function RootLayout() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasRedirected = useRef(false); // ✅ Prevents double redirects

  // 🔗 Handle deep links
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) createSessionFromUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      createSessionFromUrl(url);
    });

    return () => subscription.remove();
  }, []);

  // 🔐 Auth check with proper exception handling
  useEffect(() => {
    let isMounted = true; // ✅ Prevent memory leaks

    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) return; // Component unmounted

        if (error) {
          console.error("Error getting session:", error.message);
          setIsLoading(false);
          return;
        }

        const sessionExists = data.session !== null;
        setIsAuthenticated(sessionExists);

        // ✅ Get current route safely
        const currentRoute = pathname || '';

        // ✅ Comprehensive list of exempt routes
        const exemptRoutes = [
          'password-reset',
          'reset-password',
          '/reset',
          'forgot-password',
          'email-confirm',
          'signup',
          'login',
          '/auth/',
          '/forgot',
          '/confirm'
        ];

        // ✅ Check if current route should bypass auth
        const isExemptRoute = exemptRoutes.some(route =>
          currentRoute.toLowerCase().includes(route.toLowerCase())
        );

        // ✅ Also check for reset tokens in URL (for deep links)
        const urlParams = typeof window !== 'undefined'
          ? window.location?.search || ''
          : '';
        const hasResetToken = urlParams.includes('code=') ||
          urlParams.includes('token=');

        console.log('=== AUTH CHECK ===');
        console.log('Route:', currentRoute);
        console.log('Is Exempt:', isExemptRoute);
        console.log('Has Reset Token:', hasResetToken);
        console.log('Has Session:', sessionExists);
        console.log('Already Redirected:', hasRedirected.current);

        // ✅ Only redirect if:
        // 1. User HAS a session AND
        // 2. Route is NOT exempt AND  
        // 3. No reset token present AND
        // 4. Haven't already redirected
        const shouldRedirect =
          sessionExists &&
          !isExemptRoute &&
          !hasResetToken &&
          !hasRedirected.current &&
          !currentRoute.includes('/main'); // Don't redirect if already on main page

        if (shouldRedirect && isMounted) {
          console.log('⏭️ REDIRECTING to Library...');
          hasRedirected.current = true; // Mark as redirected

          router.replace({
            pathname: '/(main)/library',
            params: { flashMessage: 'Welcome back!' }
          });
        } else if (isExemptRoute || hasResetToken) {
          console.log('✅ SKIPPING redirect (exempt route or reset token)');
        }

      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // ✅ Small delay to ensure router is ready, but use pathname as dependency
    const timer = setTimeout(checkAuth, 100); // Reduced to 100ms

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [pathname]); // Re-check when route changes

  // ✅ Show loading spinner while checking auth (prevents flash)
  if (isLoading && !isAuthenticated) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <ActivityIndicator size="large" color="#3d85f1" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <Stack screenOptions={{ headerShown: false }} />

      {/* ✅ Show appropriate nav based on auth status */}
      <NavBar items={isAuthenticated ? navItems.mainNavItems : navItems.guestNavItems} />
    </View>
  );
}
