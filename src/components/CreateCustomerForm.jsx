import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, Upload, Check, X, Grid, List, Plus, Trash2, Type, Palette, Move, RotateCcw } from 'lucide-react';
import { fastapi_url } from '../App';

// Label size configurations (in MM converted to pixels at 300 DPI for high quality)
const LABEL_SIZES = {
  'small': {
    id: 'small',
    name: '40 x 84.5 MM',
    widthMM: 40,
    heightMM: 84.5,
    widthPx: 472, // 40mm * 11.81 pixels/mm at 300 DPI
    heightPx: 998,  // 84.5mm * 11.81 pixels/mm at 300 DPI
    displayWidth: 160,
    displayHeight: 338
  },
  'medium': {
    id: 'medium', 
    name: '50 x 155.5 MM',
    widthMM: 50,
    heightMM: 155.5,
    widthPx: 590,
    heightPx: 1837,
    displayWidth: 150,
    displayHeight: 467
  },
  'large': {
    id: 'large',
    name: '50 x 133.5 MM', 
    widthMM: 50,
    heightMM: 133.5,
    widthPx: 590,
    heightPx: 1575,
    displayWidth: 150,
    displayHeight: 400
  }
};

// Background patterns and colors
const BACKGROUND_OPTIONS = {
  colors: [
    '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da',
    '#adb5bd', '#495057', '#343a40', '#212529', '#000000',
    '#fff3cd', '#d4edda', '#d1ecf1', '#f8d7da', '#e2e3e5',
    '#ffeaa7', '#fab1a0', '#fd79a8', '#fdcb6e', '#e17055',
    '#00b894', '#00cec9', '#6c5ce7', '#a29bfe', '#74b9ff'
  ],
  patterns: [
    { id: 'solid', name: 'Solid Color' },
    { id: 'gradient', name: 'Gradient' },
    { id: 'stripes', name: 'Stripes' },
    { id: 'dots', name: 'Polka Dots' },
    { id: 'grid', name: 'Grid Pattern' }
  ]
};

// Enhanced text element structure
const createTextElement = () => ({
  id: Date.now() + Math.random(),
  text: 'Sample Text',
  x: 0.5,
  y: 0.3,
  fontSize: 16,
  fontFamily: 'Arial',
  color: '#000000',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'center',
  rotation: 0,
  opacity: 1
});

// Mock AWS S3 service - enhanced for different label sizes
const mockS3Service = {
  getTemplatesForCategory: async (category, labelSize, page = 1, limit = 10) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const sizeConfig = LABEL_SIZES[labelSize];
    
    const yourTemplateUrls = [
      '/templates/water_bottle.png',
      '/templates/CAFE_TERRASE_1000ML_60 X 160MM.jpg',
      '/templates/AM_CAFE_&_MUSIC_LLP_1000ML_150_X_60_MM.jpg',
      '/templates/BEL_POSTO_THE_CAFE_500ML.jpg'
    ];
    
    const createTemplateImage = (width, height, text, bgColor, textColor = '#333', pattern = 'default') => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      
      // Background with patterns
      if (pattern === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, bgColor);
        gradient.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = gradient;
      } else if (pattern === 'stripes') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let i = 0; i < width; i += 20) {
          ctx.fillRect(i, 0, 10, height);
        }
      } else {
        ctx.fillStyle = bgColor;
      }
      ctx.fillRect(0, 0, width, height);
      
      // Border
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, width, height);
      
      // Size indicator
      ctx.fillStyle = textColor;
      ctx.font = `${Math.min(width, height) * 0.06}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(text, width / 2, height / 2);
      
      // Size label
      ctx.font = `${Math.min(width, height) * 0.04}px Arial`;
      ctx.fillText(`${sizeConfig.widthMM} x ${sizeConfig.heightMM} MM`, width / 2, height - 20);
      
      return canvas.toDataURL();
    };
    
    const commonTemplates = [
      { pattern: 'default', bg: '#f8f9fa', name: 'Classic White' },
      { pattern: 'gradient', bg: '#e3f2fd', name: 'Blue Gradient' },
      { pattern: 'stripes', bg: '#fff3e0', name: 'Orange Stripes' },
      { pattern: 'default', bg: '#e8f5e8', name: 'Fresh Green' },
      { pattern: 'gradient', bg: '#fce4ec', name: 'Pink Gradient' }
    ];

    const templates = [];
    
    yourTemplateUrls.forEach((url, index) => {
      if (url && (url.startsWith('/templates/') || url.startsWith('data:') || url.startsWith('http'))) {
        templates.push({
          id: `custom-${category}-${labelSize}-${index + 1}`,
          url: url,
          name: `Custom Template ${index + 1}`,
          logoArea: { x: 0.3, y: 0.4, width: 0.4, height: 0.3 },
          category: category,
          labelSize: labelSize,
          isCustom: true
        });
      }
    });

    commonTemplates.forEach((template, index) => {
      templates.push({
        id: `generated-${category}-${labelSize}-${index + 1}`,
        url: createTemplateImage(
          sizeConfig.displayWidth, 
          sizeConfig.displayHeight, 
          template.name, 
          template.bg, 
          '#374151', 
          template.pattern
        ),
        name: `${template.name} - ${sizeConfig.name}`,
        logoArea: { x: 0.3, y: 0.3, width: 0.4, height: 0.4 },
        category: category,
        labelSize: labelSize,
        isCustom: false
      });
    });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTemplates = templates.slice(startIndex, endIndex);
    
    return {
      templates: paginatedTemplates,
      hasMore: endIndex < templates.length,
      totalPages: Math.ceil(templates.length / limit)
    };
  }
};

// Enhanced image utilities
const ImageUtils = {
  loadImageWithFallbacks: (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
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
  const backgroundImageInputRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Enhanced state variables
  const [step, setStep] = useState('size'); // Start with size selection
  const [selectedLabelSize, setSelectedLabelSize] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customerLogo, setCustomerLogo] = useState(null);
  const [backgroundType, setBackgroundType] = useState('color'); // 'color' or 'image'
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundPattern, setBackgroundPattern] = useState('solid');
  const [textElements, setTextElements] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [logoPosition, setLogoPosition] = useState({ x: 0.5, y: 0.2, scale: 0.3 });
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    category: '',
    labelSize: '',
    templateId: null,
    logoUrl: '',
    street: '',
    city: '',
    country_id: '',
    state_id: '',
    zip: ''
  });

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

  // Enhanced canvas generation with text elements
  const generateCanvasBackground = (ctx, width, height) => {
    if (backgroundType === 'image' && backgroundImage) {
      // Draw background image
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = backgroundImage;
    } else {
      // Draw background color/pattern
      if (backgroundPattern === 'gradient') {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, backgroundColor);
        gradient.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = gradient;
      } else if (backgroundPattern === 'stripes') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let i = 0; i < width; i += 20) {
          ctx.fillRect(i, 0, 10, height);
        }
      } else if (backgroundPattern === 'dots') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let x = 0; x < width; x += 30) {
          for (let y = 0; y < height; y += 30) {
            ctx.beginPath();
            ctx.arc(x + 15, y + 15, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }
    }
  };

  const createInteractivePreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !selectedLabelSize) return;

    const ctx = canvas.getContext('2d');
    const sizeConfig = LABEL_SIZES[selectedLabelSize];
    
    // Set canvas dimensions
    canvas.width = sizeConfig.widthPx;
    canvas.height = sizeConfig.heightPx;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Generate background
    generateCanvasBackground(ctx, canvas.width, canvas.height);
    
    // Draw logo if present
    if (customerLogo) {
      const img = new Image();
      img.onload = () => {
        const logoSize = Math.min(canvas.width, canvas.height) * 0.3 * logoPosition.scale;
        const logoX = logoPosition.x * canvas.width - logoSize / 2;
        const logoY = logoPosition.y * canvas.height - logoSize / 2;
        
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        ctx.restore();
        
        // Draw text elements after logo
        drawTextElements(ctx, canvas.width, canvas.height);
        setPreviewImage(canvas.toDataURL());
      };
      img.src = customerLogo;
    } else {
      // Draw text elements without logo
      drawTextElements(ctx, canvas.width, canvas.height);
      setPreviewImage(canvas.toDataURL());
    }
  }, [selectedLabelSize, backgroundColor, backgroundImage, backgroundPattern, backgroundType, customerLogo, logoPosition, textElements]);

  const drawTextElements = (ctx, canvasWidth, canvasHeight) => {
    textElements.forEach(element => {
      ctx.save();
      
      // Calculate position and size
      const x = element.x * canvasWidth;
      const y = element.y * canvasHeight;
      const fontSize = element.fontSize * (canvasWidth / 400); // Scale font size
      
      // Set text properties
      ctx.font = `${element.fontStyle} ${element.fontWeight} ${fontSize}px ${element.fontFamily}`;
      ctx.fillStyle = element.color;
      ctx.textAlign = element.textAlign;
      ctx.globalAlpha = element.opacity;
      
      // Apply rotation if any
      if (element.rotation !== 0) {
        ctx.translate(x, y);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.fillText(element.text, 0, 0);
      } else {
        ctx.fillText(element.text, x, y);
      }
      
      ctx.restore();
    });
  };

  // Text management functions
  const addTextElement = () => {
    const newText = createTextElement();
    setTextElements(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
  };

  const updateTextElement = (id, updates) => {
    setTextElements(prev => 
      prev.map(element => 
        element.id === id ? { ...element, ...updates } : element
      )
    );
  };

  const deleteTextElement = (id) => {
    setTextElements(prev => prev.filter(element => element.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  // Update preview when text elements change
  useEffect(() => {
    if (selectedLabelSize) {
      createInteractivePreview();
    }
  }, [createInteractivePreview]);

  // Step handlers
  const handleSizeSelect = (sizeId) => {
    setSelectedLabelSize(sizeId);
    setCustomerData(prev => ({ ...prev, labelSize: sizeId }));
    setStep('category');
  };

  const handleCategorySelect = async (categoryId) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    
    try {
      const result = await mockS3Service.getTemplatesForCategory(categoryId, selectedLabelSize, 1, 10);
      setTemplates(result.templates);
      setHasMore(result.hasMore);
      setCurrentPage(1);
      setStep('design');
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target.result);
        setBackgroundType('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomerLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAcceptDesign = () => {
    setCustomerData(prev => ({
      ...prev,
      category: selectedCategory,
      logoUrl: customerLogo,
      backgroundColor: backgroundColor,
      backgroundImage: backgroundImage,
      textElements: textElements
    }));
    setStep('details');
  };

  const handleFinalSubmit = () => {
    if (customerData.name && customerData.phone) {
      const finalData = {
        ...customerData,
        previewImage,
        labelSize: selectedLabelSize
      };
      onSubmit(finalData);
      onClose();
    }
  };

  // Render functions
  const renderSizeSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Label Size</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(LABEL_SIZES).map((size) => (
          <button
            key={size.id}
            onClick={() => handleSizeSelect(size.id)}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <div className="text-lg font-medium text-gray-800 mb-2">{size.name}</div>
            <div className="text-sm text-gray-600 mb-4">
              {size.widthMM} × {size.heightMM} MM
            </div>
            <div 
              className="mx-auto border-2 border-gray-300 rounded"
              style={{
                width: size.displayWidth / 3,
                height: size.displayHeight / 3,
                backgroundColor: '#f8f9fa'
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const renderCategorySelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep('size')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Size
        </button>
        <h3 className="text-lg font-semibold text-gray-800">Select Business Category</h3>
        <div></div>
      </div>
      
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

  const renderDesignEditor = () => {
    const selectedText = textElements.find(t => t.id === selectedTextId);
    const sizeConfig = LABEL_SIZES[selectedLabelSize];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep('category')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Category
          </button>
          <h3 className="text-lg font-semibold text-gray-800">Design Your Label</h3>
          <button
            onClick={handleAcceptDesign}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Accept Design
          </button>
        </div>

        <div className="space-y-6">
          {/* Background and Logo Controls Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Background Section */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                Background
              </h4>
              
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setBackgroundType('color')}
                    className={`px-3 py-1 rounded text-sm ${backgroundType === 'color' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    Color
                  </button>
                  <button
                    onClick={() => setBackgroundType('image')}
                    className={`px-3 py-1 rounded text-sm ${backgroundType === 'image' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  >
                    Image
                  </button>
                </div>

                {backgroundType === 'color' ? (
                  <div>
                    <div className="grid grid-cols-5 gap-2 mb-2">
                      {BACKGROUND_OPTIONS.colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setBackgroundColor(color)}
                          className={`w-8 h-8 rounded border-2 ${backgroundColor === color ? 'border-blue-500' : 'border-gray-300'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-full h-10 rounded"
                    />
                    
                    <select
                      value={backgroundPattern}
                      onChange={(e) => setBackgroundPattern(e.target.value)}
                      className="w-full mt-2 p-2 border rounded"
                    >
                      {BACKGROUND_OPTIONS.patterns.map(pattern => (
                        <option key={pattern.id} value={pattern.id}>
                          {pattern.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => backgroundImageInputRef.current?.click()}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500"
                    >
                      {backgroundImage ? 'Change Background Image' : 'Upload Background Image'}
                    </button>
                    <input
                      ref={backgroundImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Logo Section */}
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-800 mb-3">Logo</h4>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500"
              >
                {customerLogo ? 'Change Logo' : 'Upload Logo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              
              {customerLogo && (
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600">Position X</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.01"
                      value={logoPosition.x}
                      onChange={(e) => setLogoPosition({...logoPosition, x: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Position Y</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.01"
                      value={logoPosition.y}
                      onChange={(e) => setLogoPosition({...logoPosition, y: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Size</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={logoPosition.scale}
                      onChange={(e) => setLogoPosition({...logoPosition, scale: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800">Preview - {sizeConfig.name}</h4>
              <div className="text-sm text-gray-600">
                {sizeConfig.widthMM} × {sizeConfig.heightMM} MM
              </div>
            </div>
            
            <div className="flex justify-center items-center bg-gray-50 p-4 rounded-lg min-h-96">
              <div className="relative">
                <canvas
                  ref={previewCanvasRef}
                  className="border border-gray-300 rounded shadow-lg"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    width: 'auto',
                    height: 'auto'
                  }}
                />
                
                {/* Size indicator overlay */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {sizeConfig.name}
                </div>
                
                {/* Guidelines overlay for text positioning (optional) */}
                {selectedTextId && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Add guidelines here if needed */}
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex justify-center space-x-2 mt-4">
              <button
                onClick={() => {
                  setBackgroundColor('#ffffff');
                  setBackgroundType('color');
                  setBackgroundPattern('solid');
                  setCustomerLogo(null);
                  setTextElements([]);
                  setSelectedTextId(null);
                }}
                className="flex items-center px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </button>
              
              <button
                onClick={addTextElement}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Text
              </button>
            </div>
          </div>

          {/* Text Elements Section - Now Below Preview */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-800 flex items-center">
                <Type className="w-4 h-4 mr-2" />
                Text Elements
              </h4>
              <button
                onClick={addTextElement}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
              {textElements.map(element => (
                <div
                  key={element.id}
                  onClick={() => setSelectedTextId(element.id)}
                  className={`p-2 border rounded cursor-pointer flex items-center justify-between ${
                    selectedTextId === element.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <span className="text-sm truncate">{element.text}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTextElement(element.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Text Editor for Selected Element */}
            {selectedText && (
              <div className="border-t pt-4">
                <h5 className="font-medium text-gray-700 mb-3">Edit Selected Text</h5>
                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Left Column - Basic Text Properties */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Text Content</label>
                      <input
                        type="text"
                        value={selectedText.text}
                        onChange={(e) => updateTextElement(selectedText.id, { text: e.target.value })}
                        className="w-full p-2 border rounded"
                        placeholder="Enter text"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600">Font Size</label>
                        <input
                          type="range"
                          min="8"
                          max="72"
                          value={selectedText.fontSize}
                          onChange={(e) => updateTextElement(selectedText.id, { fontSize: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{selectedText.fontSize}px</span>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600">Font Family</label>
                        <select
                          value={selectedText.fontFamily}
                          onChange={(e) => updateTextElement(selectedText.id, { fontFamily: e.target.value })}
                          className="w-full p-1 border rounded text-xs"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Verdana">Verdana</option>
                          <option value="Comic Sans MS">Comic Sans MS</option>
                          <option value="Impact">Impact</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600">Weight</label>
                        <select
                          value={selectedText.fontWeight}
                          onChange={(e) => updateTextElement(selectedText.id, { fontWeight: e.target.value })}
                          className="w-full p-1 border rounded text-xs"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="lighter">Lighter</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600">Style</label>
                        <select
                          value={selectedText.fontStyle}
                          onChange={(e) => updateTextElement(selectedText.id, { fontStyle: e.target.value })}
                          className="w-full p-1 border rounded text-xs"
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600">Align</label>
                        <select
                          value={selectedText.textAlign}
                          onChange={(e) => updateTextElement(selectedText.id, { textAlign: e.target.value })}
                          className="w-full p-1 border rounded text-xs"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Color</label>
                      <input
                        type="color"
                        value={selectedText.color}
                        onChange={(e) => updateTextElement(selectedText.id, { color: e.target.value })}
                        className="w-full h-8 rounded"
                      />
                    </div>
                  </div>

                  {/* Right Column - Position and Transform */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600">Position X</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={selectedText.x}
                          onChange={(e) => updateTextElement(selectedText.id, { x: parseFloat(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{Math.round(selectedText.x * 100)}%</span>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600">Position Y</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={selectedText.y}
                          onChange={(e) => updateTextElement(selectedText.id, { y: parseFloat(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{Math.round(selectedText.y * 100)}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600">Rotation</label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={selectedText.rotation}
                          onChange={(e) => updateTextElement(selectedText.id, { rotation: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{selectedText.rotation}°</span>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-600">Opacity</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={selectedText.opacity}
                          onChange={(e) => updateTextElement(selectedText.id, { opacity: parseFloat(e.target.value) })}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{Math.round(selectedText.opacity * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCustomerDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setStep('design')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Design
        </button>
        <h3 className="text-lg font-semibold text-gray-800">Customer Details</h3>
        <div></div>
      </div>

      {/* Design Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Final Label Design</h4>
        <div className="flex items-center space-x-4">
          <img
            src={previewImage}
            alt="Final preview"
            className="h-32 object-contain rounded border"
          />
          <div className="text-sm space-y-1">
            <p><strong>Size:</strong> {LABEL_SIZES[selectedLabelSize]?.name}</p>
            <p><strong>Category:</strong> {businessCategories.find(c => c.id === selectedCategory)?.name}</p>
            <p><strong>Text Elements:</strong> {textElements.length}</p>
            <p><strong>Logo:</strong> {customerLogo ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Customer Form */}
      <div className="grid md:grid-cols-2 gap-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={customerData.email}
            onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
          <select
            value={customerData.state_id}
            onChange={(e) => setCustomerData({ ...customerData, state_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select State</option>
            <option value="andhra">Andhra Pradesh</option>
            <option value="telangana">Telangana</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
          <input
            type="text"
            value={customerData.zip}
            onChange={(e) => setCustomerData({ ...customerData, zip: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={!customerData.name || !customerData.phone || !customerData.street || !customerData.city || !customerData.state_id || !customerData.zip}
          className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating...' : 'Create Customer & Save Design'}
        </button>
      </div>
    </div>
  );

  // Loading state
  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {step === 'size' && renderSizeSelection()}
      {step === 'category' && renderCategorySelection()}
      {step === 'design' && renderDesignEditor()}
      {step === 'details' && renderCustomerDetails()}
    </div>
  );
};

export default CreateCustomerForm;