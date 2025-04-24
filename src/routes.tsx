import { Navigate, RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "./components/protected-route";

import Login from "./pages/login";
import Register from "./pages/register";

// Implementar lazy loading para componentes de rutas protegidas
const Events = lazy(() => import("./pages/events"));
const EventForm = lazy(() => import("./pages/event-form"));

// Componente de carga para usar con Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <p>Cargando...</p>
  </div>
);

// Public routes that don't require authentication
export const publicRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
];

// Protected routes that require authentication
export const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/events",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Events />
          </Suspense>
        ),
      },
      {
        path: "/event/create",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <EventForm />
          </Suspense>
        ),
      },
      {
        path: "/event/edit/:id",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <EventForm />
          </Suspense>
        ),
      },
      // Root path redirects to events
      {
        path: "/",
        element: <Navigate to="/events" replace />,
      },
    ],
  },
];

// Fallback route for any unmatched paths
// Only redirect to events if not on a public route
export const fallbackRoutes: RouteObject[] = [
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
];

// Combine all routes with correct priority order:
// 1. Public routes first (so they're checked first)
// 2. Protected routes
// 3. Fallback routes for any unmatched paths
export const routes: RouteObject[] = [
  ...publicRoutes,
  ...protectedRoutes,
  ...fallbackRoutes,
];
