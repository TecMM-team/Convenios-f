import { Box, Typography } from "@mui/material";
import ConveniosPasos from "~/components/Convenios/pasos";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { getData } from "~/utils/apiUtils";

export default function ConveniosRegistartion() {
  const [paso, setPaso] = useState(1);
  const [searchParams] = useSearchParams();
  const numeroConvenio = searchParams.get('numero_convenio');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargarConvenio = async () => {
      if (numeroConvenio) {
        try {
          const response = await getData({
            endpoint: `/convenios/draft/${numeroConvenio}`
          });
          
          if (response.statusCode === 201 && response.data?.convenio) {
            const convenio = response.data.convenio;
            // Establecer el paso como ultimo_paso + 1
            const pasoInicial = Math.min((convenio.ultimo_paso || 0) + 1, 5);
            setPaso(pasoInicial);
          }
        } catch (error) {
          console.error('Error al cargar convenio:', error);
        }
      }
      setIsLoading(false);
    };
    
    cargarConvenio();
  }, [numeroConvenio]);

  if (isLoading && numeroConvenio) {
    return null; // O un spinner de carga
  }

  return (
    <>
      <Typography
        variant="h5"
        sx={{
          fontFamily: "madaniArabicMedium",
          fontSize: "2rem",
          color: "#1e1e2f",
        }}
      >
        Asistente para nuevos Convenios
      </Typography>
      
      <Box  sx={{
        p: { xs: 2.5, md: 3 },
        border: "1px solid #e6e8ef",
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
        width: "90%",
        margin: "auto",
      }}>
        <ConveniosPasos paso={paso} setPaso={setPaso}/>
      </Box>
    </>
  )
}
