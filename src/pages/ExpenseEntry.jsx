import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/constants';

const today = new Date().toISOString().split('T')[0];

const defaultForm = {
    date: today,
    particulars: '',
    category: 'Groceries',
    amount: '',
    paymentMethod: 'UPI',
};

const inputClass = `
  w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200
`;

const inputStyle = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
};

const focusStyle = {
    borderColor: 'var(--accent-primary)',
    boxShadow: '0 0 0 3px rgba(108,99,255,0.15)',
};

const Field = ({ label, children }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            {label}
        </label>
        {children}
    </div>
);

export const ExpenseEntry = ({ prefill = null, onSaved }) => {
    const { addNewExpense, editExpense } = useExpenses();
    const [form, setForm] = useState(prefill || defaultForm);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [focused, setFocused] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || isNaN(parseFloat(form.amount))) return;
        setSaving(true);
        try {
            if (prefill?.id) {
                await editExpense(prefill.id, form);
            } else {
                await addNewExpense(form);
            }
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
            if (!prefill) setForm(defaultForm);
            if (onSaved) onSaved();
        } finally {
            setSaving(false);
        }
    };

    const getStyle = (name) => ({
        ...inputStyle,
        ...(focused === name ? focusStyle : {}),
    });

    return (
        <div className="max-w-xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {prefill?.id ? 'Edit Expense' : 'Add Expense'}
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Log a new expense to your tracker</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl p-6"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Date">
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            required
                            className={inputClass}
                            style={getStyle('date')}
                            onFocus={() => setFocused('date')}
                            onBlur={() => setFocused('')}
                        />
                    </Field>

                    <Field label="Amount (₹)">
                        <input
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                            className={inputClass}
                            style={getStyle('amount')}
                            onFocus={() => setFocused('amount')}
                            onBlur={() => setFocused('')}
                        />
                    </Field>
                </div>

                <Field label="Particulars / Description">
                    <input
                        type="text"
                        name="particulars"
                        value={form.particulars}
                        onChange={handleChange}
                        placeholder="e.g. Big Bazaar groceries"
                        required
                        className={inputClass}
                        style={getStyle('particulars')}
                        onFocus={() => setFocused('particulars')}
                        onBlur={() => setFocused('')}
                    />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Category">
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className={inputClass}
                            style={getStyle('category')}
                            onFocus={() => setFocused('category')}
                            onBlur={() => setFocused('')}
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c.label} value={c.label}>{c.icon} {c.label}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Payment Method">
                        <select
                            name="paymentMethod"
                            value={form.paymentMethod}
                            onChange={handleChange}
                            className={inputClass}
                            style={getStyle('paymentMethod')}
                            onFocus={() => setFocused('paymentMethod')}
                            onBlur={() => setFocused('')}
                        >
                            {PAYMENT_METHODS.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </Field>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                        style={{
                            background: success
                                ? 'linear-gradient(135deg, #43e97b, #38f9d7)'
                                : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                            color: 'white',
                            opacity: saving ? 0.7 : 1,
                        }}
                    >
                        <Save size={16} />
                        {saving ? 'Saving…' : success ? '✓ Saved!' : prefill?.id ? 'Update Expense' : 'Save Expense'}
                    </button>

                    {!prefill?.id && (
                        <button
                            type="button"
                            onClick={() => setForm(defaultForm)}
                            className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                        >
                            <RotateCcw size={16} />
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};
