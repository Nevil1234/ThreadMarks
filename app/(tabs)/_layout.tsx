import { View, Text, StatusBar } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Colors from "@/constants/Colors";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Tablayout() {
    const insets = useSafeAreaInsets();
    const bottomPadding = Math.max(insets.bottom, 10);

    return (
        <>
            <StatusBar hidden />
            <Tabs screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.EMERALD,
                tabBarInactiveTintColor: Colors.TEXT_MUTED,
                tabBarStyle: {
                    backgroundColor: Colors.BG_CARD,
                    borderTopWidth: 1,
                    borderTopColor: Colors.BORDER,
                    elevation: 0,
                    paddingBottom: bottomPadding,
                    paddingTop: 8,
                    height: 56 + bottomPadding,
                },
                tabBarLabelStyle: {
                    fontFamily: 'outfit-medium',
                    fontSize: 10,
                    letterSpacing: 0.5,
                },
            }}>
                <Tabs.Screen name="home"
                    options={{
                        tabBarLabel: 'Home',
                        title: 'Home',
                        tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
                    }} />
                <Tabs.Screen name="recent"
                    options={{
                        tabBarLabel: 'Recent',
                        headerTitle: 'Recent',
                        tabBarIcon: ({ color }) => <FontAwesome name="history" size={22} color={color} />,
                    }} />
                <Tabs.Screen name="wardrobe"
                    options={{
                        tabBarLabel: 'Wardrobe',
                        headerTitle: 'My Wardrobe',
                        tabBarIcon: ({ color }) => <MaterialCommunityIcons name="hanger" size={22} color={color} />,
                    }} />
                <Tabs.Screen name="marketplace"
                    options={{
                        tabBarLabel: 'Market',
                        headerTitle: 'Marketplace',
                        tabBarIcon: ({ color }) => <SimpleLineIcons name="basket" size={22} color={color} />,
                    }} />
            </Tabs>
        </>
    )
}