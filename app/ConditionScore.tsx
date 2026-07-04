import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import Colors from "@/constants/Colors";
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import CryptoJS from 'crypto-js';

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

const calculateConditionScore = (metadata: any): number => {
  let score = 0;
  const manufacturingDate = new Date(metadata.manufacturingDate);
  const yearsSinceManufacture = new Date().getFullYear() - manufacturingDate.getFullYear();
  score += Math.max(0, 100 - yearsSinceManufacture * 10);

  const material = metadata.material.toLowerCase();
  if (material.includes('cotton') || material.includes('polyster')) {
    score += 3;
  } else if (material.includes('synthetic')) {
    score += 1;
  }

  return Math.min(100, Math.max(0, score));
};

function getScoreColor(score: number) {
  if (score >= 80) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 30) return 'Fair';
  return 'Poor';
}

export default function ConditionScore() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [conditionScore, setConditionScore] = React.useState<number | null>(null);
  const isPermissionGranted = Boolean(permission?.granted);

  const isEligibleForDonation = conditionScore !== null && conditionScore >= 50;
  const isEligibleForReselling = conditionScore !== null && conditionScore >= 80;

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
        material: metadata.properties?.material || 'N/A',
        manufacturingDate: metadata.properties?.manufacturing_date || 'N/A',
      };

      const score = calculateConditionScore(finalMetadata);
      setConditionScore(score);
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar translucent backgroundColor={Colors.BG} barStyle="dark-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={styles.headerSection}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color={Colors.EMERALD} />
            </Pressable>
            <Text style={styles.title}>Condition Score</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.scanCard}>
            {!isPermissionGranted ? (
              <Pressable style={styles.permissionBtn} onPress={requestPermission}>
                <Feather name="camera" size={28} color={Colors.EMERALD} />
                <Text style={styles.permissionText}>Allow Camera Access</Text>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.scannerBox, pressed && { transform: [{ scale: 0.98 }] }]}
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
                        <Text style={styles.loadingText}>Analyzing...</Text>
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
            <Text style={styles.scanHint}>Scan to check your item's condition</Text>
          </View>
        </View>

        <View style={styles.body}>
          {conditionScore !== null ? (
            <>
              <View style={styles.scoreCard}>
                <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(conditionScore) }]}>
                  <Text style={styles.scoreNumber}>{conditionScore}</Text>
                </View>
                <Text style={[styles.scoreLabel, { color: getScoreColor(conditionScore) }]}>
                  {getScoreLabel(conditionScore)}
                </Text>
                <Text style={styles.scoreDesc}>
                  {isEligibleForReselling
                    ? 'Your item is in great shape — eligible for resale.'
                    : isEligibleForDonation
                    ? 'Good condition — eligible for donation.'
                    : 'This item has seen better days.'}
                </Text>
              </View>

              <View style={styles.actions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    !isEligibleForDonation && styles.actionBtnDisabled,
                    pressed && isEligibleForDonation && { transform: [{ scale: 0.97 }] },
                  ]}
                  onPress={isEligibleForDonation ? () => router.push('/Donate') : undefined}
                  disabled={!isEligibleForDonation}
                >
                  <Feather name="gift" size={20} color={isEligibleForDonation ? Colors.WHITE : '#999'} />
                  <Text style={[styles.actionBtnText, !isEligibleForDonation && { color: '#999' }]}>Donate</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.actionBtnResell,
                    !isEligibleForReselling && styles.actionBtnDisabled,
                    pressed && isEligibleForReselling && { transform: [{ scale: 0.97 }] },
                  ]}
                  onPress={isEligibleForReselling ? () => router.push('/(tabs)/marketplace') : undefined}
                  disabled={!isEligibleForReselling}
                >
                  <Feather name="tag" size={20} color={isEligibleForReselling ? Colors.WHITE : '#999'} />
                  <Text style={[styles.actionBtnText, !isEligibleForReselling && { color: '#999' }]}>Resell</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Feather name="bar-chart-2" size={48} color={Colors.BORDER} />
              <Text style={styles.emptyTitle}>No Score Yet</Text>
              <Text style={styles.emptyDesc}>Scan a product QR code above to see its condition score</Text>
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
    paddingBottom: 28,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
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
  scanCard: {
    marginHorizontal: 24,
    backgroundColor: Colors.BG_ELEVATED,
    borderRadius: 24,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  scannerBox: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: Colors.BG_CARD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  cameraWrapper: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  camera: {
    width: 200,
    height: 200,
    borderRadius: 20,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
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
    fontSize: 13,
    fontFamily: 'outfit-medium',
    marginTop: 14,
  },
  permissionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: Colors.BG_CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  permissionText: {
    color: Colors.EMERALD,
    fontSize: 15,
    fontFamily: 'outfit-bold',
    marginTop: 8,
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
    marginTop: 10,
    fontFamily: 'outfit-medium',
    fontSize: 14,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  scoreCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  scoreBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scoreNumber: {
    color: Colors.WHITE,
    fontSize: 28,
    fontFamily: 'outfit-bold',
  },
  scoreLabel: {
    fontSize: 20,
    fontFamily: 'outfit-bold',
    marginBottom: 6,
  },
  scoreDesc: {
    fontSize: 14,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.EMERALD,
    borderRadius: 16,
    paddingVertical: 16,
  },
  actionBtnResell: {
    backgroundColor: Colors.GOLD,
  },
  actionBtnDisabled: {
    backgroundColor: '#E8E8E8',
  },
  actionBtnText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: 'outfit-bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
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
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});
