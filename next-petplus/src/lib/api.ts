const API_URL = 'https://petplus-backend.onrender.com/api';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit & { isFormData?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {};

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('petplus_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (!options.isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const { isFormData, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      ...headers,
      ...(fetchOptions.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}
