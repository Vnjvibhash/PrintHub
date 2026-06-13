import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
  type Auth
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  type Firestore
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  type FirebaseStorage
} from "firebase/storage";
import { UserProfile, ServiceItem, ProductItem, Order, NotificationRecord } from "@/types";

// 1. Firebase Configuration Detection
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.authDomain
);

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
  } catch (error) {
    console.warn("Firebase initialization failed, falling back to Local/Mock mode:", error);
  }
}

export const isFirebaseEnabled = !!(firebaseApp && firebaseAuth && firebaseDb);

// --- MOCK DATABASE PRE-POPULATION ---
const DEFAULT_SERVICES: ServiceItem[] = [
  // Printing Services
  { id: "a4-bw", name: "A4 Black & White Printing", category: "printing", description: "Standard single/double-sided black & white printing on 75GSM paper.", basePrice: 2, features: ["75 GSM Bond Paper", "Crisp text rendering", "Single/Double Sided option"], image: "/images/a4-bw.jpg" },
  { id: "a4-color", name: "A4 Color Printing", category: "printing", description: "High-quality A4 color printing on standard or premium paper.", basePrice: 10, features: ["Vibrant color ink", "Standard or gloss finish", "Ideal for presentations"], image: "/images/a4-color.jpg" },
  { id: "a3-bw", name: "A3 Black & White Printing", category: "printing", description: "Larger format black & white printing, ideal for CAD drawings and maps.", basePrice: 5, features: ["A3 Size (297 x 420 mm)", "80 GSM paper", "Accurate detail styling"], image: "/images/a3-bw.jpg" },
  { id: "a3-color", name: "A3 Color Printing", category: "printing", description: "Premium A3 color prints for posters, charts, and spreadsheets.", basePrice: 20, features: ["Large color format", "Vivid pigments", "Perfect for diagrams"], image: "/images/a3-color.jpg" },
  { id: "photo-print", name: "Photo Printing", category: "printing", description: "Vivid, archival photo prints on professional glossy/matte photo paper.", basePrice: 15, features: ["Glossy or Matte Paper", "High DPI print resolution", "Fade resistant"], image: "/images/photo.jpg" },
  { id: "passport-photo", name: "Passport Photo Printing", category: "printing", description: "Standard passport size photo set (8 photos) with background editing.", basePrice: 50, features: ["8 Photos per sheet", "Biometric compliant", "Glossy cutouts"], image: "/images/passport.jpg" },
  { id: "spiral-binding", name: "Spiral Binding", category: "printing", description: "Robust spiral coil binding with clear cover sheet and black back card.", basePrice: 40, features: ["Up to 300 pages", "Flexible plastic coil", "Clear front cover"], image: "/images/spiral.jpg" },
  { id: "lamination", name: "Lamination", category: "printing", description: "Thermal plastic lamination to protect documents from water and tearing.", basePrice: 20, features: ["Heavy duty plastic pouches", "Waterproof and tearproof", "Glossy transparent look"], image: "/images/lamination.jpg" },
  { id: "banner-print", name: "Flex & Banner Printing", category: "printing", description: "High-durability outdoor flex banners and promotional advertising banners.", basePrice: 40, features: ["12oz premium heavy vinyl", "Weatherproof and UV-resistant", "Includes metal grommets"], image: "/images/banner.jpg" },

  // Business Services
  { id: "visiting-cards", name: "Business & Visiting Cards", category: "business", description: "Standard 350GSM business cards with matte/gloss lamination.", basePrice: 1.5, features: ["350 GSM premium cardstock", "Single or double sided", "Matte/Gloss finishing"], image: "/images/cards.jpg" },
  { id: "letterheads", name: "Company Letterheads", category: "business", description: "Professional executive letterheads on premium 100GSM royal executive paper.", basePrice: 4, features: ["100 GSM premium paper", "High resolution company logo", "Executive finish"], image: "/images/letterhead.jpg" },
  { id: "brochures", name: "Flyers & Brochures", category: "business", description: "A4 bi-fold or tri-fold advertising brochures with vibrant color.", basePrice: 8, features: ["130 GSM art paper", "Folded layout", "Vibrant graphic colors"], image: "/images/brochure.jpg" },
  { id: "menu-print", name: "Restaurant Menu Card Printing", category: "business", description: "Premium restaurant menu sheet or folded booklet printing with moisture protection.", basePrice: 15, features: ["300 GSM royal cardstock", "Gloss/Matte lamination coating", "Spill & moisture resistant"], image: "/images/menu.jpg" },
  { id: "invitation-print", name: "Premium Invitation Card Printing", category: "business", description: "Exquisite wedding, birthday, and party invitation card printing.", basePrice: 25, features: ["Textured executive paper", "Complimentary envelope wrap", "Vibrant colors & hot stamping"], image: "/images/invitation.jpg" },
  { id: "calendar-print", name: "Custom Photo Wall Calendars", category: "business", description: "Personalized wall/desk calendars featuring custom photos for each month.", basePrice: 180, features: ["12-month page sheets", "Wiro spiral binder hang hook", "Sturdy premium paper stock"], image: "/images/calendar.jpg" },
  { id: "corporate-gift", name: "Corporate Gift Printing & Combo Sets", category: "business", description: "Embossed diaries, engraved metal pens, and premium customized gift combos.", basePrice: 450, features: ["Engraved executive metal pen", "Leatherette diary notebook", "Premium customized gift box"], image: "/images/corporate-gift.jpg" },

  // Custom Merchandise
  { id: "mug-print", name: "Custom Mug Printing", category: "merchandise", description: "Personalized ceramic coffee mugs with wrap-around photo prints.", basePrice: 150, features: ["325ml premium ceramic", "Microwave and dishwasher safe", "Glossy dynamic wrap"], image: "/images/mug.jpg" },
  { id: "magic-mug", name: "Magic Mug Printing", category: "merchandise", description: "Color-changing ceramic mugs that reveal your design when hot liquids are added.", basePrice: 250, features: ["Heat-sensitive coating", "Black finish turns white", "Wow-factor gift"], image: "/images/magic-mug.jpg" },
  { id: "tshirt-print", name: "Custom T-Shirt Printing", category: "merchandise", description: "Premium cotton round-neck T-shirts with customized DTF graphics.", basePrice: 350, features: ["100% combed cotton", "High durability print", "Multiple color options"], image: "/images/tshirt.jpg" },
  { id: "hoodie-print", name: "Custom Hoodie Printing", category: "merchandise", description: "Warm and cozy fleece-lined hoodies with custom graphics or embroidery.", basePrice: 750, features: ["300 GSM fleece cotton", "Kangaroo pockets", "Durable wash-safe print"], image: "/images/hoodie.jpg" },
  { id: "pillow-print", name: "Custom Cushion/Pillow Printing", category: "merchandise", description: "Cozy custom throw pillows and cushion covers with premium soft fillers.", basePrice: 200, features: ["Satin canvas covers", "Soft fiber filler included", "Vivid photo sublimation"], image: "/images/pillow.jpg" },
  { id: "mobilecover-print", name: "Custom Mobile Cover Printing", category: "merchandise", description: "Edge-to-edge personalized 3D wrap hard cases for popular phone models.", basePrice: 180, features: ["polycarbonate slim case", "3D wrap print covers sides", "Scratch-resistant matte finish"], image: "/images/mobilecover.jpg" },
  { id: "keychain-print", name: "Personalized Keychain Printing", category: "merchandise", description: "Premium clear acrylic or wooden keychains customized with photos or logo.", basePrice: 60, features: ["Glossy acrylic display", "Sturdy metal chain ring", "Double-sided full print"], image: "/images/keychain.jpg" },
  { id: "cap-print", name: "Custom Cap & Hat Printing", category: "merchandise", description: "Printed or embroidered sports caps for branding and promotions.", basePrice: 120, features: ["100% breathable cotton", "Adjustable secure strap", "Vivid logo embroidery"], image: "/images/cap.jpg" },
  { id: "photoframe-print", name: "Archival Canvas Frame Printing", category: "merchandise", description: "Museum-grade canvas material stretched onto a sturdy wooden internal frames.", basePrice: 300, features: ["Premium textured canvas", "Wooden gallery wrapped border", "Pre-installed hangers"], image: "/images/canvas.jpg" },
  { id: "mousepad-print", name: "Custom Rubber Mousepad Printing", category: "merchandise", description: "Smooth textured custom mousepads with anti-slip rubber bases.", basePrice: 120, features: ["High-speed smooth cloth surface", "Anti-fray stitched edges", "Steady heavy rubber grip"], image: "/images/mousepad.jpg" },

  // Document Services
  { id: "scanning", name: "Document Scanning & Archiving", category: "documents", description: "High-speed document scanning to PDF/JPEG and cloud storage backup.", basePrice: 5, features: ["Up to 600 DPI", "Multi-page PDF compilation", "OCR text searchable (optional)"], image: "/images/scan.jpg" },
  { id: "xerox", name: "High-volume Xerox", category: "documents", description: "Quick photocopy services for booklets, documents, and records.", basePrice: 1.5, features: ["High-speed replication", "70 GSM paper", "Bulk discount rates"], image: "/images/xerox.jpg" },
  { id: "resume-creation", name: "Professional Resume Writing", category: "documents", description: "Resume writing and formatting service with ATS-compliant designs.", basePrice: 200, features: ["ATS friendly styling", "PDF & Word deliverables", "Modern executive layout"], image: "/images/resume.jpg" },
];

const DEFAULT_PRODUCTS: ProductItem[] = [
  { id: "prod-mug", name: "Standard Ceramic Mug", type: "mug", basePrice: 150, imageUrl: "/images/mug.jpg", colors: ["#ffffff", "#000000", "#ef4444", "#3b82f6"] },
  { id: "prod-magic-mug", name: "Magic Color Changing Mug", type: "magic-mug" as any, basePrice: 250, imageUrl: "/images/magic-mug.jpg", colors: ["#000000"] },
  { id: "prod-tshirt", name: "Premium cotton T-Shirt", type: "tshirt", basePrice: 350, imageUrl: "/images/tshirt.jpg", colors: ["#ffffff", "#000000", "#18181b", "#ef4444", "#3b82f6", "#10b981"], sizes: ["S", "M", "L", "XL", "XXL"] },
  { id: "prod-hoodie", name: "Heavyweight Fleece Hoodie", type: "hoodie", basePrice: 750, imageUrl: "/images/hoodie.jpg", colors: ["#ffffff", "#000000", "#374151", "#3b82f6"], sizes: ["M", "L", "XL", "XXL"] },
  { id: "prod-pillow", name: "Cozy Cushion/Pillow", type: "pillow", basePrice: 200, imageUrl: "/images/pillow.jpg", colors: ["#ffffff", "#fef08a", "#fbcfe8"] },
  { id: "prod-mobilecover", name: "Slim Fit 3D Phone Case", type: "mobilecover", basePrice: 180, imageUrl: "/images/mobilecover.jpg", colors: ["#ffffff", "#000000", "#1e3a8a", "#e11d48"] },
  { id: "prod-keychain", name: "Custom Acrylic Keychain", type: "keychain", basePrice: 60, imageUrl: "/images/keychain.jpg", colors: ["#ffffff", "#ef4444", "#eab308", "#10b981"] },
  { id: "prod-cap", name: "Adjustable Snapback Canvas Cap", type: "cap", basePrice: 120, imageUrl: "/images/cap.jpg", colors: ["#ffffff", "#000000", "#1e3a8a", "#e11d48"], sizes: ["Adjustable"] },
  { id: "prod-photoframe", name: "Stretched Canvas Art Frame", type: "photoframe", basePrice: 300, imageUrl: "/images/canvas.jpg", colors: ["#ffffff"], sizes: ["12x12", "12x18", "18x24"] },
  { id: "prod-mousepad", name: "Premium Non-Slip Mousepad", type: "mousepad", basePrice: 120, imageUrl: "/images/mousepad.jpg", colors: ["#ffffff", "#000000", "#374151"] },
];

// Prepopulate localStorage for Mocks
const getLocalData = (key: string) => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(`printhub_db_${key}`);
  return data ? JSON.parse(data) : null;
};

const setLocalData = (key: string, data: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(`printhub_db_${key}`, JSON.stringify(data));
};

const initLocalDatabase = () => {
  if (typeof window === "undefined") return;
  
  const existingServices = getLocalData("services");
  if (!existingServices) {
    setLocalData("services", DEFAULT_SERVICES);
  } else {
    // Merge any missing services
    const missing = DEFAULT_SERVICES.filter(
      (ds) => !existingServices.some((cs: any) => cs.id === ds.id)
    );
    if (missing.length > 0) {
      setLocalData("services", [...existingServices, ...missing]);
    }
  }

  const existingProducts = getLocalData("products");
  if (!existingProducts) {
    setLocalData("products", DEFAULT_PRODUCTS);
  } else {
    // Merge any missing products
    const missing = DEFAULT_PRODUCTS.filter(
      (dp) => !existingProducts.some((cp: any) => cp.id === dp.id)
    );
    if (missing.length > 0) {
      setLocalData("products", [...existingProducts, ...missing]);
    }
  }

  if (!getLocalData("settings")) {
    setLocalData("settings", {
      gstNumber: "27AAAAA1111A1Z1",
      companyName: "PrintHub Services Ltd.",
      companyAddress: "102, Digital Towers, Sector 62, Noida, UP - 201301",
      taxRate: 18,
      upiId: "pay.printhub@okaxis",
      contactEmail: "support@printhub.com"
    });
  }
  
  // Prepopulate standard accounts
  if (!getLocalData("users")) {
    const defaultUsers: Record<string, UserProfile> = {
      "user-customer": {
        uid: "user-customer",
        email: "customer@printhub.com",
        displayName: "Jane Doe",
        role: "customer",
        photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jane",
        addresses: [
          { id: "addr-1", name: "Home", street: "Flat 402, Royal Gardens", city: "Noida", state: "Uttar Pradesh", zipCode: "201301", phone: "9876543210" }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      "user-admin": {
        uid: "user-admin",
        email: "admin@printhub.com",
        displayName: "Admin Partner",
        role: "admin",
        photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    setLocalData("users", defaultUsers);
  }

  // Prepopulate sample order history for demonstration
  if (!getLocalData("orders")) {
    const defaultOrders: Order[] = [
      {
        id: "PH-9821",
        customerId: "user-customer",
        customerEmail: "customer@printhub.com",
        customerName: "Jane Doe",
        serviceId: "a4-color",
        serviceName: "A4 Color Printing",
        serviceCategory: "printing",
        files: [{ name: "semester_project_presentation.pdf", url: "#", size: 1048576, type: "application/pdf" }],
        quantity: 1,
        specifications: { paperSize: "A4", colorMode: "color", sides: "double", binding: "spiral", pages: 15, copies: 2 },
        priceBreakdown: { base: 10, optionsPrice: 40, subtotal: 340, gst: 61.2, total: 401.2 },
        paymentId: "pay_mock_12345",
        paymentMethod: "stripe",
        paymentStatus: "completed",
        orderStatus: "Ready for Pickup",
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: "PH-7712",
        customerId: "user-customer",
        customerEmail: "customer@printhub.com",
        customerName: "Jane Doe",
        serviceId: "mug-print",
        serviceName: "Custom Mug Printing",
        serviceCategory: "merchandise",
        files: [{ name: "my_family_portrait.jpg", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300", size: 409600, type: "image/jpeg" }],
        quantity: 2,
        specifications: { size: "M" as any, color: "#ffffff", customText: "Happy Birthday Mom", customImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300" },
        priceBreakdown: { base: 150, optionsPrice: 0, subtotal: 300, gst: 54, total: 354 },
        paymentId: "pay_mock_67890",
        paymentMethod: "upi",
        paymentStatus: "completed",
        orderStatus: "Delivered",
        createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString()
      }
    ];
    setLocalData("orders", defaultOrders);
  }
};

if (typeof window !== "undefined") {
  initLocalDatabase();
}

// --- HYBRID ACTIONS ROUTER ---

// 1. AUTHENTICATION SERVICES
export const authService = {
  // Subscribe to auth state changes
  onAuthStateChange: (callback: (user: UserProfile | null) => void) => {
    if (isFirebaseEnabled) {
      return firebaseOnAuthStateChanged(firebaseAuth!, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // Fetch additional profile fields from Firestore
          const docRef = doc(firebaseDb!, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            callback(docSnap.data() as UserProfile);
          } else {
            // Create profile record if missing
            const profile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              role: "customer",
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firebaseUser.uid}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(docRef, profile);
            callback(profile);
          }
        } else {
          callback(null);
        }
      });
    } else {
      // Mock implementation using localStorage
      const checkSession = () => {
        if (typeof window === "undefined") return;
        const loggedInUid = sessionStorage.getItem("printhub_logged_in_uid");
        if (loggedInUid) {
          const usersMap = getLocalData("users") || {};
          const user = usersMap[loggedInUid];
          callback(user || null);
        } else {
          callback(null);
        }
      };

      // Set listener
      if (typeof window !== "undefined") {
        window.addEventListener("printhub_auth_event", checkSession);
      }
      checkSession();

      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("printhub_auth_event", checkSession);
        }
      };
    }
  },

  // Email/Password sign up
  signUp: async (email: string, password: string, displayName: string): Promise<UserProfile> => {
    if (isFirebaseEnabled) {
      const userCred = await createUserWithEmailAndPassword(firebaseAuth!, email, password);
      const profile: UserProfile = {
        uid: userCred.user.uid,
        email,
        displayName,
        role: "customer",
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userCred.user.uid}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(firebaseDb!, "users", userCred.user.uid), profile);
      return profile;
    } else {
      // Mock Signup
      const usersMap = getLocalData("users") || {};
      
      // Check if already exists
      const emailExists = Object.values(usersMap).some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) throw new Error("Email already in use.");

      const newUid = `user-${Math.random().toString(36).substring(2, 11)}`;
      const profile: UserProfile = {
        uid: newUid,
        email,
        displayName,
        role: "customer",
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${newUid}`,
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      usersMap[newUid] = profile;
      setLocalData("users", usersMap);
      
      sessionStorage.setItem("printhub_logged_in_uid", newUid);
      window.dispatchEvent(new Event("printhub_auth_event"));
      return profile;
    }
  },

  // Email/Password sign in
  signIn: async (email: string, password: string): Promise<UserProfile> => {
    if (isFirebaseEnabled) {
      const userCred = await signInWithEmailAndPassword(firebaseAuth!, email, password);
      const docRef = doc(firebaseDb!, "users", userCred.user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      throw new Error("User profile not found.");
    } else {
      // Mock Signin
      const usersMap = getLocalData("users") || {};
      const foundUser = Object.values(usersMap).find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase()
      ) as UserProfile;

      if (!foundUser) {
        throw new Error("Auth failed: Invalid credentials.");
      }

      // Check simple passwords for mocks (customer@printhub.com / password123, admin@printhub.com / admin123)
      if (email === "customer@printhub.com" && password !== "password123") {
        throw new Error("Auth failed: Invalid password.");
      }
      if (email === "admin@printhub.com" && password !== "admin123") {
        throw new Error("Auth failed: Invalid password.");
      }

      sessionStorage.setItem("printhub_logged_in_uid", foundUser.uid);
      window.dispatchEvent(new Event("printhub_auth_event"));
      return foundUser;
    }
  },

  // Social Google login
  signInWithGoogle: async (): Promise<UserProfile> => {
    if (isFirebaseEnabled) {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(firebaseAuth!, provider);
      const docRef = doc(firebaseDb!, "users", userCred.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        const profile: UserProfile = {
          uid: userCred.user.uid,
          email: userCred.user.email || "",
          displayName: userCred.user.displayName || "Google User",
          role: "customer",
          photoURL: userCred.user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userCred.user.uid}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(docRef, profile);
        return profile;
      }
    } else {
      // Mock Google Login - Log in the mock customer directly
      const usersMap = getLocalData("users") || {};
      const customer = usersMap["user-customer"];
      
      sessionStorage.setItem("printhub_logged_in_uid", customer.uid);
      window.dispatchEvent(new Event("printhub_auth_event"));
      return customer;
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    if (isFirebaseEnabled) {
      await firebaseSignOut(firebaseAuth!);
    } else {
      sessionStorage.removeItem("printhub_logged_in_uid");
      window.dispatchEvent(new Event("printhub_auth_event"));
    }
  },

  updateUserProfile: async (uid: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    if (isFirebaseEnabled) {
      const docRef = doc(firebaseDb!, "users", uid);
      await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
      const docSnap = await getDoc(docRef);
      return docSnap.data() as UserProfile;
    } else {
      const usersMap = getLocalData("users") || {};
      const user = usersMap[uid];
      if (!user) throw new Error("User profile not found.");

      const updated = {
        ...user,
        ...data,
        updatedAt: new Date().toISOString()
      };
      usersMap[uid] = updated;
      setLocalData("users", usersMap);
      window.dispatchEvent(new Event("printhub_auth_event"));
      return updated;
    }
  }
};

// 2. FIRESTORE DATABASE SERVICES
export const dbService = {
  // Read all items in a collection
  getCollection: async <T>(collName: string): Promise<T[]> => {
    if (isFirebaseEnabled) {
      const q = query(collection(firebaseDb!, collName));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
    } else {
      const data = getLocalData(collName);
      return (data || []) as T[];
    }
  },

  // Read a single document by ID
  getDocument: async <T>(collName: string, docId: string): Promise<T | null> => {
    if (isFirebaseEnabled) {
      const docRef = doc(firebaseDb!, collName, docId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as T) : null;
    } else {
      const collectionData = getLocalData(collName);
      if (Array.isArray(collectionData)) {
        return (collectionData.find((item: any) => item.id === docId) || null) as T | null;
      } else if (collectionData && typeof collectionData === "object") {
        return (collectionData[docId] || null) as T | null;
      }
      return null;
    }
  },

  // Add document (auto-generated ID)
  addDocument: async <T extends { id?: string }>(collName: string, documentData: Omit<T, "id">): Promise<T> => {
    if (isFirebaseEnabled) {
      const collRef = collection(firebaseDb!, collName);
      const docRef = await addDoc(collRef, documentData);
      return { id: docRef.id, ...documentData } as unknown as T;
    } else {
      const collectionData = getLocalData(collName) || [];
      const newId = `doc-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      const record = { id: newId, ...documentData } as unknown as T;
      
      collectionData.push(record);
      setLocalData(collName, collectionData);
      return record;
    }
  },

  // Set document (custom ID)
  setDocument: async <T>(collName: string, docId: string, documentData: T): Promise<T> => {
    if (isFirebaseEnabled) {
      await setDoc(doc(firebaseDb!, collName, docId), documentData as any);
      return documentData;
    } else {
      const collectionData = getLocalData(collName) || [];
      const index = collectionData.findIndex((item: any) => item.id === docId);
      const record = { id: docId, ...documentData };

      if (index > -1) {
        collectionData[index] = record;
      } else {
        collectionData.push(record);
      }
      setLocalData(collName, collectionData);
      return record as T;
    }
  },

  // Update document
  updateDocument: async (collName: string, docId: string, updateData: any): Promise<void> => {
    if (isFirebaseEnabled) {
      await updateDoc(doc(firebaseDb!, collName, docId), updateData);
    } else {
      const collectionData = getLocalData(collName) || [];
      const index = collectionData.findIndex((item: any) => item.id === docId);
      if (index > -1) {
        collectionData[index] = { ...collectionData[index], ...updateData };
        setLocalData(collName, collectionData);
      } else {
        // Check if map structure (e.g. users collection is structured as a map in mock)
        const mapData = getLocalData(collName);
        if (mapData && mapData[docId]) {
          mapData[docId] = { ...mapData[docId], ...updateData };
          setLocalData(collName, mapData);
        }
      }
    }
  },

  // Query documents with filters
  queryDocuments: async <T>(collName: string, filters: { field: string; operator: "==" | ">" | "<" | "array-contains"; value: any }[]): Promise<T[]> => {
    if (isFirebaseEnabled) {
      let q = query(collection(firebaseDb!, collName));
      filters.forEach(f => {
        q = query(q, where(f.field, f.operator, f.value));
      });
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
    } else {
      const collectionData = (getLocalData(collName) || []) as any[];
      return collectionData.filter(item => {
        return filters.every(f => {
          if (f.operator === "==") return item[f.field] === f.value;
          if (f.operator === ">") return item[f.field] > f.value;
          if (f.operator === "<") return item[f.field] < f.value;
          if (f.operator === "array-contains") return Array.isArray(item[f.field]) && item[f.field].includes(f.value);
          return false;
        });
      }) as T[];
    }
  }
};

// 3. STORAGE SERVICES (FILE UPLOAD)
export const storageService = {
  uploadFile: (
    file: File, 
    path: string, 
    onProgress: (progress: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (isFirebaseEnabled) {
        const storageRef = ref(firebaseStorage!, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          },
          (error) => {
            reject(error);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          }
        );
      } else {
        // Mock upload: Simulate progress and return standard Data URI or Object URL
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          onProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            
            // Create a fake URL using URL.createObjectURL or standard visual asset
            try {
              const fileUrl = URL.createObjectURL(file);
              resolve(fileUrl);
            } catch (err) {
              resolve(`https://firebasestorage.googleapis.com/v0/b/printhub-mock/o/${encodeURIComponent(file.name)}?alt=media`);
            }
          }
        }, 150);
      }
    });
  }
};
