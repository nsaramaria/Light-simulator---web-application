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
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
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