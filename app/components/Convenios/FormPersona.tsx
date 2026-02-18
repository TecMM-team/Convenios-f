import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";

import { useState,useEffect } from "react";
import { useSearchParams } from "react-router";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import InputField from "~/common/TextField/InputField";
import SelectField from "~/common/TextField/SelectField";
import { createRecord, getData, updateRecord } from "~/utils/apiUtils";
import { useAuthContext } from "~/context/AuthContext";
import dayjs from 'dayjs';

interface FormPersonaProps {
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
  nombreTitular: "",
  numIne: "",
  actividades: "",
  numEscritura: "",
  calleNumero: "",
  estado: "",
  municipio: "",
  cp: "",
};

export default function FormPersona({ setPaso, tipoOrganizacion, setIdOrganizacion, setIdConvenio, setFolio, convenioData, testigos: testigosIniciales }: FormPersonaProps) {
  const [testigos, setTestigos] = useState<string[]>(['']);
  const [form, setForm] = useState(initialState);
  const [estados, setEstado] = useState([]);
  const [municipiosDomicilio, setMunicipioDomicilio] = useState([]);

  const { setNoti, user } = useAuthContext();
  const [, setSearchParams] = useSearchParams();

  // Cargar datos existentes cuando hay convenioData
  useEffect(() => {
    if (convenioData) {
      setForm({
        rfc: convenioData.rfc || "",
        nombreTitular: convenioData.nombre_Titular || "",
        numIne: convenioData.ine_Representante || "",
        actividades: convenioData.actividades || "",
        numEscritura: convenioData.numero_Escritura || "",
        calleNumero: convenioData.domicilio_Calle || "",
        estado: "",
        municipio: convenioData.domicilio_Municipio || "",
        cp: convenioData.domicilio_CP || "",
      });
      
      if (testigosIniciales && testigosIniciales.length > 0) {
        setTestigos(testigosIniciales);
      }
      
      setIdOrganizacion(convenioData.id_Organizacion);
      setIdConvenio(convenioData.convenio_id || convenioData.id_Convenio);
    }
  }, [convenioData, testigosIniciales]);

  const on = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(s => ({ ...s, [k]: e.target.value }));


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
        setMunicipioDomicilio(response.data.municipios);
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
      setMunicipioDomicilio(response.data.municipios);
    }
  }

  const handleChangeMunicipio = async (municipio: string) => {
    setForm(s => ({ ...s, municipio: municipio}));
  }

  const handleRegister = async () => {
    const rfcNormalizado = (form.rfc || "").trim().toUpperCase();
    if (rfcNormalizado.length > 15) {
      return setNoti({
        open: true,
        type: "error",
        message: "RFC inválido: parece CURP. Captura RFC (máximo 15 caracteres).",
      });
    }

    if(!form.estado){
      return setNoti({
        open: true,
        type: "error",
        message: "seleccione un estado",
      });
      
    }
    const estado_seleccionado = estados.find(opcion => opcion.value === form.estado);
    if(!form.municipio){
      return setNoti({
        open: true,
        type: "error",
        message: "seleccione un municipio",
      });
    }
    const municipio_seleccionado = municipiosDomicilio.find(opcion => opcion.value === form.municipio);

    const body = {
    	"rfc": rfcNormalizado,
    	"nombre_Legal": "",
      "nombre_Comercial": "",
      "nombre_Titular": form.nombreTitular,
      "puesto_Titular": "",
      "numero_Escritura": form.numEscritura,
      "nombre_Notario": "",
      "numero_Notaria": "",
      "municipio_Notaria": "",
      "actividades": "",
      "domicilio_Calle": form.calleNumero,
      "domicilio_Estado": estado_seleccionado.label,
      "domicilio_Municipio": municipio_seleccionado.label,
      "domicilio_CP": form.cp,
      "contacto_Telefono": "",
      "contacto_Email": "",
      "oficio_Nombramiento": form.numEscritura,
      "fecha_Nombramiento": null,
      "ine_Representante": form.numIne,
      "acta_constitutiva": form.numEscritura,
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
    if(respuesta.statusCode !== 201){
      setNoti({
        open: true,
        type: "error",
        message: respuesta.errorMessage,
      });
      return;
    }

    const idOrganizacion = respuesta.data.id_Organizacion;
    setIdOrganizacion(idOrganizacion);

    // Paso 2: Crear el convenio
    const tipoConvenio =
      tipoOrganizacion.toLowerCase().includes("persona")
        ? "Persona Física"
        : tipoOrganizacion;

    const convenioBody = {
      id_Creador_Cuenta: user?.id_Cuenta,
      id_Unidad_Academica: user?.id_Unidad_Academica,
      tipo_Convenio: tipoConvenio,
      fecha_Inicio: dayjs().format("YYYY-MM-DD"),
      fecha_Fin: null,
      id_Organizacion: idOrganizacion,
    };

    const convenioRespuesta = await createRecord({ 
      data: convenioBody, 
      endpoint: "/convenios/draft" 
    });

    if(convenioRespuesta.statusCode === 201){
      setIdConvenio(convenioRespuesta.data.id_Convenio);
      const numeroConvenio = convenioRespuesta.data.numero_convenio;
      setFolio(numeroConvenio);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('numero_convenio', numeroConvenio);
        return next;
      }, { replace: true });
      
      setNoti({
        open: true,
        type: "success",
        message: `Convenio creado exitosamente con folio ${numeroConvenio}`,
      });
      setPaso(3);
    } else {
      setNoti({
        open: true,
        type: "error",
        message: convenioRespuesta.errorMessage,
      });
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container rowSpacing={3} columnSpacing={3}>
        <Grid size={12} sx={{borderBottom: '1px solid #cacacaff'}}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Información de la Persona Física
          </Typography>
        </Grid>
        <Grid size={12}>
          <InputField text="Nombre Completo" type="text" size="100%" onChange={on("nombreTitular")}/>
        </Grid>
        <Grid size={6}>
          <InputField text="RFC" type="text" size="100%" value={form.rfc} onChange={on("rfc")}/>
        </Grid>
        <Grid size={6}>
          <InputField text="Número de INE" type="text" size="100%" onChange={on("numIne")}/>
        </Grid>
        <Grid size={6}>
          <InputField text="Número de Acta Constitutiva" type="text" size="100%" onChange={on("numEscritura")}/>
        </Grid>
        <Grid size={6}>
          <InputField text="Actividades que Desempeña" type="text" size="100%" onChange={on("actividades")}/>
        </Grid>
        <Grid size={12} sx={{borderBottom: '1px solid #cacacaff'}}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Domicilio
          </Typography>
        </Grid>
        <Grid size={12}>
          <InputField text="Calle y número" type="text" size="100%" onChange={on("calleNumero")}/>
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
          <InputField text="Código Postal" type="text" size="100%" onChange={on("cp")}/>
        </Grid>
        <Grid size={12} sx={{borderBottom: '1px solid #cacacaff'}}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Testigos del Convenio
          </Typography>
        </Grid>
        {testigos.map((valor, index) => (
          <Grid size={12} key={index}>
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
          {/* Botones de Regresar y Continuar */}
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
          </Box>
        </Box>
      </Grid>
    </Box>
  )
}
