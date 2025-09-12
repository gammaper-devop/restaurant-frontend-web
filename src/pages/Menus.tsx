import React from 'react';
import Layout from '../components/Layout';

const Menus: React.FC = () => {
  return (
    <Layout title="Menus">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Menus Management</h2>
        <p className="text-gray-600">Manage restaurant menus and dish collections.</p>
        <p className="text-sm text-gray-500 mt-4">Feature coming soon...</p>
      </div>
    </Layout>
  );
};

export default Menus;
