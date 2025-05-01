
import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold rounded-md px-3 py-2 mr-2">
              URL
            </div>
            <h1 className="text-xl font-bold">Shortener</h1>
          </Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/urls" 
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  My URLs
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>URL Shortener - Created with React and Express</p>
          <p className="mt-1">© {new Date().getFullYear()} URL Shortener</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
