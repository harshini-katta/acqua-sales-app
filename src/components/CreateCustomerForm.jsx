import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, Upload, Check, X, Grid, List } from 'lucide-react';

// Mock AWS S3 service - replace with your actual AWS integration  
const mockS3Service = {
  getTemplatesForCategory: async (category, page = 1, limit = 10) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 🎯 STEP 1: ADD YOUR OWN TEMPLATE IMAGES HERE
    const yourTemplateUrls = [
      // Option 1: Host on your server (put images in public/templates/ folder)
      '/templates/water_bottle.png',
      
      // Option 2: Base64 data URLs (convert your images to base64)
      // 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD...',
      
      // Option 3: Your own server URLs  
      // 'https://your-domain.com/templates/template1.jpg',
    ];
    
    // Create canvas-based template images to avoid CORS issues
    const createTemplateImage = (width, height, text, bgColor, textColor = '#333', pattern = 'default') => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      
      // Background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      if (pattern === 'water-bottle') {
        gradient.addColorStop(0, '#e0f2fe');
        gradient.addColorStop(0.5, '#bae6fd');
        gradient.addColorStop(1, '#7dd3fc');
      } else if (pattern === 'elegant') {
        gradient.addColorStop(0, '#f8fafc');
        gradient.addColorStop(1, '#e2e8f0');
      } else {
        gradient.addColorStop(0, bgColor);
        gradient.addColorStop(1, bgColor);
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Border
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, width, height);
      
      // Decorative elements for different patterns
      if (pattern === 'water-bottle') {
        // Water droplets effect
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        for (let i = 0; i < 8; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const radius = 5 + Math.random() * 10;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (pattern === 'elegant') {
        // Elegant border lines
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        ctx.strokeRect(15, 15, width - 30, height - 30);
      }
      
      // Logo placeholder area (center)
      const logoAreaSize = Math.min(width * 0.4, height * 0.4);
      const logoX = (width - logoAreaSize) / 2;
      const logoY = (height - logoAreaSize) / 2;
      
      ctx.strokeStyle = '#9ca3af';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.strokeRect(logoX, logoY, logoAreaSize, logoAreaSize);
      
      // "LOGO" text in placeholder area
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.setLineDash([]);
      ctx.fillText('LOGO', width / 2, height / 2 + 5);
      
      // Template name
      ctx.fillStyle = textColor;
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(text, width / 2, height - 15);
      
      return canvas.toDataURL();
    };
    
    // Category-specific templates
    const getTemplatesForCategoryType = (category) => {
      // Fallback generated templates (these will show if your images don't load)
      const commonTemplates = [
        { pattern: 'default', bg: '#f8f9fa', name: 'Classic White' },
        { pattern: 'elegant', bg: '#fff5f5', name: 'Elegant Rose' },
        { pattern: 'default', bg: '#f0f9ff', name: 'Ocean Blue' },
        { pattern: 'water-bottle', bg: '#e0f2fe', name: 'Fresh Water' },
        { pattern: 'default', bg: '#fef3c7', name: 'Golden Sunset' }
      ];

      // 🎯 STEP 2: CREATE TEMPLATES ARRAY WITH YOUR IMAGES FIRST
      const templates = [];
      
      // Add your own images first (these will show up first in the gallery)
      yourTemplateUrls.forEach((url, index) => {
        // Only add if URL exists and is valid
        if (url && (url.startsWith('/templates/') || url.startsWith('data:') || url.startsWith('http'))) {
          templates.push({
            id: `custom-${category}-${index + 1}`,
            url: url,
            name: `Your Custom Template ${index + 1}`,
            
            // 🎯 STEP 3: ADJUST LOGO AREAS FOR YOUR SPECIFIC TEMPLATES
            logoArea: category === 'textile' ? 
              { x: 0.2, y: 0.3, width: 0.6, height: 0.4 } : // Clothing labels - wide
            category === 'automobile' ? 
              { x: 0.3, y: 0.2, width: 0.4, height: 0.6 } : // Car labels - tall  
            category === 'restaurant' ?
              { x: 0.25, y: 0.25, width: 0.5, height: 0.5 } : // Restaurant - square
            category === 'jewelry' ?
              { x: 0.35, y: 0.35, width: 0.3, height: 0.3 } : // Jewelry - small
            { x: 0.3, y: 0.4, width: 0.4, height: 0.3 }, // Default - center
            
            category: category,
            isCustom: true
          });
        }
      });

      // Add fallback generated templates
      commonTemplates.forEach((template, index) => {
        templates.push({
          id: `generated-${category}-${index + 1}`,
          url: createTemplateImage(320, 240, template.name, template.bg, '#374151', template.pattern),
          name: `${template.name} - ${category}`,
          logoArea: { x: 0.3, y: 0.3, width: 0.4, height: 0.4 },
          category: category,
          isCustom: false
        });
      });

      return templates;
    };
    
    // Get templates based on category
    const categoryTemplates = getTemplatesForCategoryType(category || 'general');
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const templates = categoryTemplates.slice(startIndex, endIndex);
    
    return {
      templates,
      hasMore: endIndex < categoryTemplates.length,
      totalPages: Math.ceil(categoryTemplates.length / limit)
    };
  }
};

// Add this before the CreateCustomerForm component
const ImageUtils = {
  loadImageWithFallbacks: (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Simple fallback - create placeholder
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, 300, 200);
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Image Load Error', 150, 100);
        
        const fallbackImg = new Image();
        fallbackImg.onload = () => resolve(fallbackImg);
        fallbackImg.src = canvas.toDataURL();
      };
      img.src = src;
    });
  }
};

const CreateCustomerForm = ({ onClose, onSubmit }) => {
  // All refs declared at the top level
  const fileInputRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // State variables
  const [step, setStep] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customerLogo, setCustomerLogo] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [logoPosition, setLogoPosition] = useState({ x: 0.3, y: 0.3, scale: 1 });
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    category: '',
    templateId: null,
    logoUrl: ''
    street: '',
    city: '',
    country_id: '',
    state_id: '',
    zip: ''
  });

  const [loading, setLoading] = useState(false);

  const businessCategories = [
    { id: 'textile', name: 'Textile/Clothing Shop', icon: '👕' },
    { id: 'automobile', name: 'Automobile', icon: '🚗' },
    { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
    { id: 'jewelry', name: 'Jewelry', icon: '💎' },
    { id: 'real-estate', name: 'Real Estate', icon: '🏠' },
    { id: 'software', name: 'Software Company', icon: '💻' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'finance', name: 'Finance/Banking', icon: '💰' },
    { id: 'retail', name: 'Retail/General Store', icon: '🛒' },
    { id: 'beauty', name: 'Beauty/Salon', icon: '💄' },
    { id: 'fitness', name: 'Fitness/Gym', icon: '💪' }
  ];

  // Enhanced canvas utility that works with your own images
  const createInteractivePreview = useCallback((templateImage, logoImage, position = logoPosition) => {
    if (!templateImage || !logoImage) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Use enhanced image loader for your own images
    Promise.all([
      ImageUtils.loadImageWithFallbacks(templateImage),
      ImageUtils.loadImageWithFallbacks(logoImage)
    ]).then(([templateImg, logoImg]) => {
      // Set canvas dimensions to match template
      canvas.width = templateImg.width;
      canvas.height = templateImg.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw template background
      ctx.drawImage(templateImg, 0, 0);
      
      // Calculate logo size and position
      const maxLogoSize = Math.min(templateImg.width * 0.4, templateImg.height * 0.4);
      const logoSize = maxLogoSize * position.scale;
      const logoX = position.x * templateImg.width - logoSize / 2;
      const logoY = position.y * templateImg.height - logoSize / 2;
      
      // Draw logo with enhanced styling
      ctx.save();
      
      // Add subtle background circle behind logo for better visibility
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Add drop shadow
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      // Draw the logo
      ctx.globalAlpha = 0.95;
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      
      ctx.restore();
      
      // Update preview image
      setPreviewImage(canvas.toDataURL());
    }).catch(error => {
      console.error('Failed to create preview:', error);
      
      // Create a more informative error preview
      canvas.width = 400;
      canvas.height = 300;
      ctx.fillStyle = '#fee2e2';
      ctx.fillRect(0, 0, 400, 300);
      
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Preview Generation Failed', 200, 120);
      
      ctx.font = '14px Arial';
      ctx.fillText('Tips to fix this:', 200, 150);
      ctx.fillText('1. Host images on your own server', 200, 175);
      ctx.fillText('2. Convert to base64 data URLs', 200, 195);
      ctx.fillText('3. Use CORS-enabled image hosting', 200, 215);
      
      setPreviewImage(canvas.toDataURL());
    });
  }, [logoPosition]);

  const handleCategorySelect = async (categoryId) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    
    try {
      const result = await mockS3Service.getTemplatesForCategory(categoryId, 1, 10);
      setTemplates(result.templates);
      setHasMore(result.hasMore);
      setCurrentPage(1);
      setStep('templates');
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTemplates = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const result = await mockS3Service.getTemplatesForCategory(selectedCategory, currentPage + 1, 10);
      setTemplates(prev => [...prev, ...result.templates]);
      setHasMore(result.hasMore);
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setStep('logo');
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomerLogo(e.target.result);
        // Initialize logo position based on template's suggested logo area
        if (selectedTemplate?.logoArea) {
          setLogoPosition({
            x: selectedTemplate.logoArea.x + selectedTemplate.logoArea.width / 2,
            y: selectedTemplate.logoArea.y + selectedTemplate.logoArea.height / 2,
            scale: 0.8
          });
        }
        // Generate preview immediately after logo upload
        setTimeout(() => {
          if (selectedTemplate?.url) {
            createInteractivePreview(selectedTemplate.url, e.target.result);
          }
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePositionChange = (newPosition) => {
    setLogoPosition(newPosition);
    if (selectedTemplate?.url && customerLogo) {
      createInteractivePreview(selectedTemplate.url, customerLogo, newPosition);
    }
  };

  const handleAcceptPreview = () => {
    setCustomerData(prev => ({
      ...prev,
      category: selectedCategory,
      templateId: selectedTemplate.id,
      logoUrl: customerLogo,
      logoPosition: logoPosition
    }));
    setStep('details');
  };

  const handleDiscardPreview = () => {
    setCustomerLogo(null);
    setPreviewImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFinalSubmit = () => {
    if (customerData.name && customerData.phone) {
      const finalData = {
        ...customerData,
        previewImage
      };
      onSubmit(finalData);
      onClose();
  const handleSubmit = async () => {
    if (
      customerData.name &&
      customerData.phone &&
      customerData.street &&
      customerData.city &&
      customerData.country_id &&
      customerData.state_id &&
      customerData.zip
    ) {
      try {
        setLoading(true);

        const requestBody = {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          street: customerData.street,
          city: customerData.city,
          state_id: parseInt(customerData.state_id, 10),
          country_id: parseInt(customerData.country_id, 10),
          zip: customerData.zip
        };

        const response = await axios.post(
          'https://d28c5r6pnnqv4m.cloudfront.net/fastapi/odoo/contacts/',
          requestBody,
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        console.log('Customer created:', response.data);
        alert('Customer created successfully!');
        onSubmit(response.data); // send API response back
        onClose();
      } catch (error) {
        console.error('Error creating customer:', error.response ? error.response.data : error.message);
        alert('Failed to create customer. See console for details.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please fill all required fields (*)');
    }
  };

  const renderCategorySelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Business Category</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {businessCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            disabled={loading}
          >
            <div className="text-2xl mb-2">{category.icon}</div>
            <div className="text-sm font-medium text-gray-700">{category.name}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTemplateSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep('category')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Categories
        </button>
        <h3 className="text-lg font-semibold text-gray-800">Choose Label Design</h3>
        <div></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="border-2 border-gray-200 rounded-lg p-2 hover:border-blue-500 cursor-pointer transition-colors"
          >
            <img
              src={template.url}
              alt={template.name}
              className="w-full h-24 object-cover rounded mb-2"
            />
            <p className="text-xs text-gray-600 text-center">{template.name}</p>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMoreTemplates}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );

  const renderLogoUpload = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep('templates')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Templates
        </button>
        <h3 className="text-lg font-semibold text-gray-800">Upload Customer Logo</h3>
        <div></div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Selected Template */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Template</h4>
          <img
            src={selectedTemplate?.url}
            alt="Selected template"
            className="w-full h-48 object-cover rounded-lg border"
          />
        </div>

        {/* Logo Upload and Positioning */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Upload Logo</h4>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500"
            >
              {customerLogo ? (
                <img src={customerLogo} alt="Customer logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload logo</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Logo Positioning Controls */}
          {customerLogo && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Adjust Logo Position</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Horizontal</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.01"
                    value={logoPosition.x}
                    onChange={(e) => handlePositionChange({...logoPosition, x: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Vertical</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.01"
                    value={logoPosition.y}
                    onChange={(e) => handlePositionChange({...logoPosition, y: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Size</label>
                  <input
                    type="range"
                    min="0.3"
                    max="1.5"
                    step="0.1"
                    value={logoPosition.scale}
                    onChange={(e) => handlePositionChange({...logoPosition, scale: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview and Action Buttons */}
      {customerLogo && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Preview</h4>
          <div className="text-center relative">
            <canvas
              ref={previewCanvasRef}
              className="max-w-full h-auto border rounded-lg mx-auto"
              style={{ maxHeight: '300px' }}
            />
            {!previewImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Generating preview...</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleDiscardPreview}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-2" />
              Discard
            </button>
            <button
              onClick={handleAcceptPreview}
              disabled={!previewImage}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderCustomerDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setStep('logo')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Logo
        </button>
        <h3 className="text-lg font-semibold text-gray-800">Customer Details</h3>
        <div></div>
      </div>

      {/* Preview Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Design</h4>
        <img
          src={previewImage}
          alt="Final preview"
          className="h-32 object-contain mx-auto rounded"
        />
        <p className="text-xs text-gray-500 text-center mt-2">
          Category: {businessCategories.find(c => c.id === selectedCategory)?.name}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
        <input
          type="text"
          value={customerData.name}
          onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
        <input
          type="tel"
          value={customerData.phone}
          onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={customerData.email}
          onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Address Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Street *</label>
        <input
          type="text"
          value={customerData.street}
          onChange={(e) => setCustomerData({ ...customerData, street: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
        <input
          type="text"
          value={customerData.city}
          onChange={(e) => setCustomerData({ ...customerData, city: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Country ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Country ID *</label>
        <input
          type="number"
          value={customerData.country_id}
          onChange={(e) => setCustomerData({ ...customerData, country_id: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* State ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">State ID *</label>
        <input
          type="number"
          value={customerData.state_id}
          onChange={(e) => setCustomerData({ ...customerData, state_id: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* ZIP */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP *</label>
        <input
          type="text"
          value={customerData.zip}
          onChange={(e) => setCustomerData({ ...customerData, zip: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={!customerData.name || !customerData.phone}
          className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Customer'}
        </button>
      </div>
    </div>
  );

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {step === 'category' && renderCategorySelection()}
      {step === 'templates' && renderTemplateSelection()}
      {step === 'logo' && renderLogoUpload()}
      {step === 'details' && renderCustomerDetails()}
    </div>
  );
};

export default CreateCustomerForm;