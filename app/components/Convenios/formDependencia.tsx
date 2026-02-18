import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import pkg from 'dayjs';
const {Dayjs} = pkg;

import { useState,useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
// Iconos
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CancelIcon from "@mui/icons-material/Cancel";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import InputField from "~/common/TextField/InputField";
import SelectField from "~/common/TextField/SelectField";
import { createRecord, getData, updateRecord } from "~/utils/apiUtils";
import { useAuthContext } from "~/context/AuthContext";
import dayjs from 'dayjs';



interface FormDependenciaProps {
  setPaso: (paso: number) => void;
  tipoOrganizacion: string;
  setIdOrganizacion: (id: number | string) => void;
  setIdConvenio: (id: number | string) => void;
  setFolio: (folio: string) => void;
  convenioData?: any;
  testigos?: string[];
}

const initialState = {
  razonSocial: "",
  nombreTitular: "",
  puestoTitular: "",
  numEscritura: "",
  numIne: "",
  calleNumero: "",
  estado: "",
  municipio: "",
  cp: "",
  correo: "",
  telefono: "",
};
export default function FormDependencia({ setPaso, tipoOrganizacion, setIdOrganizacion, setIdConvenio, setFolio, convenioData, testigos: testigosIniciales }: FormDependenciaProps) {
  const [testigos, setTestigos] = useState<string[]>(['']);
  const [form, setForm] = useState(initialState);
  const [fechaCreacion, setFechaCreacion] = useState<Dayjs | null>(null);
  const [estados, setEstado] = useState([]);
  const [municipiosDomicilio, setMunicipioDomicilio] = useState([]);

  const { setNoti, user } = useAuthContext();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();

  // Cargar datos existentes cuando hay convenioData
  useEffect(() => {
    if (convenioData) {
      const loadDataWithMunicipios = async () => {
        if (convenioData.domicilio_Estado) {
          const responseDomicilio = await getData({
            endpoint: "/locacion/municipios/" + convenioData.domicilio_Estado
          });
          if (responseDomicilio.statusCode === 200 && responseDomicilio.data?.municipios) {
            const municipios = responseDomicilio.data.municipios.map((m: any) => ({
              ...m,
              value: String(m.value),
            }));
            setMunicipioDomicilio(municipios);
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        setForm({
          razonSocial: convenioData.nombre_Legal || "",
          nombreTitular: convenioData.nombre_Titular || "",
          puestoTitular: convenioData.puesto_Titular || "",
          numEscritura: convenioData.oficio_Nombramiento || "",
          numIne: convenioData.ine_Representante || "",
          calleNumero: convenioData.domicilio_Calle || "",
          estado: convenioData.domicilio_Estado ? String(convenioData.domicilio_Estado) : "",
          municipio: convenioData.domicilio_Municipio ? String(convenioData.domicilio_Municipio) : "",
          cp: convenioData.domicilio_CP || "",
          correo: convenioData.contacto_Email || "",
          telefono: convenioData.contacto_Telefono || "",
        });
      };
      loadDataWithMunicipios();
      
      if (convenioData.fecha_Nombramiento) {
        setFechaCreacion(dayjs(convenioData.fecha_Nombramiento));
      }
      
      if (testigosIniciales && testigosIniciales.length > 0) {
        setTestigos(testigosIniciales);
      }
      
      setIdOrganizacion(convenioData.id_Organizacion);
      setIdConvenio(convenioData.convenio_id || convenioData.id_Convenio);
    }
  }, [convenioData, testigosIniciales]);

  const on = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(s => ({ ...s, [k]: e.target.value }));

  const handleDateChange = (newDate: Dayjs | null) => {
    setFechaCreacion(newDate);
  };

  //testigos
  const handleAddTestigo = () => {
    setTestigos([...testigos, '']);
  };
  const handleRemoveTestigo = (index: number) => {
    setTestigos(testigos.filter((_, i) => i !== index));
  };
  const handleChangeTestigo = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const nuevosValores = [...testigos];
    nuevosValores[index] = event.target.value;

    setTestigos(nuevosValores);
  };

  //estados
  useEffect(() =>  {
    const fetchEstados = async () => {
      const response = await getData({
        endpoint: "/locacion/estados"
      });
      if (response.statusCode === 200 && response.data?.estados) {
        setEstado(response.data.estados);
      }
    }
    fetchEstados();
  }, []);

  useEffect(() => {
    const fetchMunicipios = async () => {
      if (!form.estado) return;
      const response = await getData({
        endpoint: "/locacion/municipios/" + form.estado
      });
      if (response.statusCode === 200 && response.data?.municipios) {
        const municipios = response.data.municipios.map((m: any) => ({
          ...m,
          value: String(m.value),
        }));
        setMunicipioDomicilio(municipios);
      }
    }
    fetchMunicipios();
  }, [form.estado]);

  const handleChangeEstado = async (estado: string) => {
    setForm(s => ({ ...s, estado: estado, municipio: ""}));
    fetchMunicipiosDomicilio(estado);
  }

  //municipio
  const fetchMunicipiosDomicilio = async (estado: string) => {
    const response = await getData({
      endpoint: "/locacion/municipios/"+estado
    });
    if (response.statusCode === 200 && response.data?.municipios) {
      const municipios = response.data.municipios.map((m: any) => ({
        ...m,
        value: String(m.value),
      }));
      setMunicipioDomicilio(municipios);
    }
  }

  const handleChangeMunicipio = async (municipio: string) => {
    setForm(s => ({ ...s, municipio: municipio}));
  }

  const handleRegister = async () => {
    const body = {
    	"rfc": "",
    	"nombre_Legal": form.razonSocial,
      "nombre_Comercial": "",
      "nombre_Titular": form.nombreTitular,
      "puesto_Titular": form.puestoTitular,
      "numero_Escritura": form.numEscritura,
      "nombre_Notario": "",
      "numero_Notaria": "",
      "municipio_Notaria": "",
      "actividades": "",
      "domicilio_Calle": form.calleNumero,
      "domicilio_Estado": form.estado,
      "domicilio_Municipio": form.municipio,
      "domicilio_CP": form.cp,
	      "contacto_Telefono": form.telefono,
	      "contacto_Email": form.correo,
	      "oficio_Nombramiento": form.numEscritura,
	      "fecha_Nombramiento": fechaCreacion ? dayjs(fechaCreacion).format('YYYY-MM-DD') : null,
	      "ine_Representante": form.numIne,
	      "acta_constitutiva": "",
	      "tipo": tipoOrganizacion,
	    	"testigos": testigos
    }
    
    // Si ya existe una organización, actualizar en lugar de crear
    if (convenioData && convenioData.id_Organizacion) {
      const respuesta = await updateRecord({ 
        data: body, 
        endpoint: `/organizacion/${convenioData.id_Organizacion}` 
      });
      
      if (respuesta.statusCode === 200) {
        setNoti({
          open: true,
          type: "success",
          message: "Organización actualizada exitosamente",
        });
        setPaso(3);
      } else {
        setNoti({
          open: true,
          type: "error",
          message: respuesta.errorMessage || "Error al actualizar la organización",
        });
      }
      return;
    }
    
    // Paso 1: Crear la organización
    const respuesta = await createRecord({ data: body, endpoint: "/organizacion" });
    
    if(respuesta.statusCode === 201){
      const organizacionId = respuesta.data?.id_Organizacion;
      
      if (!organizacionId) {
        setNoti({
          open: true,
          type: "error",
          message: "Error: No se recibió el ID de la organización",
        });
        return;
      }
      
      setIdOrganizacion(organizacionId);
      
      // Paso 2: Crear el convenio (draft)
      const convenioBody = {
        id_Creador_Cuenta: user?.id_Cuenta,
        id_Unidad_Academica: user?.id_Unidad_Academica,
        tipo_Convenio: tipoOrganizacion,
        fecha_Inicio: fechaCreacion ? dayjs(fechaCreacion).format('YYYY-MM-DD') : new Date().toISOString().split('T')[0],
        fecha_Fin: null,
        id_Organizacion: organizacionId
      };
      
      const convenioRespuesta = await createRecord({ data: convenioBody, endpoint: "/convenios/draft" });
      
      if (convenioRespuesta.statusCode === 201) {
        const convenioId = convenioRespuesta.data?.id_Convenio;
        const folio = convenioRespuesta.data?.numero_convenio;
        
        if (convenioId) setIdConvenio(convenioId);
        if (folio) {
          setFolio(folio);
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('numero_convenio', folio);
            return next;
          }, { replace: true });
        }
        
        setNoti({
          open: true,
          type: "success",
          message: `Organización y convenio creados exitosamente`,
        });
        setPaso(3);
      } else {
        setNoti({
          open: true,
          type: "error",
          message: convenioRespuesta.errorMessage || "Error al crear el convenio",
        });
      }
    }else{
      setNoti({
        open: true,
        type: "error",
        message: respuesta.errorMessage,
      });
      return;
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container rowSpacing={3} columnSpacing={3}>
        <Grid size={12} sx={{borderBottom: '1px solid #cacacaff'}}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Información de la Dependencia
          </Typography>
        </Grid>
        <Grid size={12}>
          <InputField text="Nombre de la Dependencia" type="text" size="100%" value={form.razonSocial} onChange={on("razonSocial")}/>
        </Grid>
        <Grid size={6}>
          <InputField text="Representante Legal de la Dependencia" type="text" size="100%" value={form.nombreTitular} onChange={on("nombreTitular")}/>
        </Grid>
        <Grid size={6}>
          <InputField text="Puesto del Representante" size="100%" type="text" value={form.puestoTitular} onChange={on("puestoTitular")}/>
        </Grid>
        <Grid size={6}>
          <InputField text="Número de Nombramiento" size="100%" type="text" value={form.numEscritura} onChange={on("numEscritura")}/>
        </Grid>
        <Grid size={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DatePicker']}>
                <DatePicker
                value={fechaCreacion}
                onChange={handleDateChange}
                sx={{
                    width: "100%",
                    borderRadius: "1dvh",
                    backgroundColor: "transparent",
                    transition: "all 0.2s ease",
                }}
                label="Fecha del Nombramiento" />
              </DemoContainer>
            </LocalizationProvider>
        </Grid>
        <Grid size={6}>
          <InputField text="Número de INE del Representante Legal" size="100%" type="text" value={form.numIne} onChange={on("numIne")}/>
        </Grid>
        <Grid size={12} sx={{borderBottom: '1px solid #cacacaff'}}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Domicilio de la Dependencia
            </Typography>
        </Grid>
        <Grid size={12}>
          <InputField text="Calle y Número" type="text" size="100%" value={form.calleNumero} onChange={on("calleNumero")}/>
        </Grid>
        <Grid size={6}>
          <Box>
            <SelectField
              label="Estado"
              name="estado"
              options={estados}
              value={form.estado}
              onChange={(e) => handleChangeEstado(e.target.value)}
              placeholder="Selecciona un Estado"
              helperText={"Selecciona un Estado"}
              maxWidth="100%"
            />
          </Box>
        </Grid>
        <Grid size={6}>
          <Box>
            <SelectField
              label="Municipio"
              name="municipio"
              value={form.municipio}
              onChange={(e) => handleChangeMunicipio(e.target.value)}
              options={municipiosDomicilio}
              placeholder="Selecciona un Municipio"
              helperText={"Selecciona un Municipio"}
              maxWidth="100%"
            />
          </Box>
        </Grid>
        <Grid size={6}>
          <InputField text="Código Postal" type="text" size="100%" value={form.cp} onChange={on("cp")} />
        </Grid>
        <Grid size={12} sx={{borderBottom: '1px solid #cacacaff'}}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Información de Contacto
            </Typography>
        </Grid>
        <Grid size={6}>
          <InputField text="Correo Electronio" type="text" size="100%" value={form.correo} onChange={on("correo")} />
        </Grid>
        <Grid size={6}>
          <InputField text="Telefono" type="text" size="100%" value={form.telefono} onChange={on("telefono")} />
        </Grid>
        <Grid size={12} sx={{borderBottom: '1px solid #cacacaff'}}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Testigos del Convenio
          </Typography>
        </Grid>
        {testigos.map((valor, index) => (
          <Grid key={index} size={12}>
            <TextField
              fullWidth
              label={`Nombre completo del Testigo ${index + 1}`}
              value={valor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {handleChangeTestigo(index, e)}}
              name={`testigo${index + 1}`}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" color="error" onClick={() => {handleRemoveTestigo(index)}}>
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        ))}
        <Grid size={12}>
          <Button
            startIcon={<AddCircleOutlineIcon />}
            sx={{ textTransform: "none", mt: 1 }}
            onClick={() => handleAddTestigo()}
          >
            Agregar otro testigo
          </Button>
        </Grid>
        {/* --- BOTONES DE NAVEGACIÓN --- */}
        <Box
          sx={{
            width: "100%", 
            display: "flex",
            justifyContent: "flex-end"
          }}
        >
          {/* Botones de Regresar, Continuar y Cancelar */}
          <Box>
            <Button
              variant="outlined" // Lo cambié a outlined para diferenciar
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => setPaso(1)}
              sx={{
                mr: 2, // Margen a la derecha
                padding: "10px 24px",
                fontSize: "1rem",
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              Regresar
            </Button>
            <Button
              variant="contained"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              onClick={() => {
                handleRegister()
              }}
              sx={{
                padding: "10px 24px",
                fontSize: "1rem",
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              Continuar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/convenios')}
              sx={{
                ml: 2,
                padding: "10px 24px",
                fontSize: "1rem",
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
}
