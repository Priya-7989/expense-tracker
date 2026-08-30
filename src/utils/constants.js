export const CATEGORIES = [
    { label: 'Groceries', color: '#43e97b', icon: '🛒' },
    { label: 'Utilities', color: '#6c63ff', icon: '⚡' },
    { label: 'Rent', color: '#f093fb', icon: '🏠' },
    { label: 'Dining', color: '#fa7c58', icon: '🍽️' },
    { label: 'Transport', color: '#4facfe', icon: '🚗' },
    { label: 'Misc', color: '#ffeaa7', icon: '📦' },
];

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Card'];

export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export const getCategoryColor = (cat) =>
    CATEGORIES.find((c) => c.label === cat)?.color ?? '#94a3b8';

export const getCategoryIcon = (cat) =>
    CATEGORIES.find((c) => c.label === cat)?.icon ?? '📦';

export const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
