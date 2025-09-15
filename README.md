# PURCH Frontend - Vue 3 Application

A modern, object-oriented frontend application for the PURCH purchasing system, built with Vue 3, TypeScript, and a comprehensive design system.

## 🏗️ Architecture Overview

This frontend application follows a **Domain-Driven Design (DDD)** and **Object-Oriented Programming (OOP)** architecture pattern, organized into distinct layers:

### Core Architecture Layers

- **Core Layer** (`src/core/`): Domain entities, business logic, and repository interfaces
- **Infrastructure Layer** (`src/infrastructure/`): API clients, repository implementations, and external service integrations
- **Application Layer** (`src/application/`): Application services that orchestrate business logic
- **Presentation Layer** (`src/presentation/`): Vue components, composables, and UI logic
- **Shared Layer** (`src/shared/`): Design system, utilities, and cross-cutting concerns

### Key Architectural Patterns

- **Repository Pattern**: Abstracted data access through interfaces
- **Service Layer**: Business logic encapsulation in application services
- **Dependency Injection**: Centralized service registration and resolution
- **Design System**: Consistent UI components with OOP base classes
- **Composition API**: Modern Vue 3 reactive patterns

## 🎨 Design System

The application features a comprehensive design system built with TypeScript classes and SCSS:

### Design Tokens
- **Colors**: Primary, secondary, semantic, and neutral color palettes
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Consistent spacing scale (4px base unit)
- **Border Radius**: Unified corner radius system
- **Shadows**: Layered shadow system for depth

### Component Architecture
- **BaseComponent**: Abstract base class for all UI components
- **BaseButton**: Extensible button component with variants and states
- **BaseCard**: Flexible card component with slots and interactions
- **BaseBadge**: Status and category indicators

## 🚀 Technology Stack

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Quasar** for UI framework and components
- **Pinia** for state management
- **Vue Router** for navigation
- **SCSS** for styling with design tokens
- **Vitest** for testing

## 📁 Project Structure

```
src/
├── core/                    # Domain layer
│   ├── entities/           # Business entities (Product, VendorSelection)
│   └── repositories/       # Repository interfaces
├── infrastructure/         # Infrastructure layer
│   ├── api/               # API client and HTTP utilities
│   └── repositories/      # Repository implementations
├── application/           # Application layer
│   └── services/          # Application services
├── presentation/          # Presentation layer
│   ├── components/        # Vue components
│   └── composables/       # Vue composables
├── shared/               # Shared utilities
│   ├── design-system/    # Design system components and styles
│   └── container/        # Dependency injection
├── stores/               # Pinia stores
├── components/           # Legacy Vue components
├── pages/                # Page components
└── services/             # Legacy services
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test` | Run unit tests |

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
VUE_APP_API_URL=http://localhost:8000/api
VUE_APP_FIREBASE_API_KEY=your_firebase_key
VUE_APP_FIREBASE_AUTH_DOMAIN=your_domain
VUE_APP_FIREBASE_PROJECT_ID=your_project_id
```

### Vite Configuration
The project uses Vite for development and building. Configuration can be found in `vite.config.ts`.

## 🧪 Testing

The application includes comprehensive testing setup:

### Test Structure
- **Unit Tests**: Test individual components and services
- **Integration Tests**: Test component interactions
- **Architecture Tests**: Test domain logic and business rules

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🎯 Key Features

### Product Management
- Product catalog with search and filtering
- Product detail views with vendor information
- Inventory tracking and management

### Vendor Selection
- Multi-vendor comparison
- Vendor selection workflows
- Vendor performance tracking

### Order Management
- Order creation and editing
- Order status tracking
- Order history and reporting

### Authentication
- Firebase authentication integration
- JWT token management
- Role-based access control

## 🔄 State Management

The application uses Pinia for state management with the following stores:

- **Auth Store**: User authentication and session management
- **Product Store**: Product data and operations
- **Vendor Store**: Vendor information and selection
- **Order Store**: Order management and tracking
- **Settings Store**: Application configuration

## 🎨 Styling Guidelines

### Design System Usage
1. Use design tokens for consistent spacing, colors, and typography
2. Extend base component classes for custom components
3. Follow the established component hierarchy
4. Use SCSS mixins for common patterns

### Component Development
1. Create TypeScript classes that extend base components
2. Implement proper lifecycle methods
3. Use composition API for reactive logic
4. Follow naming conventions (PascalCase for components)

## 🚀 Deployment

### Production Build
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Environment-Specific Builds
Configure different environment variables for development, staging, and production environments.

## 📚 Documentation

- **Architecture Design**: See `ARCHITECTURE_DESIGN.md` for detailed architecture documentation
- **API Integration**: See `FRONTEND_INTEGRATION_GUIDE.md` for API integration details
- **Component Library**: See individual component files for usage examples

## 🤝 Contributing

1. Follow the established architecture patterns
2. Write tests for new features
3. Use TypeScript for type safety
4. Follow the design system guidelines
5. Update documentation as needed

## 📄 License

This project is part of the PURCH purchasing system. All rights reserved.
