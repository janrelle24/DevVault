import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Home from './pages/Home';
import DocPage from './pages/DocPage';
import { CategoriesList, CategoryDetail } from './pages/Categories';
import Tags from './pages/Tags';
import Bookmarks from './pages/Bookmarks';
import Recent from './pages/Recent';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NewDocument from './pages/NewDocument';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

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
            <Route path="/docs/:slug" element={<DocPage />} />
            <Route path="/categories" element={<CategoriesList />} />
            <Route path="/categories/:slug" element={<CategoryDetail />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/recent" element={<Recent />} />
            <Route
              path="/new"
              element={
                <ProtectedRoute adminOnly>
                  <NewDocument />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="*"
              element={
                <div className="p-10 text-center text-vault-muted">
                  <p className="text-lg font-semibold text-white mb-1">Page not found</p>
                  <p className="text-sm">The document or page you're looking for doesn't exist.</p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
