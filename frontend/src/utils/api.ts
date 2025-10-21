import { getToken } from './auth';

const api = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['x-auth-token'] = token;
  }

  const fullUrl = `http://127.0.0.1:8000${url}`;
  console.log('Fetching URL:', fullUrl);
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  return response;
};

export default api;