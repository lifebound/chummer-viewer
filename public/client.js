// client.js: Centralized client-server API calls and helpers

// Session-aware fetch helper
export async function fetchWithSessionRetry(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (res.status === 401) {
      document.cookie = 'connect.sid=; Max-Age=0; path=/;';
      return fetch(url, options);
    }
    return res;
  } catch (err) {
    throw err;
  }
}

async function handleUpload(file) {
  try {
    const formData = new FormData();
    formData.append('character', file);
    const response = await fetchWithSessionRetry('/upload', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Upload failed');
    appState.characterData = await response.json();
    displayCharacter(appState);
  } catch (err) {
    console.error('Upload error:', err);
    showUploadError(err);
  }
}

// Upload character file
export async function uploadCharacterFile(file) {
  const formData = new FormData();
  formData.append('character', file);
  const response = await fetchWithSessionRetry('/upload', {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}

// Login
export async function login(username, password) {
  const res = await fetchWithSessionRetry('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

// Logout
export async function logout() {
  return fetchWithSessionRetry('/api/logout', { method: 'POST' });
}

// Session check
export async function checkSession() {
  const res = await fetchWithSessionRetry('/api/session');
  return res.json();
}

// Append job to character
export async function appendJob(formData) {
  const response = await fetchWithSessionRetry('/append-job', {
    method: 'POST',
    body: formData
  });
  return response;
}
