import { Link, useRouter } from "expo-router";
import { Text, View, StatusBar, Dimensions, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from "@/constants/Colors";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/config/firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useContext, useEffect } from "react";
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  useEffect(() => {
    const redirect = () => router.replace('/(tabs)/home');
    if (__DEV__) {
      const t = setTimeout(redirect, 0);
      return () => clearTimeout(t);
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const result = await getDoc(doc(db, 'users', user.email));
        setUserDetail(result.data());
        redirect();
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar translucent backgroundColor={Colors.BLUE} barStyle="light-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={styles.container}>
          <View style={styles.hero}>
            <View style={styles.badge}>
              <Feather name="shield" size={28} color={Colors.WHITE} />
            </View>
            <Text style={styles.brandTitle}>ThreadMark</Text>
            <Text style={styles.brandSub}>Verify. Own. Trust.</Text>

            <View style={styles.heroCard}>
              <Feather name="search" size={22} color={Colors.WHITE} style={styles.heroCardIcon} />
              <Text style={styles.heroHeadline}>
                Is your style safe from counterfeits and fraud?
              </Text>
              <Text style={styles.heroSub}>
                Check the genuinity of your apparel. Scan the QR code.
              </Text>
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.features}>
              <FeatureItem
                icon="shield"
                title="Anti-Counterfeit"
                desc="Blockchain-verified authenticity for every item."
              />
              <FeatureItem
                icon="camera"
                title="Instant Scan"
                desc="Scan the QR code to verify any product in seconds."
              />
              <FeatureItem
                icon="droplet"
                title="Sustainable"
                desc="Track condition, recycle, and donate with ease."
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && { transform: [{ scale: 0.97 }] }]}
            >
              <Link href="/signup" asChild>
                <Pressable style={styles.buttonInner}>
                  <Text style={styles.primaryText}>Let's Get Started</Text>
                  <Feather name="arrow-right" size={18} color={Colors.WHITE} style={{ marginLeft: 8 }} />
                </Pressable>
              </Link>
            </Pressable>

            <Link href="/login" asChild>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>
                  Already have an account? <Text style={styles.secondaryHighlight}>Login</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIconWrap}>
        <Feather name={icon} size={20} color={Colors.BLUE} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.BLUE,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  hero: {
    backgroundColor: Colors.BLUE,
    paddingTop: 60,
    paddingBottom: 56,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  brandTitle: {
    color: Colors.WHITE,
    fontSize: 30,
    fontFamily: 'outfit-bold',
  },
  brandSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontFamily: 'outfit-medium',
    marginTop: 4,
    letterSpacing: 1,
  },
  heroCard: {
    width: '100%',
    marginTop: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 18,
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroCardIcon: {
    marginBottom: 10,
  },
  heroHeadline: {
    color: Colors.WHITE,
    fontSize: 20,
    fontFamily: 'outfit-bold',
    textAlign: 'center',
    lineHeight: 26,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'outfit-regular',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },
  features: {
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.LIGHT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: 'outfit-bold',
    color: Colors.DARK,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: 'outfit-regular',
    color: Colors.MEDIUM_GRAY,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: Colors.BLUE,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  primaryText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: 'outfit-bold',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
  },
  secondaryText: {
    fontFamily: 'outfit-medium',
    fontSize: 15,
    color: Colors.MEDIUM_GRAY,
  },
  secondaryHighlight: {
    color: Colors.BLUE,
    fontFamily: 'outfit-bold',
  },
});
