// lib/api.ts

export async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${path}`;

  // Add the HeadersInit type here
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Get token from localStorage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Something went wrong');
  }

  return response.json();
}