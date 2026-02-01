import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import defaultConfig from '../config/tenants/default.json';

const ConfigContext = createContext(null);

const fallbackConfig = {
  id: 'default',
  name: 'Glass Dynamics',
  branding: { primaryColor: '#2563eb', logoUrl: '/logo.png' },
  labels: { order: 'Order', installer: 'Installer' }
};

async function loadTenantConfig(tenantId) {
  if (!tenantId) return null;
  const file = tenantId === 'default_glass_dynamics' ? 'default' : tenantId;
  try {
    const res = await fetch(`/config/tenants/${file}.json`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Tenant config fetch failed:', e);
  }
  return null;
}

export function ConfigProvider({ children }) {
  const location = useLocation();
  const [config, setConfig] = useState(defaultConfig);

  // Re-read tenantId when route changes (e.g. after login) and load that tenant's config
  useEffect(() => {
    let cancelled = false;
    const userInfo = (() => {
      try {
        return JSON.parse(localStorage.getItem('userInfo') || 'null');
      } catch {
        return null;
      }
    })();
    const tenantId = userInfo?.tenantId;

    if (!tenantId) {
      setConfig(defaultConfig);
      return;
    }

    loadTenantConfig(tenantId).then((loaded) => {
      if (!cancelled && loaded) setConfig(loaded);
      else if (!cancelled) setConfig(defaultConfig);
    });
    return () => { cancelled = true; };
  }, [location.pathname]);

  useEffect(() => {
    const color = config?.branding?.primaryColor || fallbackConfig.branding.primaryColor;
    document.documentElement.style.setProperty('--primary-color', color);
  }, [config]);

  return (
    <ConfigContext.Provider value={{ config: config || defaultConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  return ctx?.config ?? null;
}
