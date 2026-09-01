import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, Wallet, Star, ChevronLeft, ChevronRight, ArrowUpRight, ScanLine, ReceiptText, TrendingDown } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CATEGORIES, MONTHS, getCategoryColor, getCategoryIcon, formatCurrency } from '../utils/constants';
import { BentoGrid } from '../components/BentoGrid';

/* ─── Animated counter hook ─── */
function useCountUp(target, duration = 800) {
    const [value, setValue] = useState(0);
    const rafRef = useRef(null);
    useEffect(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const startTime = performance.now();
        const startVal = 0;
        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out-cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(startVal + (target - startVal) * eased);
            if (progress < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]);
    return value;
}

/* ─── Animated currency display ─── */
const AnimatedAmount = ({ amount }) => {
    const count = useCountUp(amount);
    return <>{formatCurrency(count)}</>;
};

/* (StatCard removed — replaced by BentoGrid below) */

/* ─── Custom bar tooltip ─── */
const BarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card" style={{ borderRadius: 12, padding: '10px 14px', fontSize: 13 }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>Day {label}</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{formatCurrency(payload[0].value)}</div>
        </div>
    );
};

/* ─── Donut centre overlay (rendered outside recharts to avoid cx/cy issues) ─── */
const DonutCenter = ({ total }) => (
    <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
    }}>
        <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{formatCurrency(total)}</span>
    </div>
);

/* ─── Transaction row ─── */
const TxRow = ({ e, index }) => (
    <motion.div
        key={e.id}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 16 }}
        transition={{ duration: 0.28, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card-hover"
        style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '13px 18px', borderBottom: '1px solid var(--border)',
            transition: 'background 0.2s',
        }}
    >
        <div style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
            background: `${getCategoryColor(e.category)}18`,
            border: `1px solid ${getCategoryColor(e.category)}30`,
        }}>
            {getCategoryIcon(e.category)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {e.particulars}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                {e.date} · {e.category} · {e.paymentMethod}
            </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: getCategoryColor(e.category) }}>
                {formatCurrency(e.amount)}
            </div>
        </div>
    </motion.div>
);

/* ─── Main Dashboard ─── */
export const Dashboard = ({ onNavigate }) => {
    const { expenses, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, fetchExpenses, loading } = useExpenses();
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        fetchExpenses(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth, fetchExpenses]);

    const filtered = activeCategory === 'All' ? expenses : expenses.filter(e => e.category === activeCategory);

    const totalSpent = filtered.reduce((s, e) => s + e.amount, 0);
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dailyAvg = totalSpent / daysInMonth;

    const categoryTotals = CATEGORIES.map(cat => ({
        name: cat.label,
        amount: expenses.filter(e => e.category === cat.label).reduce((s, e) => s + e.amount, 0),
        color: cat.color,
        icon: cat.icon,
    })).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

    const topCategory = categoryTotals[0];

    const dailyMap = {};
    filtered.forEach(e => {
        const day = parseInt(e.date.split('-')[2], 10);
        dailyMap[day] = (dailyMap[day] || 0) + e.amount;
    });
    const barData = Object.entries(dailyMap).sort(([a], [b]) => +a - +b).map(([day, amount]) => ({ day, amount }));

    const prevMonth = () => {
        if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(y => y - 1); }
        else setSelectedMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(y => y + 1); }
        else setSelectedMonth(m => m + 1);
    };

    const sortedFiltered = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                        Dashboard
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                        Your spending at a glance
                    </p>
                </div>

                {/* Month selector */}
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 4, borderRadius: 14, padding: '8px 12px' }}>
                    <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px 6px', borderRadius: 8, display: 'flex', transition: 'color 0.2s' }}>
                        <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', width: 140, textAlign: 'center' }}>
                        {MONTHS[selectedMonth - 1]} {selectedYear}
                    </span>
                    <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px 6px', borderRadius: 8, display: 'flex', transition: 'color 0.2s' }}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* ── Bento Grid Stats ── */}
            <BentoGrid items={[
                {
                    title: 'Total Spending',
                    meta: MONTHS[selectedMonth - 1],
                    icon: <Wallet size={18} className="text-[var(--accent)]" />,
                    status: expenses.length > 0
                        ? `${expenses.length} txn${expenses.length !== 1 ? 's' : ''}`
                        : 'No data',
                    description: (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                                    <AnimatedAmount amount={totalSpent} />
                                </span>
                                {dailyAvg > 0 && (
                                    <span style={{ fontSize: 12, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <TrendingUp size={12} />
                                        {formatCurrency(dailyAvg)}/day
                                    </span>
                                )}
                            </div>
                            {categoryTotals.length > 0 && (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {categoryTotals.slice(0, 4).map(c => (
                                        <span key={c.name} style={{
                                            fontSize: 11, padding: '3px 8px', borderRadius: 6,
                                            background: `${c.color}15`, border: `1px solid ${c.color}25`,
                                            color: c.color, fontWeight: 600,
                                        }}>
                                            {c.icon} {formatCurrency(c.amount)}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ),
                    colSpan: 2,
                    hasPersistentHover: true,
                    tags: ['monthly', 'overview'],
                },
                {
                    title: 'Top Category',
                    icon: topCategory
                        ? <span style={{ fontSize: 18 }}>{topCategory.icon}</span>
                        : <Star size={18} className="text-[var(--accent-orange)]" />,
                    status: topCategory ? formatCurrency(topCategory.amount) : '—',
                    statusColor: topCategory?.color,
                    description: topCategory ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontSize: 20, fontWeight: 800, color: topCategory.color }}>
                                {topCategory.name}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                {((topCategory.amount / (totalSpent || 1)) * 100).toFixed(1)}% of total spending
                            </span>
                        </div>
                    ) : 'No expenses recorded yet',
                    tags: ['highest'],
                    cta: 'View breakdown →',
                },
                {
                    title: 'Receipt Scanner',
                    icon: <ScanLine size={18} className="text-[var(--accent-2)]" />,
                    status: 'Quick Add',
                    description: (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '8px 0' }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: 'linear-gradient(135deg, rgba(232,121,249,0.12), rgba(124,111,247,0.12))',
                                border: '1.5px dashed rgba(232,121,249,0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <ReceiptText size={22} style={{ color: 'var(--accent-2)' }} />
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
                                Snap a bill to auto-extract expenses
                            </span>
                        </div>
                    ),
                    cta: 'Open Scanner →',
                    onClick: () => onNavigate?.('scanner'),
                    tags: ['OCR'],
                },
                {
                    title: 'Recent Activity',
                    icon: <ReceiptText size={18} className="text-[var(--accent-green)]" />,
                    status: `${daysInMonth} days`,
                    description: (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Daily Average
                                </span>
                                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-green)' }}>
                                    <AnimatedAmount amount={dailyAvg} />
                                </span>
                            </div>
                            {sortedFiltered.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {sortedFiltered.slice(0, 3).map(e => (
                                        <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                                            <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                                                {getCategoryIcon(e.category)} {e.particulars}
                                            </span>
                                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
                                                {formatCurrency(e.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                    No recent transactions
                                </span>
                            )}
                        </div>
                    ),
                    tags: ['summary'],
                    cta: `${sortedFiltered.length} total →`,
                },
            ]} />

            {/* ── Category filters ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['All', ...CATEGORIES.map(c => c.label)].map(cat => {
                    const active = activeCategory === cat;
                    const color = cat === 'All' ? 'var(--accent)' : getCategoryColor(cat);
                    return (
                        <motion.button
                            key={cat}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: '7px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                                border: `1px solid ${active ? 'transparent' : 'var(--glass-border)'}`,
                                background: active ? color : 'var(--glass)',
                                color: active ? '#fff' : 'var(--text-secondary)',
                                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                            }}
                        >
                            {cat !== 'All' && getCategoryIcon(cat)}{cat !== 'All' ? ' ' : ''}{cat}
                        </motion.button>
                    );
                })}
            </div>

            {/* ── Charts ── */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="shimmer" style={{ borderRadius: 20, height: 280 }} />
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                    {/* Bar chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="glass-card"
                        style={{ borderRadius: 20, padding: '22px 22px 14px', gridColumn: barData.length > 0 ? '1' : '1' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Daily Spending</h2>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '3px 10px', borderRadius: 99, fontWeight: 500 }}>
                                {MONTHS[selectedMonth - 1]}
                            </span>
                        </div>
                        {barData.length === 0 ? (
                            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
                                No expenses this month
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={barData} barSize={8} margin={{ left: -10, right: 4 }}>
                                    <defs>
                                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#7c6ff7" />
                                            <stop offset="100%" stopColor="#e879f9" stopOpacity={0.4} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 6 }} />
                                    <Bar dataKey="amount" fill="url(#barGrad)" radius={[6, 6, 2, 2]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </motion.div>

                    {/* Donut chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.4 }}
                        className="glass-card"
                        style={{ borderRadius: 20, padding: '22px' }}
                    >
                        <h2 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>By Category</h2>
                        {categoryTotals.length === 0 ? (
                            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
                                No data yet
                            </div>
                        ) : (
                            <>
                                <div style={{ position: 'relative' }}>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <PieChart>
                                            <defs>
                                                {categoryTotals.map(c => (
                                                    <filter key={c.name} id={`glow-${c.name}`}>
                                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                                    </filter>
                                                ))}
                                            </defs>
                                            <Pie
                                                data={categoryTotals} dataKey="amount" nameKey="name"
                                                cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                                                paddingAngle={3} strokeWidth={0}
                                            >
                                                {categoryTotals.map(entry => (
                                                    <Cell key={entry.name} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={v => [formatCurrency(v), '']}
                                                contentStyle={{
                                                    background: 'rgba(12,12,22,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: 12, color: 'var(--text-primary)', fontSize: 13,
                                                    backdropFilter: 'blur(12px)',
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <DonutCenter total={expenses.reduce((s, e) => s + e.amount, 0)} />
                                </div>
                                {/* Legend */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                                    {categoryTotals.slice(0, 4).map(c => (
                                        <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: 99, background: c.color, flexShrink: 0 }} />
                                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{c.icon} {c.name}</span>
                                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(c.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}

            {/* ── Transaction list ── */}
            {sortedFiltered.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.4 }}
                    className="glass-card"
                    style={{ borderRadius: 20, overflow: 'hidden' }}
                >
                    <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                            Recent Transactions
                        </h2>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {sortedFiltered.length} entries
                        </span>
                    </div>
                    <AnimatePresence>
                        {sortedFiltered.slice(0, 12).map((e, i) => (
                            <TxRow key={e.id} e={e} index={i} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {!loading && filtered.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="glass-card"
                    style={{ borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}
                >
                    <div style={{ fontSize: 40, marginBottom: 12 }}>💸</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>No expenses yet</div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Add your first expense to see your breakdown here.</div>
                </motion.div>
            )}
        </div>
    );
};
