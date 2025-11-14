import React, { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { CheckCircle } from 'lucide-react';

const Toast: React.FC = () => {
    const { state, dispatch } = useApp();
    const { toastMessage } = state;

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                dispatch({ type: 'HIDE_TOAST' });
            }, 3000); // Hide after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [toastMessage, dispatch]);

    if (!toastMessage) {
        return null;
    }

    return (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
            <div className="flex items-center gap-3 bg-gray-900 dark:bg-gray-800 text-white py-3 px-5 rounded-full shadow-lg border border-gray-700">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-medium text-sm">{toastMessage}</span>
            </div>
            <style jsx>{`
                @keyframes toast-in {
                    from {
                        transform: translate(-50%, 100%);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, 0);
                        opacity: 1;
                    }
                }
                .animate-toast-in {
                    animation: toast-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Toast;
