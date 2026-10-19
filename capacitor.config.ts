import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'space.theboostnation.mindful',
  appName: 'Mindspace',
  webDir: 'dist',
  ios: { contentInset: 'never', backgroundColor: '#f4f1eb' },
  backgroundColor: '#f4f1eb',
  plugins: {
    // The web view shrinks above the keyboard instead of sliding the page under the notch.
    Keyboard: { resize: 'native', resizeOnFullScreen: true },
  },
}

export default config
