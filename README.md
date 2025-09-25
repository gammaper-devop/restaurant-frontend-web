# 🍽️ RestaurantOS - Management System Frontend

A modern, professional restaurant management system built with React, TypeScript, and Tailwind CSS. This frontend application provides a beautiful, responsive interface for managing restaurants, menus, users, and more.

![RestaurantOS Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.13-06B6D4)

## ✨ Features

### 🎨 **Modern Design System**
- **Glass Morphism UI** - Beautiful frosted glass effects and modern aesthetics
- **Professional Color Palette** - Custom primary, secondary, success, warning, and danger colors
- **Smooth Animations** - Subtle fade-ins, hover effects, and micro-interactions
- **Responsive Design** - Mobile-first approach that works on all devices
- **Visual State Indicators** - Color-coded status indicators for active/inactive items

### 🏗️ **Core Functionality**
- **Authentication System** - Secure login with beautiful UI
- **Dashboard Overview** - Comprehensive stats cards and system monitoring
- **Restaurant Management** - Complete CRUD operations with soft delete support
- **Location Management** - Multi-location restaurant support with geographic hierarchy
- **Smart Filtering** - Advanced filtering for active/inactive items across all modules
- **User Management** - Role-based access control with permission management
- **Data Tables** - Professional tables with sorting, filtering, and visual status indicators
- **Responsive Navigation** - Collapsible sidebar with modern icons

### 🛠️ **Technical Features**
- **TypeScript Support** - Full type safety throughout the application
- **Component Library** - Reusable UI components (Cards, Buttons, Inputs, Tables)
- **Modern Routing** - React Router v7 with protected routes
- **API Integration** - Axios-based API service layer with comprehensive error handling
- **Build Optimization** - Vite for fast development and production builds
- **Soft Delete System** - Non-destructive data management with recovery capabilities

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd restaurant_app/frontend-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API base URL
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/           # Reusable components
│   ├── ui/              # UI component library
│   │   ├── Card.tsx     # Professional card component
│   │   ├── Button.tsx   # Multi-variant button component
│   │   ├── Input.tsx    # Form input with validation
│   │   ├── Table.tsx    # Data table with sorting & filtering
│   │   ├── Modal.tsx    # Modal dialog component
│   │   ├── Toast.tsx    # Success/error notifications
│   │   └── ConfirmDialog.tsx # Confirmation dialogs
│   ├── Layout.tsx       # Main layout wrapper
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── ProtectedRoute.tsx # Route protection
│   ├── RestaurantForm.tsx # Restaurant creation form
│   ├── RestaurantDetailsModal.tsx # Restaurant details view
│   └── EditRestaurantModal.tsx # Restaurant edit form
├── pages/               # Page components
│   ├── Login.tsx        # Authentication page
│   ├── Dashboard.tsx    # Main dashboard with stats
│   ├── Restaurants.tsx  # Restaurant management with filtering
│   ├── RestaurantLocations.tsx # Location management system
│   ├── Categories.tsx   # Category management
│   ├── Users.tsx        # User management
│   └── ...
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state
├── services/            # API services
│   └── api.ts          # HTTP client and all services
├── types/               # TypeScript type definitions
│   └── index.ts        # Shared interfaces
└── App.tsx             # Main app component
```

## 🎨 Design System

### Color Palette

```css
Primary Colors:   #dc2626 → #450a0a (Red spectrum)
Secondary Colors: #0284c7 → #082f49 (Blue spectrum)
Success Colors:   #16a34a → #052e16 (Green spectrum)
Warning Colors:   #d97706 → #451a03 (Orange spectrum)
Danger Colors:    #dc2626 → #450a0a (Red spectrum)
Neutral Colors:   #fafafa → #0a0a0a (Gray spectrum)
```

### Typography

- **Primary Font**: Inter (Google Fonts)
- **Display Font**: Cal Sans (for headings)
- **Font Sizes**: 2xs (10px) → 9xl (128px)

### Components

All components support multiple variants, sizes, and states:

- **Cards**: `default | elevated | outlined | glass`
- **Buttons**: `primary | secondary | success | warning | danger | ghost | outline`
- **Inputs**: `default | filled | outlined`
- **Tables**: `default | striped | bordered`

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

## 📱 Responsive Breakpoints

```css
sm:  640px   # Small tablets
md:  768px   # Tablets  
lg:  1024px  # Small laptops
xl:  1280px  # Laptops
2xl: 1536px  # Large screens
```

## 🛡️ Soft Delete System

A comprehensive soft delete system ensures data integrity and recovery:

### 🔄 **Core Features**
- **Non-Destructive Deletion**: Items are marked as inactive instead of permanent deletion
- **Visual Differentiation**: Inactive items display with grayed-out styling and clear indicators
- **Smart Filtering**: Toggle between showing active-only or all items
- **Cascade Soft Delete**: Restaurant deletion automatically soft-deletes related locations
- **Recovery Ready**: Soft-deleted items remain in database for potential recovery

### 🎨 **Visual Indicators**
- **Inactive Items**: Grayed icons, struck-through text, "Inactiva" badges
- **Filter Controls**: Checkbox toggles to show/hide inactive items
- **Count Displays**: Clear indication of active vs total items
- **Status Badges**: Color-coded status indicators throughout the UI

### 📊 **Affected Modules**
- **Restaurant Management**: Soft delete restaurants with cascade to locations
- **Location Management**: Individual location soft delete with visual feedback
- **Restaurant Details**: Filtered views showing only active locations
- **All Restaurants View**: Consistent filtering across all restaurant displays

## 🔐 Authentication

The app includes a complete authentication system:

- **Login Page**: Beautiful glass morphism design
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Auth Context**: Global authentication state management
- **Token Management**: Secure token storage and refresh

### Default Credentials
```
Email: admin@example.com
Password: your-password
```

## 🏢 Pages Overview

### 🏠 Dashboard
- **System Overview**: Key metrics and statistics
- **Recent Activity**: Live activity feed
- **Quick Actions**: Common management tasks
- **System Status**: Real-time health monitoring

### 🍽️ Restaurant Management
- **Restaurant Profiles**: Complete restaurant information with image support
- **Multi-Location System**: Advanced location management with geographic hierarchy
- **Smart Filtering**: Filter active/inactive restaurants and locations
- **Visual Status Indicators**: Color-coded status with inactive item styling
- **Soft Delete Protection**: Non-destructive deletion with recovery capabilities
- **Category Organization**: Restaurant categorization with filtering
- **Location Details View**: Comprehensive location information with maps integration
- **Batch Operations**: Efficient management of multiple locations

### 👥 User Management
- **User Accounts**: Complete user profile management
- **Role Management**: Admin, Manager, Staff roles
- **Permission System**: Granular access control
- **Activity Tracking**: User login and activity logs

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------||---------|
| **React** | 19.1.1 | UI Framework |
| **TypeScript** | 5.8.3 | Type Safety |
| **Tailwind CSS** | 4.1.13 | Styling Framework |
| **Vite** | 7.1.2 | Build Tool |
| **React Router** | 7.8.2 | Routing |
| **Axios** | 1.12.0 | HTTP Client |

## 🎯 Best Practices

### Code Organization
- **Component Co-location**: Keep related files together
- **TypeScript First**: Strong typing for reliability
- **Reusable Components**: DRY principle throughout
- **Consistent Naming**: Clear, descriptive component names

### Performance
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Builds**: Vite's fast bundling
- **Image Optimization**: Responsive image handling

### Accessibility
- **Semantic HTML**: Proper HTML structure
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliant color ratios

## 🔄 API Integration

The frontend is designed to work with a REST API backend:

```typescript
// Example API endpoint usage
const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication
POST /api/users/login
GET  /api/users/profile

// Restaurant Management  
GET    /api/restaurants              # Get all restaurants with locations
POST   /api/restaurants              # Create new restaurant
PUT    /api/restaurants/:id          # Update restaurant
DELETE /api/restaurants/:id          # Soft delete restaurant (cascade)

// Location Management
GET    /api/restaurants/locations    # Get all locations
GET    /api/restaurants/:id/locations # Get locations by restaurant
POST   /api/restaurants/locations    # Create new location
PUT    /api/restaurants/locations/:id # Update location
DELETE /api/restaurants/locations/:id # Soft delete location

// Category Management
GET    /api/categories               # Get all categories
POST   /api/categories               # Create category
PUT    /api/categories/:id           # Update category
DELETE /api/categories/:id           # Soft delete category
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The `dist` folder contains the production-ready files.

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=RestaurantOS
VITE_APP_VERSION=1.0.0
```

### Deployment Platforms

The app can be deployed to:
- **Vercel** (Recommended)
- **Netlify** 
- **AWS S3 + CloudFront**
- **GitHub Pages**

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@restaurantos.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 Documentation: [Full Documentation](https://docs.restaurantos.com)

## 🆕 Recent Updates

### Version 2.1.0 - Enhanced Location Management

#### 🎆 **New Features**
- **🛡️ Comprehensive Soft Delete System**: Non-destructive data management across all modules
- **📍 Advanced Location Management**: Multi-location restaurant support with geographic hierarchy
- **🎨 Visual Status Indicators**: Color-coded inactive items with clear visual differentiation
- **⚙️ Smart Filtering Controls**: Toggle visibility of active/inactive items throughout the UI
- **🔄 Cascade Operations**: Restaurant deletion automatically handles related locations

#### 🐛 **Bug Fixes & Improvements**
- **🧙 Console Cleanup**: Removed debug logs while preserving error handling
- **📊 Accurate Counters**: Fixed location counts to show only active items by default
- **🔧 API Error Handling**: Enhanced error management in location operations
- **📱 Responsive Design**: Improved mobile experience for location management
- **⚡ Performance**: Optimized filtering and state management

#### 📦 **Technical Enhancements**
- Enhanced API service layer with comprehensive error handling
- Improved TypeScript definitions for location management
- Better state management for filtered views
- Consistent UI patterns across all management modules

## 🙏 Acknowledgments

- **Tailwind CSS** - For the amazing utility-first CSS framework
- **React Team** - For the incredible React ecosystem
- **TypeScript** - For making JavaScript development safer
- **Vite** - For the lightning-fast build tool
- **Inter Font** - For beautiful, professional typography

---

**RestaurantOS Frontend** - Built with ❤️ for restaurant management excellence.

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red)
![Professional Grade](https://img.shields.io/badge/Quality-Professional%20Grade-gold)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen)
