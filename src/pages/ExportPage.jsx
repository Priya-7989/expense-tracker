import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { FileDown, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { getAllExpenses } from '../db/database';
import { MONTHS, getCategoryIcon, formatCurrency } from '../utils/constants';

export const ExportPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        setLoading(true);
        getAllExpenses().then((data) => {
            setExpenses(data);
            setLoading(false);
        });
    }, []);

    const handleExport = async () => {
        if (expenses.length === 0) return;
        setExporting(true);
        try {
            // Summary sheet
            const categoryMap = {};
            expenses.forEach((e) => {
                categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
            });

            const summaryData = Object.entries(categoryMap).map(([cat, amt]) => ({
                Category: `${getCategoryIcon(cat)} ${cat}`,
                'Total Amount (₹)': amt,
            }));

            const totalRow = { Category: 'TOTAL', 'Total Amount (₹)': expenses.reduce((s, e) => s + e.amount, 0) };

            // Expense rows
            const expenseRows = expenses.map((e) => ({
                'Date': e.date,
                'Particulars': e.particulars,
                'Category': `${getCategoryIcon(e.category)} ${e.category}`,
                'Amount (₹)': e.amount,
                'Payment Method': e.paymentMethod,
            }));

            const wb = XLSX.utils.book_new();

            // All Expenses sheet
            const ws1 = XLSX.utils.json_to_sheet(expenseRows);
            ws1['!cols'] = [{ wch: 12 }, { wch: 35 }, { wch: 16 }, { wch: 14 }, { wch: 18 }];
            XLSX.utils.book_append_sheet(wb, ws1, 'All Expenses');

            // Summary sheet
            const ws2 = XLSX.utils.json_to_sheet([...summaryData, totalRow]);
            ws2['!cols'] = [{ wch: 20 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, ws2, 'Summary by Category');

            // Monthly breakdown
            const monthlyMap = {};
            expenses.forEach((e) => {
                const [year, month] = e.date.split('-');
                const key = `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
                monthlyMap[key] = (monthlyMap[key] || 0) + e.amount;
            });
            const monthlyRows = Object.entries(monthlyMap)
                .sort()
                .map(([period, amt]) => ({ Month: period, 'Total Amount (₹)': amt }));
            const ws3 = XLSX.utils.json_to_sheet(monthlyRows);
            ws3['!cols'] = [{ wch: 20 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, ws3, 'Monthly Summary');

            const now = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `household-expenses-${now}.xlsx`);
            setDone(true);
            setTimeout(() => setDone(false), 3000);
        } finally {
            setExporting(false);
        }
    };

    // Group expenses by month for preview
    const grouped = {};
    expenses.forEach((e) => {
        const [year, month] = e.date.split('-');
        const key = `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
        if (!grouped[key]) grouped[key] = { total: 0, count: 0 };
        grouped[key].total += e.amount;
        grouped[key].count += 1;
    });
    const sortedGroups = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Export to Excel</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Download all expenses as a structured .xlsx file</p>
            </div>

            {/* Export card */}
            <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(240,147,251,0.1))' }}>
                        <FileDown size={24} style={{ color: 'var(--accent-primary)' }} />
                    </div>
                    <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>household-expenses.xlsx</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {expenses.length} expense{expenses.length !== 1 ? 's' : ''} across {sortedGroups.length} month{sortedGroups.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <div className="rounded-xl p-4 space-y-1.5" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>
                        What's included:
                    </p>
                    {['📋  All Expenses — full list with date, description, category, amount, payment method',
                        '📊  Summary by Category — totals per category',
                        '📅  Monthly Summary — month-by-month spend overview'].map((item) => (
                            <p key={item} className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item}</p>
                        ))}
                </div>

                <button
                    onClick={handleExport}
                    disabled={exporting || expenses.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{
                        background: done
                            ? 'linear-gradient(135deg, #43e97b, #38f9d7)'
                            : expenses.length === 0
                                ? 'var(--border)'
                                : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        color: expenses.length === 0 ? 'var(--text-secondary)' : 'white',
                        cursor: expenses.length === 0 ? 'not-allowed' : 'pointer',
                    }}
                >
                    {done ? <><CheckCircle size={16} /> Downloaded!</>
                        : exporting ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Exporting…</>
                            : <><Download size={16} /> Export to Excel</>}
                </button>

                {expenses.length === 0 && !loading && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <AlertCircle size={14} />
                        Add some expenses first before exporting.
                    </div>
                )}
            </div>

            {/* Monthly breakdown preview */}
            {sortedGroups.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Monthly Preview</h2>
                    </div>
                    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {sortedGroups.map(([period, { total, count }]) => (
                            <div key={period} className="flex items-center justify-between px-5 py-3">
                                <div>
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{period}</span>
                                    <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>{count} entries</span>
                                </div>
                                <span className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>
                                    {formatCurrency(total)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
