import { BrowserRouter, useRoutes } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import { EventsProvider } from './lib/events-context';
import { Toaster } from './lib/toaster';
import { routes } from './routes';

// AppRoutes component to render the routes using useRoutes hook
function AppRoutes() {
  const routeElements = useRoutes(routes);
  return routeElements;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EventsProvider>
          <AppRoutes />
          <Toaster />
        </EventsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
