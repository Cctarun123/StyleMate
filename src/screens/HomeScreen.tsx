import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  Text,
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
import { surface, theme, text, sheet, border } from '../utils/theme';
import { SectionHeader } from '../components/SectionHeader';
import { AnnouncementBar } from '../components/AnnouncementBar';
import { Button } from '../components/Button';
import { useCountdown, Countdown } from '../hooks/useCountdown';
import { OutfitCategory, Product } from '../types';
import {
  BRAND,
  TAGLINE,
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

  // Animation values per section key — initialized upfront so style refs exist on first render.
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
      // No backend exists — save to AsyncStorage as a placeholder.
      // TODO: Replace with a real newsletter API endpoint.
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

  const heroFontSize = Math.min(96, screenWidth * 0.82);

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
      <View style={s.hero} onLayout={sectionLayout('hero')}>
        <Animated.View
          style={[
            s.heroLabel,
            { opacity: anims.hero?.opacity, transform: [{ translateY: anims.hero?.y }] },
          ] as any}
        >
          <Text style={[text.label(), { color: theme.colors.accent }]}>{HERO.label}</Text>
        </Animated.View>

        <View style={s.heroLines}>
          <Animated.View
            style={[
              s.heroLine,
              { opacity: anims.hero?.opacity, transform: [{ translateY: anims.hero?.y }] },
            ] as any}
          >
            <Text style={[text.heading(), { fontSize: heroFontSize, color: theme.colors.text }]}>
              {HERO.lines[0]}
            </Text>
          </Animated.View>
          <Animated.View
            style={[
              s.heroLine,
              { opacity: anims.hero?.opacity, transform: [{ translateY: anims.hero?.y }] },
            ] as any}
          >
            <Text style={[text.heading(), { fontSize: heroFontSize, color: theme.colors.accent }]}>
              {HERO.lines[1]}
            </Text>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            s.stamp,
            { opacity: anims.hero?.opacity, transform: [{ translateY: anims.hero?.y }, { rotate: '-8deg' }] },
          ] as any}
        >
          <Text style={[text.label(), s.stampText]}>{HERO.stamp}</Text>
        </Animated.View>

        <View style={s.heroSubLines}>
          <Animated.View
            style={[
              s.subLine,
              { opacity: anims.hero?.opacity, transform: [{ translateY: anims.hero?.y }] },
            ] as any}
          >
            <Text style={[text.label(), { color: theme.colors.subtext }]}>{HERO.subLines[0]}</Text>
          </Animated.View>
          <Animated.View
            style={[
              s.subLine,
              { opacity: anims.hero?.opacity, transform: [{ translateY: anims.hero?.y }] },
            ] as any}
          >
            <Text style={[text.label(), { color: theme.colors.subtext }]}>{HERO.subLines[1]}</Text>
          </Animated.View>
        </View>

        {/* Decorative product images behind the headline */}
        <View style={s.heroImages}>
          {products.slice(0, 3).map((p) => (
            <View
              key={p.id}
              style={[
                s.heroImageWrap,
                {
                  transform: [
                    { rotate: p.id % 3 === 0 ? '-6deg' : p.id % 3 === 1 ? '4deg' : '-3deg' },
                  ],
                },
              ]}
            >
              <Image source={{ uri: p.image }} style={s.heroImage} resizeMode="cover" />
              <Text style={[text.label(), s.heroImageCaption]}>AFTERHOURS / LONDON</Text>
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
      <View style={s.weatherSection} onLayout={sectionLayout('weather')}>
        <View style={[surface, s.weatherRow]}>
          <Text style={[text.label(), s.weatherLabel]}>TONIGHT / TIRUPATI</Text>
          <Text style={[text.heading(), s.weatherTemp]}>
            {weather != null ? `${weather.temperature}°` : '—'}
          </Text>
          {weatherLoading ? (
            <Text style={[text.label(), s.weatherWear]}>Loading&hellip;</Text>
          ) : weatherError ? (
            <Text style={[text.label(), s.weatherWear]}>{weatherError}</Text>
          ) : (
            <>
              <Text style={[text.label(), s.weatherWear]}>WEAR: </Text>
              <Text style={[text.heading(), s.weatherOutfit]}>{category.toUpperCase()}</Text>
              <Text style={[text.heading(), s.weatherPeriod]}>.</Text>
            </>
          )}
        </View>

        <SectionHeader label="01 / SUGGESTED" heading="SUGGESTED FOR TODAY" />

        {productsError && <Text style={[text.label(), s.error]}>Products: {productsError}</Text>}

        {productsLoading ? (
          <View style={sheet.center()}>
            <ActivityIndicator size="large" color={theme.colors.text} />
          </View>
        ) : suggested.length === 0 ? (
          <Text style={[text.label(), s.empty]}>NOTHING SUGGESTED.</Text>
        ) : (
          <FlatList
            horizontal
            data={suggested}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }: { item: Product }) => (
              <View style={s.cardWrap} key={item.id}>
                <ProductCard item={item} onPress={(id: number) => navigation.navigate('ProductDetail', { id })} />
              </View>
            )}
            ItemSeparatorComponent={() => <View style={s.separator} />}
            contentContainerStyle={s.listContent}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>

      {/* ---------- COUNTDOWN ---------- */}
      <View style={[surface, s.countdownSection]} onLayout={sectionLayout('countdown')}>
        <View style={s.countdownHeader}>
          <View style={s.dropLabelRow}>
            <View style={s.dot} />
            <Text style={[text.label()]}>{COUNTDOWN.label}</Text>
          </View>
          <Text style={[text.heading(), s.countdownHeading]}>{COUNTDOWN.heading}</Text>
        </View>
        <View style={s.countdownBoxes}>
          {[
            { label: 'DAYS', value: String(drop.days).padStart(2, '0') },
            { label: 'HOURS', value: String(drop.hours).padStart(2, '0') },
            { label: 'MINUTES', value: String(drop.minutes).padStart(2, '0') },
            { label: 'SECONDS', value: String(drop.seconds).padStart(2, '0') },
          ].map((box) => (
            <View key={box.label} style={s.countdownBox}>
              <Text style={[text.heading(), s.countdownNumeral]}>{box.value}</Text>
              <Text style={[text.label(), s.countdownBoxLabel]}>{box.label}</Text>
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
      <View style={s.collectionSection} onLayout={sectionLayout('collection')}>
        <SectionHeader label={COLLECTION.label} heading={COLLECTION.heading} />
        <Text style={[text.body(), s.collectionDesc]}>{COLLECTION.description}</Text>
        <Button
          title={COLLECTION.link}
          onPress={() => navigation.navigate('Explore')}
          variant="outline"
          fullWidth
        />
        <Text style={[text.label(), s.collectionBadge]}>DROP / 010</Text>
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
      <View style={s.previousSection} onLayout={sectionLayout('previous')}>
        <View style={s.previousDivider} />
        <Text style={[text.label(), s.previousLabel]}>{PREVIOUS.label}</Text>
        <View style={s.previousItems}>
          {PREVIOUS.items.map((item, i) => (
            <Text key={i} style={[text.label(), s.previousItem]}>
              {item.replace(' — SOLD OUT', '')}
              <Text style={s.previousSoldOut}> — SOLD OUT</Text>
            </Text>
          ))}
        </View>
        <View style={s.previousLinesRow}>
          <Text style={[text.label(), s.previousLine]}>{PREVIOUS.lines[0]}</Text>
          <Text style={[text.label(), s.previousLine]}>{PREVIOUS.lines[1]}</Text>
        </View>
      </View>

      {/* ---------- CAMPAIGN ---------- */}
      <View style={s.campaignSection} onLayout={sectionLayout('campaign')}>
        <SectionHeader label={CAMPAIGN.label} heading={CAMPAIGN.heading} />
        <View style={s.campaignSide}>
          <Text style={[text.label(), s.campaignSideText]}>{CAMPAIGN.sideText}</Text>
          <Text style={[text.label(), s.campaignCaption]}>{CAMPAIGN.caption}</Text>
        </View>
        <View style={s.campaignLandscapeWrap}>
          <Image source={{ uri: CAMPAIGN_IMAGES.landscape }} style={s.campaignLandscape} resizeMode="cover" />
          <View style={s.campaignOverlay}>
            <Text style={[text.heading(), s.campaignOverlayText]}>{CAMPAIGN.overlay}</Text>
            <Text style={[text.heading(), s.campaignArrow]}>↗</Text>
          </View>
        </View>
        <View style={s.campaignPortraitWrap}>
          <Image source={{ uri: CAMPAIGN_IMAGES.portrait }} style={s.campaignPortrait} resizeMode="cover" />
          <View style={s.campaignPortraitCap}>
            <Text style={[text.label(), s.campaignSecondCaption]}>{CAMPAIGN.secondCaption}</Text>
          </View>
          <Text style={[text.label(), s.campaignLine]}>{CAMPAIGN.lines[0]}</Text>
          <Text style={[text.label(), s.campaignLine]}>{CAMPAIGN.lines[1]}</Text>
        </View>
        <Text style={[text.label(), s.campaignFooterLine]}>{CAMPAIGN.footerLine}</Text>
        <Button
          title={CAMPAIGN.link}
          onPress={() => navigation.navigate('Explore')}
          variant="outline"
          fullWidth
        />
      </View>

      {/* ---------- MINDSET ---------- */}
      <View style={s.mindsetSection} onLayout={sectionLayout('mindset')}>
        <Text style={[text.label(), s.mindsetLabel]}>{MINDSET.label}</Text>
        <View style={s.mindsetHeading}>
          <Text style={[text.heading(), s.mindsetHeadingLine]}>{MINDSET.headingLines[0]}</Text>
          <Text style={[text.heading(), s.mindsetHeadingLineMuted]}>{MINDSET.headingLines[1]}</Text>
        </View>
        <View style={s.mindsetPlus}>
          <Text style={[text.heading(), s.mindsetPlusText]}>+</Text>
        </View>
        <Text style={[text.body(), s.mindsetParagraph]}>{MINDSET.paragraph}</Text>
        {MINDSET.statements.map((stmt, i) => (
          <View key={i} style={s.statementRow}>
            <Text style={[text.heading(), s.statementNumber]}>{String(i + 1)}</Text>
            <View style={s.statementContent}>
              <Text style={[text.heading(), s.statementHeading]}>{stmt.heading}</Text>
              <Text style={[text.body(), s.statementDescription]}>{stmt.description}</Text>
            </View>
            {i < MINDSET.statements.length - 1 && <View style={s.statementDivider} />}
          </View>
        ))}
      </View>

      {/* ---------- NEWSLETTER ---------- */}
      <View style={[s.newsletterSection, { backgroundColor: theme.colors.accent }]} onLayout={sectionLayout('newsletter')}>
        <Text style={[text.label(), { color: theme.colors.bg }, s.newsletterLabel]}>{NEWSLETTER.label}</Text>
        <View style={s.newsletterHeading}>
          <Text style={[text.heading(), { color: theme.colors.bg, fontSize: Math.min(96, screenWidth * 0.85) }]}>
            {NEWSLETTER.headingLines[0]}
          </Text>
          <Text style={[text.heading(), { color: theme.colors.text, fontSize: Math.min(96, screenWidth * 0.85) }]}>
            {NEWSLETTER.headingLines[1]}
          </Text>
        </View>
        {NEWSLETTER.textLines.map((line, i) => (
          <Text key={i} style={[text.body(), { color: theme.colors.bg, fontSize: 13 }, s.newsletterText]}>
            {line}
          </Text>
        ))}
        <Text style={[text.label(), { color: theme.colors.bg }, s.newsletterPrompt]}>{NEWSLETTER.prompt}</Text>
        <View style={s.newsletterInputWrap}>
          <TextInput
            style={s.newsletterInput}
            value={newsletter.email}
            onChangeText={(t) => setNewsletter((prev) => ({ ...prev, email: t, errorMessage: null, status: 'idle' }))}
            placeholder={NEWSLETTER.placeholder}
            placeholderTextColor="rgba(0,0,0,0.45)"
          />
          <Pressable style={s.newsletterSubmit} onPress={handleNewsletterSubmit}>
            <Text style={s.newsletterSubmitText}>↗</Text>
          </Pressable>
        </View>
        <Pressable
          style={s.newsletterConsent}
          onPress={() =>
            setNewsletter((prev) => ({ ...prev, consent: !prev.consent, errorMessage: null, status: 'idle' }))
          }
        >
          <View style={s.checkbox} />
          <Text style={[text.label(), { color: theme.colors.bg }]}>{NEWSLETTER.consent}</Text>
        </Pressable>
        {newsletter.status === 'error' && (
          <Text style={[text.label(), { color: theme.colors.bg }, s.newsletterError]}>{newsletter.errorMessage}</Text>
        )}
        {newsletter.status === 'success' && (
          <Text style={[text.label(), { color: theme.colors.bg, fontWeight: 'bold' }, s.newsletterSuccess]}>
            YOU'RE ON THE LIST.
          </Text>
        )}
        <Text style={[text.label(), { color: theme.colors.bg }, s.newsletterFooter]}>{NEWSLETTER.footer}</Text>
      </View>

      {/* ---------- FOOTER ---------- */}
      <View style={s.footerSection} onLayout={sectionLayout('footer')}>
        <Animated.View
          style={[
            s.footerWordmarkWrap,
            { opacity: anims.footer?.opacity, transform: [{ translateY: anims.footer?.y }] },
          ] as any}
        >
          <Text
            style={[
              text.heading(),
              s.footerWordmark,
              { fontSize: Math.min(140, screenWidth * 1.2) },
            ]}
          >
            {BRAND}
          </Text>
        </Animated.View>
        <View style={s.footerStatements}>
          {FOOTER.statements.map((stmt, i) => (
            <Text key={i} style={[text.label(), s.footerStatement]}>{stmt}</Text>
          ))}
        </View>
        <View style={s.footerColumns}>
          <View style={s.footerColumn}>
            <Text style={[text.label(), s.footerColumnHeading]}>{FOOTER.columns.explore.heading}</Text>
            {FOOTER.columns.explore.links.map((link, i) => (
              <Pressable key={i} style={s.footerLink} onPress={() => alert('Coming soon')}>
                <Text style={[text.label(), s.footerLinkText]}>{link}</Text>
              </Pressable>
            ))}
          </View>
          <View style={s.footerColumn}>
            <Text style={[text.label(), s.footerColumnHeading]}>{FOOTER.columns.findUs.heading}</Text>
            {FOOTER.columns.findUs.links.map((link, i) => {
              const url = `https://www.${link.replace(' ↗', '').toLowerCase()}.com/nocturn`;
              return (
                <Pressable key={i} style={s.footerLink} onPress={() => alert('Coming soon')}>
                  <Text style={[text.label(), s.footerLinkText]}>{link}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={s.footerColumn}>
            <Text style={[text.label(), s.footerColumnHeading]}>{FOOTER.columns.smallPrint.heading}</Text>
            {FOOTER.columns.smallPrint.links.map((link, i) => (
              <Pressable key={i} style={s.footerLink} onPress={() => alert('Coming soon')}>
                <Text style={[text.label(), s.footerLinkText]}>{link}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={s.footerDivider} />
        <View style={s.footerFinePrint}>
          <Text style={[text.label(), s.footerFineText]}>{FOOTER.copyright}</Text>
          <Text style={[text.label(), s.footerFineText]}>{FOOTER.statements[0]}</Text>
          <Pressable style={s.footerBackToTop} onPress={scrollToTop}>
            <Text style={[text.label(), s.footerBackToTopText]}>{FOOTER.backToTop}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { paddingBottom: 90 },

  hero: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  heroLabel: { marginBottom: 12 },
  heroLines: { gap: 2 },
  heroLine: { marginBottom: 2 },
  stamp: {
    position: 'absolute',
    top: 14,
    right: 14,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stampText: { ...text.label(), color: theme.colors.accent },
  heroSubLines: { gap: 6, marginTop: 16, marginBottom: 24 },
  subLine: { textAlign: 'center' },
  heroImages: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  heroImageWrap: { width: 120, height: 120, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroImageCaption: {
    ...text.label(),
    color: theme.colors.subtext,
    marginTop: 6,
    textAlign: 'center',
  },
  heroButtons: { gap: 10, marginTop: 30 },

  weatherSection: { paddingHorizontal: 16, marginBottom: 28 },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 16,
  },
  weatherLabel: { marginRight: 8 },
  weatherTemp: { fontSize: 56, letterSpacing: -2 },
  weatherWear: { marginLeft: 6 },
  weatherOutfit: { fontSize: 24 },
  weatherPeriod: { color: theme.colors.accent, fontSize: 24 },

  countdownSection: { padding: 24, marginHorizontal: 16, marginBottom: 28 },
  countdownHeader: { gap: 10, marginBottom: 20 },
  countdownHeading: { fontSize: 28, letterSpacing: -1 },
  dropLabelRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, backgroundColor: theme.colors.accent, marginRight: 8 },
  countdownBoxes: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  countdownBox: { alignItems: 'center', minWidth: 60 },
  countdownNumeral: { fontSize: 34, letterSpacing: -2, marginBottom: 2 },
  countdownBoxLabel: { fontSize: 9 },

  collectionSection: { paddingHorizontal: 16, marginBottom: 28 },
  collectionDesc: { fontSize: 13, marginBottom: 14 },
  collectionBadge: { ...text.label(), color: theme.colors.accent, marginBottom: 16 },
  collectionGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  collectionCard: { width: '48%', paddingBottom: 16 },

  previousSection: { paddingHorizontal: 16, marginBottom: 28 },
  previousDivider: { height: 1, backgroundColor: theme.colors.border, marginBottom: 12 },
  previousLabel: { marginBottom: 10 },
  previousItems: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  previousItem: { flexWrap: 'wrap' },
  previousSoldOut: { color: theme.colors.accent, fontSize: 10 },
  previousLinesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  previousLine: { fontSize: 11 },

  campaignSection: { paddingHorizontal: 16, marginBottom: 28 },
  campaignSide: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  campaignSideText: { flex: 1 },
  campaignCaption: { ...text.label(), color: theme.colors.subtext },
  campaignLandscapeWrap: { height: 240, overflow: 'hidden', marginBottom: 12 },
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
  campaignOverlayText: { ...text.heading(), fontSize: 34, color: theme.colors.text },
  campaignArrow: { ...text.heading(), fontSize: 28, color: theme.colors.accent },
  campaignPortraitWrap: { height: 260, overflow: 'hidden', marginBottom: 12 },
  campaignPortrait: { width: '100%', height: '100%' },
  campaignPortraitCap: { marginBottom: 10 },
  campaignSecondCaption: { ...text.label(), color: theme.colors.subtext },
  campaignLine: { ...text.label(), fontSize: 11 },
  campaignFooterLine: { ...text.label(), color: theme.colors.subtext, marginTop: 12 },

  mindsetSection: { paddingHorizontal: 16, marginBottom: 28 },
  mindsetLabel: { marginBottom: 10 },
  mindsetHeading: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  mindsetHeadingLine: { fontSize: 46, letterSpacing: -2 },
  mindsetHeadingLineMuted: { fontSize: 46, letterSpacing: -2, color: theme.colors.subtext },
  mindsetPlus: { alignItems: 'center', marginBottom: 16 },
  mindsetPlusText: { fontSize: 64, color: theme.colors.accent },
  mindsetParagraph: { fontSize: 13, lineHeight: 20, color: theme.colors.subtext, marginBottom: 24 },
  statementRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: theme.colors.border, paddingVertical: 14 },
  statementNumber: { color: theme.colors.accent, fontSize: 18, width: 24 },
  statementContent: { flex: 1 },
  statementHeading: { fontSize: 16, marginBottom: 4 },
  statementDescription: { fontSize: 11, lineHeight: 16, color: theme.colors.subtext },
  statementDivider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },

  newsletterSection: { padding: 32, paddingHorizontal: 24 },
  newsletterLabel: { color: theme.colors.bg, marginBottom: 10 },
  newsletterHeading: { gap: 2, marginBottom: 14 },
  newsletterText: { marginBottom: 8, textAlign: 'center' },
  newsletterPrompt: { color: theme.colors.bg, marginBottom: 12 },
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
  newsletterSubmitText: { fontSize: 16, color: theme.colors.bg },
  newsletterConsent: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: theme.colors.bg,
    borderRadius: 0,
  },
  newsletterError: { color: theme.colors.bg, marginBottom: 8 },
  newsletterSuccess: { color: theme.colors.bg, marginBottom: 8 },
  newsletterFooter: { color: theme.colors.bg, textAlign: 'center' },

  footerSection: { paddingHorizontal: 16, paddingBottom: 40, borderTopWidth: 1, borderTopColor: theme.colors.border },
  footerWordmarkWrap: { overflow: 'hidden', marginBottom: 20 },
  footerWordmark: {
    fontFamily: theme.fonts.display,
    color: '#1F1F1F',
    textTransform: 'uppercase',
    lineHeight: 1,
  },
  footerStatements: { gap: 6, marginBottom: 24 },
  footerStatement: { ...text.label(), color: theme.colors.subtext, fontSize: 10 },
  footerColumns: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  footerColumn: { width: '30%' },
  footerColumnHeading: { ...text.label(), color: theme.colors.text, marginBottom: 12 },
  footerLink: { marginBottom: 8 },
  footerLinkText: { ...text.label(), color: theme.colors.subtext },
  footerDivider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 16 },
  footerFinePrint: { gap: 8 },
  footerFineText: { ...text.label(), fontSize: 10 },
  footerBackToTop: { alignItems: 'center', marginTop: 4 },
  footerBackToTopText: { ...text.label(), color: theme.colors.accent },

  error: { color: theme.colors.accent, marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 20 },
  cardWrap: { width: 150, marginEnd: 12 },
  separator: { width: 12 },
  listContent: { paddingEnd: 16 },
});
