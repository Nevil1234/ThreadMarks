import { View, Text, StatusBar } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Colors from "@/constants/Colors";
export default function Tablayout() {
    return (
        <>
            <StatusBar hidden />
            <Tabs screenOptions={{
                headerShown: false,
            }}>
                <Tabs.Screen name="home"
                    options={{
                        tabBarLabel: 'Home',
                        title: 'Home',
                        tabBarIcon: ({ color, size }) => <Feather name="home" size={24} color="black" />,

                    }} />
                <Tabs.Screen name="recent"
                    options={{
                        tabBarLabel: 'Recent',
                        headerTitle: 'Recent',
                        tabBarIcon: ({ color, size }) => <FontAwesome name="history" size={24} color="black" />,

                    }} />
                <Tabs.Screen name="wardrobe"
                    options={{
                        tabBarLabel: 'My Wardrobe',
                        headerTitle: 'My Wardrobe',
                        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="hanger" size={24} color="black" />,

                    }} />
                <Tabs.Screen name="marketplace"
                    options={{
                        tabBarLabel: 'Marketplace',
                        headerTitle: 'Marketplace',
                        tabBarIcon: ({ color, size }) => <SimpleLineIcons name="basket" size={24} color="black" />,

                    }} />
                
            </Tabs>
        </>
    )
}