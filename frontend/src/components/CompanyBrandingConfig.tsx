import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  SwatchIcon, 
  PhotoIcon, 
  BuildingOfficeIcon,
  CheckIcon,
  XMarkIcon,
  EyeDropperIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useCompanyBranding } from '../contexts/CompanyBrandingContext';
import toast from 'react-hot-toast';

interface CompanyBrandingConfigProps {
  companyId: string;
  onClose: () => void;
}

interface BrandingFormData {
  name: string;
  domain: string;
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
}

export default function CompanyBrandingConfig({ companyId, onClose }: CompanyBrandingConfigProps) {
  const { companyBranding, updateCompanyBranding } = useCompanyBranding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<BrandingFormData>({
    name: companyBranding?.name || '',
    domain: companyBranding?.domain || '',
    primaryColor: companyBranding?.primaryColor || '#2563eb',
    secondaryColor: companyBranding?.secondaryColor || '#1d4ed8',
    logo: companyBranding?.logo || ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  // Predefined color palettes for inspiration
  const colorPalettes = [
    { name: 'Professional Blue', primary: '#2563eb', secondary: '#1d4ed8' },
    { name: 'Modern Teal', primary: '#0d9488', secondary: '#0f766e' },
    { name: 'Corporate Purple', primary: '#7c3aed', secondary: '#6d28d9' },
    { name: 'Trustworthy Green', primary: '#059669', secondary: '#047857' },
    { name: 'Warm Orange', primary: '#ea580c', secondary: '#c2410c' },
    { name: 'Elegant Gray', primary: '#475569', secondary: '#334155' },
    { name: 'Bold Red', primary: '#dc2626', secondary: '#b91c1c' },
    { name: 'Creative Pink', primary: '#ec4899', secondary: '#db2777' }
  ];

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo file size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // In a real app, you would upload to cloud storage here
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update form data with the uploaded URL
      setFormData(prev => ({ 
        ...prev, 
        logo: previewLogo || URL.createObjectURL(file) 
      }));
      
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Logo upload failed:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.domain) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Update company branding
      updateCompanyBranding({
        name: formData.name,
        domain: formData.domain,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        logo: formData.logo
      });

      toast.success('Company branding updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update branding:', error);
      toast.error('Failed to update company branding');
    }
  };

  const resetToDefaults = () => {
    if (companyBranding) {
      setFormData({
        name: companyBranding.name,
        domain: companyBranding.domain,
        primaryColor: companyBranding.primaryColor,
        secondaryColor: companyBranding.secondaryColor,
        logo: companyBranding.logo
      });
      setPreviewLogo(null);
      toast.success('Reset to current branding');
    }
  };

  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '');
    if (!/^[0-9A-F]{6}$/i.test(hex)) return '#ffffff';
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    return yiq >= 128 ? '#000000' : '#ffffff';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <SwatchIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Company Branding</h2>
                <p className="text-sm text-gray-600">Customize your company's visual identity</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={resetToDefaults}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Reset to current branding"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Company Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BuildingOfficeIcon className="w-5 h-5 mr-2" />
              Company Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Company Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain *
                </label>
                <input
                  type="text"
                  required
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="company.com"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <PhotoIcon className="w-5 h-5 mr-2" />
              Company Logo
            </h3>
            
            <div className="flex items-center space-x-6">
              {/* Current Logo Display */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  {(previewLogo || formData.logo) ? (
                    <img
                      src={previewLogo || formData.logo}
                      alt="Company logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Upload Controls */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Logo
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUploading ? 'Uploading...' : 'Choose File'}
                    </button>
                    <span className="text-sm text-gray-500">
                      PNG, JPG up to 5MB
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
                
                {formData.logo && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, logo: '' }));
                      setPreviewLogo(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <SwatchIcon className="w-5 h-5 mr-2" />
              Color Scheme
            </h3>
            
            {/* Primary Color */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <EyeDropperIcon className="absolute inset-0 m-auto w-6 h-6 text-gray-400 pointer-events-none" />
                </div>
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  placeholder="#2563eb"
                />
                <div 
                  className="w-12 h-12 rounded-lg border border-gray-200 flex items-center justify-center text-xs font-medium"
                  style={{ 
                    backgroundColor: formData.primaryColor,
                    color: getContrastColor(formData.primaryColor)
                  }}
                >
                  Sample
                </div>
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <EyeDropperIcon className="absolute inset-0 m-auto w-6 h-6 text-gray-400 pointer-events-none" />
                </div>
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                  placeholder="#1d4ed8"
                />
                <div 
                  className="w-12 h-12 rounded-lg border border-gray-200 flex items-center justify-center text-xs font-medium"
                  style={{ 
                    backgroundColor: formData.secondaryColor,
                    color: getContrastColor(formData.secondaryColor)
                  }}
                >
                  Sample
                </div>
              </div>
            </div>

            {/* Color Palette Suggestions */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Suggested Color Palettes
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {colorPalettes.map((palette) => (
                  <button
                    key={palette.name}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        primaryColor: palette.primary,
                        secondaryColor: palette.secondary
                      }));
                    }}
                    className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                  >
                    <div className="flex space-x-2 mb-2">
                      <div 
                        className="w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: palette.primary }}
                      />
                      <div 
                        className="w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: palette.secondary }}
                      />
                    </div>
                    <div className="text-xs font-medium text-gray-900">{palette.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Preview</h3>
            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-4 mb-4">
                {(previewLogo || formData.logo) ? (
                  <img
                    src={previewLogo || formData.logo}
                    alt="Preview logo"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold"
                    style={{ 
                      backgroundColor: formData.primaryColor,
                      color: getContrastColor(formData.primaryColor)
                    }}
                  >
                    {formData.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 
                    className="text-xl font-bold"
                    style={{ color: formData.primaryColor }}
                  >
                    {formData.name || 'Company Name'}
                  </h4>
                  <p className="text-gray-600">{formData.domain || 'company.com'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  <span 
                    className="text-sm font-medium"
                    style={{ color: getContrastColor(formData.primaryColor) }}
                  >
                    Primary Color
                  </span>
                </div>
                <div 
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: formData.secondaryColor }}
                >
                  <span 
                    className="text-sm font-medium"
                    style={{ color: getContrastColor(formData.secondaryColor) }}
                  >
                    Secondary Color
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <CheckIcon className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
