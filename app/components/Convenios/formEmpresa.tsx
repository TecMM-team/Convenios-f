import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import pkg from 'dayjs';
const {Dayjs} = pkg;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";

// Iconos
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CancelIcon from "@mui/icons-material/Cancel";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import InputField from "~/common/TextField/InputField";
import SelectField from "~/common/TextField/SelectField";
import { createRecord, getData, updateRecord } from '~/utils/apiUtils';
import { useAuthContext } from '~/context/AuthContext';
import dayjs from 'dayjs';

interface FormEmpresaProps {
  setPaso: (paso: number) => void;
  tipoOrganizacion: string;
  setIdOrganizacion: (id: number | string) => void;
  setIdConvenio: (id: number | string) => void;
  setFolio: (folio: string) => void;
  convenioData?: any;
  testigos?: string[];
}

// Estado inicial del formulario
const initialState = {
  rfc: "",
  razonSocial: "",
  nombreComercial: "",
  nombreTitular: "",
  puestoTitular: "",
  actividades: "",
  numEscritura: "",
  nombreNotario: "",
  numNotaria: "",
  estadoNotaria: "",
  municipioNotaria: "" as string | number,
  calleNumero: "",
  estado: "",
  municipio: "" as string | number,
  cp: "",
  correo: "",
  telefono: "",
};

export default function FormEmpresa({ setPaso, tipoOrganizacion, setIdOrganizacion, setIdConvenio, setFolio, convenioData, testigos: testigosIniciales }: FormEmpresaProps) {
  // Estado para guardar todos los datos del formulario
  const [testigos, setTestigos] = useState<string[]>(['']);
  const [form, setForm] = useState(initialState);
  const [fechaCreacion, setFechaCreacion] = useState<Dayjs | null>(null);
  const [estados, setEstado] = useState([]);
  const [municipioNotaria, setMunicipioNotaría] = useState([]);
  const [municipiosDomicilio, setMunicipioDomicilio] = useState([]);

  const { setNoti, user } = useAuthContext();
  const navigate = useNavigate();

  // Cargar datos existentes cuando hay convenioData
  useEffect(() => {
    if (convenioData) {
      // Función para cargar los municipios primero y luego establecer el formulario
      const loadDataWithMunicipios = async () => {
        
        // IMPORTANTE: Esperar a que se carguen las opciones ANTES de establecer el valor
        // Esto evita que el SelectField intente mostrar un valor que aún no existe en las opciones
        
        // Cargar municipios del domicilio si hay estado
        if (convenioData.domicilio_Estado) {
          const responseDomicilio = await getData({
            endpoint: "/locacion/municipios/" + convenioData.domicilio_Estado
          });
          if (responseDomicilio.statusCode === 200 && responseDomicilio.data?.municipios) {
            setMunicipioDomicilio(responseDomicilio.data.municipios);
            
            // Pequeño delay para asegurar que React haya actualizado el estado
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // Cargar municipios de notaría si hay estado
        if (convenioData.notaria_Estado) {
          const responseNotaria = await getData({
            endpoint: "/locacion/municipios/" + convenioData.notaria_Estado
          });
          if (responseNotaria.statusCode === 200 && responseNotaria.data?.municipios) {
            setMunicipioNotaría(responseNotaria.data.municipios);
            
            // Pequeño delay para asegurar que React haya actualizado el estado
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // Establecer todos los valores del formulario
        // Ahora notaria_Estado y notaria_Municipio se guardan en BD
        const nuevoForm = {
          rfc: convenioData.rfc || "",
          razonSocial: convenioData.nombre_Legal || "",
          nombreComercial: convenioData.nombre_Comercial || "",
          nombreTitular: convenioData.nombre_Titular || "",
          puestoTitular: convenioData.puesto_Titular || "",
          actividades: convenioData.actividades || "",
          numEscritura: convenioData.numero_Escritura || "",
          nombreNotario: convenioData.nombre_Notario || "",
          numNotaria: convenioData.numero_Notaria || "",
          estadoNotaria: convenioData.notaria_Estado ? String(convenioData.notaria_Estado) : "",
          municipioNotaria: convenioData.notaria_Municipio ? Number(convenioData.notaria_Municipio) : "",
          calleNumero: convenioData.domicilio_Calle || "",
          estado: convenioData.domicilio_Estado ? String(convenioData.domicilio_Estado) : "",
          municipio: convenioData.domicilio_Municipio ? Number(convenioData.domicilio_Municipio) : "",
          cp: convenioData.domicilio_CP || "",
          correo: convenioData.contacto_Email || "",
          telefono: convenioData.contacto_Telefono || "",
        };
        
        setForm(nuevoForm);
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
        setMunicipioDomicilio(response.data.municipios);
      }
    }
    fetchMunicipios();
  }, [form.estado]);


  const on = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(s => ({ ...s, [k]: e.target.value }));

  const handleDateChange = (newDate: Dayjs | null) => {
    setFechaCreacion(newDate);
  };

  const handleAddTestigo = () => {
    setTestigos([...testigos, '']);
  };

  const handleRemoveTestigo = (index: number) => {
    setTestigos(testigos.filter((_, i) => i !== index));
  };

  const fetchMunicipiosDomicilio = async (estado: string) => {
    const response = await getData({
      endpoint: "/locacion/municipios/"+estado
    });
    if (response.statusCode === 200 && response.data?.municipios) {
      setMunicipioDomicilio(response.data.municipios);
    }
  }

  const fetchMunicipiosNotaria = async (estado: string) => {
    const response = await getData({
      endpoint: "/locacion/municipios/"+estado
    });
    if (response.statusCode === 200 && response.data?.municipios) {
      setMunicipioNotaría(response.data.municipios);
    }
  }

  const handleChangeEstado = async (estado: string) => {
    setForm(s => ({ ...s, estado: estado, municipio: ""}));
    fetchMunicipiosDomicilio(estado);
  }

  const handleChangeMunicipio = async (municipio: string) => {
    setForm(s => ({ ...s, municipio: municipio}));
  }

  const handleChangeMunicipioNotaria = async (estadoNotaria: string) => {
    setForm(s => ({ ...s, estadoNotaria: estadoNotaria, municipioNotaria: ""}));
    fetchMunicipiosNotaria(estadoNotaria);
  }

  const handleChangeTestigo = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const nuevosValores = [...testigos];
    nuevosValores[index] = event.target.value;

    setTestigos(nuevosValores);
  };

  const handleRegister = async () => {
    const body = {
    	"rfc": form.rfc,
    	"nombre_Legal": form.razonSocial,
      "nombre_Comercial": form.nombreComercial,
      "nombre_Titular": form.nombreTitular,
      "puesto_Titular": form.puestoTitular,
      "numero_Escritura": form.numEscritura,
      "nombre_Notario": form.nombreNotario,
      "numero_Notaria": form.numNotaria,
      "notaria_Estado": form.estadoNotaria,
      "notaria_Municipio": form.municipioNotaria,
      "actividades": form.actividades,
      "domicilio_Calle": form.calleNumero,
      "domicilio_Estado": form.estado,
      "domicilio_Municipio": form.municipio,
      "domicilio_CP": form.cp,
      "contacto_Telefono": form.telefono,
      "contacto_Email": form.correo,
      "oficio_Nombramiento": form.numEscritura,
      "fecha_Nombramiento": fechaCreacion ? fechaCreacion.format('YYYY-MM-DD') : null,
      "ine_Representante": "",
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
        fecha_Inicio: fechaCreacion || new Date().toISOString().split('T')[0],
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
          // Actualizar la URL con el numero_convenio
          const newParams = new URLSearchParams(window.location.search);
          newParams.set('numero_convenio', folio);
          window.history.replaceState({}, '', `${window.location.pathname}?${newParams}`);
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
                  Información de la Empresa
                </Typography>
            </Grid>
            <Grid size={6}>
              <InputField text="RFC" type="text" size="100%" value={form.rfc} onChange={on("rfc")}/>
            </Grid>
            <Grid size={6}>
              <InputField text="Razón Social (Nombre legal)" type="text" size="100%" value={form.razonSocial} onChange={on("razonSocial")}/>
            </Grid>
            <Grid size={6}>
              <InputField text="Nombre Comercial" type="text" size="100%" value={form.nombreComercial} onChange={on("nombreComercial")}/>
            </Grid>
            <Grid size={6}>
              <InputField text="Nombre del Titular" size="100%" type="text" value={form.nombreTitular} onChange={on("nombreTitular")}/>
            </Grid>
            <Grid size={6}>
              <InputField text="Puesto del Titular" size="100%" type="text" value={form.puestoTitular} onChange={on("puestoTitular")}/>
            </Grid>
            <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  onChange={on("actividades")}
                  value={form.actividades}
                  rows={4}
                  label="Actividades de la Empresa"
                  name="actividades"
                  margin="normal"
                />
            </Grid>
            <Grid size={12} sx={{borderBottom: '1px solid #cacacaff'}}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Datos de Constitución
                </Typography>
            </Grid>
            <Grid size={6}>
              <InputField text="Número de Escritura Pública" size="100%" type="text" value={form.numEscritura} onChange={on("numEscritura")}/>
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
                      label="Fecha de Creación de la Empresa" />
                  </DemoContainer>
                </LocalizationProvider>
            </Grid>
            <Grid size={6}>
              <InputField text="Nombre del Notario Público" size="100%" type="text" value={form.nombreNotario} onChange={on("nombreNotario")}/>
            </Grid>
            <Grid size={6}>
              <InputField text="Número de Notaría Pública" size="100%" type="text" value={form.numNotaria} onChange={on("numNotaria")}/>
            </Grid>
            <Grid size={6}>
              <Box>
                <SelectField
                  label="Estado de la Notaría Pública"
                  name="estadoNotaria"
                  options={estados}
                  value={form.estadoNotaria}
                  onChange={(e) => handleChangeMunicipioNotaria(e.target.value)}
                  placeholder="Selecciona un Estado"
                  helperText={"Selecciona un Estado"}
                  maxWidth="100%"
                />
              </Box>
            </Grid>
            <Grid size={6}>
              <Box>
                <SelectField
                  label="Municipio de la Notaría Pública"
                  name="municipioNotaria"
                  value={form.municipioNotaria}
                  onChange={(e) => setForm(s => ({ ...s, municipioNotaria: e.target.value }))}
                  options={municipioNotaria}
                  placeholder="Selecciona un Municipio"
                  helperText={"Selecciona primero un Estado"}
                  maxWidth="100%"
                />
              </Box>
            </Grid>
            <Grid size={12} sx={{borderBottom: '1px solid #cacacaff'}}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Domicilio de la Empresa
                </Typography>
            </Grid>
            <Grid size={12}>
              <InputField text="Calle y Número" size="100%" type="text" value={form.calleNumero} onChange={on("calleNumero")}/>
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
              <InputField text="Código Postal (CP)" size="100%" type="text" value={form.cp} onChange={on("cp")}/>
            </Grid>
            <Grid size={12} sx={{borderBottom: '1px solid #cacacaff'}}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Información de Contacto
              </Typography>
            </Grid>
            <Grid size={6}>
              <InputField text="Correo Electronico" size="100%" type="text" value={form.correo} onChange={on("correo")}/>
            </Grid>
            <Grid size={6}>
              <InputField text="Teléfono" size="100%" type="text" value={form.telefono} onChange={on("telefono")}/>
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
              {/* Botones de Continuar y Cancelar */}
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => {
                    handleRegister()
                  }}
                  sx={{
                    mr: 2,
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