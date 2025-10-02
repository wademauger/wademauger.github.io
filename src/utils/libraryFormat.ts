// Utilities for namespaced library format
export function countNamespaces(libraryObj) {
  if (!libraryObj || typeof libraryObj !== 'object') return {};
  const ns = libraryObj.namespaces || libraryObj;
  const counts = {};
  Object.keys(ns).forEach((k) => {
    const arr = ns[k];
    // Special-case for songs namespace which may be structured as artists -> albums -> songs
    if (k === 'songs' && arr && typeof arr === 'object') {
      // If songs namespace is an array (legacy), count entries as songs
      if (Array.isArray(arr)) {
        counts['songs'] = arr.length;
        // no artists data available
      } else {
        // Expecting shape: { artists: [ { name, albums: [ { name, songs: [...] } ] }, ... ] }
        if (Array.isArray(arr.artists)) {
          const artists = arr.artists.length;
          let songCount = 0;
          for (const artist of arr.artists) {
            if (!artist) continue;
            // artist.albums may be array or object
            const albums = Array.isArray(artist.albums) ? artist.albums : (artist.albums && typeof artist.albums === 'object' ? Object.values(artist.albums) : []);
            for (const album of albums) {
              if (!album) continue;
              if (Array.isArray(album.songs)) songCount += album.songs.length;
              else if (album.songs && typeof album.songs === 'object') songCount += Object.keys(album.songs).length;
            }
          }
          counts['artists'] = artists;
          counts['songs'] = songCount;
        } else {
          // fallback: if object keys look like artist names
          const possibleArtists = Object.keys(arr).filter(k2 => k2 !== 'metadata');
          let artists = possibleArtists.length;
          let songCount = 0;
          for (const aKey of possibleArtists) {
            const artistEntry = arr[aKey];
            if (!artistEntry) continue;
            // artistEntry.albums or artistEntry.songs
            if (Array.isArray(artistEntry.albums)) {
              for (const alb of artistEntry.albums) {
                if (!alb) continue;
                if (Array.isArray(alb.songs)) songCount += alb.songs.length;
                else if (alb.songs && typeof alb.songs === 'object') songCount += Object.keys(alb.songs).length;
              }
            } else if (Array.isArray(artistEntry.songs)) {
              songCount += artistEntry.songs.length;
            } else if (artistEntry && typeof artistEntry === 'object') {
              // count keys as songs
              songCount += Object.keys(artistEntry).length;
            }
          }
          counts['artists'] = artists;
          counts['songs'] = songCount;
        }
      }
    } else {
      if (Array.isArray(arr)) counts[k] = arr.length;
      else if (arr && typeof arr === 'object') counts[k] = Object.keys(arr).length;
      else counts[k] = 0;
    }
  });
  return counts;
}

export function detectLegacyFormat(obj) {
  // Legacy format: top-level array of entries or top-level object that isn't namespaced
  if (!obj || typeof obj !== 'object') return { isLegacy: false };
  const hasNamespaces = !!obj.namespaces;
  if (hasNamespaces) return { isLegacy: false };
  // If top-level keys look like namespace names (panels, recipes, songs) and are arrays, consider not legacy
  const likelyNamespaces = ['panels', 'recipes', 'songs', 'colorworks', 'patterns'];
  const topKeys = Object.keys(obj);
  const matches = topKeys.filter(k => likelyNamespaces.includes(k) && Array.isArray(obj[k]));
  // If there are multiple top-level keys that match known namespaces (and more than one),
  // treat as already namespaced. If there's only one key and it's an array, we'll treat it as legacy below.
  if (matches.length > 0 && topKeys.length === matches.length && topKeys.length > 1) return { isLegacy: false };

  // If the top-level is an array -> legacy single-namespace
  if (Array.isArray(obj)) return { isLegacy: true, inferredNamespace: 'panels' };

  // If there's a single top-level key that is an array, infer that as the namespace
  if (topKeys.length === 1 && Array.isArray(obj[topKeys[0]])) {
    return { isLegacy: true, inferredNamespace: topKeys[0] };
  }

  // Otherwise not considered legacy
  return { isLegacy: false };
}

export function migrateLegacyToNamespaced(obj, namespace = 'panels') {
  if (!obj) return { metadata: {}, namespaces: { [namespace]: [] } };
  if (obj.namespaces) return obj; // already namespaced
  let entries = [];
  if (Array.isArray(obj)) entries = obj;
  else {
    const keys = Object.keys(obj);
    if (keys.length === 1 && Array.isArray(obj[keys[0]])) entries = obj[keys[0]];
    else entries = [];
  }
  const now = new Date().toISOString();
  return {
    metadata: { name: `migrated-${namespace}`, createdAt: now, updatedAt: now, schemaVersion: 1 },
    namespaces: { [namespace]: entries }
  };
}

const defaultExport = { countNamespaces, detectLegacyFormat, migrateLegacyToNamespaced };

export default defaultExport;
