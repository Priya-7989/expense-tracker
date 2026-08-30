import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ExpenseEntry } from './pages/ExpenseEntry';
import { BillScanner } from './pages/BillScanner';
import { ExportPage } from './pages/ExportPage';
import { ExpenseProvider } from './context/ExpenseContext';

function App() {
  const [page, setPage] = useState('dashboard');

  const pages = {
    dashboard: <Dashboard />,
    add: <ExpenseEntry />,
    scanner: <BillScanner />,
    export: <ExportPage />,
  };

  return (
    <ExpenseProvider>
      <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Sidebar currentPage={page} onNavigate={setPage} />

        {/* Main content */}
        <main
          className="flex-1 transition-all duration-300"
          style={{
            marginLeft: '240px',
            padding: '32px 24px',
          }}
        >
          {/* On mobile, margin is 0 */}
          <style>{`@media (max-width: 768px) { main { margin-left: 0 !important; padding-top: 72px !important; } }`}</style>
          <div className="max-w-5xl mx-auto">
            {pages[page]}
          </div>
        </main>
      </div>
    </ExpenseProvider>
  );
}

export default App;
