
import { ApiResponse, AuthData, Task, TaskList, CreateTaskRequest, UpdateTaskRequest, Priority } from './types';

const BASE_URL = 'https://you-do-beryl.vercel.app/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('youdo_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Helper wrapper untuk debugging request/response
const fetchWithLog = async (url: string, options: RequestInit = {}) => {
  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };

  console.log(`[API REQ] ${options.method || 'GET'} ${url}`, options.body ? JSON.parse(options.body as string) : '');
  
  try {
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    console.log(`[API RES] ${res.status} ${url}:`, text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // If response is not JSON (e.g. 404 HTML, 500 Server Error page)
      if (!res.ok) {
        throw new Error(`Server Error (${res.status}): ${text.substring(0, 50)}...`);
      }
      throw new Error(`Invalid JSON Response from server: ${text.substring(0, 50)}...`);
    }

    // Handle non-200 HTTP status
    if (!res.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err: any) {
    console.error(`[API ERR] ${url}:`, err);
    if (err.message === 'Failed to fetch') {
        throw new Error('Network Error: Unable to connect to server. This might be due to CORS issues or the server is down.');
    }
    throw err;
  }
};

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<ApiResponse<AuthData>> => {
      return fetchWithLog(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    },
    register: async (name: string, email: string, password: string): Promise<ApiResponse<AuthData>> => {
      return fetchWithLog(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
    }
  },
  tasks: {
    getAll: async (): Promise<ApiResponse<TaskList>> => {
      return fetchWithLog(`${BASE_URL}/tasks`, {
        headers: getAuthHeaders(),
      });
    },
    create: async (task: CreateTaskRequest): Promise<ApiResponse<Task>> => {
      return fetchWithLog(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(task),
      });
    },
    getById: async (id: number): Promise<ApiResponse<Task>> => {
      return fetchWithLog(`${BASE_URL}/tasks/${id}`, {
        headers: getAuthHeaders(),
      });
    },
    update: async (id: number, task: UpdateTaskRequest): Promise<ApiResponse<Task>> => {
      return fetchWithLog(`${BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(task),
      });
    },
    delete: async (id: number): Promise<ApiResponse<string>> => {
      return fetchWithLog(`${BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    }
  }
};
