import { View, Text, Pressable, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from "@/constants/Colors";
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';

const MOCK_SCANS = [
  {
    id: '1',
    name: 'Classic Oxford Shirt',
    brand: 'Ralph Lauren',
    date: '2 hours ago',
    status: 'authentic',
  },
  {
    id: '2',
    name: 'Slim Fit Denim Jacket',
    brand: 'Levi\'s',
    date: 'Yesterday',
    status: 'authentic',
  },
  {
    id: '3',
    name: 'Air Max 90',
    brand: 'Nike',
    date: '3 days ago',
    status: 'authentic',
  },
  {
    id: '4',
    name: 'Graphic Tee',
    brand: 'Unknown Brand',
    date: '1 week ago',
    status: 'unverified',
  },
];

function getStatusColor(status: string) {
  return status === 'authentic' ? '#22C55E' : '#F59E0B';
}

function getStatusIcon(status: string) {
  return status === 'authentic' ? 'check-circle' : 'alert-circle';
}

export default function Recent() {
  const router = useRouter();
  const [scans] = useState(MOCK_SCANS);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar translucent backgroundColor={Colors.BG} barStyle="dark-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Recent Scans</Text>
          <Text style={styles.subtitle}>{scans.length} items verified</Text>
        </View>

        <View style={styles.body}>
          {scans.length > 0 ? (
            scans.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <View style={styles.cardIcon}>
                  <Feather name="tag" size={18} color={Colors.EMERALD} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardBrand}>{item.brand}</Text>
                </View>
                <View style={styles.cardRight}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]}>
                    <Feather name={getStatusIcon(item.status) as any} size={12} color={Colors.WHITE} />
                  </View>
                  <Text style={styles.cardDate}>{item.date}</Text>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Feather name="clock" size={48} color={Colors.BORDER} />
              <Text style={styles.emptyTitle}>No Recent Scans</Text>
              <Text style={styles.emptyDesc}>
                Products you verify will appear here
              </Text>
              <Pressable
                style={({ pressed }) => [styles.scanBtn, pressed && { transform: [{ scale: 0.97 }] }]}
                onPress={() => router.push('/(tabs)/home')}
              >
                <Feather name="maximize" size={18} color={Colors.WHITE} />
                <Text style={styles.scanBtnText}>Scan Now</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.BG,
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    color: Colors.TEXT,
    fontSize: 26,
    fontFamily: 'outfit-bold',
  },
  subtitle: {
    color: Colors.TEXT_DIM,
    fontSize: 14,
    fontFamily: 'outfit-regular',
    marginTop: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.EMERALD_DIM,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardName: {
    fontSize: 15,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
    marginBottom: 2,
  },
  cardBrand: {
    fontSize: 13,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDate: {
    fontSize: 11,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_MUTED,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.EMERALD,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  scanBtnText: {
    color: Colors.WHITE,
    fontSize: 15,
    fontFamily: 'outfit-bold',
  },
});
