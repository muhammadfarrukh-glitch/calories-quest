import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    // Optional: clear all user data on logout
    // localStorage.removeItem('user');
    // localStorage.removeItem('userProfile');
    // localStorage.removeItem('quest');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 
            className="text-2xl font-bold text-gray-900 tracking-tight cursor-pointer"
            onClick={() => navigate('/')}
          >
            🔥 CalorieQuest
          </h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;