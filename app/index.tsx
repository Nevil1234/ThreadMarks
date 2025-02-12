import { Link, useRouter } from "expo-router";
import { Text, View, Image, StatusBar, Dimensions, Pressable } from "react-native";
import Colors from "@/constants/Colors";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/config/firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import { useRoute } from "@react-navigation/native";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useContext, useEffect } from "react";

const { width, height } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const {userDetail, setUserDetail}=useContext(UserDetailContext);
  
  useEffect(()=>{

  const unsubscribe = onAuthStateChanged(auth, async(user) => {
    if (user) {
      console.log('User is signed in');
      const result = await getDoc(doc(db, 'users', user.email));
      setUserDetail(result.data());
      router.replace('/(tabs)/home');
    } else {
      console.log('User is signed out');
    }
  });

  return () => unsubscribe();
}, []);
  const newHeight = width / (737 / 549);
  return (
   <View>
     <StatusBar translucent backgroundColor="transparent" />
      <Image source={require('./../assets/images/login.jpg')}
      style={{  
        resizeMode:"contain",
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        marginTop: -145,
        marginBottom: -160,
}} />
<View>
<Text style={{
  fontFamily: 'outfit-bold',
  fontSize:30,
  textAlign:'center',
}}>Is your style safe from counterfeits and fraud?</Text>
<Text style={{
  fontFamily: 'outfit-medium',
  fontSize:20,
  textAlign:'center',
  marginTop: 10,
  color: '#000000',
  opacity: 0.5
}}> Check the genuinity of your apparel. Scan the QR code</Text>
<Link href="/signup" asChild>
<Pressable style={{
  backgroundColor: Colors.BLUE,
  width: 200,
  height: 50,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 20,
  alignSelf: 'center',
}}>
  <Text>Lets Get Started</Text>
</Pressable>
</Link>

<Link href="/login" asChild>
<Pressable style={{
  width: 200,
  height: 50,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 5,
  alignSelf: 'center',
}}>
  <Text style={{
    fontFamily: 'outfit-medium',
  }}>Already Have An Account? </Text>
</Pressable>
</Link>

   </View>
   </View>

  );
}
