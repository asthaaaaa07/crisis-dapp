import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Contract addresses
export const getContractAddresses = async () => {
  try {
    const response = await api.get('/contracts');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch contract addresses:', error);
    throw error;
  }
};

// IPFS upload
export const uploadToIPFS = async (name, dataBase64) => {
  try {
    const response = await api.post('/ipfs', {
      name,
      dataBase64,
    });
    return response.data.cid;
  } catch (error) {
    console.error('Failed to upload to IPFS:', error);
    throw error;
  }
};

// Oracle finalization
export const finalizeReport = async (reportId, valid) => {
  try {
    const response = await api.post('/oracle/finalize', {
      reportId,
      valid,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to finalize report:', error);
    throw error;
  }
};

// Donation history
export const getDonationHistory = async () => {
  try {
    const response = await api.get('/donations');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch donation history:', error);
    throw error;
  }
};

export default api;
