import { getToken } from './auth';

const api = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = { ...options.headers };

  if (options.body && typeof options.body === 'string') {
    try {
      JSON.parse(options.body);
      headers['Content-Type'] = 'application/json';
    } catch (e) {
      // Not a JSON string, do not set Content-Type
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('Token:', token);
  console.log('Headers:', headers);

  const fullUrl = `${import.meta.env.VITE_API_BASE_URL}${url}`;
  console.log('Fetching URL:', fullUrl);
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  return response;
};

export default api;