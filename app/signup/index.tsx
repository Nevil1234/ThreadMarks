import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, StatusBar } from 'react-native';
import { TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/config/firebaseconfig';
import { doc, setDoc } from 'firebase/firestore';
import { UserDetailContext } from '@/context/UserDetailContext';
import { Feather } from '@expo/vector-icons';

export default function signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [Name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const router = useRouter();

  const CreateNewAccount = () => {
    if (!email || !password || !Name) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (resp) => {
        const user = resp.user;
        await SaveUser(user);
        setLoading(false);
        router.replace('/(tabs)/home');
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  const SaveUser = async (user) => {
    const data = {
      name: Name,
      email: email,
      member: false,
      uid: user?.uid,
    };
    await setDoc(doc(db, 'users', email), data);
    setUserDetail(data);
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
              <Feather name="tag" size={26} color={Colors.WHITE} />
            </View>
            <Text style={styles.brandTitle}>ThreadMark</Text>
            <Text style={styles.brandSub}>Verify. Own. Trust.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the authenticity revolution</Text>

            <TextInput
              label="Full Name"
              value={Name}
              onChangeText={setName}
              autoCapitalize="words"
              style={styles.input}
              mode="outlined"
              outlineColor={Colors.LIGHT_GRAY}
              activeOutlineColor={Colors.BLUE}
              theme={{ colors: { primary: Colors.BLUE } }}
              left={<TextInput.Icon icon="account-outline" />}
            />

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
                onPress={CreateNewAccount}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                contentStyle={{ paddingVertical: 6 }}
              >
                Create Account
              </Button>
            )}

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

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
