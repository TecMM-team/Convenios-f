import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button
} from "@mui/material";
// Importa los iconos que usaremos
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BusinessIcon from "@mui/icons-material/Business"; // Icono de ejemplo para la organización

interface Paso1Props {
  setPaso: (paso: number) => void;
  setTipoOrganizacion: (organizacion: string) => void;
  tipoOrganizacion: string;
}

export default function Paso1({setPaso, setTipoOrganizacion, tipoOrganizacion}: Paso1Props) {

    const handleChange = (event: any) => {
      setTipoOrganizacion(event.target.value as string);
    };

    return (
        <Box
        sx={{
          bgcolor: "#6c757d", // Un color gris oscuro, similar al de la imagen
          color: "white", // Texto blanco dentro de este contenedor
          padding: { xs: 3, md: 5 },
          borderRadius: 2, // Bordes redondeados
          textAlign: "center",
          display: "flex", 
          flexDirection: "column",
          alignItems: "center",
          gap: 2, // Espacio entre elementos hijos
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", fontSize: { xs: "1.8rem", md: "2.2rem" } }}
        >
          BIENVENIDO AL ASISTENTE
        </Typography>

        <Typography variant="h6" sx={{ maxWidth: "500px", fontWeight: "normal", fontSize: "1.1rem" }}>
          Comencemos por identificar a la Organización. Por favor, seleccione el
          tipo de organización.
        </Typography>

        {/* Icono de placeholder */}
        <Box
          sx={{
            width: 100,
            height: 100,
            bgcolor: "rgba(255, 255, 255, 0.1)", // Círculo semitransparente
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            my: 2, // Margen vertical
          }}
        >
          <BusinessIcon
            sx={{ fontSize: 50, color: "rgba(255, 255, 255, 0.4)" }}
          />
        </Box>

        {/* Selector (Dropdown) */}
        <Select
          value={tipoOrganizacion}
          onChange={handleChange}
          sx={{
            bgcolor: "white",
            color: "black", 
            minWidth: 300,
            fontWeight: "medium",
            "& .MuiOutlinedInput-notchedOutline": { border: "none" }, // Quita el borde
            ".MuiSelect-select": { padding: "12px 24px" },
          }}
        >
          <MenuItem value="Empresa">Empresa - (Persona Moral)</MenuItem>
          <MenuItem value="Dependencia">Dependencia</MenuItem>
          <MenuItem value="Persona Fisica">Persona Física</MenuItem>
          {/* Agrega más opciones si es necesario */}
        </Select>

        {/* Botón de Continuar */}
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={() => setPaso(2)}
          sx={{
            mt: 2,
            padding: "10px 24px",
            fontSize: "1rem",
            fontWeight: "bold",
            textTransform: "none", // Evita que el texto sea mayúsculas
          }}
        >
          Continuar
        </Button>
      </Box>
    );
}