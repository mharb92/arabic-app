/**
 * config.js
 * Single source of truth for all configuration constants
 * NO dependencies
 */

// Supabase Configuration
export const SUPABASE_URL = 'https://xkhulybdrxdzakarivvi.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhraHVseWJkcnhkemFrYXJpdnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNDI4NzksImV4cCI6MjA0ODgxODg3OX0.sb_publishable_NtOLOeDOCn3w2faTU4m8Ow_4iUhcVkM';

// Claude API Configuration (via Supabase Edge Function)
export const API_ENDPOINT = 'https://xkhulybdrxdzakarivvi.supabase.co/functions/v1/claude';
export const API_MODEL = 'claude-sonnet-4-20250514';

// Push Notification Configuration
export const VAPID_PUBLIC_KEY = 'BOJT9sBVkyJ8O7OO3dFqGUxFXqgyNaHqDnbSOmJajDY6s0K350HTgoyddWh3qkeeZyi7Kt4cfmqH_F5hNLfxOb4';

// Aya's Course Configuration
export const AYA_EMAILS = ['ayamariner@gmail.com', 'aya.test@gmail.com'];
export const JUNE_5_2026 = new Date('2026-06-05T00:00:00');

// Service Worker
export const SW_PATH = '/arabic-app/sw.js';

// App Metadata
export const APP_NAME = 'Arabic Mastery';
export const APP_VERSION = 'v3.0.0';
export const THEME_COLOR = '#1a6b50';
