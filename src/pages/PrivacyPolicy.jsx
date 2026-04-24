import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import logoRenacer from '../assets/LogoRenacer.png';

export default function PrivacyPolicy() {
    return (
        <div className="bg-surface font-inter text-on-surface min-h-screen flex flex-col">
            {/* Minimal Header */}
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
                        <Shield className="text-primary w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-home-h1 text-primary">Política de Privacidad</h1>
                        <p className="text-outline mt-2">Última actualización: Abril 2026</p>
                    </div>
                </div>

                <div className="glass-card p-10 rounded-3xl border border-white/50 shadow-xl space-y-8 bg-white/60">
                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">1. Introducción</h2>
                        <p className="text-outline leading-relaxed">
                            En el Centro de Salud Mental Comunitario RENACER ("CSMC RENACER"), respetamos su privacidad y estamos comprometidos a proteger su información personal e historial clínico. Esta Política de Privacidad explica cómo recopilamos, utilizamos, divulgamos y resguardamos su información cuando visita nuestro centro o utiliza nuestro sistema de servicios de salud.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">2. Información que Recopilamos</h2>
                        <p className="text-outline leading-relaxed">
                            Podemos recopilar información sobre usted de diversas maneras, enfocadas siempre en brindar la mejor atención de salud mental. La información que podemos recoger incluye:
                        </p>
                        <ul className="list-disc pl-6 text-outline space-y-2">
                            <li><strong>Datos Personales:</strong> Nombre completo, DNI, fecha de nacimiento, dirección, número de teléfono y correo electrónico.</li>
                            <li><strong>Información Médica:</strong> Historial clínico, diagnósticos (CIE-10), tratamientos recibidos, medicamentos recetados y notas de evolución psicoterapéutica.</li>
                            <li><strong>Información Familiar:</strong> Antecedentes familiares relevantes para su diagnóstico y tratamiento, bajo estricta confidencialidad.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">3. Uso de la Información</h2>
                        <p className="text-outline leading-relaxed">
                            Utilizamos la información recopilada exclusivamente con fines médicos y administrativos internos:
                        </p>
                        <ul className="list-disc pl-6 text-outline space-y-2">
                            <li>Para proporcionar diagnósticos precisos y planes de tratamiento (paquetes de continuidad).</li>
                            <li>Para realizar un seguimiento de su evolución clínica a través del tiempo.</li>
                            <li>Para contactarlo en caso de reprogramaciones, seguimiento de casos de emergencia y recordatorios de citas.</li>
                            <li>Para fines estadísticos obligatorios requeridos por el Ministerio de Salud (MINSA), de forma completamente anonimizada.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">4. Divulgación y Compartición</h2>
                        <p className="text-outline leading-relaxed">
                            Su historial clínico es <strong>estrictamente confidencial</strong>. No compartimos, vendemos ni alquilamos su información personal a terceros. Solo divulgaremos su información bajo las siguientes circunstancias:
                        </p>
                        <ul className="list-disc pl-6 text-outline space-y-2">
                            <li><strong>Consentimiento:</strong> Cuando contemos con su autorización expresa por escrito.</li>
                            <li><strong>Requerimiento Legal:</strong> Cuando sea requerido por mandato judicial o autoridad competente en el marco de una investigación legal (ej. casos de violencia familiar reportados).</li>
                            <li><strong>Emergencia Vital:</strong> Si determinamos que existe un riesgo inminente para su vida o la de terceros.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">5. Seguridad de sus Datos</h2>
                        <p className="text-outline leading-relaxed">
                            El CSMC RENACER utiliza el Sistema Integral de Gestión de Citas y Paquetes de Salud Mental, el cual cuenta con medidas de seguridad administrativas, técnicas y físicas diseñadas para proteger su información médica y personal contra acceso no autorizado, alteración o destrucción.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">6. Sus Derechos</h2>
                        <p className="text-outline leading-relaxed">
                            Como paciente, usted tiene derecho a:
                        </p>
                        <ul className="list-disc pl-6 text-outline space-y-2">
                            <li>Solicitar una copia de su historia clínica y constancias de atención.</li>
                            <li>Solicitar la corrección o actualización de sus datos personales y demográficos (como domicilio y teléfono).</li>
                            <li>Conocer quiénes han tenido acceso a su expediente clínico.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-home-h3 text-primary">7. Contacto para Consultas</h2>
                        <p className="text-outline leading-relaxed">
                            Si tiene preguntas o inquietudes sobre esta Política de Privacidad o sobre el manejo de sus datos clínicos, no dude en contactarnos en nuestras instalaciones ubicadas en Calle Cáceres N° 605 – 613, Otuzco, o al correo: <strong>ccomunitariorenacer@gmail.com</strong>.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
