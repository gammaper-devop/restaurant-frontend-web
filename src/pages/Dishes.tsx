import React from 'react';
import Layout from '../components/Layout';

const Dishes: React.FC = () => {
  return (
    <Layout title="Dishes">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dishes Management</h2>
        <p className="text-gray-600">Manage restaurant dishes and menu items.</p>
        <p className="text-sm text-gray-500 mt-4">Feature coming soon...</p>
      </div>
    </Layout>
  );
};

export default Dishes;
