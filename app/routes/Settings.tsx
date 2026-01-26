import Breadcrumbs from "~/common/Breadcrumbs/Breadcrumbs";
import ChangeForm from "~/components/Settingsc/changeForm";
import { Box, Typography } from "@mui/material";

export default function Settings() {
  const isRoot = location.pathname === "/configuracion";

  return (
    <Box sx={{ p: 3 }}>
      
      <Breadcrumbs
        items={[
          { label: "Configuracion"},
          { label: "Cambio de contraseña" },
        ]}
      />
      
      <Box 
        sx={{
          mt: 3,
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Cambiar Contraseña
        </Typography>

        <ChangeForm  />
      </Box>
    </Box>
  )
}