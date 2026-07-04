import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from "@/constants/Colors";
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import LottieView from 'lottie-react-native';

const NGOs = [
  {
    id: '1',
    name: 'Clothes For All',
    desc: 'Clothing for underprivileged communities',
    location: 'New York, NY',
    icon: 'heart',
  },
  {
    id: '2',
    name: 'Warm Winters',
    desc: 'Helping homeless people stay warm',
    location: 'Chicago, IL',
    icon: 'sun',
  },
  {
    id: '3',
    name: 'Dress for Success',
    desc: 'Professional attire for job seekers',
    location: 'Los Angeles, CA',
    icon: 'briefcase',
  },
];

export default function Donate() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState<typeof NGOs[0] | null>(null);

  useEffect(() => {
    if (params.scannedProduct) {
      const newProduct = JSON.parse(params.scannedProduct as string);
      setSelectedItems(prev => [...prev, newProduct]);
    }
  }, [params.scannedProduct]);

  const handleSchedule = () => {
    if (!selectedNGO) return;
    if (!address.trim()) return;
    if (selectedItems.length === 0) return;

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedItems([]);
      setAddress('');
      setSelectedNGO(null);
    }, 3000);
  };

  const canSchedule = selectedNGO && address.trim().length > 0 && selectedItems.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar translucent backgroundColor={Colors.BG} barStyle="dark-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={styles.headerSection}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color={Colors.EMERALD} />
            </Pressable>
            <Text style={styles.title}>Donate</Text>
            <View style={{ width: 40 }} />
          </View>
          <Text style={styles.subtitle}>Give your clothes a second life</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.stepBadge}>1 </Text>
            Choose an Organization
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ngoScroll}>
            {NGOs.map((ngo) => {
              const selected = selectedNGO?.id === ngo.id;
              return (
                <Pressable
                  key={ngo.id}
                  style={[styles.ngoCard, selected && styles.ngoCardSelected]}
                  onPress={() => setSelectedNGO(ngo)}
                >
                  <View style={[styles.ngoIcon, selected && { backgroundColor: Colors.EMERALD }]}>
                    <Feather name={ngo.icon as any} size={18} color={selected ? Colors.WHITE : Colors.EMERALD} />
                  </View>
                  <Text style={styles.ngoName}>{ngo.name}</Text>
                  <Text style={styles.ngoDesc}>{ngo.desc}</Text>
                  <View style={styles.ngoLocationRow}>
                    <Feather name="map-pin" size={11} color={Colors.TEXT_DIM} />
                    <Text style={styles.ngoLocation}>{ngo.location}</Text>
                  </View>
                  {selected && (
                    <View style={styles.checkBadge}>
                      <Feather name="check" size={14} color={Colors.WHITE} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionTitle}>
            <Text style={styles.stepBadge}>2 </Text>
            Scan Items ({selectedItems.length})
          </Text>

          <Pressable
            style={({ pressed }) => [styles.scanBtn, pressed && { transform: [{ scale: 0.97 }] }]}
            onPress={() => router.push('/ScanClothing')}
          >
            <Feather name="camera" size={20} color={Colors.WHITE} />
            <Text style={styles.scanBtnText}>Scan Clothing QR Code</Text>
          </Pressable>

          {selectedItems.map((item, i) => (
            <View key={i} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemBrand}>{item.brand}</Text>
                {item.conditionScore != null && (
                  <View style={styles.scoreChip}>
                    <Feather name="bar-chart-2" size={11} color={Colors.EMERALD} />
                    <Text style={styles.scoreChipText}>Score: {item.conditionScore}</Text>
                  </View>
                )}
              </View>
              <Pressable onPress={() => setSelectedItems(prev => prev.filter((_, idx) => idx !== i))}>
                <Feather name="x" size={18} color={Colors.TEXT_MUTED} />
              </Pressable>
            </View>
          ))}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            <Text style={styles.stepBadge}>3 </Text>
            Pickup Address
          </Text>

          <TextInput
            style={styles.addressInput}
            placeholder="Enter your pickup address..."
            placeholderTextColor={Colors.TEXT_MUTED}
            value={address}
            onChangeText={setAddress}
            multiline
          />

          <Pressable
            style={({ pressed }) => [
              styles.scheduleBtn,
              !canSchedule && styles.scheduleBtnDisabled,
              pressed && canSchedule && { transform: [{ scale: 0.97 }] },
            ]}
            onPress={canSchedule ? handleSchedule : undefined}
            disabled={!canSchedule}
          >
            <Feather name="truck" size={20} color={canSchedule ? Colors.WHITE : '#999'} />
            <Text style={[styles.scheduleBtnText, !canSchedule && { color: '#999' }]}>
              Schedule Free Pickup
            </Text>
          </Pressable>

          {!canSchedule && (
            <Text style={styles.hint}>
              {!selectedNGO ? 'Select an organization above' : selectedItems.length === 0 ? 'Scan at least one item' : 'Enter a pickup address'}
            </Text>
          )}
        </View>
      </ScrollView>

      {showSuccess && (
        <View style={styles.successOverlay}>
          <LottieView
            source={require('@/assets/animations/success-animation.json')}
            autoPlay
            loop={false}
            style={{ width: 180, height: 180 }}
          />
          <Text style={styles.successTitle}>Pickup Scheduled!</Text>
          <Text style={styles.successDesc}>
            {selectedNGO?.name} will collect your items soon.
          </Text>
        </View>
      )}
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
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.EMERALD_DIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.TEXT,
    fontSize: 20,
    fontFamily: 'outfit-bold',
  },
  subtitle: {
    color: Colors.TEXT_DIM,
    fontSize: 14,
    fontFamily: 'outfit-regular',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
    marginBottom: 14,
  },
  stepBadge: {
    color: Colors.EMERALD,
    fontFamily: 'outfit-bold',
  },
  ngoScroll: {
    marginBottom: 28,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  ngoCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 18,
    padding: 16,
    marginRight: 12,
    width: 200,
    borderWidth: 2,
    borderColor: Colors.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  ngoCardSelected: {
    borderColor: Colors.EMERALD,
  },
  ngoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.EMERALD_DIM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  ngoName: {
    fontSize: 15,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
    marginBottom: 4,
  },
  ngoDesc: {
    fontSize: 12,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    lineHeight: 17,
    marginBottom: 8,
  },
  ngoLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ngoLocation: {
    fontSize: 11,
    fontFamily: 'outfit-medium',
    color: Colors.TEXT_DIM,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.EMERALD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.EMERALD,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },
  scanBtnText: {
    color: Colors.WHITE,
    fontSize: 15,
    fontFamily: 'outfit-bold',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: Colors.BG_ELEVATED,
  },
  itemName: {
    fontSize: 15,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
  },
  itemBrand: {
    fontSize: 13,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    marginBottom: 4,
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreChipText: {
    fontSize: 12,
    fontFamily: 'outfit-medium',
    color: Colors.EMERALD,
  },
  addressInput: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 14,
    padding: 16,
    minHeight: 80,
    fontSize: 15,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT,
    textAlignVertical: 'top',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.EMERALD,
    borderRadius: 16,
    paddingVertical: 16,
  },
  scheduleBtnDisabled: {
    backgroundColor: '#E8E8E8',
  },
  scheduleBtnText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: 'outfit-bold',
  },
  hint: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    marginTop: 10,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250,248,244,0.97)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
    marginTop: 8,
  },
  successDesc: {
    fontSize: 14,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
