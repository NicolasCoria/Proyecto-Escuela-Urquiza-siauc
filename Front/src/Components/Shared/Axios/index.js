import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:8000/api',
  withCredentials: true
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  const role = localStorage.getItem('role');

  console.log('Axios Interceptor - Token:', token);
  console.log('Axios Interceptor - Role:', role);
  console.log('Axios Interceptor - URL:', config.url);

  if (token) {
    axios.defaults.withXSRFToken = true;
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-User-Role'] = role;
    console.log('Axios Interceptor - Headers configurados:', config.headers);
  } else {
    console.log('Axios Interceptor - No token encontrado');
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response && response.status === 401) {
      localStorage.removeItem('ACCESS_TOKEN');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    }
    throw error;
  }
);

export default axiosClient;
