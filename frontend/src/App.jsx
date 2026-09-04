import { Routes, Route, Navigate } from 'react-router-dom';
//import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {

  return (
    <div className="flex min-h-screen bg-vault-bg">
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 min-w-0">
          <Routes>
              
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />}/>
              <Route path="/signup" element={<Signup />}/>
          </Routes>
        </main>
      </div>
    </div>
  );
}


