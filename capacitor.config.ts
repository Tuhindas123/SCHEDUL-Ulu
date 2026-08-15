import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flowtracker.app',
  appName: 'Flow Tracker',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '105526018528-ke8t06tfmo2g7gdqmg0idm8i2o9p56sr.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;