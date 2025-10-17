import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Card, Button, Table } from '../components/ui';

const Users: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Mock data - in real app, this would come from an API
  const users = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2024-02-10T14:30:00Z',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'Manager',
      status: 'Active',
      lastLogin: '2024-02-09T16:45:00Z',
      createdAt: '2024-01-20',
    },
    {
      id: 3,
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      role: 'Staff',
      status: 'Active',
      lastLogin: '2024-02-08T09:15:00Z',
      createdAt: '2024-01-25',
    },
    {
      id: 4,
      name: 'David Chen',
      email: 'david.chen@example.com',
      role: 'Staff',
      status: 'Inactive',
      lastLogin: '2024-01-30T11:20:00Z',
      createdAt: '2024-01-18',
    },
  ];

  const columns = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
            {value.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-neutral-900">{value}</p>
            <p className="text-sm text-neutral-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value: string) => {
        const roleColors = {
          Admin: 'bg-danger-100 text-danger-800',
          Manager: 'bg-warning-100 text-warning-800',
          Staff: 'bg-secondary-100 text-secondary-800',
        };
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            roleColors[value as keyof typeof roleColors] || 'bg-neutral-100 text-neutral-800'
          }`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          value === 'Active' 
            ? 'bg-success-100 text-success-800' 
            : 'bg-neutral-100 text-neutral-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            value === 'Active' ? 'bg-success-500' : 'bg-neutral-400'
          }`} />
          {value}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      render: (value: string) => {
        const date = new Date(value);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let timeAgo = '';
        if (diffDays === 1) timeAgo = 'Today';
        else if (diffDays === 2) timeAgo = 'Yesterday';
        else timeAgo = `${diffDays - 1} days ago`;
        
        return (
          <div>
            <p className="text-sm text-neutral-900">{date.toLocaleDateString()}</p>
            <p className="text-xs text-neutral-500">{timeAgo}</p>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
onClick={() => {}}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
          <Button
            variant="ghost"
            size="sm"
onClick={() => {}}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            className="text-warning-600 hover:text-warning-700 hover:bg-warning-50"
          />
          <Button
            variant="ghost"
            size="sm"
onClick={() => {}}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
            className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
          />
        </div>
      ),
    },
  ];

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'primary',
    },
    {
      title: 'Active Users',
      value: users.filter(u => u.status === 'Active').length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: 'success',
    },
    {
      title: 'Administrators',
      value: users.filter(u => u.role === 'Admin').length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'danger',
    },
    {
      title: 'New This Month',
      value: users.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      color: 'secondary',
    },
  ];

  const getStatColorClasses = (color: string) => {
    const colors = {
      primary: 'from-primary-500 to-primary-600',
      secondary: 'from-secondary-500 to-secondary-600',
      success: 'from-success-500 to-success-600',
      danger: 'from-danger-500 to-danger-600',
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  const filteredUsers = activeTab === 'all' 
    ? users 
    : users.filter(user => user.status.toLowerCase() === activeTab);

  const tabs = [
    { id: 'all', label: 'All Users', count: users.length },
    { id: 'active', label: 'Active', count: users.filter(u => u.status === 'Active').length },
    { id: 'inactive', label: 'Inactive', count: users.filter(u => u.status === 'Inactive').length },
  ];

  return (
    <Layout 
      title="Users Management" 
      subtitle="Manage user accounts, roles, and permissions"
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const colorClasses = getStatColorClasses(stat.color);
            return (
              <Card key={index} variant="elevated" hover className="group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClasses} text-white shadow-soft`}>
                    {stat.icon}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Tabs and Actions */}
        <Card variant="elevated" className="p-0 overflow-hidden">
          <div className="border-b border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6">
              {/* Tabs */}
              <div className="flex space-x-1 bg-neutral-100 rounded-xl p-1 mb-4 sm:mb-0">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-primary-700 shadow-soft'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-neutral-100 rounded-xl px-3 py-2">
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="bg-transparent border-0 outline-none text-sm placeholder-neutral-500 w-32 sm:w-auto"
                  />
                </div>
                <Button
                  variant="outline"
                  size="md"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                  }
                >
                  Filter
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  Add User
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Table
          columns={columns}
          data={filteredUsers}
          variant="striped"
          emptyMessage="No users found. Create your first user account to get started."
        />

        {/* User Permissions Overview */}
        <Card variant="elevated" size="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Role Permissions</h3>
            <Button variant="ghost" size="sm">Manage Roles</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-danger-200 rounded-xl bg-danger-50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-danger-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-danger-900">Administrator</h4>
              </div>
              <p className="text-sm text-danger-700">Full system access and user management</p>
            </div>
            <div className="p-4 border border-warning-200 rounded-xl bg-warning-50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-warning-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-warning-900">Manager</h4>
              </div>
              <p className="text-sm text-warning-700">Restaurant and menu management</p>
            </div>
            <div className="p-4 border border-secondary-200 rounded-xl bg-secondary-50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-secondary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-secondary-900">Staff</h4>
              </div>
              <p className="text-sm text-secondary-700">View and basic operations</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Users;
