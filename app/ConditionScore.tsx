import { View, Text, Pressable, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import Colors from "@/constants/Colors";
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ThirdwebStorage } from '@thirdweb-dev/storage';
import Toast from 'react-native-toast-message';
import CryptoJS from 'crypto-js';
const storage = new ThirdwebStorage({
  clientId: process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID,
  gatewayUrls: ['https://ipfs.thirdwebcdn.com/ipfs/'],
  secretKey: process.env.EXPO_PUBLIC_THIRDWEB_SECRET_KEY,
});

const childishDecrpyt = (encrypted: string) => {
  try{
    const reversed = encrypted.split('').reverse().join('');
    const padded = reversed + '=='.slice(0,(4 - (reversed.length % 4))% 4);
    const bytes = CryptoJS.enc.Base64.parse(padded);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  catch(error){
    console.error('Decryption Error:', error);
    throw new Error('Failed to decrypt the product. Please try again.');
  }
};


export default function ConditionScore() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [conditionScore, setConditionScore] = React.useState<number | null>(null); // Store condition score
  const [isEligibleForDonation, setIsEligibleForDonation] = React.useState(false); // Donation eligibility
  const [isEligibleForReselling, setIsEligibleForReselling] = React.useState(false); // Reselling eligibility
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

const decryptedData = childishDecrpyt(data);

      // Validate and sanitize input
      const sanitizedData = decryptedData.trim().replace(/\s/g, '');
      if (!sanitizedData.startsWith('ipfs://')) {
        throw new Error('Invalid IPFS URI format');
      }

      // Extract CID and path
      const ipfsPath = sanitizedData.replace('ipfs://', '');
      const [cid, ...pathParts] = ipfsPath.split('/');

      // Validate CID format
      if (!/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafybe[a-z0-9]+)$/.test(cid)) {
        throw new Error('Invalid IPFS CID');
      }

      const path = pathParts.join('/');
      const gateways = [
        `https://gateway.pinata.cloud/ipfs/${cid}/${path}`, // Pinata gateway
      ];

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

      // Generate condition score
      const score = calculateConditionScore(finalMetadata);
      setConditionScore(score);

      // Determine eligibility for donation and reselling
      setIsEligibleForDonation(score >= 50);
      setIsEligibleForReselling(score >= 80);

      // // Navigate to product page
      // router.push({
      //   pathname: '/Donate',
      //   params: {
      //     scannedProduct: JSON.stringify({
      //       ...finalMetadata,
      //       image: accessibleImageUrl,
      //       conditionScore: score,
      //       // isEligibleForDonation,
      //       manufacturingDate: finalMetadata.manufacturingDate,
      //       material: finalMetadata.material,
      //     })
      //   }
      // });

      setIsEligibleForDonation(score >= 5.0);
      setIsEligibleForReselling(score >= 8.0);
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

  // Function to calculate condition score
  const calculateConditionScore = (metadata: any): number => {
    let score = 0;

    // Weighted scoring based on manufacturing date
    const manufacturingDate = new Date(metadata.manufacturingDate);
    const yearsSinceManufacture = (new Date().getFullYear() - manufacturingDate.getFullYear());
    score += Math.max(0, 100 - yearsSinceManufacture * 10); // Deduct 10 points per year

    // Weighted scoring based on material quality
    const materialQuality = metadata.material.toLowerCase();
    if (materialQuality.includes('cotton') || materialQuality.includes('polyster')) {
      score += 3;
    } else if (materialQuality.includes('synthetic')) {
      score += 1;
    }

    // Ensure score is within range [0, 100]
    return Math.min(100, Math.max(0, score));
  };

  return (
    <ScrollView style={{ backgroundColor: Colors.BLUE }}>
      <View style={styles.scannerContainer}>
        {!isPermissionGranted ? (
          <Pressable onPress={requestPermission} style={styles.permissionButton}>
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
                      <ActivityIndicator size="large" color={Colors.WHITE} />
                      <Text style={styles.loadingText}>Verifying Product...</Text>
                    </View>
                  )}
                </View>
              ) : (
                <Image
                  source={require('@/assets/images/qr.png')}
                  style={styles.qrPlaceholder}
                />
              )}
            </Pressable>
            <Text style={styles.scannerLabel}>Tap to scan QR code</Text>
          </>
        )}
      </View>

      {/* Display condition score */}
      {conditionScore !== null && (
        <View style={styles.conditionScoreContainer}>
          <Text style={styles.conditionScoreText}>Condition Score: {conditionScore}</Text>
          <Text style={styles.eligibilityText}>
            {isEligibleForReselling
              ? "Eligible for Reselling"
              : isEligibleForDonation
              ? "Eligible for Donation"
              : "Not Eligible for Donation or Reselling"}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <ActionButton
          text="Donate"
          isEnabled={isEligibleForDonation}
          onPress={() => router.push("/Donate")}
        />
        <ActionButton
          text="Resell"
          isEnabled={isEligibleForReselling}
          onPress={() => router.push("/marketplace")}
        />
      </View>
    </ScrollView>
  );
}

// Action Button Component
const ActionButton = ({
  text,
  isEnabled,
  onPress,
}: {
  text: string;
  isEnabled: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { opacity: isEnabled ? 1 : 0.5, backgroundColor: isEnabled ? Colors.BLUE : '#ccc' },
      ]}
      onPress={isEnabled ? onPress : undefined}
      disabled={!isEnabled}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.BLUE,
    height: 100,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'outfit-bold',
  },
  scannerContainer: {
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
    marginTop: 60
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
    borderRadius: 15,
  },
  scannerLabel: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: Colors.WHITE,
  },
  actionsContainer: {
    backgroundColor: Colors.WHITE,
    borderRadius: 30,
    marginTop: 100,
    padding: 20,
  },
  actionButton: {
    backgroundColor: Colors.BLUE,
    padding: 20,
    borderRadius: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.DARK,
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  loadingText: {
    color: Colors.WHITE,
    marginTop: 10,
  },
  permissionButton: {
    padding: 20,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
  },
  permissionText: {
    color: Colors.BLUE,
    fontSize: 16,
    textAlign: 'center',
  },
  conditionScoreContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  conditionScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  eligibilityText: {
    fontSize: 16,
    color: Colors.WHITE,
    marginTop: 10,
  },
});