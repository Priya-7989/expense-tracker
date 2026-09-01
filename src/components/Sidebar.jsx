import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, PlusCircle, ScanLine, FileDown, X, Menu, IndianRupee,
} from 'lucide-react';

const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add', label: 'Add Expense', icon: PlusCircle },
    { id: 'scanner', label: 'Bill Scanner', icon: ScanLine },
    { id: 'export', label: 'Export', icon: FileDown },
];

/* Bottom bar uses shorter labels + compact icons */
const BOTTOM_NAV = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'add', label: 'Add', icon: PlusCircle, accent: true },
    { id: 'scanner', label: 'Scan', icon: ScanLine },
    { id: 'export', label: 'Export', icon: FileDown },
];

export const Sidebar = ({ currentPage, onNavigate }) => {
    const [open, setOpen] = useState(false);

    /* Lock body scroll when mobile drawer is open */
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const handleNav = (id) => {
        onNavigate(id);
        setOpen(false);
    };

    /* ─── Shared nav list ─── */
    const NavItems = () => (
        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV.map(({ id, label, icon: Icon }) => {
                const active = currentPage === id;
                return (
                    <div key={id} style={{ position: 'relative' }}>
                        {active && (
                            <motion.div
                                layoutId="activeNav"
                                style={{
                                    position: 'absolute', inset: 0, borderRadius: 12,
                                    background: 'rgba(124,111,247,0.15)',
                                    border: '1px solid rgba(124,111,247,0.25)',
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <button
                            onClick={() => handleNav(id)}
                            style={{
                                position: 'relative', zIndex: 1,
                                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                padding: '11px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                background: 'transparent',
                                color: active ? '#a78bfa' : '#94a3b8',
                                fontSize: 14, fontWeight: active ? 600 : 500,
                                fontFamily: 'inherit',
                                transition: 'color 0.2s',
                            }}
                        >
                            <Icon size={17} />
                            {label}
                        </button>
                    </div>
                );
            })}
        </nav>
    );

    return (
        <>
            {/* ═══════════════════════════════════════════════
                Inline responsive styles
            ═══════════════════════════════════════════════ */}
            <style>{`
                .sidebar-desktop { display: block; }
                .mobile-hamburger { display: none !important; }
                .mobile-bottom-bar { display: none !important; }

                @media (max-width: 768px) {
                    .sidebar-desktop { display: none !important; }
                    .mobile-hamburger { display: flex !important; }
                    .mobile-bottom-bar { display: flex !important; }
                }
            `}</style>

            {/* ═══════════════════════════════════════════════
                DESKTOP sidebar (always visible ≥ 769px)
            ═══════════════════════════════════════════════ */}
            <aside
                className="sidebar-desktop"
                style={{
                    position: 'fixed', left: 0, top: 0, height: '100%', zIndex: 30,
                    width: 260,
                    background: '#0a0a18',
                    borderRight: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Logo */}
                    <div style={{ padding: '28px 20px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                            className="glow-pulse"
                            style={{
                                width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                                background: 'var(--grad-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <IndianRupee size={20} color="white" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px', color: '#f1f5f9' }}>
                                Expense
                            </div>
                            <div style={{ fontWeight: 600, fontSize: 12, color: '#7c6ff7', letterSpacing: '0.5px' }}>
                                TRACKER
                            </div>
                        </div>
                    </div>

                    <NavItems />

                    {/* Footer */}
                    <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ color: '#34d399', fontWeight: 600 }}>● 100% local</span>
                            <span>Your data never leaves this device</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ═══════════════════════════════════════════════
                MOBILE hamburger button  (≤ 768px)
            ═══════════════════════════════════════════════ */}
            <button
                onClick={() => setOpen(!open)}
                className="mobile-hamburger"
                style={{
                    position: 'fixed', top: 16, left: 16, zIndex: 60,
                    width: 42, height: 42, borderRadius: 12,
                    background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)',
                    cursor: 'pointer', color: '#f1f5f9',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
            >
                {open ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* ═══════════════════════════════════════════════
                MOBILE backdrop overlay (z-40)
            ═══════════════════════════════════════════════ */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setOpen(false)}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 40,
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)',
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════
                MOBILE slide-out drawer (z-50)
                Solid background – no transparency issues
            ═══════════════════════════════════════════════ */}
            <AnimatePresence>
                {open && (
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
                        style={{
                            position: 'fixed', left: 0, top: 0, height: '100%', zIndex: 50,
                            width: 280,
                            background: '#0f172a',
                            borderRight: '1px solid rgba(255,255,255,0.10)',
                            boxShadow: '4px 0 30px rgba(0,0,0,0.5)',
                            overflowY: 'auto',
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            {/* Logo (with close button integrated) */}
                            <div style={{
                                padding: '24px 20px 28px', display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                                        background: 'var(--grad-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <IndianRupee size={20} color="white" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px', color: '#f1f5f9' }}>
                                            Expense
                                        </div>
                                        <div style={{ fontWeight: 600, fontSize: 12, color: '#7c6ff7', letterSpacing: '0.5px' }}>
                                            TRACKER
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setOpen(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                                        borderRadius: 10, width: 34, height: 34, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#94a3b8', transition: 'background 0.15s',
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <NavItems />

                            {/* Footer */}
                            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <span style={{ color: '#34d399', fontWeight: 600 }}>● 100% local</span>
                                    <span>Your data never leaves this device</span>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════════════
                MOBILE bottom navigation bar
            ═══════════════════════════════════════════════ */}
            <nav
                className="mobile-bottom-bar"
                style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
                    height: 64,
                    background: 'rgba(15,23,42,0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    alignItems: 'center', justifyContent: 'space-around',
                    padding: '0 8px',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
                }}
            >
                {BOTTOM_NAV.map(({ id, label, icon: Icon, accent }) => {
                    const active = currentPage === id;
                    return (
                        <button
                            key={id}
                            onClick={() => handleNav(id)}
                            style={{
                                flex: 1,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                gap: 3, padding: '6px 0', border: 'none', cursor: 'pointer',
                                background: 'transparent', fontFamily: 'inherit',
                                color: active ? '#a78bfa' : '#64748b',
                                transition: 'color 0.2s, transform 0.15s',
                                position: 'relative',
                            }}
                        >
                            {/* Active accent dot */}
                            {active && (
                                <motion.div
                                    layoutId="bottomNav"
                                    style={{
                                        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                                        width: 20, height: 3, borderRadius: 99,
                                        background: 'var(--grad-primary)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                                />
                            )}

                            {/* Icon – the "Add" button has an accent ring */}
                            {accent ? (
                                <div style={{
                                    width: 38, height: 38, borderRadius: 12,
                                    background: active ? 'var(--grad-primary)' : 'rgba(124,111,247,0.15)',
                                    border: active ? 'none' : '1px solid rgba(124,111,247,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginTop: -8,
                                    boxShadow: active ? '0 4px 14px rgba(124,111,247,0.35)' : 'none',
                                    transition: 'all 0.2s',
                                }}>
                                    <Icon size={18} color={active ? '#fff' : '#a78bfa'} />
                                </div>
                            ) : (
                                <Icon size={19} />
                            )}

                            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '0.2px' }}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </>
    );
};
