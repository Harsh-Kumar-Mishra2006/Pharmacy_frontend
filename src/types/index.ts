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
// MEDICINE TYPES (Admin-owned catalog only)
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

/**
 * Medicine = immutable catalog record created by ADMIN.
 * No quantity, no price, no supplier here — those live on Supply.
 */
export interface Medicine {
  id: string;
  name: string;
  generic_name?: string;
  brand_name?: string;
  category: string;
  medical_details: MedicalDetails;
  other_details: OtherDetails;
  metadata: MedicineMetadata;
  images: string[];
  is_available: boolean;

  // Admin who created it
  created_by: string;
  creator?: User;

  created_at?: string;
  updated_at?: string;

  // Optional relation when listing from admin view
  supplies?: Supply[];
}

export interface CreateMedicineRequest {
  name: string;
  generic_name?: string;
  brand_name?: string;
  category: string;
  medical_details?: Partial<MedicalDetails>;
  other_details?: Partial<OtherDetails>;
  metadata?: Partial<MedicineMetadata>;
  images?: string[];
}

export interface UpdateMedicineRequest extends Partial<CreateMedicineRequest> {
  is_available?: boolean;
}

export interface MedicineFilters {
  category?: string;
  is_available?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MedicineStatistics {
  total: number;
  categories: Array<{ category: string; count: number }>;
  category_count: number;
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
// SUPPLY TYPES  (Supplier → Admin)
// ============================================================

export type SupplyStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'received';

export interface Supply {
  id: string;

  medicine_id: string;
  supplier_id: string;

  quantity: number;
  unit_price: number;
  total_price: number;

  notes?: string;
  expiry_date?: string;

  status: SupplyStatus;

  // Approval workflow
  approval_notes?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  received_at?: string;

  created_at?: string;
  updated_at?: string;

  // Relations
  medicine?: Medicine;
  supplier?: User;
  approver?: User;
  rejector?: User;
}

export interface CreateSupplyRequest {
  medicine_id: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  expiry_date?: string;
}

export interface UpdateSupplyRequest {
  quantity?: number;
  unit_price?: number;
  notes?: string;
  expiry_date?: string;
}

export interface ApproveRejectSupplyRequest {
  approval_notes?: string;
  rejection_reason?: string;
}

export interface SupplyFilters {
  status?: SupplyStatus;
  medicine_id?: string;
  supplier_id?: string;
  page?: number;
  limit?: number;
}

export interface SupplyStatistics {
  total: number;
  pending: number;
  approved: number;
  received: number;
  rejected: number;
  total_value: number;
}

export interface SupplierSupplySummary {
  total: number;
  pending: number;
  approved: number;
  received: number;
  rejected: number;
}

export interface SupplyResponse {
  success: boolean;
  message: string;
  data?: Supply | Supply[];
  count?: number;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// ============================================================
// ENQUIRY TYPES  (Admin → Supplier request)
// ============================================================

export type EnquiryStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'fulfilled';

export interface Enquiry {
  id: string;

  medicine_id: string;
  supplier_id: string;
  requested_by: string;

  requested_quantity: number;
  target_unit_price?: number;

  message?: string;

  status: EnquiryStatus;

  // Supplier response
  response_message?: string;
  responded_at?: string;

  // Link to created Supply when supplier accepts
  supply_id?: string;

  // Cancellation
  cancelled_at?: string;
  cancelled_by?: string;

  created_at?: string;
  updated_at?: string;

  // Relations
  medicine?: Medicine;
  supplier?: User;
  requester?: User;
  canceller?: User;
  supply?: Supply;
}

export interface CreateEnquiryRequest {
  medicine_id: string;
  supplier_id: string;
  requested_quantity: number;
  target_unit_price?: number;
  message?: string;
}

export interface AcceptEnquiryRequest {
  unit_price: number;
  notes?: string;
  expiry_date?: string;
  response_message?: string;
}

export interface RejectEnquiryRequest {
  response_message: string;
}

export interface EnquiryFilters {
  status?: EnquiryStatus;
  medicine_id?: string;
  supplier_id?: string;
  page?: number;
  limit?: number;
}

export interface EnquiryStatistics {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
}

export interface SupplierEnquirySummary {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}

export interface EnquiryResponse {
  success: boolean;
  message: string;
  data?: Enquiry | Enquiry[];
  count?: number;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// ============================================================
// PURCHASE TYPES  (unchanged)
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

  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;

  disease?: string;
  symptoms?: string;
  prescription_required: boolean;
  prescription_file?: string;
  prescription_notes?: string;

  medicine_id: string;
  medicine_name: string;
  medicine_price: number;
  quantity: number;
  total_amount: number;

  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_screenshot?: string;
  payment_verified_at?: string;
  payment_verified_by?: string;
  payment_verification_notes?: string;
  transaction_id?: string;

  status: PurchaseStatus;

  user_id?: string;

  purchased_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;

  notes?: string;
  delivery_instructions?: string;

  created_at?: string;
  updated_at?: string;

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
// PAYMENT TYPES
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

  getMedicines: (filters?: MedicineFilters) => Promise<void>;
  getMedicineById: (id: string) => Promise<void>;
  createMedicine: (data: CreateMedicineRequest) => Promise<Medicine>;
  updateMedicine: (id: string, data: UpdateMedicineRequest) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  getStatistics: () => Promise<void>;
  searchMedicines: (searchTerm: string) => Promise<void>;

  clearSelected: () => void;
  clearError: () => void;
}

export interface SupplyContextType {
  supplies: Supply[];
  selectedSupply: Supply | null;
  statistics: SupplyStatistics | null;
  supplierSummary: SupplierSupplySummary | null;
  isLoading: boolean;
  error: string | null;

  createSupply: (data: CreateSupplyRequest) => Promise<Supply>;
  updateSupply: (id: string, data: UpdateSupplyRequest) => Promise<void>;
  deleteSupply: (id: string) => Promise<void>;
  approveSupply: (id: string, notes?: string) => Promise<void>;
  rejectSupply: (id: string, reason: string) => Promise<void>;
  receiveSupply: (id: string) => Promise<void>;

  getSupplies: (filters?: SupplyFilters) => Promise<void>;
  getSupplyById: (id: string) => Promise<void>;
  getSupplierSummary: () => Promise<void>;
  getSuppliesBySupplier: (supplierId: string, status?: SupplyStatus) => Promise<void>;
  getStatistics: () => Promise<void>;

  clearSelected: () => void;
  clearError: () => void;
}

export interface EnquiryContextType {
  enquiries: Enquiry[];
  selectedEnquiry: Enquiry | null;
  statistics: EnquiryStatistics | null;
  supplierSummary: SupplierEnquirySummary | null;
  isLoading: boolean;
  error: string | null;

  createEnquiry: (data: CreateEnquiryRequest) => Promise<Enquiry>;
  acceptEnquiry: (id: string, data: AcceptEnquiryRequest) => Promise<Enquiry>;
  rejectEnquiry: (id: string, data: RejectEnquiryRequest) => Promise<Enquiry>;
  cancelEnquiry: (id: string) => Promise<Enquiry>;

  getEnquiries: (filters?: EnquiryFilters) => Promise<void>;
  getEnquiryById: (id: string) => Promise<void>;
  getSupplierSummary: () => Promise<void>;
  getStatistics: () => Promise<void>;

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
  supplierId?: string;
  medicineId?: string;
  enquiryId?: string;
  supplyId?: string;
}

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  role?: string;
  supplier_id?: string;
  medicine_id?: string;
}

// ============================================================
// AVAILABLE MEDICINE (catalog + aggregated approved supplies)
// ============================================================

export interface AvailableMedicine {
  id: string;
  name: string;
  generic_name?: string;
  brand_name?: string;
  category: string;
  images: string[];
  medical_details: MedicalDetails;
  other_details: OtherDetails;
  metadata: MedicineMetadata;
  is_available: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;

  // Aggregated from approved/received supplies
  total_quantity: number;
  min_price: number;
  max_price: number;
  in_stock: boolean;
}

export interface AvailableMedicineFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}