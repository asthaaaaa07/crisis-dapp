import React, { useState } from 'react';
import { useBlockchain } from '../contexts/BlockchainContext.jsx';
import { uploadCrisisReport, validateFile } from '../services/ipfs.js';
import { 
  ExclamationTriangleIcon, 
  PhotoIcon, 
  MapPinIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

const ReportForm = () => {
  const { submitReport, isConnected } = useBlockchain();
  const [formData, setFormData] = useState({
    crisisType: '',
    description: '',
    location: '',
    severity: 'medium'
  });
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const crisisTypes = [
    'Natural Disaster',
    'Medical Emergency',
    'Infrastructure Failure',
    'Security Threat',
    'Environmental Hazard',
    'Other'
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateFile(file);
      setImage(file);
      setErrors(prev => ({ ...prev, image: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, image: error.message }));
      setImage(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.crisisType) {
      newErrors.crisisType = 'Crisis type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setErrors({ general: 'Please connect your wallet first' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare report data
      const reportData = {
        ...formData,
        timestamp: new Date().toISOString(),
        reporter: 'anonymous', // Will be set by contract
        image: image ? await uploadImageToIPFS(image) : null
      };

      // Upload to IPFS
      const cid = await uploadCrisisReport(reportData);

      // Submit to blockchain
      await submitReport(cid);

      // Reset form
      setFormData({
        crisisType: '',
        description: '',
        location: '',
        severity: 'medium'
      });
      setImage(null);

    } catch (error) {
      console.error('Failed to submit report:', error);
      setErrors({ general: error.message || 'Failed to submit report' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImageToIPFS = async (file) => {
    try {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = reader.result.split(',')[1];
            const response = await fetch('http://localhost:4000/api/ipfs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: file.name,
                dataBase64: base64
              })
            });
            const data = await response.json();
            resolve(data.cid);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error('Failed to upload image');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Submit Crisis Report</h2>
      </div>

      {errors.general && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Crisis Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Crisis Type *
          </label>
          <select
            name="crisisType"
            value={formData.crisisType}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.crisisType ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select crisis type</option>
            {crisisTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.crisisType && (
            <p className="mt-1 text-sm text-red-600">{errors.crisisType}</p>
          )}
        </div>

        {/* Severity Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Severity Level
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {severityLevels.map(level => (
              <label key={level.value} className="flex items-center">
                <input
                  type="radio"
                  name="severity"
                  value={level.value}
                  checked={formData.severity === level.value}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`w-full px-3 py-2 text-center rounded-lg border cursor-pointer transition-colors ${
                  formData.severity === level.value
                    ? `${level.color} border-current`
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}>
                  {level.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter location (city, coordinates, or address)"
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.location ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <div className="relative">
            <DocumentTextIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Provide detailed description of the crisis situation..."
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evidence Image (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <PhotoIcon className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600">
                {image ? image.name : 'Click to upload image or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </label>
          </div>
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
          )}
          {image && (
            <div className="mt-2 p-2 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ {image.name} selected
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isConnected}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isSubmitting || !isConnected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Submitting Report...</span>
            </div>
          ) : (
            'Submit Crisis Report'
          )}
        </button>

        {!isConnected && (
          <p className="text-center text-sm text-gray-600">
            Please connect your wallet to submit a report
          </p>
        )}
      </form>
    </div>
  );
};

export default ReportForm;
