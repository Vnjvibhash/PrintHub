"use client";

import React, { useState, useRef, useEffect } from "react";
import FileUploader from "@/components/upload/FileUploader";
import { calculatePricing } from "@/lib/pricing";
import { ProductItem, SpecificationOptions, PriceBreakdown } from "@/types";
import { Check, Type, Image as ImageIcon, Sparkles, ShoppingCart, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";
import { dbService } from "@/lib/firebase";

interface ProductCustomizerProps {
  initialType?: 'mug' | 'pillow' | 'tshirt' | 'hoodie' | 'cap' | 'mousepad' | 'keychain' | 'mobilecover' | 'photoframe';
  onAddToCart?: (customSpecs: {
    serviceId: string;
    serviceName: string;
    quantity: number;
    specifications: SpecificationOptions;
    priceBreakdown: PriceBreakdown;
  }) => void;
}

export default function ProductCustomizer({ initialType = "tshirt", onAddToCart }: ProductCustomizerProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedType, setSelectedType] = useState<'mug' | 'pillow' | 'tshirt' | 'hoodie' | 'cap' | 'mousepad' | 'keychain' | 'mobilecover' | 'photoframe'>(initialType);
  const [selectedColor, setSelectedColor] = useState<string>("#ffffff");
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [quantity, setQuantity] = useState<number>(1);
  const [customText, setCustomText] = useState<string>("");
  const [textColor, setTextColor] = useState<string>("#000000");
  const [textFontSize, setTextFontSize] = useState<number>(18);
  const [designUrl, setDesignUrl] = useState<string>("");
  const [designMeta, setDesignMeta] = useState<any>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);

  // Layout references for sizing
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load products list
  useEffect(() => {
    async function loadProducts() {
      const prods = await dbService.getCollection<ProductItem>("products");
      setProducts(prods);
      
      // Sync default color
      const currentProd = prods.find(p => p.type === selectedType);
      if (currentProd && currentProd.colors.length > 0) {
        setSelectedColor(currentProd.colors[0]);
      }
    }
    loadProducts();
  }, [selectedType]);

  // Recalculate price dynamically when specs change
  useEffect(() => {
    const serviceIdMap: Record<string, string> = {
      "mug": "mug-print",
      "tshirt": "tshirt-print",
      "hoodie": "hoodie-print",
      "pillow": "pillow-print",
      "cap": "cap-print",
      "keychain": "keychain-print",
      "mobilecover": "mobilecover-print",
      "photoframe": "photoframe-print",
      "mousepad": "mousepad-print"
    };
    const serviceId = serviceIdMap[selectedType] || "tshirt-print";
                      
    const specs: SpecificationOptions = {
      size: selectedSize as any,
      color: selectedColor,
      customText: customText || undefined,
      customImageUrl: designUrl || undefined
    };

    const breakdown = calculatePricing(serviceId, quantity, specs);
    setPriceBreakdown(breakdown);
  }, [selectedType, selectedColor, selectedSize, quantity, customText, designUrl]);

  const activeProduct = products.find(p => p.type === selectedType);

  const handleTypeChange = (type: 'mug' | 'pillow' | 'tshirt' | 'hoodie' | 'cap' | 'mousepad' | 'keychain' | 'mobilecover' | 'photoframe') => {
    setSelectedType(type);
    const matched = products.find(p => p.type === type);
    if (matched && matched.colors.length > 0) {
      setSelectedColor(matched.colors[0]);
    }
    if (type === "mug" || type === "keychain" || type === "mobilecover" || type === "mousepad") {
      setSelectedSize("Standard");
    } else if (type === "photoframe") {
      setSelectedSize("12x12");
    } else if (type === "cap") {
      setSelectedSize("Adjustable");
    } else {
      setSelectedSize("M");
    }
  };

  const handleUploadSuccess = (url: string, meta: any) => {
    setDesignUrl(url);
    setDesignMeta(meta);
  };

  const handleReset = () => {
    setCustomText("");
    setDesignUrl("");
    setDesignMeta(null);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!priceBreakdown) return;
    
    const serviceIdMap: Record<string, string> = {
      "mug": "mug-print",
      "tshirt": "tshirt-print",
      "hoodie": "hoodie-print",
      "pillow": "pillow-print",
      "cap": "cap-print",
      "keychain": "keychain-print",
      "mobilecover": "mobilecover-print",
      "photoframe": "photoframe-print",
      "mousepad": "mousepad-print"
    };
    const serviceId = serviceIdMap[selectedType] || "tshirt-print";
                      
    const serviceNameMap: Record<string, string> = {
      "mug": "Custom Mug Printing",
      "tshirt": "Custom T-Shirt Printing",
      "hoodie": "Custom Hoodie Printing",
      "pillow": "Custom Cushion/Pillow Printing",
      "cap": "Custom Cap & Hat Printing",
      "keychain": "Personalized Keychain Printing",
      "mobilecover": "Custom Mobile Cover Printing",
      "photoframe": "Archival Canvas Frame Printing",
      "mousepad": "Custom Rubber Mousepad Printing"
    };
    const serviceName = serviceNameMap[selectedType] || "Custom T-Shirt Printing";

    if (onAddToCart) {
      onAddToCart({
        serviceId,
        serviceName,
        quantity,
        specifications: {
          size: selectedSize as any,
          color: selectedColor,
          customText: customText || undefined,
          customImageUrl: designUrl || undefined
        },
        priceBreakdown
      });
    }
  };

  // Setup Mock Merchandise Background outlines
  const getProductOutline = () => {
    switch (selectedType) {
      case "mug":
        return "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80"; // Clean ceramic mug layout
      case "pillow":
        return "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&q=80"; // Soft white square cushion layout
      case "hoodie":
        return "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80"; // Standard front-view hoodie layout
      case "cap":
        return "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80"; // Cap mockup
      case "keychain":
        return "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80"; // Keychain mockup
      case "mobilecover":
        return "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80"; // Phone mockup
      case "photoframe":
        return "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&q=80"; // Canvas art frame mockup
      case "mousepad":
        return "https://images.unsplash.com/photo-1541140111813-8222e9d90981?w=400&q=80"; // Mousepad mockup
      case "tshirt":
      default:
        return "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80"; // Standard front-view crewneck shirt layout
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto w-full">
      {/* Visual Live Preview Canvas */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="w-full aspect-square max-w-[440px] rounded-3xl glass-panel relative flex items-center justify-center p-8 overflow-hidden group shadow-2xl">
          {/* Overlay to dynamically shift color of fabric */}
          <div 
            className="absolute inset-0 z-0 opacity-40 mix-blend-multiply transition-colors duration-300 pointer-events-none"
            style={{ backgroundColor: selectedColor }}
          />

          {/* Product Outline image */}
          <img
            src={getProductOutline()}
            alt={selectedType}
            className="w-full h-full object-contain relative z-10 select-none mix-blend-darken"
            draggable={false}
          />

          {/* Dynamic Design Area overlay (absolute bounds) */}
          <div 
            className={`absolute z-20 flex flex-col items-center justify-center text-center p-3 pointer-events-none ${
              selectedType === "mug" 
                ? "w-[80px] h-[100px] left-[45%] top-[40%]" 
                : selectedType === "pillow"
                ? "w-[120px] h-[120px] left-[36%] top-[35%]"
                : selectedType === "cap"
                ? "w-[50px] h-[45px] left-[44%] top-[41%]"
                : selectedType === "keychain"
                ? "w-[50px] h-[55px] left-[44%] top-[38%]"
                : selectedType === "mobilecover"
                ? "w-[80px] h-[120px] left-[40%] top-[28%]"
                : selectedType === "photoframe"
                ? "w-[150px] h-[150px] left-[32%] top-[25%]"
                : selectedType === "mousepad"
                ? "w-[150px] h-[100px] left-[32%] top-[34%]"
                : "w-[110px] h-[140px] left-[38%] top-[32%]"
            }`}
          >
            {/* User Custom Upload Image */}
            {designUrl && (
              <img
                src={designUrl}
                alt="Custom uploaded design"
                className="max-w-full max-h-[70%] object-contain mb-1 rounded shadow-sm opacity-90 border border-white/20"
              />
            )}

            {/* User Custom Text */}
            {customText && (
              <p 
                className="font-bold break-all leading-tight drop-shadow-sm select-none"
                style={{ 
                  color: textColor, 
                  fontSize: `${textFontSize}px`,
                  fontFamily: "var(--font-sans), sans-serif"
                }}
              >
                {customText}
              </p>
            )}

            {/* Placeholder Indicator */}
            {!designUrl && !customText && (
              <div className="border border-indigo-500/30 border-dashed rounded-xl px-2 py-4 flex flex-col items-center justify-center opacity-40 text-center bg-white/5">
                <Sparkles className="w-5 h-5 text-indigo-500 mb-1" />
                <span className="text-[9px] uppercase tracking-wider font-semibold">Design Area</span>
              </div>
            )}
          </div>
        </div>

        {/* Action controls below visual canvas */}
        <div className="flex space-x-3 mt-4">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Canvas</span>
          </button>
        </div>
      </div>

      {/* Specification Controls Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Section Heading */}
          <div>
            <h2 className="text-xl font-black text-zinc-950 dark:text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
              Configure Merchandise
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Design and customize apparel and cups in real time.</p>
          </div>

          {/* 1. Select Product Type Tabs */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Merchandise Type</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
              {(["tshirt", "hoodie", "mug", "pillow", "cap", "keychain", "mobilecover", "photoframe", "mousepad"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`py-2 px-1 rounded-xl text-center border text-[10px] sm:text-xs font-bold capitalize transition-all ${
                    selectedType === t
                      ? "border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 animate-pulse-slow"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {t === "tshirt" ? "T-Shirt" : 
                   t === "photoframe" ? "Canvas Frame" : 
                   t === "mobilecover" ? "Phone Case" : 
                   t === "mousepad" ? "Mousepad" : t}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Choose Fabric / Item Color */}
          {activeProduct && (
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Item Color</label>
              <div className="flex flex-wrap gap-2.5">
                {activeProduct.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center relative shadow-sm cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && (
                      <Check 
                        className={`w-4 h-4 ${
                          color.toLowerCase() === "#ffffff" ? "text-black" : "text-white"
                        }`} 
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Choose Sizing Options */}
          {selectedType !== "mug" && selectedType !== "keychain" && selectedType !== "mobilecover" && selectedType !== "mousepad" && activeProduct && (
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                {selectedType === "photoframe" ? "Canvas Size" : "Select Size"}
              </label>
              <div className="flex flex-wrap gap-2">
                {(activeProduct.sizes || ["S", "M", "L", "XL", "XXL"]).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`h-10 px-3 rounded-xl border flex items-center justify-center text-xs font-bold transition-all ${
                      selectedSize === sz
                        ? "border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Custom Overlay Text Control */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center">
              <Type className="w-4 h-4 mr-1 text-zinc-400" />
              Add Custom Text
            </label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Input custom design text..."
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/5 text-sm focus:outline-none focus:border-indigo-500"
            />
            {customText && (
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-zinc-400">Color:</span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-6 h-6 border-none bg-transparent cursor-pointer rounded-full"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-zinc-400">Size:</span>
                  <input
                    type="range"
                    min="10"
                    max="32"
                    value={textFontSize}
                    onChange={(e) => setTextFontSize(Number(e.target.value))}
                    className="w-24 accent-indigo-600"
                  />
                  <span className="text-xs font-mono">{textFontSize}px</span>
                </div>
              </div>
            )}
          </div>

          {/* 5. Custom Graphic Image Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center">
              <ImageIcon className="w-4 h-4 mr-1 text-zinc-400" />
              Overlay Image / Design Logo
            </label>
            <FileUploader
              onUploadSuccess={handleUploadSuccess}
              maxSizeMB={50}
            />
          </div>

          {/* 6. Quantity Picker */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Quantity</label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                -
              </button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                +
              </button>
            </div>
          </div>

          {/* 7. Live Dynamic Price Display */}
          {priceBreakdown && (
            <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl p-4 border border-zinc-200/50 dark:border-zinc-800/80 flex flex-col space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Base Product Price</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">₹{priceBreakdown.base.toFixed(2)}</span>
              </div>
              {priceBreakdown.optionsPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Additions (Size/Spec upgrade)</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">+₹{priceBreakdown.optionsPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-400">Subtotal ({quantity} {quantity === 1 ? 'copy' : 'copies'})</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">₹{priceBreakdown.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200/50 dark:border-zinc-800/50 pt-2 text-sm">
                <span className="font-semibold text-zinc-900 dark:text-white">Estimated Total (incl. 18% GST)</span>
                <span className="font-black text-indigo-600 dark:text-indigo-400">₹{priceBreakdown.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center space-x-2.5 px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg hover:shadow-indigo-500/15 transition cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Customize and Order Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
