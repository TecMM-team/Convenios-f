import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import { CircularProgress, Box } from "@mui/material";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
