// Validation utilities
export const validators = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password validation (min 6 characters)
  isValidPassword: (password: string): boolean => {
    return password.length >= 6;
  },

  // Name validation (2-100 characters)
  isValidName: (name: string): boolean => {
    return name.length >= 2 && name.length <= 100;
  },

  // Phone validation (10 digits)
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  },

  // Role validation
  isValidRole: (role: string): boolean => {
    return ['admin', 'supplier', 'user'].includes(role);
  },
};

export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};