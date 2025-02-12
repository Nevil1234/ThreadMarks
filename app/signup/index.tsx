import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { Link } from 'expo-router';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/config/firebaseconfig';
import { doc, setDoc } from 'firebase/firestore';
import { ScreenStackHeaderConfig } from 'react-native-screens';
import { UserDetailContext } from '@/context/UserDetailContext';

export default function signup() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [Name, setName] = useState('');
  const [error, setError] = useState('');
  const {userDetail, setUserDetail}=useContext(UserDetailContext);
  const CreateNewAccount = () => {
    if (!email || !password || !Name) {
      setError('Please fill in all fields');
    } else {
      setError('');
      createUserWithEmailAndPassword(auth, email, password)
        .then(async(resp) => {
          const user = resp.user;
          console.log('User created:', user);
          await SaveUser(user);
        })
        .catch((error) => {
          setError(error.message);
        });
    }
}

const SaveUser=async(user)=>{
    const data = {
        name:Name,
        email:email,
        member: false,
        uid: user?.uid,
    }

    await setDoc(doc(db,'users',email),data)

    setUserDetail(data);
}
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Account</Text>

      <TextInput
        label="Name"
        value={Name}
        onChangeText={setName}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        theme={{ colors: { primary: Colors.BLUE } }}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        theme={{ colors: { primary: Colors.BLUE } }}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        theme={{ colors: { primary: Colors.BLUE } }}
      />

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

      <Button mode="contained" onPress={CreateNewAccount} style={styles.button}>
        Register
      </Button>
      <Link href="/login" style={{
            textAlign: 'center',
            marginTop: 20,
            fontFamily: 'outfit-medium',
      }}>
        Already have an account? Login
        </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.BLUE,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: Colors.BLUE,
  },
});