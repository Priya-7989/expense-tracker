import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { FileDown, Download, AlertCircle, BarChart2 } from 'lucide-react';
import { getAllExpenses } from '../db/database';
import { MONTHS, getCategoryIcon, formatCurrency } from '../utils/constants';

export const ExportPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        getAllExpenses().then(data => { setExpenses(data); setLoading(false); });
    }, []);

    const handleExport = async () => {
        if (!expenses.length) return;
        setExporting(true);
        try {
            const categoryMap = {};
            expenses.forEach(e => { categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount; });

            const summaryRows = Object.entries(categoryMap).map(([cat, amt]) => ({
                'Category': `${getCategoryIcon(cat)} ${cat}`, 'Total Amount (₹)': amt,
            }));
            summaryRows.push({ 'Category': 'TOTAL', 'Total Amount (₹)': expenses.reduce((s, e) => s + e.amount, 0) });

            const expenseRows = expenses.map(e => ({
                'Date': e.date, 'Particulars': e.particulars,
                'Category': `${getCategoryIcon(e.category)} ${e.category}`,
                'Amount (₹)': e.amount, 'Payment Method': e.paymentMethod,
            }));

            const monthlyMap = {};
            expenses.forEach(e => {
                const [year, month] = e.date.split('-');
                const key = `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
                monthlyMap[key] = (monthlyMap[key] || 0) + e.amount;
            });
            const monthlyRows = Object.entries(monthlyMap).sort().map(([period, amt]) => ({ Month: period, 'Total Amount (₹)': amt }));

            const wb = XLSX.utils.book_new();
            const ws1 = XLSX.utils.json_to_sheet(expenseRows);
            ws1['!cols'] = [{ wch: 12 }, { wch: 35 }, { wch: 16 }, { wch: 14 }, { wch: 18 }];
            XLSX.utils.book_append_sheet(wb, ws1, 'All Expenses');
            const ws2 = XLSX.utils.json_to_sheet(summaryRows);
            ws2['!cols'] = [{ wch: 20 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, ws2, 'Summary by Category');
            const ws3 = XLSX.utils.json_to_sheet(monthlyRows);
            ws3['!cols'] = [{ wch: 20 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, ws3, 'Monthly Summary');

            const fileName = `household-expenses-${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
            toast.success('Excel downloaded!', { icon: '📊', description: `${expenses.length} expenses exported` });
        } finally {
            setExporting(false);
        }
    };

    const grouped = {};
    expenses.forEach(e => {
        const [year, month] = e.date.split('-');
        const key = `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
        if (!grouped[key]) grouped[key] = { total: 0, count: 0 };
        grouped[key].total += e.amount;
        grouped[key].count += 1;
    });
    const sortedGroups = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
    const grandTotal = expenses.reduce((s, e) => s + e.amount, 0);

    return (
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                    Export Data
                </h1>
                <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                    Download all your expenses as a structured Excel spreadsheet
                </p>
            </motion.div>

            {/* Export card */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card" style={{ borderRadius: 24, padding: '28px 28px 24px' }}>

                {/* Icon + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
                    <motion.div
                        animate={exporting ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileDown size={24} color="white" />
                    </motion.div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>household-expenses.xlsx</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
                            {loading ? 'Loading…' : `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} · ${sortedGroups.length} month${sortedGroups.length !== 1 ? 's' : ''} · ${formatCurrency(grandTotal)} total`}
                        </div>
                    </div>
                </div>

                {/* What's included */}
                <div style={{ borderRadius: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--text-secondary)', marginBottom: 10 }}>
                        Sheets included
                    </div>
                    {[
                        ['📋', 'All Expenses', 'Full list with date, category, amount, payment method'],
                        ['📊', 'Summary by Category', 'Totals per category with grand total'],
                        ['📅', 'Monthly Summary', 'Month-by-month spend breakdown'],
                    ].map(([icon, title, desc]) => (
                        <div key={title} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                            <span style={{ fontSize: 15 }}>{icon}</span>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleExport}
                    disabled={exporting || !expenses.length}
                    className="btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, opacity: !expenses.length ? 0.4 : 1, cursor: !expenses.length ? 'not-allowed' : 'pointer' }}
                >
                    {exporting
                        ? <><div style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> Exporting…</>
                        : <><Download size={16} /> Export to Excel</>
                    }
                </motion.button>

                {!expenses.length && !loading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <AlertCircle size={13} /> Add some expenses first to enable export.
                    </div>
                )}
            </motion.div>

            {/* Monthly preview */}
            {sortedGroups.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                    className="glass-card" style={{ borderRadius: 20, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BarChart2 size={15} color="var(--accent)" />
                        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Preview</h2>
                    </div>
                    {sortedGroups.map(([period, { total, count }]) => (
                        <div key={period} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{period}</span>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>{count} entries</span>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(total)}</span>
                        </div>
                    ))}
                </motion.div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};
