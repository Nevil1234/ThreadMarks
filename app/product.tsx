import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, Pressable, Modal, TextInput, Animated, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Colors from "@/constants/Colors";
import { useState, useRef, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';

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

interface TimelineEvent {
  label: string;
  date: string;
  icon: string;
  active: boolean;
}

function buildTimeline(manufacturingDate: string): TimelineEvent[] {
  const mfg = new Date(manufacturingDate);
  const verified = new Date(mfg.getTime() + 7 * 86400000);
  const owned = new Date(verified.getTime() + 14 * 86400000);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return [
    { label: 'Manufactured', date: fmt(mfg), icon: 'box', active: true },
    { label: 'Verified on Chain', date: fmt(verified), icon: 'check-circle', active: true },
    { label: 'Ownership Claimed', date: fmt(owned), icon: 'user', active: true },
    { label: 'Available for Transfer', date: '—', icon: 'repeat', active: false },
  ];
}

const CONFETTI_COUNT = 24;
const CONFETTI_COLORS = [Colors.GOLD, Colors.EMERALD, '#22C55E', Colors.GOLD_LIGHT, Colors.EMERALD_LIGHT, '#F59E0B'];
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function makeConfetti() {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    anim: new Animated.Value(0),
    x: (Math.random() - 0.5) * SCREEN_W * 0.9,
    drift: (Math.random() - 0.5) * 60,
    rotation: 360 + Math.random() * 720,
    w: 6 + Math.random() * 6,
    h: 10 + Math.random() * 14,
    delay: Math.random() * 400,
  }));
}

export default function ProductScreen() {
  const params = useLocalSearchParams();
  const [imageLoading, setImageLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showConfetti, setShowConfetti] = useState(true);

  const sealScale = useRef(new Animated.Value(0)).current;
  const sealOpacity = useRef(new Animated.Value(0)).current;
  const confetti = useRef(makeConfetti()).current;

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

  const timeline = buildTimeline(product.manufacturingDate);

  useEffect(() => {
    // Confetti rain
    const confettiAnims = confetti.map(c =>
      Animated.sequence([
        Animated.delay(c.delay),
        Animated.timing(c.anim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    );
    Animated.parallel(confettiAnims).start(() => setShowConfetti(false));

    // Seal animate in after delay
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(sealScale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
        Animated.timing(sealOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (!product.name || !product.image) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.BG }}>
      <ScrollView style={styles.container} bounces={false}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            setOrderId('');
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Own This Product</Text>
              <Text style={styles.modalSubtitle}>Enter your order ID to verify purchase</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter Order ID"
                value={orderId}
                onChangeText={setOrderId}
                placeholderTextColor={Colors.TEXT_MUTED}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.buttonCancel]}
                  onPress={() => {
                    setModalVisible(false);
                    setOrderId('');
                  }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[styles.modalButton, styles.buttonConfirm]}
                  onPress={() => {
                    console.log('Order ID:', orderId);
                    setModalVisible(false);
                    setOrderId('');
                  }}>
                  <Text style={styles.confirmButtonText}>Verify</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Hero Image */}
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
              <ActivityIndicator size="large" color={Colors.EMERALD} />
            </View>
          )}
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={Colors.WHITE} />
          </Pressable>

          {/* Verification Seal */}
          <Animated.View style={[styles.seal, { opacity: sealOpacity, transform: [{ scale: sealScale }] }]}>
            <View style={styles.sealOuter}>
              <View style={styles.sealInner}>
                <Feather name="shield" size={22} color={Colors.GOLD} />
              </View>
            </View>
            <Text style={styles.sealText}>VERIFIED</Text>
          </Animated.View>
        </View>

        {/* Product Info */}
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

          {/* Ownership Chain Timeline */}
          <Text style={styles.sectionTitle}>Chain of Custody</Text>
          <View style={styles.timeline}>
            {timeline.map((event, index) => (
              <View key={index} style={styles.timelineRow}>
                <View style={styles.timelineDotCol}>
                  <View style={[styles.timelineDot, event.active && styles.timelineDotActive]}>
                    <Feather name={event.icon as any} size={12} color={event.active ? Colors.WHITE : Colors.TEXT_MUTED} />
                  </View>
                  {index < timeline.length - 1 && (
                    <View style={[styles.timelineLine, event.active && index < timeline.length - 2 && styles.timelineLineActive]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineLabel, !event.active && { color: Colors.TEXT_MUTED }]}>{event.label}</Text>
                  <Text style={styles.timelineDate}>{event.date}</Text>
                </View>
              </View>
            ))}
          </View>

          <Pressable style={styles.ownButton} onPress={() => setModalVisible(!modalVisible)}>
            <Text style={styles.ownButtonText}>Own this item</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Confetti Rain */}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          {confetti.map((c, i) => (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                left: SCREEN_W / 2 + c.x,
                width: c.w,
                height: c.h,
                borderRadius: 2,
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                opacity: c.anim.interpolate({ inputRange: [0, 0.1, 0.75, 1], outputRange: [0, 1, 1, 0] }),
                transform: [
                  { translateY: c.anim.interpolate({ inputRange: [0, 1], outputRange: [-20, SCREEN_H * 0.7] }) },
                  { translateX: c.anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, c.drift, c.drift * 1.5] }) },
                  { rotate: c.anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${c.rotation}deg`] }) },
                  { scaleX: c.anim.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [1, 0.3, 1, 0.5, 1] }) },
                ],
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG,
  },
  heroContainer: {
    height: 400,
    width: '100%',
    backgroundColor: Colors.BG_ELEVATED,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },

  // Verification Seal
  seal: {
    position: 'absolute',
    top: 55,
    right: 20,
    alignItems: 'center',
  },
  sealOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: Colors.GOLD,
    backgroundColor: 'rgba(253,246,227,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  sealInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.GOLD_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealText: {
    fontSize: 9,
    fontFamily: 'outfit-bold',
    color: Colors.GOLD,
    letterSpacing: 2,
    marginTop: 4,
  },

  // Confetti
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  // Modal
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    width: '80%',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'outfit-medium',
    color: Colors.TEXT,
    backgroundColor: Colors.BG_ELEVATED,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: Colors.BG_ELEVATED,
  },
  buttonConfirm: {
    backgroundColor: Colors.EMERALD,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: Colors.WHITE,
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250,248,244,0.8)',
  },
  productCard: {
    backgroundColor: Colors.BG_CARD,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  brand: {
    fontSize: 14,
    color: Colors.EMERALD,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
    fontFamily: 'outfit-bold',
  },
  title: {
    fontSize: 26,
    color: Colors.TEXT,
    fontFamily: 'outfit-bold',
    lineHeight: 32,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.BORDER,
    marginVertical: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.TEXT_DIM,
    marginBottom: 24,
    fontFamily: 'outfit-regular',
  },
  sectionTitle: {
    fontSize: 11,
    color: Colors.TEXT_MUTED,
    marginBottom: 14,
    fontFamily: 'outfit-bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  detailItem: {
    width: '47%',
    backgroundColor: Colors.BG_ELEVATED,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.TEXT_MUTED,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'outfit-medium',
  },
  detailValue: {
    fontSize: 15,
    color: Colors.TEXT,
    fontFamily: 'outfit-bold',
  },

  // Timeline
  timeline: {
    marginBottom: 24,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineDotCol: {
    width: 32,
    alignItems: 'center',
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.BG_ELEVATED,
    borderWidth: 1.5,
    borderColor: Colors.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotActive: {
    backgroundColor: Colors.EMERALD,
    borderColor: Colors.EMERALD,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.BORDER,
    marginVertical: 2,
  },
  timelineLineActive: {
    backgroundColor: Colors.EMERALD,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 18,
  },
  timelineLabel: {
    fontSize: 14,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
  },
  timelineDate: {
    fontSize: 12,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    marginTop: 2,
  },

  ownButton: {
    backgroundColor: Colors.EMERALD,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 30,
  },
  ownButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: 'outfit-bold',
  },
});
