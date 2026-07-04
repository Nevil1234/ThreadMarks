import { View, Text, Pressable, ScrollView, StyleSheet, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from "@/constants/Colors";
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';

const WARDROBE_ITEMS = [
  {
    id: '1',
    name: 'Classic Oxford Shirt',
    brand: 'Ralph Lauren',
    category: 'Shirts',
    condition: 92,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
  },
  {
    id: '2',
    name: 'Slim Fit Denim Jacket',
    brand: "Levi's",
    category: 'Outerwear',
    condition: 78,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
  },
  {
    id: '3',
    name: 'Air Max 90',
    brand: 'Nike',
    category: 'Footwear',
    condition: 85,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  },
  {
    id: '4',
    name: 'Cotton Chinos',
    brand: 'Uniqlo',
    category: 'Pants',
    condition: 64,
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400',
  },
];

function conditionColor(score: number) {
  if (score >= 80) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

const PREMIUM_BRANDS = ['Ralph Lauren', 'Nike', 'Gucci', 'Prada', 'Louis Vuitton', 'Burberry', 'Versace'];
const MID_BRANDS = ["Levi's", 'Tommy Hilfiger', 'Calvin Klein', 'Lacoste', 'Adidas'];

function estimateResaleValue(brand: string, condition: number): number {
  const basePrice = PREMIUM_BRANDS.includes(brand) ? 120 : MID_BRANDS.includes(brand) ? 65 : 35;
  const conditionMult = 0.1 + (condition / 100) * 0.85;
  const brandMult = PREMIUM_BRANDS.includes(brand) ? 1.4 : MID_BRANDS.includes(brand) ? 1.1 : 1.0;
  return Math.round(basePrice * conditionMult * brandMult);
}

export default function Wardrobe() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar translucent backgroundColor={Colors.BG} barStyle="dark-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>My Wardrobe</Text>
          <Text style={styles.subtitle}>{WARDROBE_ITEMS.length} verified items</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{WARDROBE_ITEMS.length}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Math.round(WARDROBE_ITEMS.reduce((a, b) => a + b.condition, 0) / WARDROBE_ITEMS.length)}
              </Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{new Set(WARDROBE_ITEMS.map(i => i.brand)).size}</Text>
              <Text style={styles.statLabel}>Brands</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {WARDROBE_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.98 }] }]}
              onPress={() => router.push({
                pathname: '/WardrobeItem',
                params: { name: item.name, brand: item.brand, category: item.category, condition: String(item.condition), imageUrl: item.imageUrl },
              })}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardBrand}>{item.brand}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.categoryChip}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                  <View style={styles.scoreRow}>
                    <View style={[styles.scoreDot, { backgroundColor: conditionColor(item.condition) }]} />
                    <Text style={[styles.scoreText, { color: conditionColor(item.condition) }]}>{item.condition}</Text>
                  </View>
                  <Text style={styles.resaleText}>${estimateResaleValue(item.brand, item.condition)}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.TEXT_MUTED} />
            </Pressable>
          ))}

          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && { transform: [{ scale: 0.97 }] }]}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Feather name="plus" size={20} color={Colors.WHITE} />
            <Text style={styles.addBtnText}>Scan & Add Item</Text>
          </Pressable>
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
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.BG_ELEVATED,
    borderRadius: 16,
    marginTop: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: Colors.EMERALD,
    fontSize: 22,
    fontFamily: 'outfit-bold',
  },
  statLabel: {
    color: Colors.TEXT_DIM,
    fontSize: 12,
    fontFamily: 'outfit-regular',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.BORDER,
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
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.BG_ELEVATED,
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardName: {
    fontSize: 15,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
  },
  cardBrand: {
    fontSize: 13,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: Colors.EMERALD_DIM,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'outfit-medium',
    color: Colors.EMERALD,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 12,
    fontFamily: 'outfit-bold',
  },
  resaleText: {
    fontSize: 13,
    fontFamily: 'outfit-bold',
    color: Colors.GOLD,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.EMERALD,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  addBtnText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: 'outfit-bold',
  },
});
