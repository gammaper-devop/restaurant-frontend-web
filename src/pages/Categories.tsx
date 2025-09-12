import React from 'react';
import Layout from '../components/Layout';

const Categories: React.FC = () => {
  return (
    <Layout title="Categories">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Categories Management</h2>
        <p className="text-gray-600">Manage restaurant categories.</p>
        <p className="text-sm text-gray-500 mt-4">Feature coming soon...</p>
      </div>
    </Layout>
  );
};

export default Categories;
