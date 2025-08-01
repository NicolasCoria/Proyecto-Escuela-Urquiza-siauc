import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:8000/api',
  withCredentials: true
});

axiosClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('ACCESS_TOKEN');
  const role = sessionStorage.getItem('role');

  axios.defaults.withXSRFToken = true;
  config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-User-Role'] = role;

  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response && response.status === 401) {
      sessionStorage.removeItem('ACCESS_TOKEN');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('user');
    }
    throw error;
  }
);

export default axiosClient;
