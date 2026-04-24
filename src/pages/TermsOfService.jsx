import { Link } from 'react-router-dom';
import { ArrowLeft, ScrollText } from 'lucide-react';
import logoRenacer from '../assets/LogoRenacer.png';

export default function TermsOfService() {
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
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <ScrollText className="text-primary w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-home-h1 text-primary">Términos de Servicio</h1>
                        <p className="text-outline mt-2">Última actualización: Abril 2026</p>
                    </div>
                </div>

                <div className="glass-card p-10 rounded-3xl border border-white/50 shadow-xl space-y-8 bg-white/60">
                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">1. Aceptación de los Términos</h2>
                        <p className="text-outline leading-relaxed">
                            Al acceder y utilizar los servicios presenciales y digitales del Centro de Salud Mental Comunitario RENACER ("CSMC RENACER"), usted acepta estar sujeto a los siguientes Términos de Servicio. Estos términos regulan la relación entre el centro y los pacientes/usuarios de Otuzco y zonas aledañas.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">2. Naturaleza de los Servicios</h2>
                        <p className="text-outline leading-relaxed">
                            El CSMC RENACER es un establecimiento público de salud enfocado en brindar atención ambulatoria especializada en salud mental comunitaria. Nuestros servicios incluyen:
                        </p>
                        <ul className="list-disc pl-6 text-outline space-y-2">
                            <li>Consultas psiquiátricas y psicológicas.</li>
                            <li>Terapia ocupacional y de lenguaje.</li>
                            <li>Acompañamiento psicosocial y trabajo social.</li>
                            <li>Intervención en crisis y visitas domiciliarias.</li>
                            <li>Entrega de medicamentos bajo receta médica en la farmacia del centro.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">3. Responsabilidades del Paciente</h2>
                        <p className="text-outline leading-relaxed">
                            Para garantizar la efectividad de los tratamientos (especialmente los estructurados en paquetes de atención), el paciente y/o su familiar cuidador se compromete a:
                        </p>
                        <ul className="list-disc pl-6 text-outline space-y-2">
                            <li>Asistir puntualmente a sus citas programadas.</li>
                            <li>Comunicar con al menos 24 horas de anticipación cualquier cancelación o necesidad de reprogramación.</li>
                            <li>Proporcionar información veraz sobre sus antecedentes, síntomas y medicación actual.</li>
                            <li>Seguir las indicaciones terapéuticas de los profesionales a cargo.</li>
                            <li>Mantener un trato respetuoso hacia el personal y otros usuarios del centro.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">4. Continuidad de Cuidados</h2>
                        <p className="text-outline leading-relaxed">
                            Muchos de nuestros tratamientos se basan en el modelo de "Paquetes de Continuidad de Cuidados" regulados por normativas nacionales. El abandono del tratamiento sin alta médica puede conllevar a que el centro realice visitas domiciliarias de rescate, como parte de nuestro protocolo de prevención de recaídas.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">5. Sistema RENACER (Plataforma Digital)</h2>
                        <p className="text-outline leading-relaxed">
                            El acceso a la plataforma digital está restringido exclusivamente al personal administrativo y de salud del CSMC RENACER. Se prohíbe terminantemente cualquier intento de acceso no autorizado, copia o distribución de los datos alojados en este sistema.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">6. Modificaciones de los Servicios</h2>
                        <p className="text-outline leading-relaxed">
                            Nos reservamos el derecho de modificar o discontinuar ciertos talleres, horarios de atención o disponibilidad de especialistas de acuerdo a la capacidad operativa del centro y las directrices normativas de la Red de Salud Otuzco.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">7. Contacto</h2>
                        <p className="text-outline leading-relaxed">
                            Cualquier reclamo, queja o sugerencia puede presentarse en nuestro Libro de Reclamaciones físico disponible en el área de Admisión del centro, o escribiendo al correo <strong>ccomunitariorenacer@gmail.com</strong>.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
