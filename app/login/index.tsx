import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, ToastAndroid } from 'react-native';
import { TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper';
import { Link, router } from 'expo-router';
import Colors from '@/constants/Colors';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/config/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { UserDetailContext } from '@/context/UserDetailContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const {userDetail, setUserDetail}=useContext(UserDetailContext);
  const [loading,setloading] =  useState(false);
  const handleLogin = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
    } else {
      console.log('Logging in with:', email, password);
      setloading(true);
      signInWithEmailAndPassword(auth, email, password)
      .then(async(resp)=>{
        const user=resp.user
        console.log('User logged in:',user);
        await getUserDetail();
        setloading(false);
        router.replace('/(tabs)/home');
      })
      .catch((error) => {
        setError(error.message);
        setloading(false);
        ToastAndroid.show('Incorrect email and password', ToastAndroid.SHORT);
    })
    }
  };

  const getUserDetail = async() =>{
    const result = await getDoc(doc(db, 'users', email));
    console.log('User data:', result.data());
    setUserDetail(result.data());
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

     
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

      {!loading? <Button disabled= {loading} mode="contained" onPress={handleLogin} style={styles.button}>
        Login
      </Button>:<ActivityIndicator size="large" color="#{Colors.WHITE}" />}
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'outfit-bold',
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