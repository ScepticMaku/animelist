import { NavBar } from "@/src/components/navbar";
import { Link, router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ScrollView, SafeAreaView } from "react-native";
import { supabase } from "@/src/utils/supabase";
import { useEffect, useState } from "react";
import { showToast } from "@/src/components/showToast";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function EmailConfirm() {

  const { userEmail, flashMessage } = useLocalSearchParams<{ userEmail: string, flashMessage: string }>();
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (flashMessage) {
      showToast(flashMessage);
      router.setParams({ flashMessage: undefined });
    }
  }, [flashMessage]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push({
            pathname: '/(main)/library',
            params: { flashMessage: 'Successfully logged in!' }
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data.user !== null) {
        router.push({
          pathname: '/(main)/library',
          params: { flashMessage: 'Successfully logged in!' }
        });
      }
    };

    getCurrentUser();
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  async function resendLink() {
    setProcessing(true);

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: userEmail
    });

    setProcessing(false);

    if (error) {
      showToast(error.message);
      return;
    }

    showToast('Email confirmation link sent!');
    // Start 60 second countdown
    setCountdown(60);
  }

  // Steps data array
  const steps = [
    {
      number: '1',
      title: 'Open your email',
      description: 'Check your inbox for an email from GojoList'
    },
    {
      number: '2',
      title: 'Click the confirmation link',
      description: 'This will verify your email address'
    },
    {
      number: '3',
      title: 'Start using GojoList!',
      description: "You'll be redirected automatically once confirmed"
    }
  ];

  return (
    <SafeAreaView style={Styles.container}>
      <ScrollView
        style={Styles.scrollView}
        contentContainerStyle={Styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* Header Section */}
        <View style={Styles.headerSection}>
          <View style={Styles.iconContainer}>
            <Ionicons name="mail-unread-outline" size={42} color="#3d85f1" />
          </View>
          <Text style={Styles.title}>Check Your Email</Text>
          <Text style={Styles.subtitle}>
            We've sent a confirmation link to your email address. Please check your inbox and click the link to verify your account.
          </Text>
        </View>

        {/* Email Display Card */}
        <View style={Styles.emailCard}>
          <View style={Styles.emailIconContainer}>
            <Ionicons name="mail-outline" size={20} color="#64748b" />
          </View>
          <View style={Styles.emailContent}>
            <Text style={Styles.emailLabel}>Email Address</Text>
            <Text style={Styles.emailAddress}>{userEmail || 'your@email.com'}</Text>
          </View>
        </View>

        {/* Steps Card */}
        <View style={Styles.stepsCard}>
          <Text style={Styles.stepsTitle}>Next Steps</Text>

          {steps.map((step, index) => (
            <View
              key={step.number}
              style={[Styles.stepItem, index === steps.length - 1 && Styles.stepItemLast]}
            >
              <View style={Styles.stepNumberContainer}>
                <Text style={Styles.stepNumber}>{step.number}</Text>
              </View>
              <View style={Styles.stepContent}>
                <Text style={Styles.stepTitle}>{step.title}</Text>
                <Text style={Styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Resend Button Card */}
        <View style={Styles.actionCard}>
          <Text style={Styles.actionTitle}>Didn't receive the email?</Text>
          <Text style={Styles.actionDescription}>
            Check your spam folder or request a new confirmation link below.
          </Text>

          <TouchableOpacity
            style={[Styles.resendButton, processing && Styles.resendButtonDisabled]}
            onPress={() => resendLink()}
            disabled={processing || countdown > 0}
            activeOpacity={0.8}
          >
            {processing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={20} color="#ffffff" />
                <Text style={Styles.resendButtonText}>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Confirmation Link'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Tips Card */}
        <View style={Styles.tipsCard}>
          <View style={Styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={18} color="#f59e0b" />
            <Text style={Styles.tipsTitle}>Tips</Text>
          </View>
          <Text style={Styles.tipsText}>
            • The confirmation link expires after 24 hours{'\n'}
            • Make sure to check your spam/junk folder{'\n'}
            • Add noreply@gojolist.com to your contacts
          </Text>
        </View>

        {/* Footer */}
        <View style={Styles.footer}>
          <TouchableOpacity
            style={Styles.backToLoginContainer}
            onPress={() => { }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back-outline" size={18} color="#64748b" />
            <Link href={'/(auth)/login'} asChild>
              <Text style={Styles.backToLoginText}>Back to Sign In</Text>
            </Link>
          </TouchableOpacity>
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

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3d85f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },

  // Email Display Card
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  emailIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  emailContent: {
    flex: 1,
  },
  emailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  emailAddress: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },

  // Steps Card
  stepsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 18,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepItemLast: {
    marginBottom: 0,
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#3d85f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3d85f1',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
  },

  // Action Card (Resend)
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 18,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#3d85f1',
    borderRadius: 12,
    height: 52,
    shadowColor: '#3d85f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Tips Card
  tipsCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  tipsText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 20,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});
