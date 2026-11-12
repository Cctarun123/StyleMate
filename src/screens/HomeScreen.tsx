import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  AccessibilityInfo,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { filterProductsByOutfit } from '../utils/outfit';
import { surface, theme, sheet } from '../utils/theme';
import { SectionHeader } from '../components/SectionHeader';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { useCountdown, Countdown } from '../hooks/useCountdown';
import { OutfitCategory, Product } from '../types';
import {
  BRAND,
  HERO,
  COUNTDOWN,
  COLLECTION,
  PREVIOUS,
  CAMPAIGN,
  MINDSET,
  NEWSLETTER,
  FOOTER,
  CAMPAIGN_IMAGES,
} from '../constants/brand';

const WAITLIST_STORAGE_KEY = '@nocturn:waitlist';

type Weather = {
  temperature: number;
  condition: string;
};

type HomeNavigationParamList = {
  ProductDetail: { id: number };
};

type HomeTabParamList = {
  Home: undefined;
  Explore: undefined;
  Wardrobe: undefined;
};

type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<HomeTabParamList>,
  NativeStackNavigationProp<HomeNavigationParamList>
>;

const LATITUDE = 51.5074;
const LONGITUDE = -0.1278;
const WEATHER_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weathercode`;

function weatherCondition(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code === 85 || code === 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear';
}

function outfitForTemperature(temperature: number): OutfitCategory {
  if (temperature < 10) return 'jackets';
  if (temperature > 22) return 'light';
  return 'casual';
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const scrollViewRef = useRef<any>(null);
  const newsletterScrollY = useRef<number>(0);
  const { width: screenWidth } = useWindowDimensions();
  const reduceMotionRef = useRef<boolean | null>(null);

  const sectionKeys = [
    'hero',
    'weather',
    'countdown',
    'collection',
    'previous',
    'campaign',
    'mindset',
    'newsletter',
    'footer',
  ];

  const [anims] = useState<Record<string, { opacity: Animated.Value; y: Animated.Value }>>(
    () =>
      Object.fromEntries(
        sectionKeys.map((k) => [k, { opacity: new Animated.Value(0), y: new Animated.Value(24) }])
      )
  );

  const fadeIn = useCallback(
    (key: string) => {
      const a = anims[key];
      if (reduceMotionRef.current) {
        a.opacity.setValue(1);
        a.y.setValue(0);
        return;
      }
      Animated.parallel([
        Animated.timing(a.opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(a.y, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    },
    [anims]
  );

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotionRef.current = enabled;
    });
  }, []);

  const sectionLayout = useCallback(
    (key: string) => {
      return (e: any) => {
        fadeIn(key);
        if (key === 'newsletter') {
          newsletterScrollY.current = e.nativeEvent.layout.y;
        }
      };
    },
    [fadeIn]
  );

  const scrollToNewsletter = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: newsletterScrollY.current, animated: true });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, []);

  // ---------- Products & weather (existing logic, untouched) ----------
  const {
    products,
    loading: productsLoading,
    refreshing: productsRefreshing,
    error: productsError,
    refresh: refreshProducts,
  } = useProducts();
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const res = await fetch(WEATHER_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const current = data.current;
      setWeather({
        temperature: Math.round(current.temperature_2m),
        condition: weatherCondition(current.weathercode),
      });
    } catch (error) {
      setWeatherError(error instanceof Error ? error.message : 'Failed to load weather.');
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const onRefresh = useCallback(async () => {
    await Promise.all([fetchWeather(), refreshProducts()]);
  }, [fetchWeather, refreshProducts]);

  const category: OutfitCategory = weather ? outfitForTemperature(weather.temperature) : 'casual';
  const suggested = filterProductsByOutfit(products, category);
  const drop: Countdown = useCountdown();

  // ---------- Newsletter state ----------
  const [newsletter, setNewsletter] = useState<{
    email: string;
    consent: boolean;
    status: 'idle' | 'saving' | 'success' | 'error';
    errorMessage: string | null;
  }>({
    email: '',
    consent: false,
    status: 'idle',
    errorMessage: null,
  });

  const handleNewsletterSubmit = useCallback(async () => {
    setNewsletter((prev) => ({ ...prev, errorMessage: null, status: 'idle' }));

    if (!EMAIL_REGEX.test(newsletter.email)) {
      setNewsletter((prev) => ({ ...prev, status: 'error', errorMessage: 'Enter a valid email address.' }));
      return;
    }
    if (!newsletter.consent) {
      setNewsletter((prev) => ({ ...prev, status: 'error', errorMessage: 'You must consent to receive drop updates.' }));
      return;
    }

    setNewsletter((prev) => ({ ...prev, status: 'saving' }));
    try {
      const existing = await AsyncStorage.getItem(WAITLIST_STORAGE_KEY);
      const list = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(list)) {
        throw new Error('Invalid waitlist storage.');
      }
      list.push(newsletter.email);
      await AsyncStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(list));
      setNewsletter((prev) => ({ ...prev, status: 'success' }));
    } catch {
      setNewsletter((prev) => ({ ...prev, status: 'error', errorMessage: 'Could not save your email. Try again.' }));
    }
  }, [newsletter.email, newsletter.consent]);

  const heroFontSize = Math.min(screenWidth * 0.2, 88);
  const isNarrow = screenWidth < 400;

  return (
    <ScrollView
      ref={scrollViewRef}
      style={sheet.page()}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl refreshing={weatherLoading || productsRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Announcement bar */}
      <AnnouncementBar />

      {/* ---------- HERO ---------- */}
      <View style={[s.section, s.hero]} onLayout={sectionLayout('hero')}>
        <AppText variant="mono" color={theme.colors.accent} style={s.heroLabel}>
          {HERO.label}
        </AppText>

        <View style={s.heroLines}>
          <AppText
            variant="heading"
            color={theme.colors.text}
            style={{ fontSize: heroFontSize, lineHeight: heroFontSize }}
          >
            {HERO.lines[0]}
          </AppText>
          <AppText
            variant="heading"
            color={theme.colors.accent}
            style={{ fontSize: heroFontSize, lineHeight: heroFontSize }}
          >
            {HERO.lines[1]}
          </AppText>
        </View>

        <View style={s.stampRow}>
          <AppText
            variant="label"
            color={theme.colors.accent}
            style={[s.stampText, { transform: [{ rotate: '-6deg' }] }]}
          >
            {HERO.stamp}
          </AppText>
        </View>

        <View style={s.heroSubLines}>
          <AppText variant="body" color={theme.colors.subtext} style={s.subLine}>
            {HERO.subLines[0]}
          </AppText>
          <AppText variant="body" color={theme.colors.subtext} style={s.subLine}>
            {HERO.subLines[1]}
          </AppText>
        </View>

        <View style={s.heroImageRow}>
          {products.slice(0, 3).map((p) => (
            <View key={p.id} style={s.heroImageCard}>
              <Image source={{ uri: p.image }} style={s.heroImage} resizeMode="cover" />
              <AppText variant="label" color={theme.colors.subtext} style={s.heroImageCaption}>
                AFTERHOURS / LONDON
              </AppText>
            </View>
          ))}
        </View>

        <View style={s.heroButtons}>
          <Button
            title={HERO.buttons.primary}
            onPress={() => navigation.navigate('Explore')}
            variant="primary"
            fullWidth
          />
          <Button
            title={HERO.buttons.secondary}
            onPress={scrollToNewsletter}
            variant="outline"
            fullWidth
          />
        </View>
      </View>

      {/* ---------- WEATHER STRIP ---------- */}
      <View style={[s.section, s.weatherSection]} onLayout={sectionLayout('weather')}>
        <View style={[surface, s.weatherRow]}>
          <AppText variant="label" color={theme.colors.text} style={s.weatherLabel}>
            TONIGHT / TIRUPATI
          </AppText>
          <AppText variant="heading" color={theme.colors.text} style={s.weatherTemp}>
            {weather != null ? `${weather.temperature}°` : '—'}
          </AppText>
          {weatherLoading ? (
            <AppText variant="label" color={theme.colors.accent} style={s.weatherWear}>
              Loading&hellip;
            </AppText>
          ) : weatherError ? (
            <AppText variant="label" color={theme.colors.accent} style={s.weatherWear}>
              {weatherError}
            </AppText>
          ) : (
            <>
              <AppText variant="label" color={theme.colors.subtext} style={s.weatherWear}>
                WEAR:
              </AppText>
              <AppText variant="heading" color={theme.colors.text} style={s.weatherOutfit}>
                {category.toUpperCase()}
              </AppText>
              <AppText variant="heading" color={theme.colors.accent} style={s.weatherPeriod}>
                .
              </AppText>
            </>
          )}
        </View>

        <SectionHeader label="01 / SUGGESTED" heading="SUGGESTED FOR TODAY" />

        {productsError && (
          <AppText variant="label" color={theme.colors.accent} style={s.error}>
            Products: {productsError}
          </AppText>
        )}

        {productsLoading ? (
          <View style={sheet.center()}>
            <ActivityIndicator size="large" color={theme.colors.text} />
          </View>
        ) : suggested.length === 0 ? (
          <AppText variant="label" color={theme.colors.subtext} style={s.empty}>
            NOTHING SUGGESTED.
          </AppText>
        ) : (
          <FlatList
            horizontal
            data={suggested}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }: { item: Product }) => (
              <View style={s.cardWrap} key={item.id}>
                <ProductCard
                  item={item}
                  onPress={(id: number) => navigation.navigate('ProductDetail', { id })}
                />
              </View>
            )}
            ItemSeparatorComponent={() => <View style={s.separator} />}
            contentContainerStyle={s.listContent}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      {/* ---------- COUNTDOWN ---------- */}
      <View style={[surface, s.section, s.countdownSection]} onLayout={sectionLayout('countdown')}>
        <View style={s.countdownHeader}>
          <View style={s.dropLabelRow}>
            <View style={s.dot} />
            <AppText variant="label">{COUNTDOWN.label}</AppText>
          </View>
          <AppText variant="heading" style={s.countdownHeading}>
            {COUNTDOWN.heading}
          </AppText>
        </View>
        <View style={s.countdownBoxes}>
          {[
            { label: 'DAYS', value: String(drop.days).padStart(2, '0') },
            { label: 'HOURS', value: String(drop.hours).padStart(2, '0') },
            { label: 'MINUTES', value: String(drop.minutes).padStart(2, '0') },
            { label: 'SECONDS', value: String(drop.seconds).padStart(2, '0') },
          ].map((box) => (
            <View key={box.label} style={s.countdownBox}>
              <AppText variant="heading" style={s.countdownNumeral}>
                {box.value}
              </AppText>
              <AppText variant="label" style={s.countdownBoxLabel}>
                {box.label}
              </AppText>
            </View>
          ))}
        </View>
        <Button
          title={COUNTDOWN.link}
          onPress={scrollToNewsletter}
          variant="outline"
          fullWidth
        />
      </View>

      {/* ---------- COLLECTION ---------- */}
      <View style={[s.section, s.collectionSection]} onLayout={sectionLayout('collection')}>
        <SectionHeader label={COLLECTION.label} heading={COLLECTION.heading} />
        <AppText variant="body" color={theme.colors.subtext} style={s.collectionDesc}>
          {COLLECTION.description}
        </AppText>
        <Button
          title={COLLECTION.link}
          onPress={() => navigation.navigate('Explore')}
          variant="outline"
          fullWidth
        />
        <AppText variant="label" color={theme.colors.accent} style={s.collectionBadge}>
          DROP / 010
        </AppText>
        <View style={s.collectionGrid}>
          {products.slice(0, 4).map((item) => (
            <View key={item.id} style={s.collectionCard}>
              <ProductCard
                item={item}
                onPress={(id: number) => navigation.navigate('ProductDetail', { id })}
              />
            </View>
          ))}
        </View>
      </View>

      {/* ---------- PREVIOUS CHAPTER ---------- */}
      <View style={[s.section, s.previousSection]} onLayout={sectionLayout('previous')}>
        <View style={s.previousDivider} />
        <AppText variant="label" style={s.previousLabel}>
          {PREVIOUS.label}
        </AppText>
        <View style={s.previousItems}>
          {PREVIOUS.items.map((item, i) => (
            <AppText key={i} variant="label" style={s.previousItem}>
              {item.replace(' — SOLD OUT', '')}
              <AppText variant="label" color={theme.colors.accent} style={s.previousSoldOut}>
                — SOLD OUT
              </AppText>
            </AppText>
          ))}
        </View>
        <View style={s.previousLinesRow}>
          <AppText variant="label" style={s.previousLine}>
            {PREVIOUS.lines[0]}
          </AppText>
          <AppText variant="label" style={s.previousLine}>
            {PREVIOUS.lines[1]}
          </AppText>
        </View>
      </View>

      {/* ---------- CAMPAIGN ---------- */}
      <View style={[s.section, s.campaignSection]} onLayout={sectionLayout('campaign')}>
        <SectionHeader label={CAMPAIGN.label} heading={CAMPAIGN.heading} />
        <View style={s.campaignSide}>
          <AppText variant="label" color={theme.colors.subtext} style={s.campaignSideText}>
            {CAMPAIGN.sideText}
          </AppText>
          <AppText variant="label" color={theme.colors.subtext} style={s.campaignCaption}>
            {CAMPAIGN.caption}
          </AppText>
        </View>
        <View style={s.campaignLandscapeWrap}>
          <Image source={{ uri: CAMPAIGN_IMAGES.landscape }} style={s.campaignLandscape} resizeMode="cover" />
          <View style={s.campaignOverlay}>
            <AppText variant="heading" color={theme.colors.text} style={s.campaignOverlayText}>
              {CAMPAIGN.overlay}
            </AppText>
            <AppText variant="heading" color={theme.colors.accent} style={s.campaignArrow}>
              ↗
            </AppText>
          </View>
        </View>
        <View style={s.campaignPortraitWrap}>
          <Image source={{ uri: CAMPAIGN_IMAGES.portrait }} style={s.campaignPortrait} resizeMode="cover" />
          <View style={s.campaignPortraitCap}>
            <AppText variant="label" color={theme.colors.subtext} style={s.campaignSecondCaption}>
              {CAMPAIGN.secondCaption}
            </AppText>
          </View>
          <AppText variant="label" color={theme.colors.subtext} style={s.campaignLine}>
            {CAMPAIGN.lines[0]}
          </AppText>
          <AppText variant="label" color={theme.colors.subtext} style={s.campaignLine}>
            {CAMPAIGN.lines[1]}
          </AppText>
        </View>
        <AppText variant="label" color={theme.colors.subtext} style={s.campaignFooterLine}>
          {CAMPAIGN.footerLine}
        </AppText>
        <Button
          title={CAMPAIGN.link}
          onPress={() => navigation.navigate('Explore')}
          variant="outline"
          fullWidth
        />
      </View>

      {/* ---------- MINDSET ---------- */}
      <View style={[s.section, s.mindsetSection]} onLayout={sectionLayout('mindset')}>
        <AppText variant="label" style={s.mindsetLabel}>
          {MINDSET.label}
        </AppText>
        <View style={s.mindsetHeading}>
          <AppText variant="heading" style={s.mindsetHeadingLine}>
            {MINDSET.headingLines[0]}
          </AppText>
          <AppText variant="heading" style={s.mindsetHeadingLineMuted}>
            {MINDSET.headingLines[1]}
          </AppText>
        </View>
        <View style={s.mindsetPlus}>
          <AppText variant="heading" color={theme.colors.accent} style={s.mindsetPlusText}>
            +
          </AppText>
        </View>
        <AppText variant="body" color={theme.colors.subtext} style={s.mindsetParagraph}>
          {MINDSET.paragraph}
        </AppText>
        {MINDSET.statements.map((stmt, i) => (
          <View key={i} style={s.statementRow}>
            <AppText variant="heading" color={theme.colors.accent} style={s.statementNumber}>
              {String(i + 1)}
            </AppText>
            <View style={s.statementContent}>
              <AppText variant="heading" style={s.statementHeading}>
                {stmt.heading}
              </AppText>
              <AppText variant="body" color={theme.colors.subtext} style={s.statementDescription}>
                {stmt.description}
              </AppText>
            </View>
            {i < MINDSET.statements.length - 1 && <View style={s.statementDivider} />}
          </View>
        ))}
      </View>

      {/* ---------- NEWSLETTER ---------- */}
      <View
        style={[s.newsletterSection, { backgroundColor: theme.colors.accent }]}
        onLayout={sectionLayout('newsletter')}
      >
        <AppText variant="label" color={theme.colors.bg} style={s.newsletterLabel}>
          {NEWSLETTER.label}
        </AppText>
        <View style={s.newsletterHeading}>
          <AppText
            variant="heading"
            color={theme.colors.bg}
            style={{ fontSize: Math.min(96, screenWidth * 0.85) }}
          >
            {NEWSLETTER.headingLines[0]}
          </AppText>
          <AppText
            variant="heading"
            color={theme.colors.text}
            style={{ fontSize: Math.min(96, screenWidth * 0.85) }}
          >
            {NEWSLETTER.headingLines[1]}
          </AppText>
        </View>
        {NEWSLETTER.textLines.map((line, i) => (
          <AppText
            key={i}
            variant="body"
            color={theme.colors.bg}
            style={{ ...s.newsletterText, textAlign: 'center' }}
          >
            {line}
          </AppText>
        ))}
        <AppText variant="label" color={theme.colors.bg} style={s.newsletterPrompt}>
          {NEWSLETTER.prompt}
        </AppText>
        <View style={s.newsletterInputWrap}>
          <TextInput
            style={s.newsletterInput}
            value={newsletter.email}
            onChangeText={(t) =>
              setNewsletter((prev) => ({ ...prev, email: t, errorMessage: null, status: 'idle' }))
            }
            placeholder={NEWSLETTER.placeholder}
            placeholderTextColor="rgba(0,0,0,0.5)"
          />
          <Pressable style={s.newsletterSubmit} onPress={handleNewsletterSubmit}>
            <AppText variant="mono" color={theme.colors.bg} style={s.newsletterSubmitText}>
              ↗
            </AppText>
          </Pressable>
        </View>
        <Pressable
          style={s.newsletterConsent}
          onPress={() =>
            setNewsletter((prev) => ({ ...prev, consent: !prev.consent, errorMessage: null, status: 'idle' }))
          }
        >
          <View style={s.checkbox} />
          <AppText variant="label" color={theme.colors.bg}>
            {NEWSLETTER.consent}
          </AppText>
        </Pressable>
        {newsletter.status === 'error' && (
          <AppText variant="label" color={theme.colors.bg} style={s.newsletterError}>
            {newsletter.errorMessage}
          </AppText>
        )}
        {newsletter.status === 'success' && (
          <AppText variant="label" color={theme.colors.bg} style={[s.newsletterSuccess, { fontWeight: 'bold' }]}>
            YOU'RE ON THE LIST.
          </AppText>
        )}
        <AppText variant="label" color={theme.colors.bg} style={s.newsletterFooter}>
          {NEWSLETTER.footer}
        </AppText>
      </View>

      {/* ---------- FOOTER ---------- */}
      <View style={[s.section, s.footerSection]} onLayout={sectionLayout('footer')}>
        <View style={s.footerColumns}>
          <View style={[s.footerColumn, isNarrow && { width: '100%' }]}>
            <AppText variant="label" color={theme.colors.text} style={s.footerColumnHeading}>
              {FOOTER.columns.explore.heading}
            </AppText>
            {FOOTER.columns.explore.links.map((link, i) => (
              <Pressable key={i} style={s.footerLink} onPress={() => alert('Coming soon')}>
                <AppText variant="label" color={theme.colors.subtext} style={s.footerLinkText}>
                  {link}
                </AppText>
              </Pressable>
            ))}
          </View>
          <View style={[s.footerColumn, isNarrow && { width: '100%' }]}>
            <AppText variant="label" color={theme.colors.text} style={s.footerColumnHeading}>
              {FOOTER.columns.findUs.heading}
            </AppText>
            {FOOTER.columns.findUs.links.map((link, i) => (
              <Pressable key={i} style={s.footerLink} onPress={() => alert('Coming soon')}>
                <AppText variant="label" color={theme.colors.subtext} style={s.footerLinkText}>
                  {link}
                </AppText>
              </Pressable>
            ))}
          </View>
          <View style={[s.footerColumn, isNarrow && { width: '100%' }]}>
            <AppText variant="label" color={theme.colors.text} style={s.footerColumnHeading}>
              {FOOTER.columns.smallPrint.heading}
            </AppText>
            {FOOTER.columns.smallPrint.links.map((link, i) => (
              <Pressable key={i} style={s.footerLink} onPress={() => alert('Coming soon')}>
                <AppText variant="label" color={theme.colors.subtext} style={s.footerLinkText}>
                  {link}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={s.footerWordmarkWrap}>
          <AppText
            variant="heading"
            color='#1F1F1F'
            style={{ ...s.footerWordmark, fontSize: Math.min(140, screenWidth * 1.2) }}
          >
            {BRAND}
          </AppText>
        </View>

        <View style={s.footerStatements}>
          {FOOTER.statements.map((stmt, i) => (
            <AppText key={i} variant="label" color={theme.colors.subtext} style={s.footerStatement}>
              {stmt}
            </AppText>
          ))}
        </View>

        <View style={s.footerDivider} />
        <View style={s.footerFinePrint}>
          <AppText variant="label" color={theme.colors.subtext} style={s.footerFineText}>
            {FOOTER.copyright}
          </AppText>
          <AppText variant="label" color={theme.colors.subtext} style={s.footerFineText}>
            {FOOTER.statements[0]}
          </AppText>
          <Pressable style={s.footerBackToTop} onPress={scrollToTop}>
            <AppText variant="label" color={theme.colors.accent} style={s.footerBackToTopText}>
              {FOOTER.backToTop}
            </AppText>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { paddingBottom: 90 },

  section: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  hero: { gap: 16 },
  heroLabel: { marginBottom: 4 },
  heroLines: { gap: 4 },
  stampRow: { marginTop: 16, marginBottom: 16 },
  stampText: {},
  heroSubLines: { gap: 8, marginTop: 16 },
  subLine: { textAlign: 'center', lineHeight: 20 },
  heroImageRow: { flexDirection: 'row', gap: 8, marginTop: 24 },
  heroImageCard: { flex: 1, alignItems: 'center' },
  heroImage: { height: 140, width: '100%' },
  heroImageCaption: { marginTop: 4, textAlign: 'center', fontSize: 10 },
  heroButtons: { gap: 12, marginTop: 24 },

  weatherSection: { gap: 16 },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  weatherLabel: { marginRight: 8 },
  weatherTemp: { fontSize: 56, letterSpacing: -2 },
  weatherWear: { marginLeft: 6 },
  weatherOutfit: { fontSize: 24 },
  weatherPeriod: { color: theme.colors.accent, fontSize: 24 },

  countdownSection: { gap: 16 },
  countdownHeader: { gap: 10, marginBottom: 16 },
  countdownHeading: { fontSize: 28, letterSpacing: -1 },
  dropLabelRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, backgroundColor: theme.colors.accent, marginRight: 8 },
  countdownBoxes: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  countdownBox: { alignItems: 'center', minWidth: 60 },
  countdownNumeral: { fontSize: 34, letterSpacing: -2, marginBottom: 2 },
  countdownBoxLabel: { fontSize: 11 },

  collectionSection: { gap: 16 },
  collectionDesc: { fontSize: 13, marginBottom: 16 },
  collectionBadge: { color: theme.colors.accent, marginBottom: 16 },
  collectionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  collectionCard: { width: '48%', marginBottom: 16 },

  previousSection: { gap: 16 },
  previousDivider: { height: 1, backgroundColor: theme.colors.border, marginBottom: 16 },
  previousLabel: { marginBottom: 16 },
  previousItems: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  previousItem: { flexWrap: 'wrap' },
  previousSoldOut: { fontSize: 10 },
  previousLinesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  previousLine: { fontSize: 11 },

  campaignSection: { gap: 16 },
  campaignSide: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  campaignSideText: { flex: 1 },
  campaignCaption: {},
  campaignLandscapeWrap: { height: 240, overflow: 'hidden', marginBottom: 16 },
  campaignLandscape: { width: '100%', height: '100%' },
  campaignOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  campaignOverlayText: { fontSize: 34 },
  campaignArrow: { fontSize: 28 },
  campaignPortraitWrap: { height: 260, overflow: 'hidden', marginBottom: 16 },
  campaignPortrait: { width: '100%', height: '100%' },
  campaignPortraitCap: { marginBottom: 16 },
  campaignSecondCaption: {},
  campaignLine: { fontSize: 11 },
  campaignFooterLine: { marginTop: 16 },

  mindsetSection: { gap: 16 },
  mindsetLabel: { marginBottom: 16 },
  mindsetHeading: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  mindsetHeadingLine: { fontSize: 46, letterSpacing: -2 },
  mindsetHeadingLineMuted: { fontSize: 46, letterSpacing: -2, color: theme.colors.subtext },
  mindsetPlus: { alignItems: 'center', marginBottom: 16 },
  mindsetPlusText: { fontSize: 64 },
  mindsetParagraph: { fontSize: 13, lineHeight: 20, marginBottom: 24 },
  statementRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: theme.colors.border, paddingVertical: 14 },
  statementNumber: { fontSize: 18, width: 24 },
  statementContent: { flex: 1 },
  statementHeading: { fontSize: 16, marginBottom: 4 },
  statementDescription: { fontSize: 11, lineHeight: 16 },
  statementDivider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },

  newsletterSection: { gap: 16 },
  newsletterLabel: { marginBottom: 16 },
  newsletterHeading: { gap: 4, marginBottom: 16 },
  newsletterText: { fontSize: 13, marginBottom: 8 },
  newsletterPrompt: { marginBottom: 16 },
  newsletterInputWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  newsletterInput: {
    flex: 1,
    color: theme.colors.bg,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.bg,
    fontFamily: theme.fonts.mono,
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  newsletterSubmit: { marginLeft: 10 },
  newsletterSubmitText: { fontSize: 16 },
  newsletterConsent: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: theme.colors.bg,
    borderRadius: 0,
  },
  newsletterError: { marginBottom: 8 },
  newsletterSuccess: { marginBottom: 8, fontWeight: 'bold' },
  newsletterFooter: { textAlign: 'center' },

  footerSection: { gap: 16 },
  footerColumns: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginBottom: 24 },
  footerColumn: { width: '30%' },
  footerColumnHeading: { marginBottom: 12 },
  footerLink: { marginBottom: 8 },
  footerLinkText: {},
  footerWordmarkWrap: { height: 80, overflow: 'hidden', marginBottom: 24 },
  footerWordmark: { textTransform: 'uppercase', lineHeight: 1 },
  footerStatements: { gap: 6, marginBottom: 24 },
  footerStatement: { fontSize: 10 },
  footerDivider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 16 },
  footerFinePrint: { gap: 8 },
  footerFineText: { fontSize: 10 },
  footerBackToTop: { alignItems: 'center', marginTop: 4 },
  footerBackToTopText: {},

  error: { color: theme.colors.accent, marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 20 },
  cardWrap: { width: 150, marginEnd: 12 },
  separator: { width: 12 },
  listContent: { paddingEnd: 16 },
});
