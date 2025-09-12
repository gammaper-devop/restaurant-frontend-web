import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Card, Button, Table, Modal } from '../components/ui';
import RestaurantForm from '../components/RestaurantForm';
import { useRestaurants, useCategories, useRestaurantMutations } from '../hooks';

const Restaurants: React.FC = () => {
  const { data: restaurants, loading, error, refetch } = useRestaurants();
  const { data: categoriesData } = useCategories();
  const { remove, loading: mutationLoading } = useRestaurantMutations();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Handle delete restaurant
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await remove(id);
        await refetch();
      } catch (err) {
        console.error('Error deleting restaurant:', err);
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Layout 
        title="Restaurants" 
        subtitle="Manage your restaurant network and locations"
      >
        <div className="space-y-8">
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-primary-500 transition ease-in-out duration-150">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading restaurants...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout 
        title="Restaurants" 
        subtitle="Manage your restaurant network and locations"
      >
        <div className="text-center py-8">
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-danger-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-danger-900 mb-2">Error Loading Restaurants</h3>
            <p className="text-danger-700 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              className="border-danger-300 text-danger-700 hover:bg-danger-50"
            >
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Ensure restaurants and categories are arrays before proceeding
  const validRestaurants = Array.isArray(restaurants) ? restaurants : [];
  const validCategories = Array.isArray(categoriesData) ? categoriesData : [];

  const columns = [
    {
      key: 'name',
      label: 'Restaurant Name',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-semibold">
            {value?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-medium text-neutral-900">{value}</p>
            <p className="text-sm text-neutral-500">{row.phone || 'No phone'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value: any) => {
        const categoryName = value?.name || 'Unknown';
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800">
            {categoryName}
          </span>
        );
      },
    },
    {
      key: 'locations',
      label: 'Locations',
      render: (value: any) => {
        const locationCount = Array.isArray(value) ? value.length : 0;
        return (
          <span className="text-neutral-900 font-medium">{locationCount}</span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, row: any) => {
        // Determine status based on locations
        const hasLocations = Array.isArray(row.locations) && row.locations.length > 0;
        const status = hasLocations ? 'Active' : 'Inactive';
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            status === 'Active' 
              ? 'bg-success-100 text-success-800' 
              : 'bg-neutral-100 text-neutral-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              status === 'Active' ? 'bg-success-500' : 'bg-neutral-400'
            }`} />
            {status}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => (
        <span className="text-neutral-600">{value ? new Date(value).toLocaleDateString() : 'N/A'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log('Edit', row.id)}
            disabled={mutationLoading}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
            disabled={mutationLoading}
            icon={
              mutationLoading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )
            }
            className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
          />
        </div>
      ),
    },
  ];

  const stats = [
    {
      title: 'Total Restaurants',
      value: validRestaurants.length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'primary',
    },
    {
      title: 'Active Restaurants',
      value: validRestaurants.filter(r => {
        const hasLocations = Array.isArray(r.locations) && r.locations.length > 0;
        return hasLocations;
      }).length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: 'success',
    },
    {
      title: 'Total Locations',
      value: validRestaurants.reduce((sum, r) => {
        const locationCount = Array.isArray(r.locations) ? r.locations.length : 0;
        return sum + locationCount;
      }, 0),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'secondary',
    },
    {
      title: 'Categories',
      value: new Set(validRestaurants.map(r => r.category?.name || 'Unknown')).size,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: 'warning',
    },
  ];

  const getStatColorClasses = (color: string) => {
    const colors = {
      primary: 'from-primary-500 to-primary-600',
      secondary: 'from-secondary-500 to-secondary-600',
      success: 'from-success-500 to-success-600',
      warning: 'from-warning-500 to-warning-600',
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <Layout 
      title="Restaurants" 
      subtitle="Manage your restaurant network and locations"
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

        {/* Actions Bar */}
        <Card variant="elevated" className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-neutral-100 rounded-xl px-3 py-2">
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  className="bg-transparent border-0 outline-none text-sm placeholder-neutral-500"
                />
              </div>
              <select className="bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="">All Categories</option>
                {validCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="md"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                Export
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Add Restaurant
              </Button>
            </div>
          </div>
        </Card>

        {/* Restaurants Table */}
        <Table
          columns={columns}
          data={validRestaurants}
          variant="striped"
          emptyMessage="No restaurants found. Create your first restaurant to get started."
        />

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card variant="elevated" size="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-neutral-50">
                <div className="w-2 h-2 bg-success-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">Golden Dragon added</p>
                  <p className="text-xs text-neutral-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-neutral-50">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">Bella Italia updated</p>
                  <p className="text-xs text-neutral-500">1 day ago</p>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="elevated" size="lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Performance</h3>
              <p className="text-sm text-neutral-600">Track restaurant metrics and growth</p>
            </div>
          </Card>

          <Card variant="elevated" size="lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-success-100 to-success-200 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Locations</h3>
              <p className="text-sm text-neutral-600">Manage restaurant locations and addresses</p>
            </div>
          </Card>
        </div>

        {/* Create Restaurant Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add New Restaurant"
          size="lg"
        >
          <RestaurantForm
            onSuccess={() => {
              setIsCreateModalOpen(false);
              refetch(); // Refresh the restaurants list
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </Modal>
      </div>
    </Layout>
  );
};

export default Restaurants;
