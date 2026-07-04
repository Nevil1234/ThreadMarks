import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useContext, useEffect } from 'react';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import Colors from "@/constants/Colors";
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import CryptoJS from 'crypto-js';
import { UserDetailContext } from '@/context/UserDetailContext';

const childishDecrpyt = (encrypted: string) => {
  try {
    const reversed = encrypted.split('').reverse().join('');
    const padded = reversed + '=='.slice(0, (4 - (reversed.length % 4)) % 4);
    const bytes = CryptoJS.enc.Base64.parse(padded);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption Error:', error);
    throw new Error('Failed to decrypt the product. Please try again.');
  }
};

export default function Home() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const isPermissionGranted = Boolean(permission?.granted);
  const { userDetail } = useContext(UserDetailContext);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showCamera) {
      timer = setTimeout(() => setShowCamera(false), 25000);
    }
    return () => clearTimeout(timer);
  }, [showCamera]);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    try {
      setLoading(true);
      setShowCamera(false);

      const decryptedData = childishDecrpyt(data);
      const sanitizedData = decryptedData.trim().replace(/\s/g, '');
      if (!sanitizedData.startsWith('ipfs://')) {
        throw new Error('Invalid IPFS URI format');
      }

      const ipfsPath = sanitizedData.replace('ipfs://', '');
      const [cid, ...pathParts] = ipfsPath.split('/');

      if (!/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafybe[a-z0-9]+)$/.test(cid)) {
        throw new Error('Invalid IPFS CID');
      }

      const path = pathParts.join('/');
      const url = `https://gateway.pinata.cloud/ipfs/${cid}/${path}`;

      const response = await Promise.race([
        fetch(url),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Gateway timeout')), 5000)),
      ]);

      if (!response.ok) throw new Error('Failed to fetch metadata');
      const metadata = await response.json();

      const finalMetadata = {
        name: metadata.name || 'Unknown',
        brand: metadata.properties?.brand || 'Unknown',
        image: metadata.image || '',
        size: metadata.properties?.size || 'N/A',
        material: metadata.properties?.material || 'N/A',
        gender: metadata.properties?.gender || 'N/A',
        category: metadata.properties?.category || 'N/A',
        batchNumber: metadata.properties?.batch_number || 'N/A',
        manufacturingDate: metadata.properties?.manufacturing_date || 'N/A',
        description: metadata.description || 'No description available',
      };

      const cidAndPath = finalMetadata.image.replace('ipfs://', '');
      let accessibleImageUrl = `https://gateway.pinata.cloud/ipfs/${cidAndPath}`;

      try {
        const imgResp = await fetch(accessibleImageUrl, { method: 'GET' });
        if (!imgResp.ok) accessibleImageUrl = 'https://via.placeholder.com/150';
      } catch {
        accessibleImageUrl = 'https://via.placeholder.com/150';
      }

      router.push({
        pathname: '/product',
        params: {
          name: finalMetadata.name,
          brand: finalMetadata.brand,
          size: finalMetadata.size,
          category: finalMetadata.category,
          material: finalMetadata.material,
          manufacturingDate: finalMetadata.manufacturingDate,
          gender: finalMetadata.gender,
          batchNumber: finalMetadata.batchNumber,
          image: accessibleImageUrl,
          description: finalMetadata.description,
        },
      });
    } catch (error) {
      console.error('Scan Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Scan Error',
        text2: 'Failed to verify the product. Please try again.',
        position: 'bottom',
        visibilityTime: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const greetingName = userDetail?.name ? userDetail.name.split(' ')[0] : 'there';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar translucent backgroundColor={Colors.BG} barStyle="dark-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={{ flexGrow: 1 }} bounces={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>THREADMARK</Text>
            <Text style={styles.brandTag}>Authenticate & Protect</Text>
          </View>
          <Pressable style={styles.bellBtn}>
            <Feather name="bell" size={18} color={Colors.EMERALD} />
            <View style={styles.bellDot} />
          </Pressable>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>Hello, {greetingName}</Text>

        {/* Scan Section */}
        <View style={styles.scanSection}>
          <View style={styles.scanCardOuter}>
            <View style={styles.scanCard}>
              <View style={styles.scanCornerTL} />
              <View style={styles.scanCornerTR} />
              <View style={styles.scanCornerBL} />
              <View style={styles.scanCornerBR} />

              {!isPermissionGranted ? (
                <Pressable style={styles.permissionBtn} onPress={requestPermission}>
                  <Feather name="camera" size={32} color={Colors.EMERALD} />
                  <Text style={styles.permissionText}>Enable Camera</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.scanTouchable, pressed && { opacity: 0.8 }]}
                  onPress={() => setShowCamera(!showCamera)}
                >
                  {showCamera ? (
                    <View style={styles.cameraWrapper}>
                      <CameraView
                        style={styles.camera}
                        onBarcodeScanned={loading ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                      />
                      {loading && (
                        <View style={styles.loadingOverlay}>
                          <ActivityIndicator size="large" color={Colors.EMERALD} />
                          <Text style={styles.loadingText}>Verifying...</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.qrPlaceholder}>
                      <View style={styles.qrIconBox}>
                        <Feather name="maximize" size={56} color={Colors.EMERALD} />
                        <View style={styles.qrShieldBadge}>
                          <Feather name="shield" size={18} color={Colors.WHITE} />
                        </View>
                      </View>
                      <Text style={styles.qrLabel}>Scan QR Code</Text>
                    </View>
                  )}
                </Pressable>
              )}
            </View>
          </View>
          <Text style={styles.scanHint}>TAP TO SCAN & VERIFY</Text>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustRow}>
          <View style={styles.trustBadge}>
            <Feather name="shield" size={13} color={Colors.EMERALD} />
            <Text style={styles.trustText}>Blockchain Verified</Text>
          </View>
          <View style={styles.trustBadge}>
            <Feather name="lock" size={13} color={Colors.GOLD} />
            <Text style={styles.trustText}>Encrypted</Text>
          </View>
          <View style={styles.trustBadge}>
            <Feather name="check-circle" size={13} color={Colors.EMERALD} />
            <Text style={styles.trustText}>Authentic</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>

          <ActionCard
            icon="play"
            text="Demo Product Scan"
            sub="Preview the verification experience"
            accent={Colors.GOLD}
            onPress={() => router.push({
              pathname: '/product',
              params: {
                name: 'Classic Oxford Shirt',
                brand: 'Ralph Lauren',
                size: 'M',
                category: 'Shirts',
                material: 'Cotton',
                manufacturingDate: '2024-03-15',
                gender: 'Unisex',
                batchNumber: 'RL-2024-0847',
                image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
                description: 'A premium quality oxford shirt crafted from 100% organic cotton.',
              },
            })}
          />
          <ActionCard
            icon="bar-chart-2"
            text="Condition Score"
            sub="Assess your item's market value"
            accent={Colors.EMERALD}
            onPress={() => router.push("/ConditionScore")}
          />
          <ActionCard
            icon="refresh-cw"
            text="Recycling Options"
            sub="Sustainable disposal nearby"
            accent={Colors.EMERALD}
            onPress={() => router.push("/RecyclingOptions")}
          />
          <ActionCard
            icon="heart"
            text="Donate"
            sub="Give your clothes a second life"
            accent={Colors.EMERALD}
            onPress={() => router.push("/Donate")}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({ icon, text, sub, accent, onPress }: { icon: string; text: string; sub: string; accent: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}
      onPress={onPress}
    >
      <View style={[styles.actionIconWrap, { backgroundColor: accent === Colors.GOLD ? Colors.GOLD_DIM : Colors.EMERALD_DIM }]}>
        <Feather name={icon as any} size={18} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{text}</Text>
        <Text style={styles.actionSub}>{sub}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={Colors.TEXT_MUTED} />
    </Pressable>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  brandName: {
    color: Colors.TEXT,
    fontSize: 22,
    fontFamily: 'outfit-bold',
    letterSpacing: 3,
  },
  brandTag: {
    color: Colors.TEXT_MUTED,
    fontSize: 11,
    fontFamily: 'outfit-medium',
    letterSpacing: 1,
    marginTop: 2,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.BG_CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  bellDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.GOLD,
  },
  greeting: {
    color: Colors.TEXT_DIM,
    fontSize: 16,
    fontFamily: 'outfit-regular',
    paddingHorizontal: 24,
    marginTop: 28,
  },
  scanSection: {
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 24,
  },
  scanCardOuter: {
    padding: 16,
    borderRadius: 32,
    backgroundColor: Colors.BG_ELEVATED,
  },
  scanCard: {
    width: 210,
    height: 210,
    borderRadius: 24,
    backgroundColor: Colors.BG_CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    overflow: 'visible',
  },
  scanCornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 26,
    height: 26,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.EMERALD,
    borderTopLeftRadius: 12,
  },
  scanCornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 26,
    height: 26,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.EMERALD,
    borderTopRightRadius: 12,
  },
  scanCornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 26,
    height: 26,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.EMERALD,
    borderBottomLeftRadius: 12,
  },
  scanCornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.EMERALD,
    borderBottomRightRadius: 12,
  },
  scanTouchable: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraWrapper: {
    width: 190,
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
  },
  camera: {
    width: 190,
    height: 190,
  },
  qrPlaceholder: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  qrShieldBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.EMERALD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.BG_CARD,
  },
  qrLabel: {
    color: Colors.TEXT_MUTED,
    fontSize: 12,
    fontFamily: 'outfit-medium',
    marginTop: 14,
    letterSpacing: 0.5,
  },
  scanHint: {
    color: Colors.TEXT_MUTED,
    fontSize: 11,
    fontFamily: 'outfit-bold',
    letterSpacing: 2.5,
    marginTop: 18,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250,248,244,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  loadingText: {
    color: Colors.EMERALD,
    marginTop: 12,
    fontFamily: 'outfit-medium',
    fontSize: 14,
  },
  permissionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 190,
    height: 190,
  },
  permissionText: {
    color: Colors.EMERALD,
    fontSize: 14,
    fontFamily: 'outfit-bold',
    marginTop: 10,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.BG_CARD,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  trustText: {
    color: Colors.TEXT_DIM,
    fontSize: 10,
    fontFamily: 'outfit-medium',
    letterSpacing: 0.3,
  },
  actionsSection: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT_MUTED,
    letterSpacing: 2.5,
    marginBottom: 16,
  },
  actionCard: {
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
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionTitle: {
    fontSize: 15,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 12,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
  },
});
