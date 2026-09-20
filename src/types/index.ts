// ============================================================
// USER & AUTH TYPES
// ============================================================

export type UserRole = 'admin' | 'supplier' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  profile_picture?: string;
  is_active: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    token: string;
    phone?: string;
    address?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  address?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  profile_picture?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================================
// MEDICINE TYPES
// ============================================================

export interface MedicalDetails {
  usage?: string;
  dosage?: string;
  indications?: string[];
  contraindications?: string[];
  side_effects?: string[];
  precautions?: string[];
  interactions?: string[];
  pregnancy_category?: string;
  lactation?: string;
  pediatric_use?: string;
  geriatric_use?: string;
  overdosage?: string;
  storage?: string;
  manufacturer?: string;
  country_of_origin?: string;
}

export type MedicineForm =
  | 'tablet'
  | 'capsule'
  | 'syrup'
  | 'injection'
  | 'ointment'
  | 'cream'
  | 'liquid'
  | 'powder'
  | 'drops'
  | 'inhaler'
  | 'other';

export interface OtherDetails {
  description?: string;
  composition?: string[];
  form?: MedicineForm;
  strength?: string;
  pack_size?: string;
  unit?: string;
  shelf_life?: string;
  product_code?: string;
  barcode?: string;
  manufacturer_details?: string;
  distributor?: string;
}

export interface MedicineMetadata {
  tags?: string[];
  keywords?: string[];
  is_prescription_required: boolean;
  is_controlled_substance: boolean;
  schedule_type?: string;
  cold_chain_required: boolean;
  hazardous: boolean;
  requires_medical_approval: boolean;
  rating?: number;
  reviews_count: number;
}

export type MedicineStatus = 'pending' | 'approved' | 'rejected' | 'inactive';

export interface Medicine {
  id: string;
  name: string;
  generic_name?: string;
  brand_name?: string;
  category: string;
  medical_details: MedicalDetails;
  other_details: OtherDetails;
  metadata: MedicineMetadata;
  quantity: number;
  min_quantity_alert: number;
  max_quantity?: number;
  unit_price: number;
  purchase_price?: number;
  discount_percentage?: number;
  status: MedicineStatus;
  is_available: boolean;
  approval_notes?: string;
  images: string[];
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  supplier_id: string;
  supplier?: User;
  approver?: User;
  rejector?: User;
  last_restocked_at?: string;
  expiry_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMedicineRequest {
  name: string;
  generic_name?: string;
  brand_name?: string;
  category: string;
  medical_details?: Partial<MedicalDetails>;
  other_details?: Partial<OtherDetails>;
  metadata?: Partial<MedicineMetadata>;
  quantity: number;
  min_quantity_alert?: number;
  max_quantity?: number;
  unit_price: number;
  purchase_price?: number;
  discount_percentage?: number;
  expiry_date?: Date;
  images?: string[];
}

export interface UpdateMedicineRequest extends Partial<CreateMedicineRequest> {
  status?: MedicineStatus;
  is_available?: boolean;
  approval_notes?: string;
}

export interface UpdateQuantityRequest {
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
}

export interface ApproveRejectRequest {
  approval_notes?: string;
  rejection_reason?: string;
}

export interface MedicineFilters {
  category?: string;
  status?: string;
  supplier_id?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  low_stock?: boolean;
  is_available?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MedicineStatistics {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  low_stock: number;
  out_of_stock: number;
  categories: Array<{ category: string; count: number }>;
  category_count: number;
}

export interface SupplierSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  low_stock: number;
  out_of_stock: number;
  approval_rate: number;
}

export interface MedicineResponse {
  success: boolean;
  message: string;
  data?: Medicine | Medicine[];
  count?: number;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// ============================================================
// PURCHASE TYPES  (only ONE declaration — no duplicates)
// ============================================================

export type PurchaseStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'verified'
  | 'failed'
  | 'refunded';

export type PaymentMethod = 'qr_code' | 'cash' | 'card' | 'online';

export interface Purchase {
  id: string;
  purchase_number: string;

  // Customer
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;

  // Medical info
  disease?: string;
  symptoms?: string;
  prescription_required: boolean;
  prescription_file?: string;
  prescription_notes?: string;

  // Medicine snapshot
  medicine_id: string;
  medicine_name: string;
  medicine_price: number;
  quantity: number;
  total_amount: number;

  // Payment summary
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_screenshot?: string;
  payment_verified_at?: string;
  payment_verified_by?: string;
  payment_verification_notes?: string;
  transaction_id?: string;

  // Purchase status
  status: PurchaseStatus;

  // User (nullable for guest)
  user_id?: string;

  // Timestamps
  purchased_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;

  // Notes
  notes?: string;
  delivery_instructions?: string;

  // Server timestamps
  created_at?: string;
  updated_at?: string;

  // Relations
  medicine?: Medicine;
  payment?: Payment;
  customer?: User;
  verifier?: User;
}

export interface PurchaseRequest {
  medicine_id: string;
  quantity: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  disease?: string;
  symptoms?: string;
  prescription_required?: boolean;
  prescription_file?: string;
  prescription_notes?: string;
  delivery_instructions?: string;
  notes?: string;
}

export interface PurchaseCreateResponse {
  purchase: Purchase;
  payment_qr: {
    upi_id: string;
    amount: number;
    reference: string;
  };
}

export interface PurchaseFilters {
  status?: PurchaseStatus;
  payment_status?: PaymentStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface PurchaseStatistics {
  total_purchases: number;
  pending_payments: number;
  paid_payments: number;
  verified_payments: number;
  pending_verification: number;
  total_revenue: number;
  today_purchases: number;
  monthly_purchases: number;
}

// ============================================================
// PAYMENT TYPES  (only ONE declaration)
// ============================================================

export interface QRCodeData {
  upi_id: string | null;
  merchant_name: string | null;
  amount: number | null;
  reference: string | null;
}

export interface Payment {
  id: string;
  purchase_id: string;
  amount: number;
  payment_method: PaymentMethod;
  qr_code_data?: QRCodeData;
  status: PaymentStatus;
  screenshot_url?: string;
  screenshot_uploaded_at?: string;
  verified_at?: string;
  verified_by?: string;
  verification_notes?: string;
  transaction_id?: string;
  payment_date?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  purchase?: Purchase;
}

export interface UploadScreenshotRequest {
  screenshot_url: string;
  transaction_id?: string;
}

export interface VerifyPaymentRequest {
  verification_notes?: string;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  count: number;
  total?: number;
  page?: number;
  limit?: number;
}

// ============================================================
// CONTEXT TYPES
// ============================================================

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  getProfile: () => Promise<void>;
  clearError: () => void;
}

export interface MedicineContextType {
  medicines: Medicine[];
  selectedMedicine: Medicine | null;
  isLoading: boolean;
  error: string | null;
  statistics: MedicineStatistics | null;
  supplierSummary: SupplierSummary | null;
  getMedicines: (filters?: MedicineFilters) => Promise<void>;
  getMedicineById: (id: string) => Promise<void>;
  createMedicine: (data: CreateMedicineRequest) => Promise<Medicine>;
  updateMedicine: (id: string, data: UpdateMedicineRequest) => Promise<void>;
  updateQuantity: (id: string, data: UpdateQuantityRequest) => Promise<void>;
  approveMedicine: (id: string, notes?: string) => Promise<void>;
  rejectMedicine: (id: string, reason: string) => Promise<void>;
  revokeApproval: (id: string, reason?: string) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  getStatistics: () => Promise<void>;
  getSupplierSummary: () => Promise<void>;
  getMedicinesBySupplier: (supplierId: string, status?: string) => Promise<void>;
  searchMedicines: (searchTerm: string) => Promise<void>;
  clearSelected: () => void;
  clearError: () => void;
}

export interface PurchaseContextType {
  purchases: Purchase[];
  selectedPurchase: Purchase | null;
  pendingVerifications: Purchase[];
  statistics: PurchaseStatistics | null;
  isLoading: boolean;
  error: string | null;

  createPurchase: (data: PurchaseRequest) => Promise<PurchaseCreateResponse>;
  uploadScreenshot: (
    purchaseId: string,
    data: UploadScreenshotRequest
  ) => Promise<Purchase>;
  verifyPayment: (
    purchaseId: string,
    data: VerifyPaymentRequest
  ) => Promise<Purchase>;
  cancelPurchase: (purchaseId: string, reason?: string) => Promise<Purchase>;

  getMyPurchases: () => Promise<void>;
  getPurchaseById: (id: string) => Promise<void>;
  getAllPurchases: (filters?: PurchaseFilters) => Promise<void>;
  getPendingVerifications: () => Promise<void>;
  getStatistics: () => Promise<void>;

  clearSelected: () => void;
  clearError: () => void;
}

// ============================================================
// ROUTE PARAMS
// ============================================================

export interface RouteParams {
  id: string;
  role?: UserRole;
}

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  role?: string;
}