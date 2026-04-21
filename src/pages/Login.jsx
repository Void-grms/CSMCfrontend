import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginApi } from '../services/api';
import { Lock, User, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import logoRenacer from '../assets/LogoRenacer.png';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const data = await loginApi(username, password);
            if (data.ok) {
                login(data.token, data.user);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-inter">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="text-center">
                    <div className="bg-white p-3 rounded-[1.5rem] shadow-sm border border-primary/10 inline-block mb-2">
                        <img src={logoRenacer} alt="Logo Renacer" className="h-16 w-auto object-contain" />
                    </div>
                    <h2 className="mt-4 text-3xl font-extrabold text-primary tracking-tight">
                        CSMC RENACER
                    </h2>
                    <p className="mt-2 text-sm text-outline">
                        Ingresa tus credenciales para continuar
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="glass-card py-10 px-6 shadow-[0_10px_40px_rgba(0,70,60,0.08)] sm:rounded-[2rem] sm:px-10 border border-white">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-error/10 border-l-4 border-error p-4 rounded-xl flex items-start animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-5 w-5 text-error mr-3 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-error font-medium">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-primary mb-1.5" htmlFor="username">
                                Usuario
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-outline group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="appearance-none block w-full pl-11 pr-3 py-3 bg-white/60 border border-outline-variant rounded-xl shadow-sm placeholder-outline/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white text-on-surface sm:text-sm transition-all"
                                    placeholder="Administrador"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-primary mb-1.5" htmlFor="password">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-outline group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full pl-11 pr-3 py-3 bg-white/60 border border-outline-variant rounded-xl shadow-sm placeholder-outline/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white text-on-surface sm:text-sm transition-all"
                                    placeholder="••••••••"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-on-primary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                        <span>Iniciando sesión...</span>
                                    </>
                                ) : (
                                    <span>Iniciar Sesión</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 flex justify-center">
                    <Link 
                        to="/"
                        className="text-sm font-medium text-primary hover:text-primary/70 transition-colors flex items-center gap-2 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Volver a la página principal
                    </Link>
                </div>

                <p className="text-center mt-8 text-xs text-outline/70 font-medium">
                    &copy; 2026 Centro de Salud Mental Comunitario Renacer.
                </p>
            </div>
        </div>
    );
}
