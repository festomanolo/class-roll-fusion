import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1cf43f2e0ba74a6ea6ab9e5fd5d47df7',
  appName: 'TeacherMate - Attendance Manager',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: "https://1cf43f2e-0ba7-4a6e-a6ab-9e5fd5d47df7.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    },
    Filesystem: {
      permissions: ['photos']
    }
  }
};

export default config;