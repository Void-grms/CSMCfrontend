import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, AlertTriangle, Hospital, Clock } from 'lucide-react';
import logoRenacer from '../assets/LogoRenacer.png';

export default function EmergencySupport() {
    return (
        <div className="bg-surface font-inter text-on-surface min-h-screen flex flex-col">
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
                <nav className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
                    <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
                        <img src={logoRenacer} alt="Logo Renacer" className="h-8 w-8 object-contain" />
                        CSMC RENACER
                    </Link>
                    <Link to="/" className="text-primary hover:text-primary-fixed-dim font-medium flex items-center gap-2 transition-colors">
                        <ArrowLeft size={18} />
                        Volver al inicio
                    </Link>
                </nav>
            </header>

            <main className="pt-32 pb-20 flex-1 max-w-4xl mx-auto px-6 w-full">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center">
                        <AlertTriangle className="text-error w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-home-h1 text-error">Soporte de Emergencia</h1>
                        <p className="text-outline mt-2">Atención prioritaria para crisis de salud mental</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 mb-10">
                    <div className="bg-error p-8 rounded-3xl shadow-lg text-on-error relative overflow-hidden flex flex-col justify-center">
                        <Phone className="absolute -bottom-4 -right-4 w-40 h-40 opacity-10" />
                        <h2 className="text-home-h2 mb-2 relative z-10">Línea de Ayuda</h2>
                        <p className="opacity-90 mb-6 relative z-10">Disponible en horario laboral para urgencias psiquiátricas y contención emocional.</p>
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl flex items-center gap-4 relative z-10">
                            <Phone className="w-8 h-8" />
                            <span className="text-3xl font-bold tracking-wider">987 473 937</span>
                        </div>
                    </div>

                    <div className="glass-card p-8 rounded-3xl border border-white/50 shadow-lg bg-white/60 flex flex-col justify-center space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                <Hospital className="text-primary w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-home-h3 text-primary mb-1">Acércate al Centro</h3>
                                <p className="text-outline">Calle Cáceres N° 605 – 613<br/>Otuzco, La Libertad</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                                <Clock className="text-secondary w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-home-h3 text-primary mb-1">Horario de Atención</h3>
                                <p className="text-outline">Lun - Vie: 7:30 AM - 7:30 PM<br/>Sábados: 7:30 AM - 1:30 PM</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-3xl border border-white/50 shadow-xl space-y-6 bg-white/60">
                    <h2 className="text-home-h2 text-primary">¿Qué hacer en caso de crisis?</h2>
                    
                    <div className="space-y-4">
                        <div className="border-l-4 border-error pl-4">
                            <h4 className="text-home-h3 text-error">1. Mantén la calma</h4>
                            <p className="text-outline">Asegúrate de que la persona en crisis se encuentre en un entorno seguro, libre de objetos peligrosos o situaciones de riesgo inminente.</p>
                        </div>
                        
                        <div className="border-l-4 border-primary pl-4">
                            <h4 className="text-home-h3 text-primary">2. Llama a la línea de emergencia</h4>
                            <p className="text-outline">Si notas ideación suicida activa, agitación psicomotriz severa, o episodios psicóticos graves, comunícate de inmediato al <strong>987 473 937</strong>.</p>
                        </div>

                        <div className="border-l-4 border-secondary pl-4">
                            <h4 className="text-home-h3 text-secondary">3. Acude a Urgencias (Fuera de horario)</h4>
                            <p className="text-outline">Si la emergencia ocurre fuera de nuestro horario de atención presencial, acude directamente al área de emergencias del Hospital de Apoyo de Otuzco, quienes derivarán el caso al equipo de psiquiatría de turno si es necesario.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
