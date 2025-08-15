import { uploadToIPFS } from './api.js';

// Convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Convert JSON data to base64
export const jsonToBase64 = (data) => {
  const jsonString = JSON.stringify(data, null, 2);
  return btoa(unescape(encodeURIComponent(jsonString)));
};

// Upload file to IPFS
export const uploadFileToIPFS = async (file, name = null) => {
  try {
    const base64 = await fileToBase64(file);
    const fileName = name || file.name;
    const cid = await uploadToIPFS(fileName, base64);
    return cid;
  } catch (error) {
    console.error('Failed to upload file to IPFS:', error);
    throw error;
  }
};

// Upload JSON data to IPFS
export const uploadJsonToIPFS = async (data, name = 'data.json') => {
  try {
    const base64 = jsonToBase64(data);
    const cid = await uploadToIPFS(name, base64);
    return cid;
  } catch (error) {
    console.error('Failed to upload JSON to IPFS:', error);
    throw error;
  }
};

// Upload crisis report data
export const uploadCrisisReport = async (reportData) => {
  try {
    const reportJson = {
      type: 'crisis_report',
      timestamp: new Date().toISOString(),
      data: reportData
    };
    
    const cid = await uploadJsonToIPFS(reportJson, 'crisis_report.json');
    return cid;
  } catch (error) {
    console.error('Failed to upload crisis report:', error);
    throw error;
  }
};

// Upload proof of help data
export const uploadProofOfHelp = async (proofData) => {
  try {
    const proofJson = {
      type: 'proof_of_help',
      timestamp: new Date().toISOString(),
      data: proofData
    };
    
    const cid = await uploadJsonToIPFS(proofJson, 'proof_of_help.json');
    return cid;
  } catch (error) {
    console.error('Failed to upload proof of help:', error);
    throw error;
  }
};

// Get IPFS gateway URL
export const getIPFSGatewayURL = (cid) => {
  return `https://ipfs.io/ipfs/${cid}`;
};

// Validate file size and type
export const validateFile = (file, maxSize = 5 * 1024 * 1024) => { // 5MB default
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/json'
  ];

  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported');
  }

  return true;
};

export default {
  fileToBase64,
  jsonToBase64,
  uploadFileToIPFS,
  uploadJsonToIPFS,
  uploadCrisisReport,
  uploadProofOfHelp,
  getIPFSGatewayURL,
  validateFile
};
