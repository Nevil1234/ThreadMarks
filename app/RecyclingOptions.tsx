import { View, Text, Pressable, ScrollView, StyleSheet, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from "@/constants/Colors";
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const RECYCLING_TIPS = [
  { icon: 'scissors', title: 'Upcycle', desc: 'Turn old clothes into rags, tote bags, or quilts.' },
  { icon: 'droplet', title: 'Wash Cold', desc: 'Extend garment life and save energy.' },
  { icon: 'tool', title: 'Repair First', desc: 'Fix zippers and seams before discarding.' },
];

const DROP_OFF_CENTERS = [
  {
    id: '1',
    name: 'GreenThread Textile Recycling',
    address: '245 Eco Drive, Brooklyn, NY',
    accepts: 'All fabrics, shoes, accessories',
    hours: 'Mon–Sat 9am–6pm',
  },
  {
    id: '2',
    name: 'City Fabric Reclaim',
    address: '88 Sustainability Blvd, Manhattan, NY',
    accepts: 'Cotton, denim, polyester',
    hours: 'Mon–Fri 10am–5pm',
  },
  {
    id: '3',
    name: 'ReWear Collection Hub',
    address: '512 Green St, Queens, NY',
    accepts: 'Wearable & non-wearable textiles',
    hours: 'Tue–Sun 8am–7pm',
  },
];

export default function RecyclingOptions() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar translucent backgroundColor={Colors.BG} barStyle="dark-content" />
      <ScrollView style={styles.scroll} contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={styles.headerSection}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color={Colors.EMERALD} />
            </Pressable>
            <Text style={styles.title}>Recycling Options</Text>
            <View style={{ width: 40 }} />
          </View>
          <Text style={styles.subtitle}>
            Give your clothes a sustainable second life
          </Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Before You Recycle</Text>
          <View style={styles.tipsRow}>
            {RECYCLING_TIPS.map((tip, i) => (
              <View key={i} style={styles.tipCard}>
                <View style={styles.tipIcon}>
                  <Feather name={tip.icon as any} size={20} color={Colors.EMERALD} />
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.desc}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Drop-off Locations</Text>
          {DROP_OFF_CENTERS.map((center) => (
            <Pressable
              key={center.id}
              style={({ pressed }) => [styles.centerCard, pressed && { transform: [{ scale: 0.98 }] }]}
              onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(center.address)}`)}
            >
              <View style={styles.centerHeader}>
                <View style={styles.centerIcon}>
                  <Feather name="map-pin" size={18} color={Colors.WHITE} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.centerName}>{center.name}</Text>
                  <Text style={styles.centerAddress}>{center.address}</Text>
                </View>
                <Feather name="external-link" size={16} color={Colors.TEXT_MUTED} />
              </View>
              <View style={styles.centerDetails}>
                <View style={styles.detailChip}>
                  <Feather name="check-circle" size={12} color={Colors.EMERALD} />
                  <Text style={styles.detailText}>{center.accepts}</Text>
                </View>
                <View style={styles.detailChip}>
                  <Feather name="clock" size={12} color={Colors.TEXT_DIM} />
                  <Text style={styles.detailText}>{center.hours}</Text>
                </View>
              </View>
            </Pressable>
          ))}

          <Pressable
            style={({ pressed }) => [styles.conditionBtn, pressed && { transform: [{ scale: 0.97 }] }]}
            onPress={() => router.push('/ConditionScore')}
          >
            <Feather name="bar-chart-2" size={20} color={Colors.WHITE} />
            <Text style={styles.conditionBtnText}>Check Condition Score First</Text>
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
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
    marginBottom: 14,
  },
  tipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  tipCard: {
    flex: 1,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.EMERALD_DIM,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 13,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
    marginBottom: 4,
  },
  tipDesc: {
    fontSize: 11,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    textAlign: 'center',
    lineHeight: 15,
  },
  centerCard: {
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
  centerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  centerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.EMERALD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerName: {
    fontSize: 15,
    fontFamily: 'outfit-bold',
    color: Colors.TEXT,
  },
  centerAddress: {
    fontSize: 13,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
    marginTop: 2,
  },
  centerDetails: {
    gap: 6,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'outfit-regular',
    color: Colors.TEXT_DIM,
  },
  conditionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.EMERALD,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  conditionBtnText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: 'outfit-bold',
  },
});
