/**
 * Same-Day Photo Validation & Camera Capture Service
 * Strictly rejects older photos; only photos taken or created TODAY are eligible for streak credit.
 */
import { getLocalDateKey, parsePhotoDate } from './date-utils.js';

export class PhotoValidator {
  /**
   * Validates whether a given photo file matches today's date
   * @param {File|Blob} file
   * @param {string|null} simulatedDateKey Optional test override for date comparison
   */
  static async validatePhoto(file, simulatedDateKey = null) {
    if (!file) {
      return {
        valid: false,
        reason: 'No photo selected',
        photoDate: null,
        today: getLocalDateKey()
      };
    }

    const today = simulatedDateKey || getLocalDateKey();
    const photoDate = await parsePhotoDate(file);

    if (photoDate === today) {
      return {
        valid: true,
        photoDate,
        today,
        reason: 'Photo is verified from today'
      };
    }

    return {
      valid: false,
      photoDate,
      today,
      reason: `Photo timestamp (${photoDate}) does not match today (${today}). Only today's workout or meal photos can be logged.`
    };
  }

  /**
   * Converts file to Base64 data URL for local IndexedDB storage & preview
   */
  static async fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Capacitor Camera Bridge with Web Camera Fallback
   */
  static async capturePhoto() {
    // If Capacitor native camera is available in packaged app
    if (window.Capacitor && window.Capacitor.isPluginAvailable('Camera')) {
      try {
        const { Camera, CameraResultType, CameraSource } = window.Capacitor.Plugins;
        const photo = await Camera.getPhoto({
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          quality: 85,
          allowEditing: false
        });
        return {
          dataUrl: photo.dataUrl,
          dateKey: getLocalDateKey()
        };
      } catch (err) {
        console.warn('Capacitor Camera error, falling back:', err);
      }
    }

    return null; // Signals UI to trigger native HTML file input with capture="environment"
  }
}
