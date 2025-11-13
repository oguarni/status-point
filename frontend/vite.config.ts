import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Port configuration
    port: 3000,

    // CRITICAL: Host must be '0.0.0.0' for Docker container accessibility
    // By default, Vite binds to 'localhost' which is only accessible inside the container
    // '0.0.0.0' makes Vite listen on all network interfaces, allowing external access
    host: '0.0.0.0',

    // Proxy configuration
    // This proxies API requests from the frontend to the backend service
    // Without this, the frontend would need to know the backend's URL
    // With this, the frontend can use relative URLs (e.g., '/api/tasks')
    proxy: {
      // Route all requests starting with '/api' to the backend service
      '/api': {
        // Target: Backend service name from docker-compose.yml
        // Docker's internal DNS resolves 'backend' to the backend container's IP
        target: 'http://backend:3001',

        // changeOrigin: Changes the origin of the host header to the target URL
        // This is required for some backends that check the 'Host' header
        changeOrigin: true,

        // rewrite: (Optional) Modify the path before forwarding
        // Example: '/api/tasks' -> '/tasks' (remove '/api' prefix)
        // Not needed here since our backend expects '/api' in the path
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
