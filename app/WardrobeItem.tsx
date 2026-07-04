import { View, Text, Pressable, ScrollView, StyleSheet, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

function conditionColor(score: number) {
  if (score >= 80) return '#22C55E';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
}

function conditionLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 30) return 'Fair';
  return 'Poor';
}

const PREMIUM_BRANDS = ['Ralph Lauren', 'Nike', 'Gucci', 'Prada', 'Louis Vuitton', 'Burberry', 'Versace'];
const MID_BRANDS = ["Levi's", 'Tommy Hilfiger', 'Calvin Klein', 'Lacoste', 'Adidas'];

function estimateResaleValue(brand: string, condition: number): number {
  const basePrice = PREMIUM_BRANDS.includes(brand) ? 120 : MID_BRANDS.includes(brand) ? 65 : 35;
  const conditionMult = 0.1 + (condition / 100) * 0.85;
  const brandMult = PREMIUM_BRANDS.includes(brand) ? 1.4 : MID_BRANDS.includes(brand) ? 1.1 : 1.0;
  return Math.round(basePrice * conditionMult * brandMult);
}

export default function WardrobeItem() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const item = {
    name: params.name as string,
    brand: params.brand as string,
    category: params.category as string,
    condition: Number(params.condition),
    imageUrl: params.imageUrl as string,
  };

  const canDonate = item.condition >= 50;
  const canResell = item.condition >= 80;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar translucent backgroundColor={Colors.BG} barStyle="dark-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={styles.headerSection}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color={Colors.EMERALD} />
            </Pressable>
            <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.imageCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.brandLabel}>{item.brand}</Text>
            <Text style={styles.nameLabel}>{item.name}</Text>

            <View style={styles.separator} />

            <View style={styles.detailsGrid}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{item.category}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Condition</Text>
                <View style={styles.conditionRow}>
                  <View style={[styles.conditionDot, { backgroundColor: conditionColor(item.condition) }]} />
                  <Text style={[styles.conditionValue, { color: conditionColor(item.condition) }]}>
                    {item.condition} — {conditionLabel(item.condition)}
                  </Text>
                </View>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Verified</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Feather name="check-circle" size={14} color="#22C55E" />
                  <Text style={styles.detailValue}>Authentic</Text>
                </View>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Brand</Text>
                <Text style={styles.detailValue}>{item.brand}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Est. Resale</Text>
                <Text style={[styles.detailValue, { color: Colors.GOLD }]}>${estimateResaleValue(item.brand, item.condition)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                !canDonate && styles.actionBtnDisabled,
                pressed && canDonate && { transform: [{ scale: 0.97 }] },
              ]}
              onPress={canDonate ? () => router.push('/Donate') : undefined}
              disabled={!canDonate}
            >
              <Feather name="heart" size={18} color={canDonate ? Colors.WHITE : '#999'} />
              <Text style={[styles.actionBtnText, !canDonate && { color: '#999' }]}>Donate</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.actionBtnGold,
                !canResell && styles.actionBtnDisabled,
                pressed && canResell && { transform: [{ scale: 0.97 }] },
              ]}
              onPress={canResell ? () => router.push('/(tabs)/marketplace') : undefined}
              disabled={!canResell}
            >
              <Feather name="tag" size={18} color={canResell ? Colors.WHITE : '#999'} />
              <Text style={[styles.actionBtnText, !canResell && { color: '#999' }]}>Resell</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.conditionBtn, pressed && { transform: [{ scale: 0.97 }] }]}
            onPress={() => router.push('/ConditionScore')}
          >
            <Feather name="bar-chart-2" size={18} color={Colors.EMERALD} />
            <Text style={styles.conditionBtnText}>Re-check Condition Score</Text>
          </Pressable>
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
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
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
    fontSize: 18,
    fontFamily: 'outfit-bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  imageCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  infoCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  brandLabel: {
    fontSize: 13,
    fontFamily: 'outfit-bold',
    color: Colors.EMERALD,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nameLabel: {
    fontSize: 22,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.BORDER,
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailBox: {
    width: '47%',
    backgroundColor: Colors.BG_ELEVATED,
    borderRadius: 12,
    padding: 14,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: 'outfit-medium',
    color: Colors.TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  conditionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  conditionValue: {
    fontSize: 14,
    fontFamily: 'outfit-bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  actionBtnGold: {
    backgroundColor: Colors.GOLD,
  },
  actionBtnDisabled: {
    backgroundColor: '#E8E8E8',
  },
  actionBtnText: {
    color: Colors.WHITE,
    fontSize: 15,
    fontFamily: 'outfit-bold',
  },
  conditionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.EMERALD,
    marginBottom: 24,
  },
  conditionBtnText: {
    color: Colors.EMERALD,
    fontSize: 15,
    fontFamily: 'outfit-bold',
  },
});
