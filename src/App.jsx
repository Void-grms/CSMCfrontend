import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Paquetes from './pages/Paquetes';
import PaqueteDetalle from './pages/PaqueteDetalle';
import Pacientes from './pages/Pacientes';
import Importar from './pages/Importar';
import Historial from './pages/Historial';
import ReporteProfesionales from './pages/ReporteProfesionales';
import Documentos from './pages/Documentos';
import Login from './pages/Login';
import Home from './pages/Home';

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-surface overflow-x-hidden font-inter">
      {/* Sidebar fijo a la izquierda (retráctil) */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Área de contenido desplazada a la derecha del sidebar cuando está abierto */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64 ml-0' : 'ml-0'}`}>
        
        {/* Barra superior con estilo glassmorphism */}
        <div className="h-16 flex items-center px-6 shrink-0 bg-surface-bright/80 backdrop-blur-sm border-b border-outline-variant/20 shadow-sm sticky top-0 z-40">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-surface-bright border border-outline-variant/30 rounded-lg shadow-sm hover:bg-primary/5 text-primary transition-all duration-200 hover:shadow-md"
            title="Alternar menú lateral"
          >
            <Menu size={20} />
          </button>
        </div>

        <main className="flex-1 p-6 pt-4">
          <Routes>
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/paquetes"      element={<Paquetes />} />
            <Route path="/paquetes/:id"  element={<PaqueteDetalle />} />
            <Route path="/pacientes"     element={<Pacientes />} />
            <Route path="/importar"      element={<Importar />} />
            <Route path="/historial"     element={<Historial />} />
            <Route path="/reportes/profesionales" element={<ReporteProfesionales />} />
            <Route path="/documentos"  element={<Documentos />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/** Componente raíz */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
