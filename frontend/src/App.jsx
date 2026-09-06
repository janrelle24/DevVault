import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Home from './pages/Home';
import { CategoriesList, CategoryDetail } from './pages/Categories';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DocPage from './pages/DocPage';
//import { CategoriesList, CategoryDetail } from './pages/Categories';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  function handleSidebarNav(path) {
    if (path) navigate(path);
    setSidebarOpen(false);
  }
  return (
    <div className="flex min-h-screen bg-vault-bg">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar open={sidebarOpen} onNavigate={handleSidebarNav} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 min-w-0">
          <Routes>
              
              <Route path="/" element={<Home />} />
              <Route path="/docs/slug" element={<DocPage />} />
              <Route path="/categories" element={<CategoriesList />} />
              <Route path="/categories/:slug" element={<CategoryDetail />} />
              <Route path="/dashboard" element={<Dashboard />}/>
              <Route path="/login" element={<Login />}/>
              <Route path="/signup" element={<Signup />}/>
              <Route></Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}


