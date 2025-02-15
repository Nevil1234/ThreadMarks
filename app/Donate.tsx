import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from "@/constants/Colors";
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import LottieView from 'lottie-react-native';
import { useLocalSearchParams } from 'expo-router';

// Mock NGO data
const NGOs = [
  {
    id: '1',
    name: 'Clothes For All',
    description: 'Providing clothing to underprivileged communities',
    location: 'New York, NY'
  },
  {
    id: '2',
    name: 'Warm Winters',
    description: 'Helping homeless people stay warm in winter',
    location: 'Chicago, IL'
  },
  {
    id: '3',
    name: 'Dress for Success',
    description: 'Professional attire for job seekers',
    location: 'Los Angeles, CA'
  }
];

export default function Donate() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState<typeof NGOs[0] | null>(null);

  const handleScan = () => {
    router.push('/ScanClothing');
    // You'll need to connect this to your actual QR scanner
    // and pass the scanned data back to this component
  };
  // Add useEffect to handle new scans
  useEffect(() => {
    if (params.scannedProduct) {
      const newProduct = JSON.parse(params.scannedProduct as string);
      setSelectedItems(prev => [...prev, newProduct]);
    }
  }, [params.scannedProduct]);

  const handleDelivery = () => {
    if (!selectedNGO) {
      alert('Please select an NGO');
      return;
    }
    if (!address) {
      alert('Please enter your address');
      return;
    }
    if (selectedItems.length === 0) {
      alert('Please scan at least one item');
      return;
    }
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedItems([]);
      setAddress('');
      setSelectedNGO(null);
    }, 3000);
  };

  const NGOCard = ({ ngo, isSelected, onSelect }) => (
    <TouchableOpacity 
      style={[
        styles.ngoCard, 
        isSelected && styles.selectedNgoCard
      ]} 
      onPress={() => onSelect(ngo)}
    >
      <Text style={styles.ngoName}>{ngo.name}</Text>
      <Text style={styles.ngoDescription}>{ngo.description}</Text>
      <Text style={styles.ngoLocation}>{ngo.location}</Text>
      {isSelected && (
        <View style={styles.selectedCheckmark}>
          <Feather name="check-circle" size={24} color={Colors.BLUE} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.description}>
          Help make a difference by donating your clothes to those in need.
        </Text>

        <Text style={styles.sectionTitle}>Select NGO:</Text>
      </View>

      {/* NGO List */}
      <FlatList
        ListHeaderComponent={() => (
          <>
            <FlatList
              data={NGOs}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <NGOCard
                  ngo={item}
                  isSelected={selectedNGO?.id === item.id}
                  onSelect={setSelectedNGO}
                />
              )}
              keyExtractor={item => item.id}
              style={styles.ngoList}
            />

            {selectedNGO && (
              <>
                <Text style={styles.sectionTitle}>Selected Items ({selectedItems.length}):</Text>
                <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
                  <Feather name="camera" size={24} color="white" />
                  <Text style={styles.scanButtonText}>Scan Clothing QR Code</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
        data={selectedItems}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productBrand}>{item.brand}</Text>
              <Text style={styles.productScore}>Condition: {item.conditionScore}</Text>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={() => (
          <>
            {selectedNGO && selectedItems.length > 0 && (
              <View style={styles.footer}>
                <Text style={styles.sectionTitle}>Delivery Details:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter pickup address"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                />

                {address.trim().length > 0 && (
                  <TouchableOpacity 
                    style={[
                      styles.donateButton,
                      { backgroundColor: Colors.BLUE }
                    ]} 
                    onPress={handleDelivery}
                  >
                    <Text style={styles.donateButtonText}>Schedule Free Pickup</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      />

      {showSuccess && (
        <View style={styles.successOverlay}>
          <LottieView
            source={require('@/assets/animations/success-animation.json')}
            autoPlay
            loop={false}
            style={styles.animation}
          />
          <Text style={styles.successText}>Pickup Scheduled Successfully!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  description: {
    fontSize: 16,
    fontFamily: 'outfit-regular',
    color: Colors.DARK,
    marginBottom: 20,
  },
  content: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    fontFamily: 'outfit-regular',
    color: Colors.GRAY,
  },
  productScore: {
    fontSize: 12,
    color: Colors.DARK,
    fontFamily: 'outfit-bold',
  },
  ngoCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ngoName: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    marginBottom: 8,
  },
  ngoDescription: {
    fontSize: 14,
    fontFamily: 'outfit-regular',
    color: Colors.DARK,
    marginBottom: 8,
  },
  ngoLocation: {
    fontSize: 12,
    color: Colors.GRAY,
    fontFamily: 'outfit-regular',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'outfit-bold',
    marginVertical: 16,
    margin: 10,
    color: Colors.DARK,
  },
  scanButton: {
    backgroundColor: Colors.BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 10,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  scanButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: 'outfit-bold',
  },
  input: {
    backgroundColor: Colors.WHITE,
    borderColor: Colors.LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  donateButton: {
    backgroundColor: Colors.WHITE,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  donateButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: 'outfit-bold',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
  successText: {
    fontSize: 20,
    fontFamily: 'outfit-bold',
    color: Colors.PRIMARY,
    marginTop: 20,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.WHITE,
  },
  ngoList: {
    marginVertical: 10,
  },
  footer: {
    padding: 16,
    paddingBottom: 40,
  },
  selectedCheckmark: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  selectedNgoCard: {
    borderColor: Colors.BLUE,
    borderWidth: 2,
  },
});