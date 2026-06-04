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
import Farmacia from './pages/Farmacia';
import FarmaciaPacienteDetalle from './pages/FarmaciaPacienteDetalle';
import Importar from './pages/Importar';
import Historial from './pages/Historial';
import ReporteProfesionales from './pages/ReporteProfesionales';
import Documentos from './pages/Documentos';
import AjustesLayout from './pages/ajustes/AjustesLayout';
import AjustesPaquetes from './pages/ajustes/AjustesPaquetes';
import AjustesPaqueteEditor from './pages/ajustes/AjustesPaqueteEditor';
import AjustesPaqueteDetalle from './pages/ajustes/AjustesPaqueteDetalle';
import AjustesProfesiones from './pages/ajustes/AjustesProfesiones';
import AjustesPersonal from './pages/ajustes/AjustesPersonal';
import AjustesUsuarios from './pages/ajustes/AjustesUsuarios';
import AjustesAuditoria from './pages/ajustes/AjustesAuditoria';
import Login from './pages/Login';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import EmergencySupport from './pages/EmergencySupport';
import JobOpportunities from './pages/JobOpportunities';

function MainLayout() {
  // En desktop arranca abierto; en móvil/tablet cerrado para no tapar el contenido.
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  return (
    <div className="flex min-h-screen bg-surface overflow-x-hidden font-inter">
      {/* Sidebar fijo a la izquierda (retráctil) */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Backdrop oscuro detrás del sidebar (solo móvil/tablet) */}
      {isSidebarOpen && (
        <button
          aria-label="Cerrar menú"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Área de contenido desplazada a la derecha del sidebar cuando está abierto */}
      <div className={`flex flex-1 flex-col min-w-0 w-full transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64 ml-0' : 'ml-0'}`}>

        {/* Barra superior con estilo glassmorphism */}
        <div className="h-16 flex items-center px-4 sm:px-6 shrink-0 bg-surface-bright/80 backdrop-blur-sm border-b border-outline-variant/20 shadow-sm sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-surface-bright border border-outline-variant/30 rounded-lg shadow-sm hover:bg-primary/5 text-primary transition-all duration-200 hover:shadow-md"
            title="Alternar menú lateral"
          >
            <Menu size={20} />
          </button>
        </div>

        <main className="flex-1 p-3 sm:p-6 pt-3 sm:pt-4 w-full min-w-0 max-w-full overflow-x-hidden">
          <Routes>
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/paquetes"      element={<Paquetes />} />
            <Route path="/paquetes/:id"  element={<PaqueteDetalle />} />
            <Route path="/pacientes"     element={<Pacientes />} />
            <Route path="/farmacia"             element={<Farmacia />} />
            <Route path="/farmacia/:idPaciente" element={<FarmaciaPacienteDetalle />} />
            <Route path="/importar"      element={<Importar />} />
            <Route path="/historial"     element={<Historial />} />
            <Route path="/reportes/profesionales" element={<ReporteProfesionales />} />
            <Route path="/documentos"  element={<Documentos />} />
            <Route path="/ajustes" element={<AjustesLayout />}>
              <Route index element={<AjustesPaquetes />} />
              <Route path="paquetes" element={<AjustesPaquetes />} />
              <Route path="paquetes/nuevo" element={<AjustesPaqueteEditor modo="crear" />} />
              <Route path="paquetes/:id" element={<AjustesPaqueteDetalle />} />
              <Route path="paquetes/:id/editar" element={<AjustesPaqueteEditor modo="editar" />} />
              <Route path="profesiones" element={<AjustesProfesiones />} />
              <Route path="personal" element={<AjustesPersonal />} />
              <Route path="usuarios" element={<AjustesUsuarios />} />
              <Route path="auditoria" element={<AjustesAuditoria />} />
            </Route>
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
          <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
          <Route path="/terminos-servicio" element={<TermsOfService />} />
          <Route path="/soporte-emergencia" element={<EmergencySupport />} />
          <Route path="/oportunidades-laborales" element={<JobOpportunities />} />
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
