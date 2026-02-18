import {
  Box,
  Typography,
  Button,
  Link,
  Avatar,
  Stack,
  Alert,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Paso1 from "./paso1";
import Paso4 from "./paso4";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FormEmpresa from "./formEmpresa";
import FormDependencia from "./formDependencia";
import FormPersona from "./FormPersona";
import Paso3 from "./paso3";
import { getData, createRecord } from "~/utils/apiUtils";
import { useAuthContext } from "~/context/AuthContext";

interface PasosProps {
  paso: number;
  setPaso: (paso: number) => void;
}

export default function ConveniosPasos({ paso, setPaso }: PasosProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, setNoti } = useAuthContext();

  // --- ESTADOS COMPARTIDOS ---
  const [tipoOrganizacion, setTipoOrganizacion] = useState("Empresa");
  const [folio, setFolio] = useState<string>("");
  const [idConvenio, setIdConvenio] = useState<number | string>("");
  const [idOrganizacion, setIdOrganizacion] = useState<number | string>("");
  const [convenioData, setConvenioData] = useState<any>(null);
  const [testigos, setTestigos] = useState<string[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [notasObservaciones, setNotasObservaciones] = useState<string>("");
  const [enviando, setEnviando] = useState(false);

  // Sincronizar el folio con los parámetros de URL y cargar datos del convenio
  useEffect(() => {
    const numeroConvenio = searchParams.get('numero_convenio');
    if (numeroConvenio && !dataLoaded) {
      setFolio(numeroConvenio);
      
      // Cargar datos del convenio si existe
      const cargarDatos = async () => {
        const response = await getData({
          endpoint: `/convenios/draft/${numeroConvenio}`
        });
        
        if (response.statusCode === 201 && response.data?.convenio) {
          const convenio = response.data.convenio;
          setConvenioData(convenio);
          setIdConvenio(convenio.convenio_id || convenio.id_Convenio);
          setIdOrganizacion(convenio.id_Organizacion);
          setTipoOrganizacion(convenio.tipo_organizacion || convenio.tipo_Convenio || "Empresa");
          setTestigos(response.data.testigos || []);
          setDataLoaded(true);
        }
      };
      
      cargarDatos();
    }
  }, [searchParams, dataLoaded]);

  const handleEnviarARevision = async () => {
    if (!idConvenio || !user?.id_Cuenta) {
      setNoti({
        open: true,
        type: "error",
        message: "No se pudo identificar el convenio o el usuario"
      });
      return;
    }

    setEnviando(true);
    try {
      const response = await createRecord({
        endpoint: '/convenios/enviar-revision',
        data: {
          id_Convenio: idConvenio,
          observaciones: notasObservaciones,
          id_Usuario: user.id_Cuenta
        }
      });

      if (response.statusCode === 200) {
        setNoti({
          open: true,
          type: "success",
          message: "Convenio enviado a revisión exitosamente"
        });
        
        // Redirigir después de un pequeño delay
        setTimeout(() => {
          navigate("/convenios");
        }, 1500);
      } else {
        setNoti({
          open: true,
          type: "error",
          message: response.errorMessage || "Error al enviar el convenio a revisión"
        });
      }
    } catch (error) {
      setNoti({
        open: true,
        type: "error",
        message: "Error al enviar el convenio a revisión"
      });
    } finally {
      setEnviando(false);
    }
  };

  const titulos = [
    "",
    "Asistente para nuevos Convenios",
    "Datos de la Organización",
    "Convenio",
    "Anexos y Documentos",
    "Paso 5",
  ];

  return (
    <Box sx={{ padding: { xs: 2, md: 4 } }}>
      {/* 1. SECCIÓN DEL ENCABEZADO Y PASOS */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Avatar sx={{ bgcolor: "primary.main", color: "white", width: 40, height: 40 }}>
          {paso}
        </Avatar>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.5rem", md: "2rem" },
              color: "#1e1e2f",
            }}
          >
            {titulos[paso]}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Paso {paso} de 5
          </Typography>
        </Box>
      </Stack>

      {/* --- PASO 1: Selección de Tipo --- */}
      {paso === 1 && (
        <>
          <Paso1 setTipoOrganizacion={setTipoOrganizacion} tipoOrganizacion={tipoOrganizacion} setPaso={setPaso} />
        </>
      )}

      {/* --- PASO 2: Formularios (Aquí es donde debes setear el Folio e ID al guardar) --- */}
      {paso === 2 && (
        <>
          {tipoOrganizacion === "Empresa" && (
            <FormEmpresa 
              setPaso={setPaso}
              tipoOrganizacion={tipoOrganizacion}
              setIdOrganizacion={setIdOrganizacion}
              setIdConvenio={setIdConvenio}
              setFolio={setFolio}
              convenioData={convenioData}
              testigos={testigos}
            />
          )}
          {tipoOrganizacion === "Dependencia" && (
            <FormDependencia 
              setPaso={setPaso}
              tipoOrganizacion={tipoOrganizacion}
              setIdOrganizacion={setIdOrganizacion}
              setIdConvenio={setIdConvenio}
              setFolio={setFolio}
              convenioData={convenioData}
              testigos={testigos}
            />
          )}
          {tipoOrganizacion === "Persona Fisica" && (
            <FormPersona 
              setPaso={setPaso}
              tipoOrganizacion={tipoOrganizacion}
              setIdOrganizacion={setIdOrganizacion}
              setIdConvenio={setIdConvenio}
              setFolio={setFolio}
              convenioData={convenioData}
              testigos={testigos}
            />
          )}
        </>
      )}

      {/* --- PASO 3: Otros Datos --- */}
      {paso === 3 && (
        <>
          <Paso3 setPaso={setPaso} tipoOrganizacion={tipoOrganizacion}/>
        </>
      )}

      {paso === 4 && (
        <Paso4 
            setPaso={setPaso}
            folio={folio}
            idConvenio={idConvenio as any}
            tipoOrganizacion={tipoOrganizacion as any}
        />
      )}

      {/* --- PASO 5: Finalización --- */}
      {paso === 5 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Revisión Final
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1">
              <strong>Nota:</strong> Una vez enviado el convenio a revisión, el expediente no podrá ser modificado hasta que sea evaluado por el equipo revisor.
            </Typography>
          </Alert>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              Observaciones o comentarios (Opcional)
            </Typography>
            <TextField
              multiline
              rows={6}
              fullWidth
              value={notasObservaciones}
              onChange={(e) => setNotasObservaciones(e.target.value)}
              placeholder="Escribe aquí cualquier observación o comentario que desees agregar antes de enviar a revisión..."
              variant="outlined"
            />
          </Box>

          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '20px',
            }}
          >
            <Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowBackIcon />}
                onClick={() => setPaso(4)}
                disabled={enviando}
                sx={{
                  mr: 2,
                  padding: '10px 24px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                Regresar
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={enviando ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                onClick={handleEnviarARevision}
                disabled={enviando}
                sx={{
                  padding: '10px 24px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                {enviando ? 'Enviando...' : 'Enviar a Revisión'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
