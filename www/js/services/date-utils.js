/**
 * Date and Time utilities for SweatCircle
 * Computes YYYY-MM-DD keys, Monday week start dates, and parses EXIF timestamps
 */

/**
 * Returns YYYY-MM-DD string in local device time
 */
export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns Monday (start of week) YYYY-MM-DD key for a given date
 */
export function getWeekStartKey(referenceDate = new Date()) {
  const d = new Date(referenceDate);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday...
  // Calculate distance back to Monday (if Sunday 0 -> diff -6, if Mon 1 -> diff 0, if Tue 2 -> diff -1)
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(d.setDate(diff));
  return getLocalDateKey(monday);
}

/**
 * Formats a date key (YYYY-MM-DD) into user-friendly text like "Today", "Yesterday", or "Oct 16"
 */
export function formatFriendlyDate(dateKey) {
  const todayKey = getLocalDateKey();
  if (dateKey === todayKey) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateKey === getLocalDateKey(yesterday)) return 'Yesterday';

  const [y, m, d] = dateKey.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Extracts EXIF date or falls back to file.lastModified
 * Supports standard JPEG EXIF DateTime / DateTimeOriginal (tag 0x9003 / 0x0132)
 */
export async function parsePhotoDate(file) {
  if (!file) return null;

  try {
    const arrayBuffer = await file.slice(0, 128 * 1024).arrayBuffer();
    const view = new DataView(arrayBuffer);

    // Check for JPEG SOI marker (0xFFD8)
    if (view.getUint16(0, false) === 0xFFD8) {
      let offset = 2;
      const length = view.byteLength;

      while (offset < length - 4) {
        const marker = view.getUint16(offset, false);
        offset += 2;

        if (marker === 0xFFE1) { // APP1 Exif marker
          const exifHeader = view.getUint32(offset + 2, false);
          if (exifHeader === 0x45786966) { // "Exif"
            // Search ascii pattern YYYY:MM:DD in the buffer
            const bytes = new Uint8Array(arrayBuffer, offset, Math.min(4096, length - offset));
            const str = new TextDecoder('ascii').decode(bytes);
            const match = str.match(/(\d{4}):(\d{2}):(\d{2}) \d{2}:\d{2}:\d{2}/);
            if (match) {
              const [, yr, mo, dy] = match;
              return `${yr}-${mo}-${dy}`;
            }
          }
        } else if ((marker & 0xFF00) !== 0xFF00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
    }
  } catch (err) {
    console.warn('EXIF parsing skipped, using file timestamp:', err);
  }

  // Fallback to file.lastModified
  if (file.lastModified) {
    return getLocalDateKey(new Date(file.lastModified));
  }

  return getLocalDateKey();
}
