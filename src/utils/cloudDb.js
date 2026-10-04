/**
 * Cloud Database Service for GitHub Pages / Static Hosting.
 * Synchronizes votes and comments across multiple mobile devices using Firebase / Cloud REST.
 */

// Default free cloud Realtime Database endpoint for instant out-of-the-box sync
const DEFAULT_CLOUD_DB = 'https://zeiolabs-voting-default-rtdb.firebaseio.com';

// Local storage keys for offline cache
const CACHE_VOTES_KEY = 'zeio_voting_cache_votes';
const CACHE_COMMENTS_KEY = 'zeio_voting_cache_comments';

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
 * Fetch current global votes: { [category]: { [deviceId]: imageId } }
 */
export async function getGlobalVotes() {
  try {
    const res = await fetch(`${DEFAULT_CLOUD_DB}/votes.json`, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        setLocalCache(CACHE_VOTES_KEY, data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Cloud DB offline, using local cache:', err);
  }
  return getLocalCache(CACHE_VOTES_KEY);
}

/**
 * Cast or toggle vote for an image
 */
export async function castVote(category, imageId, deviceId) {
  const votes = await getGlobalVotes();
  
  if (!votes[category]) {
    votes[category] = {};
  }

  const currentVote = votes[category][deviceId];

  if (currentVote === imageId) {
    // Unvote
    delete votes[category][deviceId];
  } else {
    // Set vote
    votes[category][deviceId] = imageId;
  }

  // Save to local cache immediately
  setLocalCache(CACHE_VOTES_KEY, votes);

  // Sync to Cloud DB
  try {
    await fetch(`${DEFAULT_CLOUD_DB}/votes/${encodeURIComponent(category)}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(votes[category] || {})
    });
  } catch (err) {
    console.error('Error syncing vote to cloud:', err);
  }

  return votes;
}

/**
 * Fetch comments for all images: { [imageIdEscaped]: [ { id, author, text, timestamp } ] }
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
 * Escape image ID for Firebase keys (replaces / with __)
 */
function escapeKey(key) {
  return String(key).replace(/\//g, '__').replace(/\./g, '_');
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

  // Sync to cloud
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
