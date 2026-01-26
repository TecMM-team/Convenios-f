import { Box, Stack, Typography, Button, IconButton, Badge } from "@mui/material";
import { useNavigate } from "react-router";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AccountsSearchBar from "./AccountsSearchBar";
import "./styles/AccountsHeader.css";

interface AccountsHeaderProps {
  onSearch: (value: string) => void; // recibe la función de búsqueda desde el padre
}

export default function AccountsHeader({ onSearch }: AccountsHeaderProps) {
  const navigate = useNavigate();

  return (
    <Box className="accounts-header" sx={{ mb: 3 }}>
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
          Gestión de Cuentas
        </Typography>

        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Icono de notificaciones */}
          <IconButton
            sx={{
              backgroundColor: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderRadius: "50%",
              width: 40,
              height: 40,
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            <Badge
              color="primary"
              variant="dot"
              overlap="circular"
              sx={{
                "& .MuiBadge-dot": {
                  top: "6px",
                  right: "6px",
                  backgroundColor: "rgba(51, 23, 156, 0.9)",
                },
              }}
            >
              <NotificationsNoneOutlinedIcon sx={{ color: "#374151" }} />
            </Badge>
          </IconButton>

          {/* Botón de nueva cuenta */}
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
            onClick={() => navigate("/cuentas/crear")}
          >
            Nueva Cuenta
          </Button>
        </Stack>
      </Stack>

      {/* Barra de búsqueda */}
      <AccountsSearchBar onSearch={onSearch} />
    </Box>
  );
}
