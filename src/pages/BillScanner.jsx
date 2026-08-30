import { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { ScanLine, Upload, X, CheckCircle, Camera, FileText } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/constants';

const today = new Date().toISOString().split('T')[0];

const extractFromOCR = (text) => {
    // Try to extract amount
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

    // Try to extract date
    const datePatterns = [
        /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,
        /(\d{4})[\/\-](\d{2})[\/\-](\d{2})/,
        /(\d{1,2})\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i,
    ];
    let date = today;
    for (const pat of datePatterns) {
        const m = text.match(pat);
        if (m) {
            try {
                const d = new Date(m[0]);
                if (!isNaN(d)) { date = d.toISOString().split('T')[0]; break; }
            } catch (e) { /* ignore */ }
        }
    }

    return { amount, date };
};

const ConfirmModal = ({ imageUrl, ocrData, onConfirm, onCancel }) => {
    const [form, setForm] = useState({
        date: ocrData.date || today,
        particulars: ocrData.particulars || 'Scanned Bill',
        category: 'Misc',
        amount: ocrData.amount || '',
        paymentMethod: 'Cash',
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const inputStyle = {
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        borderRadius: '10px',
        padding: '10px 14px',
        width: '100%',
        fontSize: '14px',
        outline: 'none',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-lg rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                        <CheckCircle size={18} style={{ color: 'var(--accent-green)' }} />
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Confirm Scanned Data</span>
                    </div>
                    <button onClick={onCancel} className="p-1 rounded-lg hover:bg-white/5">
                        <X size={18} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {/* Image preview */}
                    {imageUrl && (
                        <img src={imageUrl} alt="Scanned bill" className="w-full max-h-40 object-contain rounded-xl"
                            style={{ border: '1px solid var(--border)' }} />
                    )}

                    {/* OCR raw text hint */}
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Review and adjust the extracted details before saving.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wide font-medium" style={{ color: 'var(--text-secondary)' }}>Date</label>
                            <input type="date" name="date" value={form.date} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wide font-medium" style={{ color: 'var(--text-secondary)' }}>Amount (₹)</label>
                            <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" style={inputStyle} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wide font-medium" style={{ color: 'var(--text-secondary)' }}>Description</label>
                        <input type="text" name="particulars" value={form.particulars} onChange={handleChange} style={inputStyle} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wide font-medium" style={{ color: 'var(--text-secondary)' }}>Category</label>
                            <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                                {CATEGORIES.map((c) => <option key={c.label} value={c.label}>{c.icon} {c.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wide font-medium" style={{ color: 'var(--text-secondary)' }}>Payment Method</label>
                            <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} style={inputStyle}>
                                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => onConfirm(form)}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold"
                            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', color: 'white' }}
                        >
                            Save Expense
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl text-sm font-medium"
                            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BillScanner = () => {
    const { addNewExpense } = useExpenses();
    const fileRef = useRef(null);
    const [status, setStatus] = useState('idle'); // idle | scanning | done | error
    const [progress, setProgress] = useState(0);
    const [imageUrl, setImageUrl] = useState(null);
    const [modal, setModal] = useState(null);
    const [savedMsg, setSavedMsg] = useState(false);
    const [rawText, setRawText] = useState('');

    const processFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        setStatus('scanning');
        setProgress(0);

        try {
            const worker = await createWorker('eng', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
                },
            });
            const { data } = await worker.recognize(file);
            await worker.terminate();
            const text = data.text;
            setRawText(text);
            const extracted = extractFromOCR(text);
            setModal({ ...extracted, imageUrl: url });
            setStatus('done');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleConfirm = async (formData) => {
        await addNewExpense(formData);
        setModal(null);
        setSavedMsg(true);
        setStatus('idle');
        setImageUrl(null);
        setRawText('');
        setTimeout(() => setSavedMsg(false), 3000);
    };

    const reset = () => {
        setStatus('idle');
        setImageUrl(null);
        setRawText('');
        setModal(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Bill Scanner</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Scan a bill or receipt to auto-extract expense details</p>
            </div>

            {savedMsg && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.3)', color: '#43e97b' }}>
                    <CheckCircle size={16} /> Expense saved successfully!
                </div>
            )}

            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => status === 'idle' && fileRef.current?.click()}
                className="rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer"
                style={{
                    border: '2px dashed var(--border)',
                    borderColor: status === 'scanning' ? 'var(--accent-primary)' : 'var(--border)',
                    background: 'var(--bg-card)',
                    padding: '48px 24px',
                    minHeight: '220px',
                }}
            >
                {status === 'idle' && (
                    <>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(240,147,251,0.1))' }}>
                            <ScanLine size={28} style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Drop a bill image here</p>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>or click to upload JPG, PNG, WEBP</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                                style={{ background: 'var(--accent-primary)', color: 'white' }}
                            >
                                <Upload size={14} /> Upload Image
                            </button>
                        </div>
                    </>
                )}

                {status === 'scanning' && (
                    <>
                        <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
                            style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
                        <div className="text-center">
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Scanning with OCR…</p>
                            <p className="text-sm mt-1" style={{ color: 'var(--accent-primary)' }}>{progress}%</p>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full max-w-xs rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--border)' }}>
                            <div className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} />
                        </div>
                    </>
                )}

                {(status === 'done' || status === 'error') && imageUrl && (
                    <div className="flex flex-col items-center gap-3">
                        <img src={imageUrl} alt="Scanned" className="max-h-32 object-contain rounded-xl" />
                        {status === 'error' && (
                            <p className="text-sm" style={{ color: '#fa7c58' }}>Failed to read the image. Try a clearer photo.</p>
                        )}
                        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            <X size={14} /> Scan Another
                        </button>
                    </div>
                )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            {/* Tips */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                    <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Tips for better results</span>
                </div>
                <ul className="text-xs space-y-1.5 list-disc list-inside" style={{ color: 'var(--text-secondary)' }}>
                    <li>Use well-lit, clear photos with minimal shadows</li>
                    <li>Ensure the total amount and date are clearly visible</li>
                    <li>Printed receipts work better than handwritten bills</li>
                    <li>OCR runs 100% offline using Tesseract.js — no internet needed</li>
                </ul>
            </div>

            {modal && (
                <ConfirmModal
                    imageUrl={modal.imageUrl}
                    ocrData={modal}
                    onConfirm={handleConfirm}
                    onCancel={() => { setModal(null); reset(); }}
                />
            )}
        </div>
    );
};
