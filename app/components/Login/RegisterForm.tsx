import "../../routes/styles/Login.css";
import InputField from "../../common/TextField/InputField";
import SelectField from "../../common/TextField/SelectField";
import { Button, CircularProgress, Alert } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

type Option = { value: string; label: string };
type RegisterFormProps = { onBackToLogin: () => void };

const DOMAIN = import.meta.env.VITE_PUBLIC_URL as string | undefined;
const API_KEY = import.meta.env.VITE_PUBLIC_API_KEY as string | undefined;
const REGISTER_PATH = "/cuenta/";
const UNIDADES_PATH = "/unidades";

const axiosClient = DOMAIN && API_KEY
  ? axios.create({ baseURL: DOMAIN, headers: { api_key: API_KEY }, timeout: 15000 })
  : null;

export default function RegisterForm({ onBackToLogin }: RegisterFormProps) {
  const [form, setForm] = useState({
    nombre: "", rfc: "", correo: "", contrasena: "", confirmarContrasena: "",
    rol: "", unidadAcademica: ""
  });
  const [ui, setUi] = useState({
    unidades: [] as Option[], cargandoUnidades: false, errorUnidades: null as string | null,
    formSubmitted: false, registrando: false, errorRegistro: null as string | null
  });

  const fetchedRef = useRef(false);
  const on = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(s => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    if (fetchedRef.current) return; fetchedRef.current = true;
    if (!axiosClient) return setUi(u => ({ ...u, errorUnidades: "Configuración de API inválida." }));
    (async () => {
      try {
        setUi(u => ({ ...u, cargandoUnidades: true, errorUnidades: null }));
        const { data } = await axiosClient.get(UNIDADES_PATH);
        const raw = Array.isArray(data?.unidades) ? data.unidades : Array.isArray(data) ? data : data?.data || [];
        if (!Array.isArray(raw)) throw new Error("Formato de respuesta inválido");
        const unidades: Option[] = raw.map((u: any) => ({
          value: String(u.id_Unidad_Academica ?? u.id ?? u.value),
          label: String(u.nombre ?? u.label ?? "")
        }));
        setUi(u => ({ ...u, unidades }));
      } catch (e) {
        console.error(e);
        setUi(u => ({ ...u, errorUnidades: "No se pudieron cargar las unidades." }));
      } finally {
        setUi(u => ({ ...u, cargandoUnidades: false }));
      }
    })();
  }, []);

  const validate = () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo);
    if (!form.nombre || !form.correo || !form.contrasena || !form.rol || !form.unidadAcademica)
      return "Completa todos los campos obligatorios.";
    if (!emailOk) return "Ingresa un correo válido.";
    if (form.contrasena !== form.confirmarContrasena) return "Las contraseñas no coinciden.";
    if (!axiosClient) return "Configuración de API inválida.";
    return null;
  };

  const handleRegisterClick = async () => {
    setUi(u => ({ ...u, formSubmitted: true, errorRegistro: null }));
    const err = validate(); if (err) return setUi(u => ({ ...u, errorRegistro: err }));
    try {
      setUi(u => ({ ...u, registrando: true }));
      const payload = {
        nombre: form.nombre,
        correo: form.correo,
        contrasena: form.contrasena,
        rol: form.rol,
        rfc: form.rfc || undefined,
        id_Unidad_Academica: form.unidadAcademica
      };
      const res = await axiosClient!.patch(REGISTER_PATH, payload);
      if (res.status >= 200 && res.status < 300) return onBackToLogin();
      setUi(u => ({ ...u, errorRegistro: res.data?.msg}));
    } catch (e: any) {
      console.error(e);
      setUi(u => ({
        ...u,
        errorRegistro: e?.response?.data?.msg || e?.response?.data?.msg || "Ocurrió un error al registrar. Inténtalo de nuevo."
      }));
    } finally {
      setUi(u => ({ ...u, registrando: false }));
    }
  };

  const hayOpciones = ui.unidades.length > 0;
  const hayErrorUnidades = !!ui.errorUnidades && !hayOpciones;
  const disabled = ui.registrando || (ui.cargandoUnidades && !hayOpciones);

  return (
    <div className="login-form">
      <div className="login-box">
        <h2 className="login-header">Crear cuenta</h2>

        {ui.errorRegistro && <Alert severity="error" sx={{ mb: 2 }}>{ui.errorRegistro}</Alert>}

        <form>
          <div className="input-wrapper">
            <InputField text="Nombre" type="text" onChange={on("nombre")} />
          </div>
          <div className="input-wrapper">
            <InputField text="Correo electrónico" type="email" onChange={on("correo")} />
          </div>
          <div className="input-wrapper">
            <InputField text="RFC" type="text" onChange={on("rfc")} />
          </div>
          <div className="input-wrapper">
            <SelectField
              label="Rol"
              name="rol"
              value={form.rol}
              onChange={(e) => setForm(s => ({ ...s, rol: (e.target as HTMLInputElement).value }))}
              options={[
                { value: "Gestor", label: "Alumno" },
                { value: "Organización", label: "Empresa" },
              ]}
              placeholder="Selecciona un rol"
              helperText={(ui.formSubmitted && !form.rol) ? "Selecciona un rol" : ""}
              size="small"
              error={ui.formSubmitted && !form.rol}
            />
          </div>
          <div className="input-wrapper">
            <SelectField
              label="Unidad Académica"
              name="unidadAcademica"
              value={form.unidadAcademica}
              onChange={(e) => setForm(s => ({ ...s, unidadAcademica: (e.target as HTMLInputElement).value }))}
              options={ui.unidades}
              loading={ui.cargandoUnidades}
              placeholder="Selecciona una unidad"
              disabled={ui.cargandoUnidades && !hayOpciones}
              helperText={
                hayErrorUnidades
                  ? ui.errorUnidades ?? undefined
                  : (ui.formSubmitted && !form.unidadAcademica) ? "Selecciona una unidad" : undefined
              }
              size="small"
              error={hayErrorUnidades || (ui.formSubmitted && !form.unidadAcademica)}
            />
          </div>
          <div className="input-wrapper">
            <InputField text="Contraseña" type="password" showToggle onChange={on("contrasena")} />
          </div>
          <div className="input-wrapper">
            <InputField text="Repetir Contraseña" type="password" showToggle onChange={on("confirmarContrasena")} />
          </div>

          {(ui.formSubmitted && form.contrasena && form.confirmarContrasena && form.contrasena !== form.confirmarContrasena) && (
            <p style={{ color: "red", marginTop: -8 }}>Las contraseñas no coinciden.</p>
          )}

          <Button
            type="button"
            variant="contained"
            disabled={disabled}
            onClick={handleRegisterClick}
            sx={{
              mt: 3, textTransform: "none", fontSize: "1rem", borderRadius: "8px",
              backgroundColor: !disabled ? "rgb(50, 22, 155)" : "rgba(50, 22, 155, 0.4)"
            }}
          >
            {ui.registrando ? <CircularProgress size={24} color="inherit" /> : "Registrarse"}
          </Button>
        </form>

        <Button onClick={onBackToLogin} sx={{ mt: 2 }}>Volver al inicio de sesión</Button>
      </div>
    </div>
  );
}
