import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, Mail, CheckCircle2 } from 'lucide-react';
import logoRenacer from '../assets/LogoRenacer.png';

export default function JobOpportunities() {
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

            <main className="pt-32 pb-20 flex-1 max-w-5xl mx-auto px-6 w-full">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="text-primary w-10 h-10" />
                    </div>
                    <h1 className="text-home-h1 text-primary mb-4">Únete a nuestro equipo</h1>
                    <p className="text-home-body-lg text-outline">
                        Sé parte del cambio en Otuzco. Buscamos profesionales apasionados por la salud mental comunitaria y el cuidado humanizado.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-home-h2 text-primary">Convocatorias Abiertas</h2>
                        
                        <div className="glass-card p-8 rounded-3xl border border-white/50 shadow-sm bg-white/60 text-center">
                            <h3 className="text-home-h3 text-outline mb-2">No hay convocatorias activas en este momento</h3>
                            <p className="text-outline/80">Sin embargo, siempre estamos recibiendo currículums para futuras oportunidades. Puedes enviarnos el tuyo de manera espontánea.</p>
                        </div>

                        {/* Plantilla para cuando haya puestos: 
                        <div className="glass-card p-6 rounded-2xl border border-white/50 shadow-md bg-white hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-home-h3 text-primary">Psicólogo(a) Clínico(a)</h3>
                                    <p className="text-outline text-sm">Tiempo Completo • Presencial (Otuzco)</p>
                                </div>
                                <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-medium">Nueva</span>
                            </div>
                            <p className="text-outline text-sm mb-4">Buscamos profesional con experiencia en psicoterapia familiar y manejo de casos de TMG en entornos comunitarios.</p>
                            <button className="text-primary font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                Ver detalles <ArrowLeft className="rotate-180" size={16} />
                            </button>
                        </div> 
                        */}

                        <h2 className="text-home-h2 text-primary mt-12 mb-6">¿Por qué trabajar con nosotros?</h2>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="text-secondary shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-primary">Impacto real</h4>
                                    <p className="text-sm text-outline mt-1">Tu trabajo transforma directamente el bienestar de familias vulnerables en nuestra provincia.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="text-secondary shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-primary">Desarrollo profesional</h4>
                                    <p className="text-sm text-outline mt-1">Entorno colaborativo multidisciplinario donde aprenderás de psiquiatras, enfermeros y terapeutas.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="text-secondary shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-primary">Estabilidad</h4>
                                    <p className="text-sm text-outline mt-1">Forma parte de la Red de Salud Otuzco bajo régimen laboral formal con beneficios de ley.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-primary p-8 rounded-3xl text-on-primary sticky top-32 shadow-xl">
                            <h3 className="text-home-h3 mb-4">Postulación Espontánea</h3>
                            <p className="text-on-primary/80 mb-6 text-sm">
                                Si crees que tu perfil encaja con nuestra misión, envíanos tu CV actualizado detallando tu experiencia y formación académica.
                            </p>
                            <div className="space-y-4">
                                <p className="text-sm font-medium">Requisitos generales:</p>
                                <ul className="text-sm text-on-primary/80 space-y-2 list-disc pl-5">
                                    <li>Título profesional y colegiatura habilitada.</li>
                                    <li>Experiencia demostrable en salud pública o comunitaria.</li>
                                    <li>Empatía, vocación de servicio y proactividad.</li>
                                </ul>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/20">
                                <a 
                                    href="mailto:ccomunitariorenacer@gmail.com?subject=Postulación%20Espontánea%20-%20CSMC%20RENACER" 
                                    className="w-full py-3 bg-white text-primary text-center font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                                >
                                    <Mail size={18} />
                                    Enviar CV por Correo
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
