import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { LogIn } from 'lucide-react';

const LoginScreen: React.FC = () => {
    const [userName, setUserName] = useState('');
    const { dispatch } = useApp();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (userName.trim()) {
            dispatch({ type: 'LOGIN', payload: { userName: userName.trim() } });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 font-sans">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
                        MONEEZ
                    </h1>
                    <p className="mt-2 text-base md:text-lg text-gray-500 dark:text-gray-400">
                        Seu mestre financeiro pessoal
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl shadow-xl p-8 space-y-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Como podemos te chamar?
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                                           font-medium
                                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500 focus:border-transparent 
                                           transition duration-200"
                                placeholder="Digite seu nome"
                                required
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full text-base py-3 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" 
                            disabled={!userName.trim()}
                        >
                            <span className="mr-2">Acessar Plataforma</span>
                            <LogIn className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;