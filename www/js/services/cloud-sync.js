/**
 * Pluggable Cloud Sync Adapter ($0/Month Free Tier Ready)
 * Seamlessly transitions between offline IndexedDB and free-tier Supabase/Firebase
 */
export class CloudSyncAdapter {
  constructor({ supabaseUrl = null, supabaseAnonKey = null } = {}) {
    this.supabaseUrl = supabaseUrl || window.SWEATCIRCLE_SUPABASE_URL || null;
    this.supabaseAnonKey = supabaseAnonKey || window.SWEATCIRCLE_SUPABASE_KEY || null;
    this.isOnlineSyncConfigured = Boolean(this.supabaseUrl && this.supabaseAnonKey);
  }

  getStatus() {
    return {
      configured: this.isOnlineSyncConfigured,
      mode: this.isOnlineSyncConfigured ? 'cloud-realtime' : 'offline-device-first'
    };
  }

  /**
   * Syncs a new workout/meal log to remote cloud database if configured
   */
  async syncLog(logPayload) {
    if (!this.isOnlineSyncConfigured) {
      return { synced: false, reason: 'offline-mode' };
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/circle_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(logPayload)
      });

      return { synced: response.ok, status: response.status };
    } catch (err) {
      console.warn('Cloud sync error (stored locally):', err);
      return { synced: false, error: err.message };
    }
  }

  /**
   * Fetches latest logs for a given circle
   */
  async fetchCircleLogs(circleId) {
    if (!this.isOnlineSyncConfigured) {
      return [];
    }

    try {
      const res = await fetch(`${this.supabaseUrl}/rest/v1/circle_logs?circle_id=eq.${circleId}&order=dateKey.desc`, {
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`
        }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Fetch circle logs fallback to offline:', err);
    }
    return [];
  }
}

export const cloudSync = new CloudSyncAdapter();
