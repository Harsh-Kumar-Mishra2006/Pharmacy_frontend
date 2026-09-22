// src/utils/medicineHelpers.ts
import {
  type Medicine,
  type AvailableMedicine,
} from '../types';

// ============================================================
// GENERIC HELPERS (used anywhere)
// ============================================================

export const formatPrice = (price: number | string | null | undefined): string => {
  const n = Number(price);
  if (!isFinite(n)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
};

export const formatDate = (d?: string | Date | null): string => {
  if (!d) return 'N/A';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(dt.getTime())) return 'N/A';
  return dt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const calculateDiscountPrice = (
  price: number,
  discountPercentage: number,
): number => {
  if (!discountPercentage || discountPercentage <= 0) return price;
  return price - price * (discountPercentage / 100);
};

// ============================================================
// CATALOG HELPERS (Medicine — admin/supplier views)
// ============================================================

export const getMedicineDisplayName = (m: Medicine): string =>
  m.generic_name ? `${m.name} (${m.generic_name})` : m.name;

export const getMedicineShortLabel = (m: Medicine): string => {
  const parts: string[] = [];
  if (m.other_details?.form) {
    parts.push(
      m.other_details.form.charAt(0).toUpperCase() + m.other_details.form.slice(1),
    );
  }
  if (m.other_details?.strength) parts.push(m.other_details.strength);
  return parts.join(' · ') || '—';
};

export const getMedicineImage = (m: Medicine): string => m.images?.[0] || '';

export const requiresPrescription = (m: Medicine): boolean =>
  Boolean(m.metadata?.is_prescription_required);

export const requiresColdChain = (m: Medicine): boolean =>
  Boolean(m.metadata?.cold_chain_required);

export const isHazardous = (m: Medicine): boolean =>
  Boolean(m.metadata?.hazardous);

export const getCategoryOptions = (medicines: Medicine[]): string[] =>
  Array.from(new Set(medicines.map((m) => m.category))).sort();

/**
 * Status of the catalog entry itself (available / hidden).
 * Old statuses (pending/approved/rejected) no longer apply to Medicine.
 */
export const getMedicineStatusLabel = (m: Medicine): string =>
  m.is_available ? 'Available' : 'Hidden';

export const getMedicineStatusColor = (m: Medicine): string =>
  m.is_available ? 'success' : 'secondary';

// ============================================================
// AVAILABLE-MEDICINE HELPERS (customer view — aggregated supplies)
// ============================================================

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

const LOW_STOCK_THRESHOLD = 10;

export const getStockStatus = (m: AvailableMedicine): StockStatus => {
  if (!m || m.total_quantity <= 0) return 'out_of_stock';
  if (m.total_quantity <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
};

export const getStockStatusColor = (m: AvailableMedicine): string => {
  const s = getStockStatus(m);
  return s === 'in_stock' ? 'success' : s === 'low_stock' ? 'warning' : 'danger';
};

export const getStockStatusLabel = (m: AvailableMedicine): string => {
  const s = getStockStatus(m);
  return s === 'in_stock' ? 'In Stock' : s === 'low_stock' ? 'Low Stock' : 'Out of Stock';
};

export const getPriceRange = (m: AvailableMedicine): string => {
  const min = Number(m.min_price ?? 0);
  const max = Number(m.max_price ?? 0);
  if (!isFinite(min) || min === 0) return formatPrice(0);
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
};

export const getEffectivePrice = (m: AvailableMedicine): number =>
  Number(m.min_price ?? 0);

export const canPurchase = (m: AvailableMedicine, quantity: number): boolean => {
  if (!m || !m.in_stock) return false;
  if (quantity < 1) return false;
  if (quantity > m.total_quantity) return false;
  return true;
};

// ============================================================
// GENERIC FILTER (works with either shape)
// ============================================================

interface BaseFilterable {
  name: string;
  generic_name?: string;
  brand_name?: string;
  category: string;
}

export const filterMedicines = <T extends BaseFilterable>(
  medicines: T[],
  filters: {
    search?: string;
    category?: string;
  },
): T[] => {
  return medicines.filter((m) => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const matches =
        m.name.toLowerCase().includes(s) ||
        m.generic_name?.toLowerCase().includes(s) ||
        m.brand_name?.toLowerCase().includes(s) ||
        m.category.toLowerCase().includes(s);
      if (!matches) return false;
    }
    if (filters.category && m.category !== filters.category) return false;
    return true;
  });
};