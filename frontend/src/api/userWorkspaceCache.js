const CACHE_TTL_MS = 60_000;

const responseCache = new Map();
const pendingRequests = new Map();

function buildCacheKey(url, token) {
  return (token || '') + ':' + url;
}

export async function fetchCachedJson(url, token, force = false) {
  const cacheKey = buildCacheKey(url, token);
  const now = Date.now();
  const cachedEntry = responseCache.get(cacheKey);

  if (!force && cachedEntry && now - cachedEntry.savedAt < CACHE_TTL_MS) {
    return cachedEntry.data;
  }

  if (!force && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const request = fetch(url, {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.detail || 'Veriler yüklenemedi.');
      }

      responseCache.set(cacheKey, {
        data,
        savedAt: Date.now()
      });

      return data;
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, request);
  return request;
}

export function prefetchUserWorkspaceData(apiBaseUrl, token) {
  if (!token) {
    return Promise.resolve([]);
  }

  const paths = ['/topics', '/learning-logs', '/resources'];

  return Promise.allSettled(
    paths.map((path) => fetchCachedJson(apiBaseUrl + path, token))
  );
}
