import { type Medicine } from '../types';

export const getMedicineStatusColor = (status: string): string => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'danger';
    case 'inactive':
      return 'secondary';
    default:
      return 'info';
  }
};

export const getMedicineStatusLabel = (status: string): string => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'pending':
      return 'Pending Approval';
    case 'rejected':
      return 'Rejected';
    case 'inactive':
      return 'Inactive';
    default:
      return status;
  }
};

export const getStockStatus = (medicine: Medicine): 'in_stock' | 'low_stock' | 'out_of_stock' => {
  if (medicine.quantity === 0) return 'out_of_stock';
  if (medicine.quantity <= medicine.min_quantity_alert) return 'low_stock';
  return 'in_stock';
};

export const getStockStatusColor = (medicine: Medicine): string => {
  const status = getStockStatus(medicine);
  switch (status) {
    case 'in_stock':
      return 'success';
    case 'low_stock':
      return 'warning';
    case 'out_of_stock':
      return 'danger';
    default:
      return 'info';
  }
};

export const getStockStatusLabel = (medicine: Medicine): string => {
  const status = getStockStatus(medicine);
  switch (status) {
    case 'in_stock':
      return 'In Stock';
    case 'low_stock':
      return 'Low Stock';
    case 'out_of_stock':
      return 'Out of Stock';
    default:
      return 'Unknown';
  }
};

export const calculateDiscountPrice = (price: number, discountPercentage: number): number => {
  if (discountPercentage <= 0) return price;
  return price - (price * (discountPercentage / 100));
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const isMedicineExpired = (medicine: Medicine): boolean => {
  if (!medicine.expiry_date) return false;
  const expiryDate = new Date(medicine.expiry_date);
  const today = new Date();
  return expiryDate < today;
};

export const getDaysUntilExpiry = (medicine: Medicine): number | null => {
  if (!medicine.expiry_date) return null;
  const expiryDate = new Date(medicine.expiry_date);
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getExpiryStatus = (medicine: Medicine): 'expired' | 'expiring_soon' | 'valid' => {
  if (!medicine.expiry_date) return 'valid';
  const daysUntilExpiry = getDaysUntilExpiry(medicine);
  if (daysUntilExpiry === null) return 'valid';
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  return 'valid';
};

export const getExpiryStatusColor = (medicine: Medicine): string => {
  const status = getExpiryStatus(medicine);
  switch (status) {
    case 'expired':
      return 'danger';
    case 'expiring_soon':
      return 'warning';
    case 'valid':
      return 'success';
    default:
      return 'info';
  }
};

export const filterMedicines = (
  medicines: Medicine[],
  filters: {
    search?: string;
    category?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    lowStock?: boolean;
  }
): Medicine[] => {
  return medicines.filter(medicine => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        medicine.name.toLowerCase().includes(searchLower) ||
        medicine.generic_name?.toLowerCase().includes(searchLower) ||
        medicine.brand_name?.toLowerCase().includes(searchLower) ||
        medicine.category.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.category && medicine.category !== filters.category) {
      return false;
    }

    // Status filter
    if (filters.status && medicine.status !== filters.status) {
      return false;
    }

    // Price range filter
    if (filters.minPrice !== undefined && medicine.unit_price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && medicine.unit_price > filters.maxPrice) {
      return false;
    }

    // Stock filters
    if (filters.inStock && medicine.quantity === 0) {
      return false;
    }
    if (filters.lowStock && medicine.quantity > medicine.min_quantity_alert) {
      return false;
    }

    return true;
  });
};

export const getCategoryOptions = (medicines: Medicine[]): string[] => {
  const categories = new Set(medicines.map(m => m.category));
  return Array.from(categories).sort();
};

export const getUniqueSuppliers = (medicines: Medicine[]): string[] => {
  const suppliers = new Set(
    medicines
      .filter(m => m.supplier)
      .map(m => m.supplier!.id)
  );
  return Array.from(suppliers);
};