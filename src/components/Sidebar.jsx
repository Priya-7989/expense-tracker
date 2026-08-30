import { useState } from 'react';
import {
    LayoutDashboard, PlusCircle, ScanLine, FileDown, X, Menu, IndianRupee,
} from 'lucide-react';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add', label: 'Add Expense', icon: PlusCircle },
    { id: 'scanner', label: 'Bill Scanner', icon: ScanLine },
    { id: 'export', label: 'Export', icon: FileDown },
];

export const Sidebar = ({ currentPage, onNavigate }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                onClick={() => setOpen(!open)}
            >
                {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 md:hidden"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
                style={{
                    width: '240px',
                    background: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border)',
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 p-6 pb-8">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                        <IndianRupee size={20} color="white" />
                    </div>
                    <div>
                        <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Expense</div>
                        <div className="font-bold text-sm" style={{ color: 'var(--accent-primary)' }}>Tracker</div>
                    </div>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 space-y-1">
                    {navItems.map(({ id, label, icon: Icon }) => {
                        const active = currentPage === id;
                        return (
                            <button
                                key={id}
                                onClick={() => { onNavigate(id); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                                style={{
                                    background: active
                                        ? 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(240,147,251,0.1))'
                                        : 'transparent',
                                    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    border: active ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
                                }}
                            >
                                <Icon size={18} />
                                {label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                    100% local · Data stays on your device
                </div>
            </aside>
        </>
    );
};
