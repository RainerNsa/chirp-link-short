
import React from 'react';
import Layout from '@/components/Layout';
import UrlList from '@/components/UrlList';

const Urls = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Your URLs</h1>
          <p className="text-gray-600">View, search, and track all your shortened links</p>
        </div>
        
        <UrlList />
      </div>
    </Layout>
  );
};

export default Urls;
