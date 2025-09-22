import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (key: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isMenuExpanded = (key: string) => {
    return expandedMenus[key] || false;
  };

  const isSubmenuActive = (subItems: any[]) => {
    return subItems?.some(item => location.pathname === item.path) || false;
  };

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21V5a2 2 0 012-2h4a2 2 0 012 2v16" />
        </svg>
      ),
    },
    {
      key: 'restaurants',
      label: 'Restaurants',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      subItems: [
        {
          path: '/restaurants',
          label: 'All Restaurants',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
        {
          path: '/restaurant-locations',
          label: 'Locations',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
      ],
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      path: '/locations',
      label: 'Locations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      path: '/dishes',
      label: 'Dishes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      path: '/menus',
      label: 'Menus',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      path: '/users',
      label: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      path: '/error-logs',
      label: 'Error Logs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-20' : 'w-72'
    } bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 shadow-hard animate-slide-in`}>
      {/* Header */}
      <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-primary-700 to-primary-600 shadow-medium">
        {!isCollapsed && (
          <div className="animate-fade-in">
            <h1 className="text-white text-xl font-bold font-display">
              RestaurantOS
            </h1>
            <p className="text-primary-200 text-xs mt-0.5">Management System</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl text-white hover:bg-white/10 transition-all duration-200 transform hover:scale-105"
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-8 px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            // Handle items with subitems
            if (item.subItems) {
              const isActive = isSubmenuActive(item.subItems);
              const isExpanded = isMenuExpanded(item.key);
              
              return (
                <div key={item.key}>
                  {/* Main menu item with submenu */}
                  <button
                    onClick={() => !isCollapsed && toggleMenu(item.key)}
                    className={`group flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 transform hover:scale-105 relative ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-glow'
                        : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full animate-fade-in" />
                      )}
                      
                      <span className={`${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-white'} transition-colors duration-200`}>
                        {item.icon}
                      </span>
                      
                      {!isCollapsed && (
                        <span className="ml-4 animate-fade-in">
                          {item.label}
                        </span>
                      )}
                    </div>
                    
                    {/* Expand/Collapse arrow */}
                    {!isCollapsed && (
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        } ${isActive ? 'text-white' : 'text-neutral-400'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-neutral-800 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-medium">
                        {item.label}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-neutral-800 rotate-45" />
                      </div>
                    )}
                  </button>
                  
                  {/* Submenu items */}
                  {!isCollapsed && isExpanded && (
                    <div className="ml-6 mt-2 space-y-1 animate-fade-in">
                      {item.subItems.map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                              isSubActive
                                ? 'bg-primary-500/20 text-primary-200 border-l-2 border-primary-400'
                                : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span className={`${isSubActive ? 'text-primary-200' : 'text-neutral-500 group-hover:text-white'} transition-colors duration-200`}>
                              {subItem.icon}
                            </span>
                            
                            <span className="ml-3">
                              {subItem.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            // Handle simple menu items
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 transform hover:scale-105 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-glow'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full animate-fade-in" />
                )}
                
                <span className={`${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-white'} transition-colors duration-200`}>
                  {item.icon}
                </span>
                
                {!isCollapsed && (
                  <span className="ml-4 animate-fade-in">
                    {item.label}
                  </span>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-neutral-800 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-medium">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-neutral-800 rotate-45" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-900 to-transparent">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-2xl bg-white/5 border border-white/10`}>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <p className="text-sm font-medium text-white truncate max-w-32">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-neutral-400 truncate max-w-32">
                {user?.email || 'admin@example.com'}
              </p>
            </div>
          )}
          
          <button
            onClick={logout}
            className={`p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-danger-600 transition-all duration-200 transform hover:scale-105 group ${
              isCollapsed ? 'relative' : ''
            }`}
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            
            {/* Tooltip for logout */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-neutral-800 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-medium">
                Logout
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-neutral-800 rotate-45" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
