import { View, Text, Pressable, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import Colors from "@/constants/Colors";
import { useRouter } from 'expo-router';
import { ThirdwebStorage } from '@thirdweb-dev/storage';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import CryptoJS from 'crypto-js';

const storage = new ThirdwebStorage({
  clientId: process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID,
  gatewayUrls: ['https://ipfs.thirdwebcdn.com/ipfs/'],
  secretKey: process.env.EXPO_PUBLIC_THIRDWEB_SECRET_KEY,
});

// Decryption function
const childishDecrypt = (encrypted: string) => {
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

// Condition score calculation function
const calculateConditionScore = (metadata: any): number => {
  let score = 10;
  const currentDate = new Date();
  try {
    if (metadata.manufacturingDate) {
      const manufactureDate = new Date(metadata.manufacturingDate);
      const ageInYears = (currentDate.getTime() - manufactureDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      score -= Math.min(3, ageInYears * 0.5);
    }
    if (metadata.material) {
      const durableMaterials = ['cotton', 'polyester', 'nylon', 'wool', 'leather'];
      if (durableMaterials.some(m => metadata.material.toLowerCase().includes(m))) {
        score += 1;
      } else {
        score -= 1;
      }
    }
    if (metadata.category) {
      const durableCategories = ['jeans', 'jacket', 'coat', 'sweater'];
      if (durableCategories.some(c => metadata.category.toLowerCase().includes(c))) {
        score += 0.5;
      }
    }
    score = Math.max(0, Math.min(10, score));
    return Number(score.toFixed(1));
  } catch (error) {
    console.error('Error calculating condition score:', error);
    return 5.0;
  }
};

export default function ScanClothing() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const isPermissionGranted = Boolean(permission?.granted);

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

      // Decrypt the QR code data
      const decryptedData = childishDecrypt(data);

      // Validate and sanitize input
      const sanitizedData = decryptedData.trim().replace(/\s/g, '');
      if (!sanitizedData.startsWith('ipfs://')) {
        throw new Error('Invalid IPFS URI format');
      }

      // Extract CID and path
      const ipfsPath = sanitizedData.replace('ipfs://', '');
      const [cid, ...pathParts] = ipfsPath.split('/');
      if (!/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafybe[a-z0-9]+)$/.test(cid)) {
        throw new Error('Invalid IPFS CID');
      }

      const path = pathParts.join('/');
      const gateways = [`https://gateway.pinata.cloud/ipfs/${cid}/${path}`];

      let metadata;
      for (const url of gateways) {
        try {
          console.log('Trying gateway:', url);
          const response = await Promise.race([
            fetch(url),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Gateway timeout')), 5000)
            ),
          ]);
          if (response.ok) {
            metadata = await response.json();
            console.log('Metadata fetched successfully:', metadata);
            break;
          } else {
            console.error(`Gateway ${url} returned status ${response.status}`);
          }
        } catch (error) {
          console.error(`Gateway ${url} failed with error:`, error.message);
        }
      }

      if (!metadata) {
        throw new Error('Failed to fetch metadata from all gateways');
      }

      // Handle metadata
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

      // Resolve image URL
      const resolveImageUrl = (ipfsUrl: string): string[] => {
        const cidAndPath = ipfsUrl.replace('ipfs://', '');
        return [`https://gateway.pinata.cloud/ipfs/${cidAndPath}`];
      };

      const testImage = async (url: string) => {
        try {
          const response = await fetch(url, { method: 'GET' });
          return response.ok;
        } catch {
          return false;
        }
      };

      const imageUrls = resolveImageUrl(finalMetadata.image);
      let accessibleImageUrl = null;

      for (const url of imageUrls) {
        console.log('Testing image URL:', url);
        if (await testImage(url)) {
          accessibleImageUrl = url;
          break;
        }
      }

      if (!accessibleImageUrl) {
        accessibleImageUrl = 'https://via.placeholder.com/150'; // Default placeholder image
      }

      // Calculate condition score
      const conditionScore = calculateConditionScore(finalMetadata);

      // Navigate back to Donate page with scanned product data
      router.push({
        pathname: '/Donate',
        params: {
          scannedProduct: JSON.stringify({
            name: finalMetadata.name,
            brand: finalMetadata.brand,
            image: accessibleImageUrl,
            size: finalMetadata.size,
            material: finalMetadata.material,
            gender: finalMetadata.gender,
            category: finalMetadata.category,
            batchNumber: finalMetadata.batchNumber,
            manufacturingDate: finalMetadata.manufacturingDate,
            description: finalMetadata.description,
            conditionScore,
          }),
        },
      });
    } catch (error) {
      console.error('Scan Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Scan Error',
        text2: error.message.includes('Missing')
          ? `The scanned product is missing required information: ${error.message}`
          : 'Failed to verify the product. Please try again.',
        position: 'bottom',
        visibilityTime: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: Colors.BG }}>
      <View style={styles.scannerContainer}>
        {!isPermissionGranted ? (
          <Pressable onPress={requestPermission} style={styles.permissionButton}>
            <Feather name="camera" size={28} color={Colors.EMERALD} />
            <Text style={styles.permissionText}>Allow Camera Access</Text>
          </Pressable>
        ) : (
          <>
            <Pressable onPress={() => setShowCamera(!showCamera)}>
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
                      <Text style={styles.loadingText}>Verifying Product...</Text>
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
            <Text style={styles.scannerLabel}>Tap to scan QR code</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scannerContainer: {
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  cameraWrapper: {
    position: 'relative',
  },
  camera: {
    width: 200,
    height: 200,
    borderRadius: 15,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: Colors.BG_CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER,
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
  scannerLabel: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'outfit-medium',
    color: Colors.TEXT_DIM,
  },
  permissionButton: {
    padding: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    alignItems: 'center',
  },
  permissionText: {
    color: Colors.EMERALD,
    fontSize: 15,
    fontFamily: 'outfit-bold',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(250,248,244,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  loadingText: {
    color: Colors.EMERALD,
    marginTop: 10,
    fontFamily: 'outfit-medium',
    fontSize: 14,
  },
});