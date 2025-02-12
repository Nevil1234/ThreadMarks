import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Colors from "@/constants/Colors";
import { useState } from 'react';

interface ProductParams {
  name: string;
  brand: string;
  size: string;
  category: string;
  material: string;
  manufacturingDate: string;
  gender: string;
  batchNumber: string;
  image: string;
  description: string;
}

export default function ProductScreen() {
  const params = useLocalSearchParams();
  const [imageLoading, setImageLoading] = useState(true);

  // Extract product details from params
  const product: ProductParams = {
    name: params.name as string,
    brand: params.brand as string,
    size: params.size as string,
    category: params.category as string,
    material: params.material as string,
    manufacturingDate: params.manufacturingDate as string,
    gender: params.gender as string,
    batchNumber: params.batchNumber as string,
    image: params.image as string,
    description: params.description as string,
  };

  // If product data is missing, return null to prevent rendering
  if (!product.name || !product.image) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      
    {/* Hero Image Section */}
    <View style={styles.heroContainer}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        resizeMode="cover"
        onLoadStart={() => setImageLoading(true)}
        onLoadEnd={() => setImageLoading(false)}
        onError={() => console.error('Failed to load image')}
      />
      {imageLoading && (
        <View style={styles.imageLoader}>
          <ActivityIndicator size="large" color={Colors.BLUE} />
        </View>
      )}
    </View>

    {/* Product Info Card */}
    <View style={styles.productCard}>
      <View style={styles.header}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.title}>{product.name}</Text>
      </View>

      <View style={styles.separator} />

      <Text style={styles.description}>{product.description}</Text>

      <Text style={styles.sectionTitle}>Product Details</Text>
      <View style={styles.detailGrid}>
        <DetailItem label="Category" value={product.category || 'N/A'} />
        <DetailItem label="Size" value={product.size || 'N/A'} />
        <DetailItem label="Material" value={product.material || 'N/A'} />
        <DetailItem label="Gender" value={product.gender || 'N/A'} />
      </View>

      <Text style={styles.sectionTitle}>Manufacturing Info</Text>
      <View style={styles.detailGrid}>
        <DetailItem 
          label="Manufacturing Date" 
          value={new Date(product.manufacturingDate).toLocaleDateString() || 'N/A'} 
        />
        <DetailItem label="Batch Number" value={product.batchNumber || 'N/A'} />
      </View>
    </View>
  </ScrollView>
);
}

// Enhanced DetailItem component
const DetailItem = ({ label, value }: { label: string; value: string }) => (
<View style={styles.detailItem}>
  <Text style={styles.detailLabel}>{label}</Text>
  <Text style={styles.detailValue}>{value}</Text>
</View>
);

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#f5f5f5',
},
heroContainer: {
  height: 400,
  width: '100%',
  backgroundColor: Colors.LIGHT_GRAY,
  position: 'relative',
  marginTop: 10, // Add this line for top margin
},
image: {
  width: '100%',
  height: '100%',
},
imageLoader: {
  ...StyleSheet.absoluteFillObject,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.8)',
},
productCard: {
  backgroundColor: Colors.WHITE,
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  marginTop: -30,
  padding: 24,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: -2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 5,
},
header: {
  marginBottom: 16,
},
brand: {
  fontSize: 16,
  color: Colors.BLUE,
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: 4,
  fontFamily: 'outfit-bold',
},
title: {
  fontSize: 28,
  color: Colors.DARK,
  fontFamily: 'outfit-bold',
  lineHeight: 34,
},
separator: {
  height: 1,
  backgroundColor: '#E0E0E0',
  marginVertical: 16,
},
description: {
  fontSize: 16,
  lineHeight: 24,
  color: Colors.DARK_GRAY,
  marginBottom: 24,
  fontFamily: 'outfit-regular',
},
sectionTitle: {
  fontSize: 18,
  color: Colors.DARK,
  marginBottom: 16,
  fontFamily: 'outfit-bold',
},
detailGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12,
  marginBottom: 24,
},
detailItem: {
  width: '48%',
  backgroundColor: '#f8f9fa',
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: '#E0E0E0',
},
detailLabel: {
  fontSize: 12,
  color: Colors.DARK_GRAY,
  marginBottom: 4,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  fontFamily: 'outfit-medium',
},
detailValue: {
  fontSize: 16,
  color: Colors.DARK,
  fontFamily: 'outfit-bold',
},
});