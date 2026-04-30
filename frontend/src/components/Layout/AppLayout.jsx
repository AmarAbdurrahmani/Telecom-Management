import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#ede9f7] p-3 lg:p-4">
      <div className="flex h-[calc(100vh-24px)] lg:h-[calc(100vh-32px)] rounded-[24px] overflow-hidden shadow-[0_8px_40px_rgba(120,90,200,0.12)]">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#f8f7fc]">
          <Navbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-hide">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
