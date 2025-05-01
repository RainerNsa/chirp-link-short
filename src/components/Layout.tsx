
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold rounded-md px-3 py-2 mr-2">
                URL
              </div>
              <h1 className="text-xl font-bold">Shortener</h1>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                <li>
                  <Link 
                    to="/" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/urls" 
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    My URLs
                  </Link>
                </li>
              </ul>
            </nav>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-2">
              <ul className="flex flex-col space-y-3">
                <li>
                  <Link 
                    to="/" 
                    className="block py-2 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/urls" 
                    className="block py-2 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My URLs
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="md:flex md:justify-between md:items-center text-center md:text-left">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 text-sm">URL Shortener - Created with React and Express</p>
              <p className="mt-1 text-gray-500 text-sm">© {new Date().getFullYear()} URL Shortener</p>
            </div>
            <div className="flex justify-center md:justify-end space-x-4">
              <a href="https://github.com" className="text-gray-500 hover:text-gray-700 transition-colors">
                GitHub
              </a>
              <a href="/privacy" className="text-gray-500 hover:text-gray-700 transition-colors">
                Privacy
              </a>
              <a href="/terms" className="text-gray-500 hover:text-gray-700 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
