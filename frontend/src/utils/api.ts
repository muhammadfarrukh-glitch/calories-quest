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

  const fullUrl = `${import.meta.env.VITE_API_BASE_URL}${url}`;
  console.log('Fetching URL:', fullUrl);
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  return response;
};

export default api;