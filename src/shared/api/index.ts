import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:4001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token in all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('access_token');
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
