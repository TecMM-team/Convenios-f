import { Box, Stack, Typography, Button, IconButton, Badge } from "@mui/material";
import { useNavigate } from "react-router";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ConveniosSearchBar from "./ConveniosSearchBar";
import NotificationBell from "~/common/Notification/NotificationBell";
import { useAuthContext } from "~/context/AuthContext";
import "./styles/ConveniosSearchBar.css"

interface ConveniosHeaderProps {
  onSearch: (value: string) => void; // recibe la función de búsqueda desde el padre
}

export default function ConveniosHeader({ onSearch }: ConveniosHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  return (
    <Box className="convenios-header" sx={{ mb: 3 }}>
      {/* Encabezado superior con título y botones */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: "madaniArabicMedium",
            fontSize: "1.8rem",
            color: "#1e1e2f",
          }}
        >
          Gestión de Convenios
        </Typography>

        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Información del usuario */}
          <Typography
            sx={{
              fontFamily: "madaniArabicRegular",
              fontSize: "0.95rem",
              color: "#4b5563",
              mr: 1,
            }}
          >
            {user?.nombre} - <span style={{ fontWeight: 500, color: "#1e1e2f" }}>{user?.rol}</span>
          </Typography>

          {/* Icono de notificaciones */}
          <NotificationBell />

          {/* Botón de nuevo convenio */}
          <Button
            variant="contained"
            sx={{
              backgroundColor: "rgba(51, 23, 156, 0.9)",
              textTransform: "none",
              fontFamily: "madaniArabicRegular",
              borderRadius: "8px",
              fontSize: "1rem",
              padding: "0.6rem 1.4rem",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              "&:hover": {
                backgroundColor: "rgb(51, 23, 156)",
              },
            }}
            onClick={() => navigate("/convenios/crear")}
          >
            Nuevo Convenio
          </Button>
        </Stack>
      </Stack>

      {/* Barra de búsqueda */}
      <ConveniosSearchBar onSearch={onSearch} />
    </Box>
  );
}