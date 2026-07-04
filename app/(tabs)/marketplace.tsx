import { View, Text, FlatList, StyleSheet, Image, Pressable, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import Colors from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const LISTINGS = [
  {
    id: '1',
    name: 'Nike T-Shirt',
    brand: 'Nike',
    price: '₹299',
    condition: 88,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
  },
  {
    id: '2',
    name: "Levi's Slim Jeans",
    brand: "Levi's",
    price: '₹599',
    condition: 76,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
  },
  {
    id: '3',
    name: 'Adidas Hoodie',
    brand: 'Adidas',
    price: '₹449',
    condition: 92,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
  },
  {
    id: '4',
    name: 'Uniqlo Polo',
    brand: 'Uniqlo',
    price: '₹199',
    condition: 65,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
  },
];

function conditionColor(score: number) {
  if (score >= 80) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filtered = LISTINGS.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: typeof LISTINGS[0] }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.97 }] }]}
      onPress={() => router.push({
        pathname: '/product',
        params: {
          name: item.name,
          brand: item.brand,
          size: 'M',
          category: 'Apparel',
          material: 'Cotton Blend',
          manufacturingDate: '2024-01-10',
          gender: 'Unisex',
          batchNumber: `TM-${item.id}-2024`,
          image: item.imageUrl,
          description: `${item.name} by ${item.brand}. Verified authentic, condition score ${item.condition}/100.`,
        },
      })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardBrand}>{item.brand}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>{item.price}</Text>
          <View style={styles.conditionBadge}>
            <View style={[styles.conditionDot, { backgroundColor: conditionColor(item.condition) }]} />
            <Text style={styles.conditionText}>{item.condition}/100</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar translucent backgroundColor={Colors.BG} barStyle="dark-content" />
      <View style={styles.headerSection}>
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.subtitle}>Verified pre-owned apparel</Text>

        <View style={styles.searchRow}>
          <Feather name="search" size={18} color={Colors.TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={Colors.TEXT_MUTED}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color={Colors.TEXT_MUTED} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="search" size={40} color={Colors.BORDER} />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.BG,
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginTop: 18,
    height: 46,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT,
  },
  list: {
    flex: 1,
    backgroundColor: Colors.BG,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.BG_ELEVATED,
  },
  cardBody: {
    padding: 12,
  },
  cardName: {
    fontSize: 14,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
    marginBottom: 2,
  },
  cardBrand: {
    fontSize: 12,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPrice: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: Colors.EMERALD,
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conditionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  conditionText: {
    fontSize: 11,
    fontFamily: 'outfit-medium',
    color: Colors.TEXT_DIM,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
    color: Colors.TEXT_DIM,
    marginTop: 12,
  },
});
