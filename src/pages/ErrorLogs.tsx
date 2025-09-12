import React from 'react';
import Layout from '../components/Layout';

const ErrorLogs: React.FC = () => {
  return (
    <Layout title="Error Logs">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error Logs Management</h2>
        <p className="text-gray-600">View and manage system error logs and statistics.</p>
        <p className="text-sm text-gray-500 mt-4">Feature coming soon...</p>
      </div>
    </Layout>
  );
};

export default ErrorLogs;
