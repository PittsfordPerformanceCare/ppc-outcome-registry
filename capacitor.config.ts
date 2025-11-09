import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d302638a5ada4621891ec8d351f84432',
  appName: 'PPC Outcome Registry',
  webDir: 'dist',
  server: {
    url: 'https://d302638a-5ada-4621-891e-c8d351f84432.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;
