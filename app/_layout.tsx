import { Stack } from "expo-router";
import {useFonts} from "expo-font";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useState } from "react";
import Toast from 'react-native-toast-message';

export default function RootLayout() {

  useFonts({
    'outfit-bold':require('./../assets/fonts/Outfit-Bold.ttf'),
    'outfit-medium':require('./../assets/fonts/Outfit-Medium.ttf'),
    'outfit-regular':require('./../assets/fonts/Outfit-Regular.ttf'),
  })
  const [userDetail,setUserDetail]=useState(null);
  return(
    <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
    <Stack>
      <Stack.Screen name="index"
      options={{
        headerShown:false
      }}/>
      <Stack.Screen name="login/index"
      options={{
        headerShown:false
      }}/>
      <Stack.Screen name="signup/index"
      options={{
        headerShown:false
      }}/>
           
      
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ConditionScore" options={{ headerShown: false }} />
      <Stack.Screen name="RecyclingOptions" options={{ headerShown: false }} />
      <Stack.Screen name="Donate" options={{ headerShown: false }} />
      <Stack.Screen name="ScanClothing" options={{ headerShown: false }} />
      <Stack.Screen name="WardrobeItem" options={{ headerShown: false }} />
      <Stack.Screen name="product" options={{ headerShown: false }} />
    </Stack>
    <Toast />
    </UserDetailContext.Provider>
  );
}
