import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue';
import { useRouter } from 'vue-router';

declare global {
  interface Window {
    __deferredPrompt?: Event | null;
  }
}

export default function usePwaInstall() {
  const isInstallable = ref(false);
  const deferredPrompt = ref<Event | null>(
    typeof window !== 'undefined' && window.__deferredPrompt ? window.__deferredPrompt : null
  );
  const router = useRouter();

  const saveBeforeInstallPrompt = (event: Event) => {
    if (typeof window === 'undefined') return;

    event.preventDefault(); // Prevent the mini-infobar from appearing
    deferredPrompt.value = event; // Save the event locally
    window.__deferredPrompt = event; // Save globally for persistence
    isInstallable.value = true; // Mark installable
  };

  const clearInstallPrompt = () => {
    if (typeof window === 'undefined') return;

    deferredPrompt.value = null;
    window.__deferredPrompt = null; // Clear global state
    isInstallable.value = false;
  };

  const handleInstall = async () => {
    if (!deferredPrompt.value) return; // Ensure there's a valid prompt

    try {
      const promptEvent = deferredPrompt.value as any;
      promptEvent.prompt(); // Show the prompt
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        router.push('/app'); // Navigate to /app after installation
      }
      clearInstallPrompt(); // Clear the prompt state regardless of the outcome
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const setupEventListener = () => {
    if (typeof window === 'undefined') return;

    // Attach the event listener and restore state if prompt exists
    window.addEventListener('beforeinstallprompt', saveBeforeInstallPrompt);
    if (window.__deferredPrompt) {
      deferredPrompt.value = window.__deferredPrompt;
      isInstallable.value = true;
    }
  };

  const removeEventListener = () => {
    if (typeof window === 'undefined') return;

    window.removeEventListener('beforeinstallprompt', saveBeforeInstallPrompt);
  };

  onMounted(setupEventListener); // Attach listener on mount
  onUnmounted(removeEventListener); // Remove listener on unmount
  onActivated(setupEventListener); // Handle <keep-alive> reactivation
  onDeactivated(removeEventListener); // Handle <keep-alive> deactivation

  return {
    isInstallable,
    handleInstall,
  };
}
