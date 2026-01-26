import InputField from "../../common/TextField/InputField";
import SelectField from "../../common/TextField/SelectField";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { updateRecord } from "~/utils/apiUtils";
import { useAuthContext } from "~/context/AuthContext";
import { Button, CircularProgress, Alert, Grid, Box, Typography, TextField} from "@mui/material"; // <--- Add Grid and Box


const DOMAIN = import.meta.env.VITE_PUBLIC_URL as string | undefined;
const API_KEY = import.meta.env.VITE_PUBLIC_API_KEY as string | undefined;
const UNIDADES_PATH = "/unidades";

type Option = { value: string; label: string };

interface AccountsUpdateProps {
  setModo: (modo: string) => void;
  setSelecccion: (seleccion: any) => void
  seleccion: any
}

const axiosClient = DOMAIN && API_KEY
  ? axios.create({ baseURL: DOMAIN, headers: { api_key: API_KEY }, timeout: 15000 })
  : null;

export default function UpdateAccounts({setModo, setSelecccion, seleccion}: AccountsUpdateProps) {
  const { setNoti } = useAuthContext();

  const fetchUnidades = async () => {
    if (!axiosClient) return console.log("Configuración de API inválida.");
    try{
      setUi(u => ({ ...u, cargandoUnidades: true, errorUnidades: null }));
      const { data } = await axiosClient.get(UNIDADES_PATH);
      const raw = Array.isArray(data?.unidades) ? data.unidades : Array.isArray(data) ? data : data?.data || [];
      if (!Array.isArray(raw)) throw new Error("Formato de respuesta inválido");
      const unidades: Option[] = raw.map((u: any) => ({
        value: String(u.id_Unidad_Academica ?? u.id ?? u.value),
        label: String(u.nombre ?? u.label ?? "")
      }));
      setUi(u => ({ ...u, unidades }));
    }catch(e){
      console.error(e);
    }
  }

    const [ui, setUi] = useState({
      unidades: [] as Option[], cargandoUnidades: false, errorUnidades: null as string | null,
      formSubmitted: false, registrando: false, errorRegistro: null as string | null
    });

    const on = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(s => ({ ...s, [k]: e.target.value }));

    const [form, setForm] = useState({
      nombre: seleccion.nombre, correo: seleccion.correo, rol: seleccion.rol, rfc: seleccion.rfc, unidadAcademica: `${seleccion.id_Unidad_Academica}`,
    });

    useEffect(() => {
      fetchUnidades();
    }, []);

    const validate = () => {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo);
      if (!form.nombre || !form.correo || !form.rol || !form.unidadAcademica)
        return "Completa todos los campos obligatorios.";
      if (!emailOk) return "Ingresa un correo válido.";
      if (!axiosClient) return "Configuración de API inválida.";
      return null;
    };

    const handleCancelar = () => {
        setModo("tabla");
        setSelecccion([]);
    }

    const handleUpdateClick = async () => {
        setUi(u => ({ ...u, formSubmitted: true, errorRegistro: null }));
        const err = validate(); if (err) return setUi(u => ({ ...u, errorRegistro: err }));
        try{
            setUi(u => ({ ...u, registrando: true }));
            const payload = {
                nombre: form.nombre,
                correo: form.correo,
                rol: form.rol,
                rfc: form.rfc || undefined,
                id_Unidad_Academica: form.unidadAcademica
            };

            const UPDATE_PATH = `/cuenta/${seleccion.id_Cuenta}`;
            console.log(payload);
            console.log(UPDATE_PATH);

            const respuesta = await updateRecord({data: payload, endpoint: UPDATE_PATH});

            if(respuesta.statusCode === 201){
              setNoti({
                open: true,
                type: "success",
                message: `Cuenta actualizada con exito.`,
              })
              setModo("tabla");
              return setSelecccion([]);
            }

            if(respuesta.statusCode !== 200 || respuesta.statusCode !== 201){
              setUi(u => ({
                ...u,
                errorRegistro: respuesta.errorMessage || "Ocurrió un error al actualizar. Inténtalo de nuevo."
              }));
            }

        }catch(e: any){
          console.error(e);
          setUi(u => ({
            ...u,
            errorRegistro: e?.response?.data?.errorMessage || e?.response?.data?.msg || "Ocurrió un error al registrar. Inténtalo de nuevo."
          }));
        }finally{
          setUi(u => ({ ...u, registrando: false }));
        }
    }

    const hayOpciones = ui.unidades.length > 0;
    const hayErrorUnidades = !!ui.errorUnidades && !hayOpciones;
    const disabled = ui.registrando || (ui.cargandoUnidades && !hayOpciones);

    const estilos={
        width: "100%",
        borderRadius: "1dvh",
        backgroundColor: "transparent",
        transition: "all 0.2s ease",
        "& .MuiOutlinedInput-root": {
          borderRadius: "1dvh",
          "& fieldset": {
            borderColor: "#ccc",
            transition: "border-color 0.25s ease, box-shadow 0.25s ease",
          },
          "&:hover fieldset": { borderColor: "#999" },
          "&.Mui-focused fieldset": {
            borderColor: "rgb(50, 22, 155)",
            boxShadow: "0 0 0.4dvh rgb(50, 22, 155, 0.7)",
          },
        },
        "& .MuiInputLabel-root": {
          color: "#666",
          fontSize: "1.6dvh",
          paddingLeft: "0.2rem",
          lineHeight: 1.2,
          transformOrigin: "top left",
          transition:
            "all 0.22s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s ease",
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: "rgb(50, 22, 155)",
        },
        "& input": {
          color: "#333",
          padding: "1.5dvh 1.5dvw",
          lineHeight: 1.5,
        }
    }

    return (
    <>
      <nav className="breadcrumbs">
        <span
          className={`crumb clickable`}
          onClick={() => {handleCancelar()}}
        >
          {"Gestión de Cuentas"}
          <span className="separator">›</span>
        </span>
        <span
          className={`crumb `}
          onClick={() => {console.log("hace click")}}
        >
          {"Editar cuenta"}
        </span>
    </nav>
    <Typography
      sx={{
        fontFamily: "madaniArabicMedium",
        fontSize: "2rem",
        color: "#1e1e2f",
        mb: 2,
      }}
    >
      Editar Cuenta
    </Typography>
    <Box sx={{ minHeight: "100vh", py: 4 }}>
    <Box sx={{ maxWidth: 1100, mx: "auto", px: 3 }}>
      {/* Título como en el mock */}
     
      {/* Card */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3 },
          border: "1px solid #e6e8ef",
          borderRadius: 2,
          bgcolor: "#fff",
          boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
        }}
      >
        <Box sx={{ width: '100%' }}>
          {ui.errorRegistro && <Alert severity="error" sx={{ mb: 2 }}>{ui.errorRegistro}</Alert>}
          <Grid container rowSpacing={3} columnSpacing={3}>
            <Grid size={12}>
              <TextField label="Nombre o Razón Social" variant="outlined" value={form.nombre} sx={estilos} type="text" onChange={on("nombre")}/>
            </Grid>
            <Grid size={6}>
              <Box><TextField label="Correo electrónico" type="email" variant="outlined" value={form.correo} sx={estilos} onChange={on("correo")}/></Box>
            </Grid>
            <Grid size={6}>
              <Box>
                <SelectField
                  label="Rol"
                  name="rol"
                  value={form.rol}
                  onChange={(e) => setForm(s => ({ ...s, rol: (e.target as HTMLInputElement).value }))}
                  options={[
                    { value: "Gestor", label: "Alumno" },
                    { value: "Organización", label: "Empresa" },
                    { value: "Revisor", label: "Revisor" },
                    { value: "Director Unidad", label: "Director Unidad" },
                    { value: "Director General", label: "Director General" },
                  ]}
                  placeholder="Selecciona un rol"
                  helperText={"Selecciona un rol"}
                  size="medium"
                  error={ui.formSubmitted && !form.rol}
                />
              </Box>
            </Grid>
            <Grid size={6}>
              <Box><TextField label="RFC" type="text" variant="outlined" value={form.rfc} sx={estilos} onChange={on("rfc")}/></Box>
            </Grid>
            <Grid size={6}>
              <Box>
                <SelectField
                  label="Unidad Académica"
                  name="unidadAcademica"
                  value={form.unidadAcademica}
                  onChange={(e) => setForm(s => ({ ...s, unidadAcademica: (e.target as HTMLInputElement).value }))}
                  options={ui.unidades}
                  loading={false}
                  placeholder="Selecciona una unidad"
                  disabled={ui.cargandoUnidades && !hayOpciones}
                  helperText={
                    hayErrorUnidades
                      ? ui.errorUnidades ?? undefined
                      : (ui.formSubmitted && !form.unidadAcademica) ? "Selecciona una unidad" : undefined
                  }
                  size="medium"
                  error={hayErrorUnidades || (ui.formSubmitted && !form.unidadAcademica)}
                />
              </Box>
            </Grid>
            <Grid size={12}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleCancelar()}
                    disabled={ui.registrando}
                    sx={{
                      textTransform: "none",
                      borderColor: "#e0e3e7",
                      bgcolor: "#eef2f6",
                      color: "#111827",
                      px: 2.5,
                      borderRadius: 2,
                      "&:hover": { borderColor: "#cfd6e4", bgcolor: "#e6ebf2" },
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={ui.registrando || (ui.cargandoUnidades && ui.unidades.length === 0)}
                    onClick={handleUpdateClick}
                    sx={{
                      textTransform: "none",
                      px: 3,
                      borderRadius: 2,
                      fontWeight: 600,
                      backgroundColor: "#2f6fed",
                      boxShadow: "0 1px 0 rgba(16,24,40,0.05)",
                      "&:hover": { backgroundColor: "#275ed1" },
                    }}
                  >
                    {ui.registrando ? <CircularProgress size={22} color="inherit" /> : "Guardar"}
                  </Button>
                </Box>
              </Box>
            </Grid>

          </Grid>
        </Box>
      </Box>
    </Box>
    </Box>
    </>
);
}