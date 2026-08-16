// pages/api/admin/settings.js
import { executeQuery } from '@/lib/db';
import { memoryStore } from '@/lib/memoryStore';

/**
 * Reads all setting key-value pairs from MySQL system_settings table.
 */
async function fetchSettingsFromDb() {
  const settingsObj = {};

  try {
    const result = await executeQuery('SELECT setting_key, setting_value FROM system_settings');
    if (result.success && Array.isArray(result.data)) {
      for (const row of result.data) {
        if (row.setting_key) {
          let val = row.setting_value;
          // Attempt JSON parse for objects/booleans/arrays stored in setting_value
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
            try {
              val = JSON.parse(val);
            } catch {}
          }
          settingsObj[row.setting_key] = val;
        }
      }
    }
  } catch (err) {
    console.warn('MySQL system_settings fetch warning:', err.message);
  }

  return settingsObj;
}

/**
 * Saves a single key-value setting pair directly to MySQL system_settings table.
 */
async function saveSettingToDb(key, value) {
  if (!key) return;
  const strVal = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
  try {
    await executeQuery(
      `INSERT INTO system_settings (setting_key, setting_value, updated_at)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
      [key, strVal]
    );
  } catch (err) {
    console.warn(`Failed to save setting ${key} to MySQL system_settings:`, err.message);
  }
}

export default async function handler(req, res) {
  // GET — Fetch settings from MySQL system_settings table with fallbacks
  if (req.method === 'GET') {
    const dbSettings = await fetchSettingsFromDb();

    // Consolidate settings with fallbacks
    const groqApiKey = dbSettings.groqApiKey || dbSettings.groq_api_key || memoryStore?.settings?.groqApiKey || memoryStore?.settings?.groq_api_key || process.env.GROQ_API_KEY || '';
    const groqModel = dbSettings.groqModel || dbSettings.groq_model || memoryStore?.settings?.groqModel || memoryStore?.settings?.groq_model || 'llama-3.3-70b-versatile';
    const siteName = dbSettings.siteName || dbSettings.site_name || 'Genesis Incubation Centre';
    const siteUrl = dbSettings.siteUrl || dbSettings.site_url || 'https://genesis.com';
    const contactEmail = dbSettings.contactEmail || dbSettings.contact_email || 'admin@genesis.com';

    const mergedSettings = {
      ...memoryStore.settings,
      ...dbSettings,
      groqApiKey,
      groq_api_key: groqApiKey,
      groqModel,
      groq_model: groqModel,
      siteName,
      site_name: siteName,
      siteUrl,
      site_url: siteUrl,
      contactEmail,
      contact_email: contactEmail,
      updated_at: dbSettings.updated_at || new Date().toISOString()
    };

    // Keep memoryStore synced
    memoryStore.settings = mergedSettings;

    return res.status(200).json({
      success: true,
      settings: mergedSettings,
    });
  }

  // POST — Test Connection OR Save Settings
  if (req.method === 'POST') {
    const { action, groqApiKey, groq_api_key, groqModel, groq_model, siteName, siteUrl, contactEmail, ...otherSettings } = req.body || {};

    // 1. Groq AI Connection Test
    if (action === 'test') {
      const activeDbSettings = await fetchSettingsFromDb();

      const keyToTest = (groqApiKey || groq_api_key) ??
        activeDbSettings.groqApiKey ??
        activeDbSettings.groq_api_key ??
        memoryStore.settings?.groqApiKey ??
        memoryStore.settings?.groq_api_key ??
        process.env.GROQ_API_KEY ??
        '';

      const modelToTest = (groqModel || groq_model) ??
        activeDbSettings.groqModel ??
        activeDbSettings.groq_model ??
        memoryStore.settings?.groqModel ??
        'llama-3.3-70b-versatile';

      if (!keyToTest || typeof keyToTest !== 'string' || !keyToTest.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Groq API Key is missing. Please enter a valid key to test.',
        });
      }

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keyToTest.trim()}`,
          },
          body: JSON.stringify({
            model: modelToTest,
            messages: [{ role: 'user', content: 'Connection test' }],
            max_tokens: 5,
          }),
        });

        if (response.ok) {
          return res.status(200).json({
            success: true,
            message: `Groq AI connection test successful! (${modelToTest})`,
          });
        } else {
          const errBody = await response.json().catch(() => ({}));
          const errMsg = errBody?.error?.message || response.statusText || `HTTP ${response.status}`;
          return res.status(400).json({
            success: false,
            message: `Groq AI connection failed (${response.status}): ${errMsg}`,
          });
        }
      } catch (fetchErr) {
        return res.status(500).json({
          success: false,
          message: `Network/Connection error: ${fetchErr.message}`,
        });
      }
    }

    // 2. Save Settings Directly to MySQL system_settings Table
    const effectiveApiKey = groqApiKey !== undefined ? groqApiKey : groq_api_key;
    const effectiveModel = groqModel !== undefined ? groqModel : groq_model;

    // Write to MySQL system_settings table
    if (effectiveApiKey !== undefined) {
      await saveSettingToDb('groqApiKey', effectiveApiKey);
      await saveSettingToDb('groq_api_key', effectiveApiKey);
    }

    if (effectiveModel !== undefined) {
      await saveSettingToDb('groqModel', effectiveModel);
      await saveSettingToDb('groq_model', effectiveModel);
    }

    if (siteName !== undefined) {
      await saveSettingToDb('siteName', siteName);
      await saveSettingToDb('site_name', siteName);
    }

    if (siteUrl !== undefined) {
      await saveSettingToDb('siteUrl', siteUrl);
      await saveSettingToDb('site_url', siteUrl);
    }

    if (contactEmail !== undefined) {
      await saveSettingToDb('contactEmail', contactEmail);
      await saveSettingToDb('contact_email', contactEmail);
    }

    // Save any other settings passed in body
    for (const [key, val] of Object.entries(otherSettings)) {
      if (key && key !== 'action') {
        await saveSettingToDb(key, val);
      }
    }

    // Query back complete updated settings from MySQL
    const updatedDbSettings = await fetchSettingsFromDb();

    const finalApiKey = updatedDbSettings.groqApiKey || updatedDbSettings.groq_api_key || (effectiveApiKey !== undefined ? effectiveApiKey : process.env.GROQ_API_KEY) || '';
    const finalModel = updatedDbSettings.groqModel || updatedDbSettings.groq_model || (effectiveModel !== undefined ? effectiveModel : 'llama-3.3-70b-versatile');

    const updatedSettings = {
      ...memoryStore.settings,
      ...updatedDbSettings,
      groqApiKey: finalApiKey,
      groq_api_key: finalApiKey,
      groqModel: finalModel,
      groq_model: finalModel,
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Sync memoryStore.settings
    memoryStore.settings = updatedSettings;

    return res.status(200).json({
      success: true,
      message: 'Settings saved successfully directly to MySQL system_settings table',
      settings: updatedSettings,
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
}
