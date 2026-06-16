import { PriceBreakdown, SpecificationOptions, OfferRecord } from "@/types";

// Standard base prices (can be modified by Admin in DB / local storage settings)
export const DEFAULT_PRICING_CONFIG = {
  // Printing rates (per page / sq ft)
  "a4-bw": 2,
  "a4-color": 10,
  "a3-bw": 5,
  "a3-color": 20,
  "photo-print": 15,
  "passport-photo": 50, // Per set of 8 photos
  "banner-print": 40,   // Per sq ft

  // Binding & Lamination options
  "binding-spiral": 40,
  "binding-lamination": 20,

  // Document services
  "scanning": 5, // Per page
  "xerox": 1.5,  // Per page
  "resume-creation": 200, // Flat rate

  // Custom Merch base prices (per item)
  "mug-print": 150,
  "magic-mug": 250,
  "tshirt-print": 350,
  "hoodie-print": 750,
  "pillow-print": 200,
  "mousepad-print": 120,
  "keychain-print": 60,
  "mobilecover-print": 180,
  "photoframe-print": 300,
  "cap-print": 120,

  // Corporate business service prices
  "visiting-cards": 1.5,
  "letterheads": 4,
  "brochures": 8,
  "menu-print": 15,
  "invitation-print": 25,
  "calendar-print": 180,
  "corporate-gift": 450,
};

// Retrieve admin-configured rates (merged with defaults)
export function getAdminRates(): typeof DEFAULT_PRICING_CONFIG {
  let rates = { ...DEFAULT_PRICING_CONFIG };
  if (typeof window !== "undefined") {
    const adminSettings = localStorage.getItem("printhub_db_settings");
    if (adminSettings) {
      try {
        const parsed = JSON.parse(adminSettings);
        if (parsed.rates) {
          rates = { ...rates, ...parsed.rates };
        }
      } catch (err) {
        console.warn("Failed to parse settings rates:", err);
      }
    }
  }
  return rates;
}

// Get all currently active offers
export function getActiveOffers(): OfferRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("printhub_db_offers");
  if (!raw) return [];
  try {
    const offers: OfferRecord[] = JSON.parse(raw);
    const now = new Date();
    return offers.filter(o => {
      if (!o.isActive) return false;
      const start = new Date(o.startDate);
      const end = new Date(o.endDate);
      return now >= start && now <= end;
    });
  } catch {
    return [];
  }
}

// Find the best offer applicable for a given serviceId
export function getBestOfferForService(serviceId: string): OfferRecord | null {
  const offers = getActiveOffers();
  const applicable = offers.filter(o =>
    o.applicableServiceIds.length === 0 || o.applicableServiceIds.includes(serviceId)
  );
  if (applicable.length === 0) return null;
  // Return highest discount value (simplified: compare raw discountValue)
  return applicable.reduce((best, curr) => {
    if (curr.discountType === "percentage" && best.discountType === "percentage") {
      return curr.discountValue > best.discountValue ? curr : best;
    }
    if (curr.discountType === "flat" && best.discountType === "flat") {
      return curr.discountValue > best.discountValue ? curr : best;
    }
    // Mix: percentage often better, keep percentage
    if (curr.discountType === "percentage") return curr;
    return best;
  });
}

export function calculatePricing(
  serviceId: string,
  quantity: number,
  specs: SpecificationOptions
): PriceBreakdown {
  // 1. Fetch current config from localStorage if available (Admin pricing overrides)
  const rates = getAdminRates();

  let basePrice = rates[serviceId as keyof typeof rates] || 0;
  let optionsPrice = 0;
  let subtotal = 0;
  const qty = Math.max(1, quantity);

  // 2. Calculations based on service category
  // A. Printing and Document Services
  if (["a4-bw", "a4-color", "a3-bw", "a3-color", "photo-print", "xerox", "scanning"].includes(serviceId)) {
    const pages = specs.pages || 1;
    const copies = specs.copies || 1;
    
    // Base is rate per page
    let ratePerPage = basePrice;
    
    // Color double-side vs single side modifiers
    if (specs.sides === "double") {
      // Small discount for double-sided (e.g. 10% off the second side, or standard 2x page rate)
      // We will keep it simple: pages represent sides.
    }

    // Add Binding / Lamination
    if (specs.binding === "spiral") {
      optionsPrice += rates["binding-spiral"];
    }
    if (specs.binding === "lamination") {
      optionsPrice += rates["binding-lamination"];
    }

    subtotal = (ratePerPage * pages + optionsPrice) * copies * qty;
  } 
  // B. Custom Merchandise
  else if ([
    "mug-print", 
    "magic-mug", 
    "tshirt-print", 
    "hoodie-print", 
    "pillow-print",
    "cap-print",
    "keychain-print",
    "mobilecover-print",
    "photoframe-print",
    "mousepad-print"
  ].includes(serviceId)) {
    // Merch calculation
    let merchBase = basePrice;
    
    // Modifiers for customized text or size overrides if any
    if (specs.size === "XL" || specs.size === "XXL") {
      optionsPrice += 50; // Extra charge for large apparel sizes
    } else if (specs.size === "12x18") {
      optionsPrice += 100; // Extra charge for medium canvas
    } else if (specs.size === "18x24") {
      optionsPrice += 250; // Extra charge for large canvas
    }
    
    subtotal = (merchBase + optionsPrice) * qty;
  }
  // C. General flat services (e.g., Resume, passport photo sets)
  else {
    subtotal = basePrice * qty;
  }

  // 3. Apply best offer/discount if available
  const offer = getBestOfferForService(serviceId);
  let discount = 0;
  if (offer) {
    if (offer.discountType === "percentage") {
      discount = Math.round(subtotal * (offer.discountValue / 100) * 100) / 100;
    } else {
      discount = Math.min(offer.discountValue, subtotal);
    }
    if (offer.minOrderValue && subtotal < offer.minOrderValue) {
      discount = 0; // min order value not met
    }
    subtotal = Math.max(0, subtotal - discount);
  }

  // 4. GST Tax Calculation (configurable tax rate, default 18%)
  let gstRate = 0.18;
  if (typeof window !== "undefined") {
    const adminSettings = localStorage.getItem("printhub_db_settings");
    if (adminSettings) {
      try {
        const parsed = JSON.parse(adminSettings);
        if (parsed.taxRate != null) {
          gstRate = parsed.taxRate / 100;
        }
      } catch {}
    }
  }
  const gst = Math.round(subtotal * gstRate * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;

  return {
    base: basePrice,
    optionsPrice,
    subtotal,
    gst,
    total,
  };
}

