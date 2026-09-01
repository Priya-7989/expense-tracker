import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Save, RotateCcw, CheckCircle } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/constants';

const today = new Date().toISOString().split('T')[0];
const defaultForm = { date: today, particulars: '', category: 'Groceries', amount: '', paymentMethod: 'UPI' };

const Field = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-secondary)' }}>
            {label}
        </label>
        {children}
    </div>
);

export const ExpenseEntry = ({ prefill = null, onSaved }) => {
    const { addNewExpense, editExpense } = useExpenses();
    const [form, setForm] = useState(prefill || defaultForm);
    const [saving, setSaving] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || isNaN(parseFloat(form.amount))) return;
        setSaving(true);
        try {
            if (prefill?.id) {
                await editExpense(prefill.id, form);
                toast.success('Expense updated!', { icon: '✏️' });
            } else {
                await addNewExpense(form);
                toast.success('Expense saved!', { icon: '✅', description: `₹${parseFloat(form.amount).toLocaleString('en-IN')} · ${form.category}` });
                setForm(defaultForm);
            }
            if (onSaved) onSaved();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                        {prefill?.id ? 'Edit Expense' : 'Add Expense'}
                    </h1>
                    <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                        Log a new transaction to your tracker
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="glass-card"
                    style={{ borderRadius: 24, padding: '28px 28px 24px' }}
                >
                    {/* Date + Amount */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <Field label="Date">
                            <input type="date" name="date" value={form.date} onChange={handleChange}
                                required className="premium-input" />
                        </Field>
                        <Field label="Amount (₹)">
                            <input type="number" name="amount" value={form.amount} onChange={handleChange}
                                placeholder="0.00" min="0" step="0.01" required className="premium-input" />
                        </Field>
                    </div>

                    {/* Particulars */}
                    <div style={{ marginBottom: 16 }}>
                        <Field label="Description / Particulars">
                            <input type="text" name="particulars" value={form.particulars} onChange={handleChange}
                                placeholder="e.g. Big Bazaar groceries" required className="premium-input" />
                        </Field>
                    </div>

                    {/* Category + Payment */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                        <Field label="Category">
                            <select name="category" value={form.category} onChange={handleChange} className="premium-input">
                                {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.icon} {c.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Payment Method">
                            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="premium-input">
                                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </Field>
                    </div>

                    {/* Category pills preview */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
                        {CATEGORIES.map(c => (
                            <button
                                key={c.label} type="button"
                                onClick={() => setForm(f => ({ ...f, category: c.label }))}
                                style={{
                                    padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                                    border: `1px solid ${form.category === c.label ? c.color : 'var(--glass-border)'}`,
                                    background: form.category === c.label ? `${c.color}20` : 'transparent',
                                    color: form.category === c.label ? c.color : 'var(--text-secondary)',
                                    cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                                }}
                            >
                                {c.icon} {c.label}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <motion.button
                            type="submit" disabled={saving} whileTap={{ scale: 0.97 }}
                            className="btn-primary"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            {saving
                                ? <><div style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                                : <><Save size={15} /> {prefill?.id ? 'Update Expense' : 'Save Expense'}</>
                            }
                        </motion.button>

                        {!prefill?.id && (
                            <motion.button
                                type="button" whileTap={{ scale: 0.95 }}
                                onClick={() => setForm(defaultForm)}
                                style={{
                                    padding: '12px 16px', borderRadius: 12, border: '1px solid var(--glass-border)',
                                    background: 'var(--glass)', color: 'var(--text-secondary)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <RotateCcw size={15} />
                            </motion.button>
                        )}
                    </div>
                </form>
            </motion.div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};
