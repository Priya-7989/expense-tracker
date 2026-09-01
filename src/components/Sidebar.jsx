import { useState } from 'react';
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

export const Sidebar = ({ currentPage, onNavigate }) => {
    const [open, setOpen] = useState(false);

    const SidebarContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo */}
            <div style={{ padding: '28px 20px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                    className="glow-pulse"
                    style={{
                        width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                        background: 'var(--grad-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 0 0 rgba(124,111,247,0.4)',
                    }}
                >
                    <IndianRupee size={20} color="white" />
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                        Expense
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--accent)', letterSpacing: '0.5px' }}>
                        TRACKER
                    </div>
                </div>
            </div>

            {/* Nav */}
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
                                onClick={() => { onNavigate(id); setOpen(false); }}
                                style={{
                                    position: 'relative', zIndex: 1,
                                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '11px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                    background: 'transparent',
                                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
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

            {/* Footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <div style={{
                    fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>● 100% local</span>
                    <span>Your data never leaves this device</span>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setOpen(!open)}
                style={{
                    display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 60,
                    width: 40, height: 40, borderRadius: 12,
                    background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
                    cursor: 'pointer', color: 'var(--text-primary)',
                    alignItems: 'center', justifyContent: 'center',
                }}
                className="mobile-toggle"
            >
                {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <style>{`@media(max-width:768px){.mobile-toggle{display:flex!important}}`}</style>

            {/* Mobile overlay */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar panel */}
            <aside
                className="mobile-sidebar"
                style={{
                    position: 'fixed', left: 0, top: 0, height: '100%', zIndex: 50,
                    width: 260,
                    background: 'rgba(12,12,22,0.85)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRight: '1px solid var(--glass-border)',
                }}
            >
                <style>{`
          @media(max-width:768px){
            .mobile-sidebar { transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.22,1,0.36,1); }
            .mobile-sidebar.open { transform: translateX(0); }
          }
          @media(min-width:769px){ .mobile-sidebar { transform: translateX(0) !important; } }
        `}</style>
                <div className={`mobile-sidebar ${open ? 'open' : ''}`} style={{ height: '100%' }}>
                    <SidebarContent />
                </div>
            </aside>
        </>
    );
};
