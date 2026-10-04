/**
 * Cloud Database Service for GitHub Pages / Static Hosting.
 * Supports multi-voting per device across any number of images.
 */

const DEFAULT_CLOUD_DB = 'https://zeiolabs-voting-default-rtdb.firebaseio.com';

const CACHE_VOTES_KEY = 'zeio_voting_cache_votes_v2';
const CACHE_COMMENTS_KEY = 'zeio_voting_cache_comments';

function escapeKey(key) {
  return String(key).replace(/\//g, '__').replace(/\./g, '_');
}

function getLocalCache(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function setLocalCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Error saving local cache:', err);
  }
}

/**
 * Fetch global votes map: { [escapedImageId]: { [deviceId]: true } }
 */
export async function getGlobalVotes() {
  try {
    const res = await fetch(`${DEFAULT_CLOUD_DB}/votes_v2.json`, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        setLocalCache(CACHE_VOTES_KEY, data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Cloud DB votes offline, using cache:', err);
  }
  return getLocalCache(CACHE_VOTES_KEY);
}

/**
 * Toggle vote for a specific image (Allows voting multiple images freely)
 */
export async function castVote(category, imageId, deviceId) {
  const safeId = escapeKey(imageId);
  const votesMap = await getGlobalVotes();
  
  if (!votesMap[safeId]) {
    votesMap[safeId] = {};
  }

  const hasVoted = Boolean(votesMap[safeId][deviceId]);

  if (hasVoted) {
    // Remove vote (unlike)
    delete votesMap[safeId][deviceId];
  } else {
    // Add vote (like)
    votesMap[safeId][deviceId] = true;
  }

  setLocalCache(CACHE_VOTES_KEY, votesMap);

  // Sync to Cloud DB
  try {
    await fetch(`${DEFAULT_CLOUD_DB}/votes_v2/${safeId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(votesMap[safeId] || {})
    });
  } catch (err) {
    console.error('Error syncing vote to cloud:', err);
  }

  return votesMap;
}

/**
 * Fetch comments for all images
 */
export async function getGlobalComments() {
  try {
    const res = await fetch(`${DEFAULT_CLOUD_DB}/comments.json`, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        setLocalCache(CACHE_COMMENTS_KEY, data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Cloud DB comments offline, using cache:', err);
  }
  return getLocalCache(CACHE_COMMENTS_KEY);
}

/**
 * Add a comment to an image
 */
export async function addComment(imageId, author, text) {
  const safeId = escapeKey(imageId);
  const commentsMap = await getGlobalComments();

  if (!commentsMap[safeId]) {
    commentsMap[safeId] = [];
  }

  const newComment = {
    id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    author: author ? author.trim() : 'Amigo Anónimo',
    text: text.trim(),
    timestamp: new Date().toISOString()
  };

  commentsMap[safeId].push(newComment);
  setLocalCache(CACHE_COMMENTS_KEY, commentsMap);

  try {
    await fetch(`${DEFAULT_CLOUD_DB}/comments/${safeId}.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment)
    });
  } catch (err) {
    console.error('Error syncing comment to cloud:', err);
  }

  return commentsMap[safeId];
}

/**
 * Get comments for specific image
 */
export async function getCommentsForImage(imageId) {
  const safeId = escapeKey(imageId);
  const commentsMap = await getGlobalComments();
  const list = commentsMap[safeId];
  if (Array.isArray(list)) return list;
  if (list && typeof list === 'object') return Object.values(list);
  return [];
}
