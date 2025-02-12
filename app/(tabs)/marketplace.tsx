import { View, Text, FlatList, StyleSheet, Image, Pressable, Alert } from 'react-native';
import React, { useState } from 'react';
import { Card, Button, Searchbar } from 'react-native-paper';
import Colors from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
const initialItems = [
  {
    id: '1',
    name: 'T-Shirt',
    brand: 'Nike',
    price: '299',
    conditionScore: '0.9',
    image: require('@/assets/images/tshirt1.png')
  },
  {
    id: '2',
    name: 'Jeans',
    brand: 'Levi\'s',
    price: '599',
    conditionScore: '0.8',
    image: require('@/assets/images/tshirt1.png')
  },
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(initialItems);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = initialItems.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.brand.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const showConditionInfo = () => {

    Alert.alert(
      'Condition Score',
      'Condition score is a measure of how well the item has sustained. A score of 1.0 means the item is in perfect condition, while a score less than 0.4 means the item is unusable.',
      [
        { text: 'OK' }
      ]
    )
  }

  const renderItem = ({ item }) => (
    <Card style={styles.itemCard}>
      <Card.Cover source={item.image} style={styles.itemImage} />
      <Card.Content>
        {/* Wrap item name and condition score in one row */}
        <View style={styles.itemHeaderRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Pressable onPress={showConditionInfo}
          style={styles.conditionContainer}>
            <Ionicons name="sparkles-sharp" size={10} color="black" />

            <Text style={styles.conditionText}>{item.conditionScore}</Text>
          </Pressable>
        </View>

        <Text style={styles.itemBrand}>{item.brand}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => { }} style={styles.button}>
          View Details
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="bell" size={24} color={Colors.BLUE} />
        <Text style={styles.headerTitle}>ThreadMark</Text>
        <Feather name="settings" size={24} color={Colors.BLUE} />
      </View>

      <Searchbar
        placeholder="Search products..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  headerTitle: {
    color: Colors.BLUE,
    fontSize: 24,
    fontFamily: 'outfit-bold'
  },
  conditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#65ed4c', // Neon green
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 3,
    justifyContent:'space-between'
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 4,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderColor: '#000000',
    borderWidth: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 8,
  },
  itemCard: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    elevation: 2,
    height: 500,
  },
  itemImage: {
    height: 350,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  // Row for item name and condition
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    marginTop: 8,
  },

  conditionText: {
    fontSize: 11,
    fontFamily: 'outfit-medium',
    color: '#000000',

  },
  itemBrand: {
    fontSize: 14,
    color: 'gray',
    fontFamily: 'outfit-medium',
  },
  itemPrice: {
    fontSize: 16,
    color: Colors.BLUE,
    marginTop: 8,
    fontFamily: 'outfit-medium',
  },
  button: {
    marginTop: -5,
    width: '100%',
    backgroundColor: Colors.BLUE,
  },
});