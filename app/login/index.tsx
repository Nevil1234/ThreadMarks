import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, StatusBar, Alert } from 'react-native';
import { TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper';
import { Link, router } from 'expo-router';
import Colors from '@/constants/Colors';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/config/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import { UserDetailContext } from '@/context/UserDetailContext';
import { Feather } from '@expo/vector-icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (resp) => {
        const user = resp.user;
        await getUserDetail();
        setLoading(false);
        router.replace('/(tabs)/home');
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
        if (Platform.OS !== 'web') {
          Alert.alert('Error', 'Incorrect email and password');
        }
      });
  };

  const getUserDetail = async () => {
    const result = await getDoc(doc(db, 'users', email));
    setUserDetail(result.data());
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

          <View style={styles.brandHeader}>
            <View style={styles.scanFrame}>
              <View style={styles.frameTL} />
              <View style={styles.frameTR} />
              <View style={styles.frameBL} />
              <View style={styles.frameBR} />
              <View style={styles.badge}>
                <Feather name="shield" size={26} color={Colors.EMERALD} />
              </View>
            </View>
            <Text style={styles.brandTitle}>ThreadMark</Text>
            <Text style={styles.brandSub}>Welcome back</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Sign in to continue verifying</Text>

            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              mode="outlined"
              outlineColor={Colors.BORDER}
              activeOutlineColor={Colors.EMERALD}
              theme={{ colors: { primary: Colors.EMERALD } }}
              left={<TextInput.Icon icon="email-outline" />}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              mode="outlined"
              outlineColor={Colors.BORDER}
              activeOutlineColor={Colors.EMERALD}
              theme={{ colors: { primary: Colors.EMERALD } }}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <HelperText type="error" visible={!!error} style={styles.errorText}>
              {error}
            </HelperText>

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={Colors.EMERALD} />
              </View>
            ) : (
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                contentStyle={{ paddingVertical: 6 }}
                buttonColor={Colors.EMERALD}
              >
                Login
              </Button>
            )}

            <Pressable style={styles.forgotWrap} onPress={() => {}}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <Link href="/signup" asChild>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryText}>
                  Don't have an account? <Text style={styles.secondaryHighlight}>Sign Up</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG,
  },
  brandHeader: {
    paddingTop: 80,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  scanFrame: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  frameTL: {
    position: 'absolute', top: 0, left: 0, width: 26, height: 26,
    borderTopWidth: 3, borderLeftWidth: 3, borderColor: Colors.EMERALD, borderTopLeftRadius: 12,
  },
  frameTR: {
    position: 'absolute', top: 0, right: 0, width: 26, height: 26,
    borderTopWidth: 3, borderRightWidth: 3, borderColor: Colors.EMERALD, borderTopRightRadius: 12,
  },
  frameBL: {
    position: 'absolute', bottom: 0, left: 0, width: 26, height: 26,
    borderBottomWidth: 3, borderLeftWidth: 3, borderColor: Colors.EMERALD, borderBottomLeftRadius: 12,
  },
  frameBR: {
    position: 'absolute', bottom: 0, right: 0, width: 26, height: 26,
    borderBottomWidth: 3, borderRightWidth: 3, borderColor: Colors.EMERALD, borderBottomRightRadius: 12,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.EMERALD_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: Colors.TEXT,
    fontSize: 28,
    fontFamily: 'outfit-bold',
    letterSpacing: 1,
  },
  brandSub: {
    color: Colors.TEXT_DIM,
    fontSize: 13,
    fontFamily: 'outfit-medium',
    marginTop: 4,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    marginTop: 12,
    marginHorizontal: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    marginBottom: 24,
  },
  input: {
    marginBottom: 14,
    backgroundColor: Colors.BG_CARD,
  },
  errorText: {
    marginTop: -4,
    marginBottom: 4,
    fontFamily: 'outfit-regular',
  },
  button: {
    marginTop: 8,
    borderRadius: 14,
  },
  buttonLabel: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
  },
  loadingWrap: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  forgotWrap: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotText: {
    color: Colors.EMERALD,
    fontFamily: 'outfit-medium',
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.BORDER,
  },
  dividerText: {
    color: Colors.TEXT_MUTED,
    fontFamily: 'outfit-medium',
    fontSize: 13,
    marginHorizontal: 12,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 10,
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
