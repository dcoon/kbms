# Project Context: Mobile App (Expo/TypeScript)

## Overview
This project is a mobile application developed using **Expo (React Native)** and **TypeScript**. It utilizes **Expo Router** for file-based routing.

## Technology Stack
- **Framework:** Expo (React Native)
- **Language:** TypeScript
- **Navigation:** Expo Router (`src/app` directory)
- **State Management:** React Hooks / Context API (assumed standard unless Redux/Zustand is added later)
- **Styling:** React Native `StyleSheet`, `global.css` for web compatibility, and potentially `react-native-reanimated` for animations.

## Project Structure
- **`src/app`**: Contains the file-based routes. `_layout.tsx` defines the layout structure (tabs, stacks). `index.tsx` is the entry route.
- **`src/components`**: Reusable UI components.
    - **`ui/`**: Core/Primitive UI components.
- **`src/hooks`**: Custom React hooks (e.g., `useColorScheme`, `useTheme`).
- **`src/constants`**: Configuration constants and theme definitions (Colors).
- **`assets`**: Static assets like images and fonts.

## Development Workflow
- **Package Manager:** `npm`
- **Commands:**
    - `npm start`: Start the Expo dev server.
    - `npm run android`: Run on Android.
    - `npm run ios`: Run on iOS.
    - `npm run web`: Run on Web.
    - `npm run lint`: Lint the codebase.

## Coding Conventions
1.  **Components:** Use Functional Components with Hooks.
2.  **Types:** Strictly type all props, state, and function return values using TypeScript interfaces or types.
3.  **Routing:** Use `expo-router` conventions.
    - Use `Stack` or `Tabs` from `expo-router` in `_layout.tsx`.
    - Use `Link` or `router.push()` for navigation.
4.  **Styling:**
    - Prefer `StyleSheet.create` for performance.
    - Use the `useColorScheme` hook to support Light and Dark modes.
    - Access theme colors from `src/constants/theme.ts` (or similar).
5.  **Platform Specifics:** Use `.native.tsx` and `.web.tsx` only when behavior diverges significantly between platforms.

## Guidelines for Changes
- **New Screens:** Create a new `.tsx` file in `src/app`. If it requires a new layout context, adjust `_layout.tsx`.
- **New Components:** Place in `src/components`. If it's a generic UI element, place in `src/components/ui`.
- **Assets:** Place images in `assets/images` and import them using `require` or `import`.
- **Icons:** Use generic icons from `@expo/vector-icons` (e.g., Ionicons) to ensure cross-platform compatibility.
- **Tests:** Do NOT create new tests for changes. Only update existing tests if they are affected by a change.

## Native vs Simulator vs Web Code
- Never call BLE or push notification libraries when running on the web or inside a simulator.
- Check which platform is running before calling native only modules and libraries. Only initialize and run native only functionality on physical devices.
- Only use react native paper for styling and themes. 
- Never add style or theme unless asked. Always try to seperated common styling into a dedicated file. Only inline styling when it is specific to the component in the file.
