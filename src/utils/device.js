/**
 * Utility to manage unique device identifier and user metadata
 */

export function getDeviceId() {
  let deviceId = localStorage.getItem('zeio_voting_device_id');
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
    localStorage.setItem('zeio_voting_device_id', deviceId);
  }
  return deviceId;
}

export function getUserNickname() {
  return localStorage.getItem('zeio_voting_nickname') || '';
}

export function setUserNickname(name) {
  if (name && name.trim()) {
    localStorage.setItem('zeio_voting_nickname', name.trim());
  }
}
