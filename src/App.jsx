import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ExpenseEntry } from './pages/ExpenseEntry';
import { BillScanner } from './pages/BillScanner';
import { ExportPage } from './pages/ExportPage';
import { ExpenseProvider } from './context/ExpenseContext';

const pages = {
  dashboard: Dashboard,
  add: ExpenseEntry,
  scanner: BillScanner,
  export: ExportPage,
};

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

function App() {
  const [page, setPage] = useState('dashboard');
  const PageComponent = pages[page];

  return (
    <ExpenseProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#12121f',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f1f5f9',
            borderRadius: '14px',
            fontSize: '13px',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        }}
      />

      <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <Sidebar currentPage={page} onNavigate={setPage} />

        <main
          style={{
            marginLeft: '260px',
            padding: '36px 28px',
            flex: 1,
            minWidth: 0,
          }}
        >
          <style>{`
            @media (max-width: 768px) {
              main { margin-left: 0 !important; padding: 80px 16px 24px !important; }
            }
          `}</style>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <PageComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </ExpenseProvider>
  );
}

export default App;
