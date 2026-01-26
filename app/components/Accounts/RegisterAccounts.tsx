import InputField from "../../common/TextField/InputField";
import SelectField from "../../common/TextField/SelectField";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { createRecord } from "~/utils/apiUtils";
import { useNavigate } from "react-router";
import { useAuthContext } from "~/context/AuthContext";
import { Button, CircularProgress, Alert, Grid, Box, Typography} from "@mui/material"; // <--- Add Grid and Box


const DOMAIN = import.meta.env.VITE_PUBLIC_URL as string | undefined;
const API_KEY = import.meta.env.VITE_PUBLIC_API_KEY as string | undefined;
const REGISTER_PATH = "/cuenta/admin";
const UNIDADES_PATH = "/unidades";

type Option = { value: string; label: string };




const axiosClient = DOMAIN && API_KEY
  ? axios.create({ baseURL: DOMAIN, headers: { api_key: API_KEY }, timeout: 15000 })
  : null;

export default function RegisterAccounts() {
  const navigate = useNavigate();
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
      nombre: "", correo: "", rol: "", rfc: "", unidadAcademica: ""
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

    const handleRegisterClick = async () => {
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

        const respuesta = await createRecord({ data: payload, endpoint: REGISTER_PATH });
        if(respuesta.statusCode === 201){
          setNoti({
            open: true,
            type: "success",
            message: `Cuenta creada con exito. El nuevo usuario recibirá su contraseña por correo electrónico.`,
          })
          return navigate("/cuentas");
        } 

        if(respuesta.statusCode !== 200 || respuesta.statusCode !== 201){
          setUi(u => ({
            ...u,
            errorRegistro: respuesta.errorMessage || "Ocurrió un error al registrar. Inténtalo de nuevo."
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

    return (
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
              <InputField text="Nombre o Razón Social" type="text" size="100%" onChange={on("nombre")}/>
            </Grid>
            <Grid size={6}>
              <Box><InputField text="Correo electrónico" type="email" onChange={on("correo")}/></Box>
            </Grid>
            <Grid size={6}>
              <Box>
                <SelectField
                  label="Rol"
                  name="rol"
                  maxWidth="100%"
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
              <Box><InputField text="RFC" type="text" onChange={on("rfc")}/></Box>
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
                    onClick={() => navigate("/cuentas")}
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
                    onClick={handleRegisterClick}
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
);
}