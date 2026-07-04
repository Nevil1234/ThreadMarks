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
          <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

          <View style={styles.headerCurve}>
            <View style={styles.badge}>
              <Feather name="shield" size={26} color={Colors.WHITE} />
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
              outlineColor={Colors.LIGHT_GRAY}
              activeOutlineColor={Colors.BLUE}
              theme={{ colors: { primary: Colors.BLUE } }}
              left={<TextInput.Icon icon="email-outline" />}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              mode="outlined"
              outlineColor={Colors.LIGHT_GRAY}
              activeOutlineColor={Colors.BLUE}
              theme={{ colors: { primary: Colors.BLUE } }}
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
                <ActivityIndicator size="large" color={Colors.BLUE} />
              </View>
            ) : (
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                contentStyle={{ paddingVertical: 6 }}
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
    backgroundColor: Colors.WHITE,
  },
  headerCurve: {
    backgroundColor: Colors.BLUE,
    paddingTop: 70,
    paddingBottom: 50,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  brandTitle: {
    color: Colors.WHITE,
    fontSize: 28,
    fontFamily: 'outfit-bold',
  },
  brandSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'outfit-medium',
    marginTop: 4,
  },
  card: {
    marginTop: -28,
    marginHorizontal: 20,
    backgroundColor: Colors.WHITE,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: 'outfit-bold',
    color: Colors.DARK,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'outfit-regular',
    color: Colors.MEDIUM_GRAY,
    marginBottom: 24,
  },
  input: {
    marginBottom: 14,
    backgroundColor: Colors.WHITE,
  },
  errorText: {
    marginTop: -4,
    marginBottom: 4,
    fontFamily: 'outfit-regular',
  },
  button: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: Colors.BLUE,
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
    color: Colors.BLUE,
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
    backgroundColor: Colors.LIGHT_GRAY,
  },
  dividerText: {
    color: Colors.MEDIUM_GRAY,
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
    color: Colors.MEDIUM_GRAY,
  },
  secondaryHighlight: {
    color: Colors.BLUE,
    fontFamily: 'outfit-bold',
  },
});
