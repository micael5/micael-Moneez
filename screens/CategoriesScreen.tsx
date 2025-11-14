import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';

const CategoriesScreen: React.FC = () => {
    const { state, dispatch } = useApp();
    const { categories } = state;

    return (
        <div className="pb-16 md:pb-0">
            <Header title="Categorias" actions={
                 <Button onClick={() => dispatch({ type: 'OPEN_CATEGORY_MODAL' })}>
                    <Plus size={16} className="mr-2" />
                    Nova Categoria
                </Button>
            } />
            <Card>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {categories.map(category => (
                        <div key={category.id} className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg aspect-square">
                            <span className="text-4xl">{category.icon}</span>
                            <p className="mt-2 text-sm font-medium text-center">{category.name}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default CategoriesScreen;