import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Rutas públicas (sin sesión)
  index("routes/Login.tsx"),
  // Rutas protegidas (con autenticación y layout con Sidebar)
  route("", "components/Protected/ProtectedRoute.tsx", [
    route("", "routes/layouts/ProtectedLayout.tsx", [
      route("convenios", "routes/Convenios.tsx", [
        route("crear", "routes/ConveniosRegistration.tsx"),
      ]),
      route("indicadores", "routes/Indicators.tsx"),
      route("configuracion", "routes/Settings.tsx"),
      route("cuentas", "routes/Accounts.tsx", [
        route("crear", "routes/AccountRegistration.tsx"),
        route(":accountId", "routes/AccountDetails.tsx"),
      ]),
      route("dashboard", "routes/Dashboard.tsx", [
        route(":userId", "routes/PersonalInfo.tsx"),
      ]),
    ]),
  ]),
  // Ruta catch-all para manejar 404s y peticiones especiales (como .well-known)
  route("*", "routes/$.tsx"),
] satisfies RouteConfig;
