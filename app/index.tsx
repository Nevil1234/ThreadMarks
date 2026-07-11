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
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={styles.container}>
          <View style={styles.hero}>
            <View style={styles.scanFrame}>
              <View style={styles.frameTL} />
              <View style={styles.frameTR} />
              <View style={styles.frameBL} />
              <View style={styles.frameBR} />
              <View style={styles.badge}>
                <Feather name="shield" size={30} color={Colors.EMERALD} />
              </View>
            </View>
            <Text style={styles.brandTitle}>ThreadMark</Text>
            <Text style={styles.brandSub}>VERIFY · OWN · TRUST</Text>

            <View style={styles.heroCard}>
              <Text style={styles.heroHeadline}>
                Is your style safe from counterfeits?
              </Text>
              <Text style={styles.heroSub}>
                Scan the QR code on any garment to confirm it's the real thing.
              </Text>
              <View style={styles.trustRow}>
                <View style={styles.trustBadge}>
                  <Feather name="shield" size={12} color={Colors.EMERALD} />
                  <Text style={styles.trustText}>Blockchain Verified</Text>
                </View>
                <View style={styles.trustBadge}>
                  <Feather name="lock" size={12} color={Colors.GOLD} />
                  <Text style={styles.trustText}>Encrypted</Text>
                </View>
              </View>
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

            <Link href="/signup" asChild>
              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && { transform: [{ scale: 0.97 }] }]}
              >
                <Text style={styles.primaryText}>Let's Get Started</Text>
                <Feather name="arrow-right" size={18} color={Colors.WHITE} style={{ marginLeft: 8 }} />
              </Pressable>
            </Link>

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
        <Feather name={icon} size={20} color={Colors.EMERALD} />
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
    backgroundColor: Colors.BG,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.BG,
  },
  hero: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  scanFrame: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  frameTL: {
    position: 'absolute', top: 0, left: 0, width: 28, height: 28,
    borderTopWidth: 3, borderLeftWidth: 3, borderColor: Colors.EMERALD, borderTopLeftRadius: 12,
  },
  frameTR: {
    position: 'absolute', top: 0, right: 0, width: 28, height: 28,
    borderTopWidth: 3, borderRightWidth: 3, borderColor: Colors.EMERALD, borderTopRightRadius: 12,
  },
  frameBL: {
    position: 'absolute', bottom: 0, left: 0, width: 28, height: 28,
    borderBottomWidth: 3, borderLeftWidth: 3, borderColor: Colors.EMERALD, borderBottomLeftRadius: 12,
  },
  frameBR: {
    position: 'absolute', bottom: 0, right: 0, width: 28, height: 28,
    borderBottomWidth: 3, borderRightWidth: 3, borderColor: Colors.EMERALD, borderBottomRightRadius: 12,
  },
  badge: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Colors.EMERALD_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: Colors.TEXT,
    fontSize: 30,
    fontFamily: 'outfit-bold',
    letterSpacing: 1,
  },
  brandSub: {
    color: Colors.TEXT_MUTED,
    fontSize: 12,
    fontFamily: 'outfit-bold',
    marginTop: 4,
    letterSpacing: 2.5,
  },
  heroCard: {
    width: '100%',
    marginTop: 28,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  heroHeadline: {
    color: Colors.TEXT,
    fontSize: 21,
    fontFamily: 'outfit-bold',
    textAlign: 'center',
    lineHeight: 28,
  },
  heroSub: {
    color: Colors.TEXT_DIM,
    fontSize: 14,
    fontFamily: 'outfit-regular',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  trustRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.BG_ELEVATED,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  trustText: {
    color: Colors.TEXT_DIM,
    fontSize: 10,
    fontFamily: 'outfit-medium',
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 26,
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
    backgroundColor: Colors.EMERALD_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: Colors.EMERALD,
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
    color: Colors.TEXT_DIM,
  },
  secondaryHighlight: {
    color: Colors.GOLD,
    fontFamily: 'outfit-bold',
  },
});
