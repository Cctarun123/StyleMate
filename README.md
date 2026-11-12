# StyleMate

A React Native (Expo + TypeScript) app that recommends what to wear based on live weather, with a wardrobe to save the pieces you like.

**Demo video:** [link here]

## Screenshots

| Home | Explore | Wardrobe |
|------|---------|----------|
| ![Home](screenshots/home.png) | ![Explore](screenshots/explore.png) | ![Wardrobe](screenshots/wardrobe.png) |

## Features

- **Live weather** from the Open-Meteo API (no API key needed)
- **Outfit rules by temperature**: cold weather suggests jackets, mild weather suggests casuals, hot weather suggests light wear
- **Browse products** with search and Men / Women category filters
- **Product detail screen** with save and remove
- **Wardrobe** that persists after the app is closed (Context API + `useReducer` + AsyncStorage)
- **Loading, error and retry states** and pull-to-refresh on data screens
- **Unit tests** for the outfit logic and the wardrobe reducer

## Tech Stack

React Native, Expo, TypeScript, React Navigation (bottom tabs + native stack), Context API, AsyncStorage, REST APIs, Jest

## Project Structure

```
src/
  screens/     Home, Explore, ProductDetail, Wardrobe
  components/  Reusable UI (product tile, search bar, buttons, screen wrapper)
  hooks/       useWeather, useProducts (data fetching + state)
  context/     WardrobeContext (useReducer + AsyncStorage persistence)
  utils/       Outfit rules, theme
  types/       Shared TypeScript types
```

**Why this structure:** data fetching lives in custom hooks so screens stay simple. State logic sits in a reducer so it is easy to test. Pure functions in `utils` keep the outfit rules separate from the UI.

## Performance Notes

- `FlatList` with `keyExtractor` for product lists
- `React.memo` on product tiles, with `useCallback` / `useMemo` to avoid needless re-renders
- Horizontal list inside a vertical scroll view; no nested vertical `FlatList`

## APIs Used

- [Open-Meteo](https://open-meteo.com/) for current weather
- [FakeStoreAPI](https://fakestoreapi.com/) for demo product data

Product data is demo data, not a real store.

## Run Locally

```bash
git clone https://github.com/Cctarun123/StyleMate.git
cd StyleMate
npm install
npx expo start
```

Scan the QR code with the Expo Go app (phone and laptop on the same WiFi, or use `npx expo start --tunnel`).

## Run Tests

```bash
npm test
```

## Future Work

- Location-based weather with `expo-location` (currently fixed to Tirupati)
- AI stylist suggestions using the Gemini API
- Local clothing catalog with finer temperature bands
- Backend with user accounts so wardrobes sync across devices

## Author

**C.C. Tharun Kumar**
[GitHub](https://github.com/Cctarun123) · [LinkedIn](https://www.linkedin.com/in/cctarunkumar21) · cctarun1122@gmail.com
