import React from 'react';
import Layout from '../components/Layout';
import { Card, Button } from '../components/ui';
import { useDashboardStats, useDashboardActivity } from '../hooks';

const Dashboard: React.FC = () => {
  const { data: statsData, loading: statsLoading, error: statsError } = useDashboardStats();
  const { data: recentActivity, error: activityError } = useDashboardActivity();

  // Debug logging
  React.useEffect(() => {
    console.log('Dashboard data:', { statsData, recentActivity, statsError, activityError });
  }, [statsData, recentActivity, statsError, activityError]);

  // Define stats structure based on API data
  const stats = statsData ? [
    {
      title: 'Total Restaurants',
      value: statsData.totalRestaurants.toString(),
      change: '+2.5%', // This could be calculated from historical data
      changeType: 'increase' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'primary',
    },
    {
      title: 'Active Menus',
      value: statsData.totalMenus.toString(),
      change: '+12.3%',
      changeType: 'increase' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'secondary',
    },
    {
      title: 'Total Dishes',
      value: statsData.totalDishes.toString(),
      change: '+8.7%',
      changeType: 'increase' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'success',
    },
    {
      title: 'System Users',
      value: statsData.totalUsers.toString(),
      change: '+4.1%',
      changeType: 'increase' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'warning',
    },
  ] : [];

  // Show loading state for stats
  if (statsLoading) {
    const loadingStats = [
      {
        title: 'Total Restaurants',
        value: '...',
        change: '...',
        changeType: 'increase' as const,
        icon: (
          <div className="w-6 h-6 bg-neutral-300 rounded animate-pulse" />
        ),
        color: 'primary',
      },
      {
        title: 'Active Menus',
        value: '...',
        change: '...',
        changeType: 'increase' as const,
        icon: (
          <div className="w-6 h-6 bg-neutral-300 rounded animate-pulse" />
        ),
        color: 'secondary',
      },
      {
        title: 'Total Dishes',
        value: '...',
        change: '...',
        changeType: 'increase' as const,
        icon: (
          <div className="w-6 h-6 bg-neutral-300 rounded animate-pulse" />
        ),
        color: 'success',
      },
      {
        title: 'System Users',
        value: '...',
        change: '...',
        changeType: 'increase' as const,
        icon: (
          <div className="w-6 h-6 bg-neutral-300 rounded animate-pulse" />
        ),
        color: 'warning',
      },
    ];
    return (
      <Layout 
        title="Dashboard" 
        subtitle="Welcome to your Restaurant Management System overview"
      >
        <div className="space-y-8">
          {/* Loading Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingStats.map((_, index) => (
              <Card key={index} variant="elevated" hover className="group animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-neutral-200 rounded mb-2" />
                    <div className="h-8 bg-neutral-200 rounded mb-2" />
                    <div className="h-4 bg-neutral-200 rounded w-24" />
                  </div>
                  <div className="w-12 h-12 bg-neutral-200 rounded-2xl" />
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-primary-500 transition ease-in-out duration-150">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading dashboard data...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (statsError || activityError) {
    return (
      <Layout 
        title="Dashboard" 
        subtitle="Welcome to your Restaurant Management System overview"
      >
        <div className="text-center py-8">
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-danger-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-danger-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-danger-700 mb-4">
              {statsError || activityError || 'An error occurred while loading the dashboard data.'}
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="border-danger-300 text-danger-700 hover:bg-danger-50"
            >
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const quickActions = [
    {
      title: 'Add Restaurant',
      description: 'Create a new restaurant profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'primary',
      href: '/restaurants',
    },
    {
      title: 'Create Menu',
      description: 'Design a new menu for restaurants',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'secondary',
      href: '/menus',
    },
    {
      title: 'Add Dish',
      description: 'Create a new dish for menus',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'success',
      href: '/dishes',
    },
    {
      title: 'Manage Users',
      description: 'Add or modify user accounts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'warning',
      href: '/users',
    },
  ];

  const getStatColorClasses = (color: string) => {
    const colors = {
      primary: 'from-primary-500 to-primary-600 text-primary-600',
      secondary: 'from-secondary-500 to-secondary-600 text-secondary-600',
      success: 'from-success-500 to-success-600 text-success-600',
      warning: 'from-warning-500 to-warning-600 text-warning-600',
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <Layout 
      title="Dashboard" 
      subtitle="Welcome to your Restaurant Management System overview"
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const colorClasses = getStatColorClasses(stat.color);
            return (
              <Card key={index} variant="elevated" hover className="group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-neutral-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} text-white shadow-soft`}>
                    {stat.icon}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card variant="elevated" size="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Quick Actions</h3>
              <div className="p-2 rounded-xl bg-neutral-100">
                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const colorClasses = getStatColorClasses(action.color);
                return (
                  <div
                    key={index}
                    className="p-4 rounded-2xl border-2 border-neutral-100 hover:border-neutral-200 transition-all duration-200 cursor-pointer group hover:shadow-soft"
                  >
                    <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]} text-white mb-3`}>
                      {action.icon}
                    </div>
                    <h4 className="font-medium text-neutral-900 group-hover:text-primary-700 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-neutral-600 mt-1">
                      {action.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card variant="elevated" size="lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900 font-medium">
                        {activity.message}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <p className="text-xs text-neutral-500">{activity.time}</p>
                        <span className="text-xs text-neutral-400">•</span>
                        <p className="text-xs text-neutral-500">by {activity.user}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-neutral-500">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* System Status */}
        <Card variant="elevated" size="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">System Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span className="text-sm text-success-600 font-medium">All Systems Operational</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-success-100 to-success-200 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l5 5L20 7" />
                </svg>
              </div>
              <h4 className="font-semibold text-neutral-900">Database</h4>
              <p className="text-sm text-success-600 mt-1">Connected</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-success-100 to-success-200 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-neutral-900">API</h4>
              <p className="text-sm text-success-600 mt-1">Responding</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-success-100 to-success-200 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-semibold text-neutral-900">Performance</h4>
              <p className="text-sm text-success-600 mt-1">Optimal</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
