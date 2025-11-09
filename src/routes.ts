// routes.ts
export const ROUTE_MAPPINGS = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin',
  PENDING_APPROVAL: '/pending-approval',
  PROJECTS: '/projects',
  TASKS: '/tasks',
  TEAM: '/team',
  FINANCIAL: '/financial',
  REPORTS: '/reports'
} as const;

export const saveLastRoute = (route: string) => {
  if (route !== ROUTE_MAPPINGS.LOGIN && route !== ROUTE_MAPPINGS.SIGNUP) {
    localStorage.setItem('lastRoute', route);
  }
};

export const getLastRoute = () => {
  return localStorage.getItem('lastRoute') || ROUTE_MAPPINGS.DASHBOARD;
};

export const isAuthRoute = (route: string) => {
  return route === ROUTE_MAPPINGS.LOGIN || route === ROUTE_MAPPINGS.SIGNUP;
};