
import React from 'react';
import Layout from '@/components/Layout';
import UrlShortenerForm from '@/components/UrlShortenerForm';

const Home = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-purple">
            Shorten Your Links
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create short, memorable links that redirect to your long URLs. Track visits and manage all your links in one place.
          </p>
        </div>
        
        <UrlShortenerForm />
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-brand-blue font-bold">1</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Paste your long URL</h3>
            <p className="text-gray-600">Enter your unwieldy link into the URL shortener above.</p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="bg-purple-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-brand-purple font-bold">2</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Get your short URL</h3>
            <p className="text-gray-600">Our system will generate a short, unique link that's easy to share.</p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-brand-blue font-bold">3</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Track your links</h3>
            <p className="text-gray-600">See how many times your link has been clicked and when it was last accessed.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
