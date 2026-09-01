import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createWorker } from 'tesseract.js';
import { toast } from 'sonner';
import { ScanLine, Upload, X, CheckCircle, FileText, ZapIcon } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/constants';

const today = new Date().toISOString().split('T')[0];

const extractFromOCR = (text) => {
    const amountPatterns = [
        /(?:total|amount|amt|rs\.?|₹|inr)\s*[:\-]?\s*(\d+(?:[.,]\d{1,2})?)/i,
        /(\d{3,}(?:[.,]\d{1,2})?)\s*(?:rs\.?|₹|inr)/i,
        /total\s*:?\s*(\d+(?:[.,]\d{2})?)/i,
        /(\d{2,}(?:[.,]\d{2})?)/,
    ];
    let amount = '';
    for (const pat of amountPatterns) {
        const m = text.match(pat);
        if (m) { amount = m[1].replace(',', ''); break; }
    }
    const datePatterns = [
        /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,
        /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/,
    ];
    let date = today;
    for (const pat of datePatterns) {
        const m = text.match(pat);
        if (m) {
            try { const d = new Date(m[0]); if (!isNaN(d)) { date = d.toISOString().split('T')[0]; break; } } catch { }
        }
    }
    return { amount, date };
};

/* ─── Confirm Modal ─── */
const ConfirmModal = ({ imageUrl, ocrData, onConfirm, onCancel }) => {
    const [form, setForm] = useState({
        date: ocrData.date || today,
        particulars: 'Scanned Bill',
        category: 'Misc',
        amount: ocrData.amount || '',
        paymentMethod: 'Cash',
    });
    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: 480, borderRadius: 24, overflow: 'hidden' }}
            >
                {/* Modal header */}
                <div style={{
                    padding: '18px 22px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={15} color="var(--accent-green)" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>Review Scanned Data</span>
                    </div>
                    <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, borderRadius: 8, display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '20px 22px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Preview */}
                    {imageUrl && (
                        <img src={imageUrl} alt="Bill" style={{ width: '100%', maxHeight: 130, objectFit: 'contain', borderRadius: 14, border: '1px solid var(--border)' }} />
                    )}
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                        OCR extracted the data below. Review and adjust before saving.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.7px' }}>Date</label>
                            <input type="date" name="date" value={form.date} onChange={handleChange} className="premium-input" style={{ marginTop: 6 }} /></div>
                        <div><label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.7px' }}>Amount (₹)</label>
                            <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" className="premium-input" style={{ marginTop: 6 }} /></div>
                    </div>

                    <div><label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.7px' }}>Description</label>
                        <input type="text" name="particulars" value={form.particulars} onChange={handleChange} className="premium-input" style={{ marginTop: 6 }} /></div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.7px' }}>Category</label>
                            <select name="category" value={form.category} onChange={handleChange} className="premium-input" style={{ marginTop: 6 }}>
                                {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.icon} {c.label}</option>)}
                            </select></div>
                        <div><label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.7px' }}>Payment</label>
                            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="premium-input" style={{ marginTop: 6 }}>
                                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select></div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                        <motion.button
                            whileTap={{ scale: 0.97 }} onClick={() => onConfirm(form)}
                            className="btn-primary"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            <CheckCircle size={15} /> Save Expense
                        </motion.button>
                        <button onClick={onCancel}
                            style={{ padding: '12px 18px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
                            Cancel
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ─── Main Bill Scanner ─── */
export const BillScanner = () => {
    const { addNewExpense } = useExpenses();
    const fileRef = useRef(null);
    const [status, setStatus] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [imageUrl, setImageUrl] = useState(null);
    const [modal, setModal] = useState(null);

    const processFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        setStatus('scanning');
        setProgress(0);
        try {
            const worker = await createWorker('eng', 1, {
                logger: m => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100)); },
            });
            const { data } = await worker.recognize(file);
            await worker.terminate();
            setModal({ ...extractFromOCR(data.text), imageUrl: url });
            setStatus('done');
        } catch {
            setStatus('error');
        }
    };

    const handleConfirm = async (formData) => {
        await addNewExpense(formData);
        setModal(null);
        setStatus('idle');
        setImageUrl(null);
        if (fileRef.current) fileRef.current.value = '';
        toast.success('Receipt saved!', { icon: '🧾', description: `₹${parseFloat(formData.amount).toLocaleString('en-IN')} · ${formData.category}` });
    };

    const reset = () => { setStatus('idle'); setImageUrl(null); setModal(null); if (fileRef.current) fileRef.current.value = ''; };

    const isDragging = status === 'idle';

    return (
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                    Bill Scanner
                </h1>
                <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                    Scan a receipt to auto-extract expense details with offline OCR
                </p>
            </motion.div>

            {/* Drop zone */}
            <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                onDrop={e => { e.preventDefault(); processFile(e.dataTransfer.files[0]); }}
                onDragOver={e => e.preventDefault()}
                onClick={() => status === 'idle' && fileRef.current?.click()}
                className="glass-card"
                style={{
                    borderRadius: 24, minHeight: 240,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
                    cursor: status === 'idle' ? 'pointer' : 'default',
                    padding: '48px 24px',
                    borderStyle: 'dashed',
                    borderColor: status === 'scanning' ? 'var(--accent)' : 'var(--glass-border)',
                    transition: 'border-color 0.3s',
                    position: 'relative', overflow: 'hidden',
                }}
            >
                {/* Subtle gradient glow when scanning */}
                {status === 'scanning' && (
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                        style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(124,111,247,0.12) 0%, transparent 70%)', pointerEvents: 'none' }}
                    />
                )}

                {status === 'idle' && (
                    <>
                        <motion.div
                            whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}
                            style={{ width: 68, height: 68, borderRadius: 20, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ScanLine size={30} color="white" />
                        </motion.div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>
                                Drop a bill image here
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>or click to upload JPG, PNG, WEBP</div>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.96 }} onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', fontSize: 13 }}
                        >
                            <Upload size={14} /> Choose Image
                        </motion.button>
                    </>
                )}

                {status === 'scanning' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%', maxWidth: 300 }}>
                        <motion.div
                            animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                            style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid rgba(124,111,247,0.2)', borderTopColor: 'var(--accent)' }}
                        />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Scanning with OCR…</div>
                            <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{progress}% complete</div>
                        </div>
                        {/* Framer Motion progress bar */}
                        <div style={{ width: '100%', height: 4, borderRadius: 99, background: 'var(--glass-border)', overflow: 'hidden' }}>
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                                style={{ height: '100%', background: 'var(--grad-primary)', borderRadius: 99 }}
                            />
                        </div>
                    </div>
                )}

                {(status === 'done' || status === 'error') && imageUrl && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                        <img src={imageUrl} alt="Scanned" style={{ maxHeight: 120, objectFit: 'contain', borderRadius: 14 }} />
                        {status === 'error' && (
                            <p style={{ color: 'var(--accent-red)', fontSize: 13, margin: 0 }}>Could not read the image. Try a clearer photo.</p>
                        )}
                        <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 99, fontSize: 13, border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit' }}>
                            <X size={13} /> Scan Another
                        </button>
                    </div>
                )}
            </motion.div>

            <input ref={fileRef} type="file" accept="image/*" onChange={e => processFile(e.target.files?.[0])} style={{ display: 'none' }} />

            {/* Tips */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="glass-card" style={{ borderRadius: 20, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <ZapIcon size={15} color="var(--accent)" />
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Tips for best results</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                        'Use well-lit, flat photos with minimal shadows',
                        'Ensure the total amount and date are clearly visible',
                        'Printed receipts work better than handwritten bills',
                        'OCR runs 100% offline — no internet required',
                    ].map(t => (
                        <li key={t} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t}</li>
                    ))}
                </ul>
            </motion.div>

            <AnimatePresence>
                {modal && (
                    <ConfirmModal imageUrl={modal.imageUrl} ocrData={modal} onConfirm={handleConfirm} onCancel={() => { setModal(null); reset(); }} />
                )}
            </AnimatePresence>
        </div>
    );
};
