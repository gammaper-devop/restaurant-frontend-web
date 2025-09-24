import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, Button, Table, Modal, Input, ConfirmDialog, Toast } from '../components/ui';
import { categoriesService } from '../services/api';
import type { Category } from '../types';

interface CategoryFormData {
  id?: number;
  name: string;
  active: boolean;
}

const Categories: React.FC = () => {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formLoading, setFormLoading] = useState(false);
  
  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Success/Error messages
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await categoriesService.getAll();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setError(null);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Error loading categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (name: keyof CategoryFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      errors.name = 'Category name must be less than 50 characters';
    }
    
    // Check for duplicate names (excluding current category when editing)
    const duplicateCategory = categories.find(cat => 
      cat.name.toLowerCase() === formData.name.trim().toLowerCase() && 
      cat.id !== formData.id
    );
    if (duplicateCategory) {
      errors.name = 'A category with this name already exists';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create new category
  const handleCreateCategory = () => {
    setFormData({
      name: '',
      active: true,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    setFormData({
      id: category.id,
      name: category.name,
      active: category.active,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setFormLoading(true);
    try {
      const categoryData = {
        name: formData.name.trim(),
        active: formData.active,
      };
      
      if (formData.id) {
        // Update existing category
        await categoriesService.update(formData.id, categoryData);
        setSuccessMessage(`Category "${categoryData.name}" updated successfully`);
        setIsEditModalOpen(false);
        setCategoryToEdit(null);
      } else {
        // Create new category - simplificado
        await categoriesService.create(categoryData as any);
        setSuccessMessage(`Category "${categoryData.name}" created successfully`);
        setIsCreateModalOpen(false);
      }
      
      setShowSuccessToast(true);
      await loadCategories(); // Refresh categories
    } catch (error) {
      console.error('Error saving category:', error);
      setFormErrors({ general: 'Error saving category. Please try again.' });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete category
  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmedDelete = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    try {
      await categoriesService.softDelete(categoryToDelete.id);
      setSuccessMessage(`Category "${categoryToDelete.name}" deleted successfully`);
      setShowSuccessToast(true);
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
      await loadCategories(); // Refresh categories
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (category: Category) => {
    try {
      await categoriesService.toggleActive(category.id);
      setSuccessMessage(`Category "${category.name}" ${category.active ? 'deactivated' : 'activated'} successfully`);
      setShowSuccessToast(true);
      await loadCategories(); // Refresh categories
    } catch (error) {
      console.error('Error toggling category status:', error);
      alert('Error updating category status. Please try again.');
    }
  };

  // Handle close modals
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setFormData({ name: '', active: true });
    setFormErrors({});
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCategoryToEdit(null);
    setFormData({ name: '', active: true });
    setFormErrors({});
  };

  // Filter and search categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === 'all' || 
      (filterActive === 'active' && category.active) ||
      (filterActive === 'inactive' && !category.active);
    return matchesSearch && matchesFilter;
  });

  // Table columns
  const columns = [
    {
      key: 'name',
      label: 'Category Name',
      sortable: true,
      render: (value: string, row: Category) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center text-white font-semibold">
            {value.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-neutral-900">{value}</p>
            <p className="text-sm text-neutral-500">ID: {row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-success-100 text-success-800' : 'bg-neutral-100 text-neutral-600'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => (
        <div className="text-sm">
          <div>{new Date(value).toLocaleDateString()}</div>
          <div className="text-neutral-500">{new Date(value).toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Category) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditCategory(row)}
            title="Edit category"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleActive(row)}
            title={row.active ? 'Deactivate' : 'Activate'}
            className={row.active ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
            icon={
              row.active ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteCategory(row)}
            title="Delete category"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          />
        </div>
      ),
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <Layout 
        title="Categories" 
        subtitle="Manage restaurant categories"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-neutral-600">Loading categories...</span>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout 
        title="Categories" 
        subtitle="Manage restaurant categories"
      >
        <Card className="p-8 text-center">
          <div className="text-danger-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Categories</h3>
          <p className="text-neutral-600 mb-4">{error}</p>
          <Button variant="primary" onClick={loadCategories}>
            Retry
          </Button>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Categories" 
      subtitle="Manage restaurant categories"
    >
      <div className="space-y-8">
        {/* Actions Bar */}
        <Card variant="elevated" className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="flex items-center space-x-2 bg-neutral-100 rounded-xl px-3 py-2">
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="bg-transparent border-0 outline-none text-sm placeholder-neutral-500 min-w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filter */}
              <select 
                className="bg-white border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
              >
                <option value="all">All Categories</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="md"
                onClick={loadCategories}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleCreateCategory}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Add Category
              </Button>
            </div>
          </div>
        </Card>

        {/* Categories Table */}
        <Table
          columns={columns}
          data={filteredCategories}
          variant="striped"
          emptyMessage="No categories found. Create your first category to get started."
        />

        {/* Create Category Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          title="Create New Category"
          size="md"
        >
          <CategoryForm
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={handleCloseCreateModal}
            loading={formLoading}
            errors={formErrors}
          />
        </Modal>

        {/* Edit Category Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          title={`Edit Category: ${categoryToEdit?.name || ''}`}
          size="md"
        >
          <CategoryForm
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={handleCloseEditModal}
            loading={formLoading}
            errors={formErrors}
            isEdit
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setCategoryToDelete(null);
          }}
          onConfirm={handleConfirmedDelete}
          title="Delete Category"
          message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone and may affect restaurants using this category.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          type="danger"
          loading={isDeleting}
        />

        {/* Success Toast */}
        <Toast
          message={successMessage}
          type="success"
          duration={5000}
          isVisible={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
        />
      </div>
    </Layout>
  );
};

// Category Form Component
interface CategoryFormProps {
  formData: CategoryFormData;
  onInputChange: (name: keyof CategoryFormData, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  errors: Record<string, string>;
  isEdit?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  loading,
  errors,
  isEdit = false,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Input
        label="Category Name"
        value={formData.name}
        onChange={(e) => onInputChange('name', e.target.value)}
        required
        placeholder="e.g. Italian, Fast Food, Mexican"
        error={errors.name}
      />
      
      {/* Active Status Toggle */}
      <div className="flex items-center space-x-3">
        <input
          id="active"
          type="checkbox"
          checked={formData.active}
          onChange={(e) => onInputChange('active', e.target.checked)}
          className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
        />
        <label htmlFor="active" className="block text-sm font-medium text-neutral-700">
          Active Category
        </label>
      </div>
      
      {errors.general && (
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
          <p className="text-sm text-danger-600">{errors.general}</p>
        </div>
      )}
      
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {isEdit ? 'Update' : 'Create'} Category
        </Button>
      </div>
    </form>
  );
};

export default Categories;
