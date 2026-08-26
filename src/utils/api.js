const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

const stripTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const isLocalHostname = (hostname) => {
  if (!hostname) {
    return false;
  }

  return LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost');
};

export const getApplicationEndpoint = () => {
  const configured = stripTrailingSlash(import.meta.env.VITE_APP_APPLICATION_ENDPOINT || '');

  if (!configured) {
    return typeof window !== 'undefined' ? stripTrailingSlash(window.location.origin) : '';
  }

  if (typeof window === 'undefined') {
    return configured;
  }

  try {
    const configuredUrl = new URL(configured);

    if (isLocalHostname(configuredUrl.hostname) && !isLocalHostname(window.location.hostname)) {
      return stripTrailingSlash(window.location.origin);
    }
  } catch {
    // Leave non-URL values untouched so custom deployment targets still work.
  }

  return configured;
};

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApplicationEndpoint()}${normalizedPath}`;
};
