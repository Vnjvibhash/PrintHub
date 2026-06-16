export type UserRole = 'customer' | 'admin';

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
}

export type ServiceCategory = 'printing' | 'business' | 'merchandise' | 'documents';

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  basePrice: number;
  features: string[];
  image: string;
}

export interface SpecificationOptions {
  paperSize?: 'A4' | 'A3';
  colorMode?: 'bw' | 'color';
  sides?: 'single' | 'double';
  binding?: 'none' | 'spiral' | 'lamination';
  pages?: number;
  copies?: number;
  size?: string;
  color?: string;
  customText?: string;
  customImageUrl?: string;
  typingLanguage?: 'english' | 'hindi';
  serviceType?: string; // Xerox, Scanning, etc.
}

export interface OrderFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface PriceBreakdown {
  base: number;
  optionsPrice: number;
  subtotal: number;
  gst: number;
  total: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Payment Received'
  | 'Processing'
  | 'Designing'
  | 'Printing'
  | 'Ready for Pickup'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: ServiceCategory;
  files: OrderFile[];
  quantity: number;
  specifications: SpecificationOptions;
  priceBreakdown: PriceBreakdown;
  paymentId?: string;
  paymentMethod: 'stripe' | 'razorpay' | 'upi';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductItem {
  id: string;
  name: string;
  type: 'mug' | 'pillow' | 'tshirt' | 'hoodie' | 'cap' | 'mousepad' | 'keychain' | 'mobilecover' | 'photoframe';
  basePrice: number;
  imageUrl: string;
  colors: string[];
  sizes?: string[];
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  method: 'stripe' | 'razorpay' | 'upi';
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  createdAt: string;
}

export interface InvoiceRecord {
  id: string;
  orderId: string;
  invoiceNumber: string;
  pdfUrl: string;
  totalAmount: number;
  taxAmount: number;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  serviceId: string;
  createdAt: string;
}

export type CarouselAccentColor = 'indigo' | 'emerald' | 'purple' | 'amber';

export interface CarouselSlide {
  id: string;
  tag: string;
  tagColor: string;
  headline: string;
  highlight: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  accentColor: CarouselAccentColor;
  iconName: string;
  stats: { value: string; label: string }[];
  isActive: boolean;
  order: number;
}

export interface OfferRecord {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  applicableServiceIds: string[]; // empty array = applies to all services
  minOrderValue?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface BusinessSettings {
  gstNumber: string;
  companyName: string;
  companyAddress: string;
  taxRate: number;
  upiId: string;
  contactEmail: string;
  rates?: Record<string, number>;
}
