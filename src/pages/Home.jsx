import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail } from 'lucide-react';
import logoRenacer from '../assets/LogoRenacer.png';
import renacerHome from '../assets/RenacerHome.png';

export default function Home() {
    return (
        <div className="bg-surface font-inter text-on-surface selection:bg-primary-fixed-dim selection:text-on-primary-fixed min-h-screen flex flex-col">
            {/* Top Navigation */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-[0_10px_30px_rgba(27,94,83,0.05)]">
                <nav className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto font-inter antialiased text-sm font-medium tracking-tight">
                    <div className="text-xl font-bold tracking-tighter text-emerald-900 flex items-center gap-2">
                        <img src={logoRenacer} alt="Logo Renacer" className="h-8 w-8 object-contain" />
                        CSMC RENACER
                    </div>
                    <div className="hidden md:flex gap-8 items-center">
                        <a className="text-emerald-700 border-b-2 border-emerald-700 pb-1" href="#hero">Inicio</a>
                        <a className="text-slate-600 hover:text-emerald-800 transition-colors duration-300" href="#servicios">Servicios</a>
                        <a className="text-slate-600 hover:text-emerald-800 transition-colors duration-300" href="#nosotros">Nosotros</a>
                        <a className="text-slate-600 hover:text-emerald-800 transition-colors duration-300" href="#contacto">Contacto</a>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link to="/login" className="px-5 py-2.5 bg-primary text-white text-home-button rounded-xl shadow-lg active:scale-95 transition-transform inline-flex items-center">Acceder al Sistema</Link>
                    </div>
                </nav>
            </header>

            <main className="pt-20 flex-1">
                {/* Hero Section */}
                <section id="hero" className="relative min-h-[90vh] flex items-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img className="w-full h-full object-cover opacity-10" alt="Vista de Otuzco" src={renacerHome} />
                        <div className="absolute inset-0 bg-gradient-to-tr from-surface via-surface/90 to-transparent"></div>
                    </div>
                    <div className="max-w-[1200px] mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/20 text-on-secondary-container rounded-full border border-secondary-container/30">
                                <span className="material-symbols-outlined text-[16px]">verified</span>
                                <span className="text-home-label-caps">CSMC RENACER - OTUZCO</span>
                            </div>
                            <h1 className="text-home-h1 text-primary leading-tight">
                                Recuperando la esperanza, transformando vidas.
                            </h1>
                            <p className="text-home-body-lg text-outline max-w-lg">
                                Especialistas en salud mental comunitaria dedicados al bienestar integral de la población de Otuzco a través de cuidados humanizados.
                            </p>
                            <div className="flex flex-wrap gap-6 pt-2">
                                <Link to="/login" className="px-8 py-4 bg-primary text-on-primary text-home-button rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
                                    Iniciar Sesión / Acceder al Sistema
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                                <a href="#servicios" className="px-8 py-4 bg-transparent border-2 border-primary text-primary text-home-button rounded-xl hover:bg-primary/5 transition-all inline-flex items-center">
                                    Conocer Servicios
                                </a>
                            </div>
                        </div>
                        <div className="relative hidden lg:block">
                            <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl"></div>
                            <div className="glass-card p-3 rounded-[2rem] shadow-2xl relative overflow-hidden border border-white/50">
                                <img className="w-full h-auto rounded-[1.5rem]" alt="CSMC Renacer" src={renacerHome} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 bg-primary">
                    <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center space-y-1">
                            <div className="text-home-h1 text-primary-fixed">8+</div>
                            <div className="text-home-label-caps text-primary-fixed-dim uppercase tracking-widest">paquetes de atención especializados</div>
                        </div>
                        <div className="text-center space-y-1">
                            <div className="text-home-h1 text-primary-fixed">8</div>
                            <div className="text-home-label-caps text-primary-fixed-dim uppercase tracking-widest">meses de seguimiento personalizado</div>
                        </div>
                        <div className="text-center space-y-1">
                            <div className="text-home-h1 text-primary-fixed">100%</div>
                            <div className="text-home-label-caps text-primary-fixed-dim uppercase tracking-widest">Atención integral comunitaria</div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section id="servicios" className="py-20">
                    <div className="max-w-[1200px] mx-auto px-6 text-center mb-12">
                        <h2 className="text-home-h2 text-primary mb-3">Nuestros Servicios Especializados</h2>
                        <p className="text-home-body-md text-outline max-w-2xl mx-auto">Ofrecemos un enfoque multidisciplinario adaptado a las necesidades de cada etapa de la vida y condición.</p>
                    </div>
                    <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-xl shadow-[0_10px_30px_rgba(27,94,83,0.05)] border border-white hover:translate-y-[-4px] transition-transform">
                            <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-primary">child_care</span>
                            </div>
                            <h3 className="text-home-h3 text-primary mb-3">Atención de niños y adolescentes</h3>
                            <p className="text-outline">Cuidado integral enfocado en el desarrollo emocional y conductual de las etapas formativas.</p>
                        </div>
                        <div className="glass-card p-6 rounded-xl shadow-[0_10px_30px_rgba(27,94,83,0.05)] border border-white hover:translate-y-[-4px] transition-transform">
                            <div className="w-12 h-12 bg-secondary-container/20 rounded-lg flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-secondary">family_restroom</span>
                            </div>
                            <h3 className="text-home-h3 text-primary mb-3">Violencia familiar y sexual</h3>
                            <p className="text-outline">Espacio seguro y confidencial para la recuperación emocional y apoyo legal asistido.</p>
                        </div>
                        <div className="glass-card p-6 rounded-xl shadow-[0_10px_30px_rgba(27,94,83,0.05)] border border-white hover:translate-y-[-4px] transition-transform">
                            <div className="w-12 h-12 bg-tertiary-fixed rounded-lg flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-tertiary">psychology</span>
                            </div>
                            <h3 className="text-home-h3 text-primary mb-3">Trastornos afectivos</h3>
                            <p className="text-outline">Tratamiento especializado para depresión, ansiedad y otras condiciones del ánimo.</p>
                        </div>
                        <div className="glass-card p-6 rounded-xl shadow-[0_10px_30px_rgba(27,94,83,0.05)] border border-white hover:translate-y-[-4px] transition-transform">
                            <div className="w-12 h-12 bg-primary-fixed-dim rounded-lg flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-primary">monitoring</span>
                            </div>
                            <h3 className="text-home-h3 text-primary mb-3">Continuidad de cuidados para TMG</h3>
                            <p className="text-outline">Acompañamiento sostenido para Trastornos Mentales Graves en la comunidad.</p>
                        </div>
                        <div className="glass-card p-6 rounded-xl shadow-[0_10px_30px_rgba(27,94,83,0.05)] border border-white hover:translate-y-[-4px] transition-transform">
                            <div className="w-12 h-12 bg-secondary-fixed rounded-lg flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-secondary">pill</span>
                            </div>
                            <h3 className="text-home-h3 text-primary mb-3">Adicciones</h3>
                            <p className="text-outline">Programas de rehabilitación y reinserción social para el manejo de dependencias.</p>
                        </div>
                        <div className="bg-primary p-6 rounded-xl shadow-xl flex flex-col justify-center items-center text-center text-on-primary">
                            <span className="material-symbols-outlined text-[48px] mb-3">medical_services</span>
                            <h3 className="text-home-h3 mb-3">¿Necesitas ayuda?</h3>
                            <p className="mb-6 opacity-80">Estamos aquí para escucharte y acompañarte.</p>
                            <button className="w-full py-3 bg-white text-primary text-home-button rounded-lg">Ver todos los programas</button>
                        </div>
                    </div>
                </section>

                {/* About Us Section */}
                <section id="nosotros" className="py-20 bg-surface-container-low overflow-hidden">
                    <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                        <div className="relative">
                            <div className="grid grid-cols-2 gap-6">
                                <img className="rounded-xl shadow-lg mt-20" alt="Medical staff" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRPelKmUZALi9iVN1XUr9fM07p0l2RZBkAFuOnCCa_riYUT8Hw7M4eIX10h8QR3yoLFnJ2Q_Bb6VYptpo7Tmwt_f0-FvU_n1nb-qGmj5qfZpvSJMHbwF0LAhnCxNfsYoM8vfPt45-xro7AVT2IBYHSeUhpoqZfkS6VxQZPnvqKXV-vGLPqNvlpgdm7vlEGNuxIPOpofO8ahGXrNpVnBMpHhQCPNHxwCfAWRyDxS0KaS-_G2YiD7FbcvkLF3DEVawnWumk6HESAu_8" />
                                <img className="rounded-xl shadow-lg" alt="Counseling session" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW0HTmuPiVX-8NsBd7F6y3IVRSyI6Q6hSe2KbQW5SsPwAQGd1kNgkxyCC3rSGWKbWabDFGZyG4M5MLHaJOSmLNA71y0BtaLI6QzWYRgfNQ4Gcp6uULnwuj5NW0XVbh9QKZcyvPGSZW6o-Uu-Qb7xNGBaupIGFiHZzDnuHeiQXvvJBnobqFsMnJJ36T4Fw0RtPdpvFyR8beVz-n_jWBa26YrbKFRZz_Yt37eSF3vwoHWZpSPPahXXapztMPPkBnA5lTSuhCRiV7J1k" />
                            </div>
                            <div className="absolute -bottom-6 -right-6 p-6 bg-secondary-container text-on-secondary-container rounded-xl shadow-xl">
                                <p className="text-home-h3">100%</p>
                                <p className="text-home-label-caps">Personalizado</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-home-h2 text-primary">Nuestra Identidad</h2>
                            <div className="space-y-2">
                                <h4 className="text-home-h3 text-primary flex items-center gap-2">
                                    <span className="material-symbols-outlined text-secondary">visibility</span>
                                    Visión
                                </h4>
                                <p className="text-outline leading-relaxed">
                                    Ser el centro de referencia líder en salud mental comunitaria, reconocido por la excelencia clínica y la calidez humana, transformando Otuzco en una comunidad resiliente.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-home-h3 text-primary flex items-center gap-2">
                                    <span className="material-symbols-outlined text-secondary">flag</span>
                                    Misión
                                </h4>
                                <p className="text-outline leading-relaxed">
                                    Brindar atención especializada e integral, promoviendo la recuperación y estabilidad de nuestros usuarios mediante un modelo basado en la comunidad, el respeto y la dignidad.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact & Location */}
                <section id="contacto" className="py-20">
                    <div className="max-w-[1200px] mx-auto px-6">
                        <div className="glass-card rounded-3xl shadow-2xl overflow-hidden border border-white grid lg:grid-cols-5">
                            <div className="lg:col-span-2 p-10 space-y-8 bg-white/40">
                                <div>
                                    <h2 className="text-home-h2 text-primary mb-6">Contáctanos</h2>
                                    <p className="text-outline">Estamos ubicados en el corazón de Otuzco para brindarte la mejor atención.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex gap-6">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary">location_on</span>
                                        </div>
                                        <div>
                                            <p className="text-home-button text-primary">Dirección</p>
                                            <p className="text-outline">Calle Cáceres N° 605 – 613 Otuzco - La Libertad </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary">schedule</span>
                                        </div>
                                        <div>
                                            <p className="text-home-button text-primary">Horarios</p>
                                            <p className="text-outline">Lunes - Viernes: 7:30 AM - 7:30 PM y Sábados: 7:30 AM - 1:30 PM</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-error">emergency</span>
                                        </div>
                                        <div>
                                            <p className="text-home-button text-error">Emergencias</p>
                                            <p className="text-outline font-bold">+51 987 473 937</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-primary">mail</span>
                                        </div>
                                        <div>
                                            <p className="text-home-button text-primary">Correo Electrónico</p>
                                            <p className="text-outline">ccomunitariorenacer@gmail.com</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-primary text-white rounded-xl shadow-lg hover:shadow-primary/20 transition-all">Enviar un mensaje</button>
                            </div>
                            <div className="lg:col-span-3 min-h-[400px] relative">
                                <iframe 
                                    src="https://maps.google.com/maps?q=Centro%20de%20Salud%20Mental%20Comunitario%20RENACER%20de%20Otuzco%2C%20C%C3%A1ceres%20613%2C%20Otuzco%2013201&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                                    className="w-full h-full border-0" 
                                    allowFullScreen="" 
                                    loading="lazy" 
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Ubicación CSMC Renacer"
                                ></iframe>
                                <div className="absolute inset-0 bg-primary/10 pointer-events-none"></div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-md flex items-center gap-2 z-10">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs font-semibold text-primary">Centro Abierto</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-200 mt-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8 py-12 max-w-7xl mx-auto font-inter text-sm leading-relaxed">
                    <div className="space-y-4">
                        <div className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                            <img src={logoRenacer} alt="Logo Renacer" className="h-6 w-6 object-contain" />
                            CSMC RENACER
                        </div>
                        <p className="text-slate-500">CSMC RENACER - Brindando salud mental de calidad en la provincia de Otuzco. Un compromiso con la comunidad.</p>
                    </div>
                    <div className="space-y-4">
                        <p className="font-semibold text-emerald-700">Enlaces Rápidos</p>
                        <ul className="space-y-2">
                            <li><Link className="text-slate-500 hover:text-emerald-600 underline decoration-emerald-500/30 transition-colors" to="/politica-privacidad">Política de Privacidad</Link></li>
                            <li><Link className="text-slate-500 hover:text-emerald-600 underline decoration-emerald-500/30 transition-colors" to="/terminos-servicio">Términos de Servicio</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <p className="font-semibold text-emerald-700">Soporte</p>
                        <ul className="space-y-2">
                            <li><Link className="text-slate-500 hover:text-emerald-600 underline decoration-emerald-500/30 transition-colors" to="/soporte-emergencia">Soporte de Emergencia</Link></li>
                            <li><Link className="text-slate-500 hover:text-emerald-600 underline decoration-emerald-500/30 transition-colors" to="/oportunidades-laborales">Oportunidades Laborales</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <p className="font-semibold text-emerald-700">Síguenos</p>
                        <div className="flex gap-3">
                            <a
                                href="https://www.facebook.com/p/Centro-de-Salud-Mental-Comunitario-RENACER-Otuzco-100034507226064/"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Facebook"
                                className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Facebook size={16} strokeWidth={2} />
                            </a>
                            <a
                                href="https://www.instagram.com/redsalud_otuzco/"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Instagram"
                                className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[#E1306C] hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:via-30% hover:to-[#dc2743] hover:text-white hover:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Instagram size={16} strokeWidth={2} />
                            </a>
                            <a
                                href="mailto:ccomunitariorenacer@gmail.com"
                                title="Correo electrónico"
                                className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[#EA4335] hover:bg-[#EA4335] hover:text-white hover:border-[#EA4335] transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <Mail size={16} strokeWidth={2} />
                            </a>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">ccomunitariorenacer@gmail.com</p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-8 py-6 border-t border-slate-200 text-center md:text-left">
                    <p className="text-slate-500">© 2024 Centro de Salud Mental Comunitario de Otuzco &quot;Renacer&quot;.</p>
                </div>
            </footer>
        </div>
    );
}
