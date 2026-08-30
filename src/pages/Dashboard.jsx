import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, Wallet, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CATEGORIES, MONTHS, getCategoryColor, getCategoryIcon, formatCurrency } from '../utils/constants';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div
        className="rounded-2xl p-5 flex flex-col gap-2"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={16} style={{ color }} />
            </div>
        </div>
        <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>{label}</p>
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(payload[0].value)}</p>
        </div>
    );
};

export const Dashboard = () => {
    const { expenses, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, fetchExpenses, loading } = useExpenses();
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        fetchExpenses(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth, fetchExpenses]);

    const filtered = activeCategory === 'All'
        ? expenses
        : expenses.filter((e) => e.category === activeCategory);

    const totalSpent = filtered.reduce((s, e) => s + e.amount, 0);
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dailyAvg = totalSpent / daysInMonth;

    const categoryTotals = CATEGORIES.map((cat) => ({
        name: cat.label,
        amount: expenses.filter((e) => e.category === cat.label).reduce((s, e) => s + e.amount, 0),
        color: cat.color,
        icon: cat.icon,
    })).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);

    const topCategory = categoryTotals[0];

    // Bar chart data by day
    const dailyMap = {};
    filtered.forEach((e) => {
        const day = parseInt(e.date.split('-')[2], 10);
        dailyMap[day] = (dailyMap[day] || 0) + e.amount;
    });
    const barData = Object.entries(dailyMap)
        .sort(([a], [b]) => a - b)
        .map(([day, amount]) => ({ day: `${day}`, amount }));

    const prevMonth = () => {
        if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(selectedYear - 1); }
        else setSelectedMonth(selectedMonth - 1);
    };
    const nextMonth = () => {
        if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1); }
        else setSelectedMonth(selectedMonth + 1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your spending overview</p>
                </div>
                {/* Month selector */}
                <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <button onClick={prevMonth} className="p-1 rounded-lg transition-colors hover:bg-white/5">
                        <ChevronLeft size={16} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                    <span className="text-sm font-semibold w-36 text-center" style={{ color: 'var(--text-primary)' }}>
                        {MONTHS[selectedMonth - 1]} {selectedYear}
                    </span>
                    <button onClick={nextMonth} className="p-1 rounded-lg transition-colors hover:bg-white/5">
                        <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
                    </button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Total Spent" value={formatCurrency(totalSpent)} icon={Wallet} color="#6c63ff" />
                <StatCard label="Daily Average" value={formatCurrency(dailyAvg)} icon={TrendingUp} color="#43e97b" />
                <StatCard
                    label="Top Category"
                    value={topCategory ? `${topCategory.icon} ${topCategory.name}` : '—'}
                    icon={Star}
                    color="#f093fb"
                />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
                {['All', ...CATEGORIES.map((c) => c.label)].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                        style={{
                            background: activeCategory === cat
                                ? (cat === 'All' ? 'var(--accent-primary)' : getCategoryColor(cat))
                                : 'var(--bg-card)',
                            color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                            border: `1px solid ${activeCategory === cat ? 'transparent' : 'var(--border)'}`,
                        }}
                    >
                        {cat !== 'All' && getCategoryIcon(cat)} {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Bar chart */}
                    <div className="lg:col-span-2 rounded-2xl p-5"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Daily Spending</h2>
                        {barData.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                No expenses this month
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={barData} barSize={10}>
                                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                    <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="url(#barGrad)" />
                                    <defs>
                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6c63ff" />
                                            <stop offset="100%" stopColor="#f093fb" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Pie chart */}
                    <div className="rounded-2xl p-5"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>By Category</h2>
                        {categoryTotals.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                No data
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={categoryTotals} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                                        {categoryTotals.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                                    <Legend formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{val}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            )}

            {/* Recent expenses table */}
            {filtered.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Expenses</h2>
                    </div>
                    <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        {[...filtered].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map((e) => (
                            <div key={e.id} className="flex items-center gap-4 px-5 py-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                                    style={{ background: `${getCategoryColor(e.category)}20` }}>
                                    {getCategoryIcon(e.category)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{e.particulars}</div>
                                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{e.date} · {e.paymentMethod}</div>
                                </div>
                                <div className="text-sm font-semibold" style={{ color: getCategoryColor(e.category) }}>
                                    {formatCurrency(e.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
