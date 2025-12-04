# Frontend Development Guide

> **Stack**: React 18, TypeScript, Vite, TailwindCSS, React Router, Axios
> **State Management**: React Context + localStorage
> **i18n**: react-i18next (Portuguese default)

---

## 1. Directory Structure

```
frontend/src/
├── App.tsx                   # Root component with routing
├── main.tsx                  # React entry point
├── index.css                 # Tailwind imports
├── pages/                    # Page components (routes)
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── TasksPage.tsx
│   ├── KanbanPage.tsx
│   └── ProjectsPage.tsx
├── components/               # Reusable components
│   ├── Layout.tsx           # Main layout (header, sidebar)
│   ├── TaskDetailsModal.tsx # Task editing modal
│   ├── ProtectedRoute.tsx   # Auth guard
│   └── AboutModal.tsx
├── contexts/                 # React contexts
│   └── AuthContext.tsx      # Authentication state
├── services/                 # API clients
│   ├── api.ts               # Axios instance with interceptors
│   ├── authService.ts
│   ├── projectService.ts
│   ├── commentService.ts
│   └── attachmentService.ts
├── types/                    # TypeScript interfaces
│   └── task.ts
├── utils/                    # Utility functions
│   └── dateFormatter.ts
└── i18n/                     # Internationalization
    ├── config.ts
    └── locales/
        ├── en.json
        └── pt.json
```

---

## 2. Commands

```bash
# All commands via Docker
docker-compose exec frontend <command>

# Or locally in frontend/
npm run dev                   # Start Vite dev server (port 3000)
npm run build                 # Production build
npm run preview               # Preview production build
npm run lint                  # ESLint check
```

---

## 3. Component Patterns

### Protected Routes

```tsx
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

### Usage in App.tsx

```tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/tasks" element={
    <ProtectedRoute>
      <TasksPage />
    </ProtectedRoute>
  } />
</Routes>
```

### Layout Component

```tsx
// components/Layout.tsx
export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <Link to="/tasks" className="text-xl font-bold">
            Projeto Agiliza
          </Link>
          <div className="flex items-center gap-4">
            <span>{user?.email}</span>
            <button onClick={logout}>{t('auth.logout')}</button>
          </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
```

---

## 4. Authentication Context

```tsx
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 5. API Integration

### Axios Configuration

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Example

```typescript
// services/authService.ts
import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },
};
```

### Vite Proxy Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:3001',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 6. Styling (TailwindCSS)

### Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### Common Patterns

```tsx
// Button variants
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Primary
</button>
<button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded">
  Secondary
</button>
<button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
  Danger
</button>

// Card
<div className="bg-white shadow-md rounded-lg p-6">
  <h2 className="text-xl font-semibold mb-4">Card Title</h2>
  <p className="text-gray-600">Content</p>
</div>

// Form input
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Enter text..."
/>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} item={item} />)}
</div>

// Flex layout
<div className="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>
```

---

## 7. Internationalization (i18n)

### Configuration

```typescript
// i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import pt from './locales/pt.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
    },
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### Usage

```tsx
import { useTranslation } from 'react-i18next';

const TasksPage = () => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('tasks.title')}</h1>

      {/* Language switcher */}
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="pt">Portugues</option>
        <option value="en">English</option>
      </select>
    </div>
  );
};
```

### Translation Structure

```json
// i18n/locales/pt.json
{
  "common": {
    "loading": "Carregando...",
    "save": "Salvar",
    "cancel": "Cancelar",
    "delete": "Excluir",
    "edit": "Editar"
  },
  "auth": {
    "login": "Entrar",
    "logout": "Sair",
    "register": "Registrar",
    "email": "E-mail",
    "password": "Senha"
  },
  "tasks": {
    "title": "Minhas Tarefas",
    "create": "Nova Tarefa",
    "status": {
      "pending": "Pendente",
      "in_progress": "Em Progresso",
      "completed": "Concluida"
    },
    "priority": {
      "low": "Baixa",
      "medium": "Media",
      "high": "Alta"
    }
  }
}
```

---

## 8. Icons (Lucide React)

```tsx
import {
  Calendar,
  User,
  CheckSquare,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  X
} from 'lucide-react';

// Usage
<Calendar className="w-5 h-5 text-gray-500" />
<Plus className="w-4 h-4" />
<Trash2 className="w-4 h-4 text-red-500" />
```

---

## 9. TypeScript Types

```typescript
// types/task.ts
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  projectId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'gestor' | 'colaborador';
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}
```

---

## 10. Environment Variables

| Variable | Description |
|----------|-------------|
| VITE_API_URL | API base URL (optional, uses proxy in dev) |

Access in code:

```typescript
const apiUrl = import.meta.env.VITE_API_URL || '/api';
```

---

## 11. Common Tasks

### Adding a New Page

1. Create page component in `pages/NewPage.tsx`
2. Add route in `App.tsx`:
   ```tsx
   <Route path="/new-page" element={
     <ProtectedRoute>
       <NewPage />
     </ProtectedRoute>
   } />
   ```
3. Add navigation link in `Layout.tsx`
4. Add translations in `i18n/locales/*.json`

### Adding a New API Service

1. Create service file in `services/newService.ts`
2. Import `api` from `./api`
3. Export service methods
4. Use in components with `useState` and `useEffect`

### Creating a Reusable Component

1. Create component in `components/`
2. Define props interface
3. Use Tailwind for styling
4. Add to relevant pages
