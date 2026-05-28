import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mikuoz.expense',
  appName: 'รายจ่ายของฉัน',
  webDir: 'out',
  server: {
    url: 'https://expense-slip-reader-1w9z.vercel.app',
    cleartext: true,
  },
};

export default config;