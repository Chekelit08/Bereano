import { Archivo_700Bold, Archivo_800ExtraBold } from '@expo-google-fonts/archivo';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import {
  DMSerifDisplay_400Regular,
  DMSerifDisplay_400Regular_Italic,
} from '@expo-google-fonts/dm-serif-display';
import { Newsreader_400Regular_Italic, Newsreader_500Medium } from '@expo-google-fonts/newsreader';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Literata_400Regular,
  Literata_400Regular_Italic,
  Literata_500Medium,
} from '@expo-google-fonts/literata';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';

import { Fonts, usePalette } from '@/constants/theme';
import { screenName } from '@/lib/analytics-core';
import { track } from '@/lib/analytics';
import { PlusProvider } from '@/lib/plus';
import { useScheme } from '@/lib/scheme';
import { SettingsProvider } from '@/lib/settings';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const c = usePalette();
  const dark = useScheme() === 'dark';
  // Tema de navegación con los colores de la marca (fondo de pantallas y pestañas).
  const base = dark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: c.bg, card: c.bg, text: c.text, border: c.line, primary: c.accent },
  };
  const [loaded, error] = useFonts({
    Newsreader_500Medium,
    Newsreader_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Literata_400Regular,
    Literata_400Regular_Italic,
    Literata_500Medium,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Caveat_700Bold,
    BebasNeue_400Regular,
    DMSerifDisplay_400Regular,
    DMSerifDisplay_400Regular_Italic,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <ThemeProvider value={navTheme}>
      <SettingsProvider>
        <PlusProvider>
          <StatusBar style={dark ? 'light' : 'dark'} />
          <ScreenTracker />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: c.bg },
              headerTintColor: c.accent,
              headerTitleStyle: { fontFamily: Fonts.uiBold, color: c.text },
              headerShadowVisible: false,
              headerBackButtonDisplayMode: 'minimal',
              contentStyle: { backgroundColor: c.bg },
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="buscar" options={{ title: 'Buscar' }} />
            <Stack.Screen name="ayuda" options={{ title: 'No estás solo', presentation: 'modal' }} />
            <Stack.Screen name="plus" options={{ title: '', presentation: 'modal' }} />
            <Stack.Screen name="compartir" options={{ title: 'Compartir' }} />
            <Stack.Screen name="ajustes" options={{ title: '' }} />
            <Stack.Screen name="oracion" options={{ title: '' }} />
            <Stack.Screen name="racha" options={{ title: '' }} />
            <Stack.Screen name="resaltados" options={{ title: '' }} />
            <Stack.Screen name="bienvenida" options={{ headerShown: false, gestureEnabled: false }} />
          </Stack>
        </PlusProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

/** Registra cada pantalla que se abre (para el panel de estadísticas). */
function ScreenTracker() {
  const segments = useSegments();
  const name = screenName(segments);
  const opened = useRef(false);
  useEffect(() => {
    if (!opened.current) {
      opened.current = true;
      track('app_abierta');
    }
    track('screen_view', {}, name);
  }, [name]);
  return null;
}
