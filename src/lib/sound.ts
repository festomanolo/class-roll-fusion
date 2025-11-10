// Sound effects utility
export const isSoundEnabled = (): boolean => {
  try {
    if (typeof window === 'undefined' || !window?.localStorage) return true;
    const v = window.localStorage.getItem('soundsEnabled');
    if (v === null) return true; // default enabled
    return v === 'true';
  } catch (e) {
    return true;
  }
};

export const playSound = async (soundName: string) => {
  try {
    if (!isSoundEnabled()) return; // respect user setting

    const possiblePaths = [
      `/src/assets/sounds/${soundName}.mp3`,
      `/assets/sounds/${soundName}.mp3`,
      `/assets/${soundName}.mp3`
    ];

    for (const path of possiblePaths) {
      try {
        const audio = new Audio(path);
        // call play but don't block on it
        void audio.play();
        return; // success (or at least attempted)
      } catch (err) {
        // try next
      }
    }
  } catch (error) {
    // Swallow to avoid breaking the app
    console.warn('Failed to play sound:', soundName, error);
  }
};