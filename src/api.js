const API_URL = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('token');

const request = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();

  // Auto-logout on expired/invalid token
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong');
    err.data = data;
    throw err;
  }
  return data;
};

// Auth
export const register = (email, password) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

// Scenes
export const saveScene = (name, sceneData) =>
  request('/scenes', {
    method: 'POST',
    body: JSON.stringify({ name, sceneData }),
  });

export const getScenes = () => request('/scenes');

export const getScene = (id) => request(`/scenes/${id}`);

export const updateScene = (id, name, sceneData) =>
  request(`/scenes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, sceneData }),
  });

export const deleteScene = (id) =>
  request(`/scenes/${id}`, { method: 'DELETE' });

export const startImageTo3D = (imageDataUri, texturePrompt, testMode = false) =>
  request('/generate/image-to-3d', {
    method: 'POST',
    body: JSON.stringify({ imageDataUri, texturePrompt, testMode }),
  });

export const getImageTo3D = (taskId, testMode = false) =>
  request(`/generate/image-to-3d/${taskId}${testMode ? '?test=1' : ''}`);

export const getGenerationUsage = () => request('/generate/usage');

export const purchaseCredits = (pack) =>
  request('/generate/purchase', { method: 'POST', body: JSON.stringify({ pack }) });

export const fetchGeneratedModel = async (taskId, testMode = false) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/generate/image-to-3d/${taskId}/model${testMode ? '?test=1' : ''}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to download generated model');
  }
  return res.blob();
};