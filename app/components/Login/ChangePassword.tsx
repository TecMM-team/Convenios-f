import "../../routes/styles/Login.css";
import InputField from "../../common/TextField/InputField";
import { Button, CircularProgress, Alert } from "@mui/material";
import { useMemo, useState } from "react";
import axios from "axios";

type ResetProps = { onBackToLogin: () => void };

const DOMAIN = import.meta.env.VITE_PUBLIC_URL as string | undefined;
const API_KEY = import.meta.env.VITE_PUBLIC_API_KEY as string | undefined;
const REQUEST_PATH = "/cuenta/restore";

const axiosClient = DOMAIN && API_KEY
  ? axios.create({ baseURL: DOMAIN, headers: { api_key: API_KEY }, timeout: 15000 })
  : null;

export default function ResetPasswordEmailOnly({ onBackToLogin }: ResetProps) {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);
  const [serverMsg, setServerMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fallback = useMemo(
    () => "Se envió el correo, redirigiendo a página inicial en 5 sg",
    []
  );

  const validarEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSend = async () => {
    setErrorMsg(null);

    if (!correo.trim()) {
      setErrorMsg("El correo es obligatorio.");
      return;
    }
    if (!validarEmail(correo.trim())) {
      setErrorMsg("Ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);
    try {
      if (axiosClient) {
        const { data } = await axiosClient.patch(REQUEST_PATH, { correo: correo.trim() });
        if (typeof data?.msg === "string" && data.msg.trim()) {
          setServerMsg(data.msg);
        } else {
          setServerMsg(fallback);
        }
      } else {
        setServerMsg(fallback);
      }
    } catch {
      setServerMsg(fallback);
    } finally {
      setShown(true);
      setTimeout(onBackToLogin, 5000);
    }
  };

  return (
    <div className="login-form">
      <div className="login-box">
        <h2 className="login-header">Recuperar contraseña</h2>
        <p className="login-subtitle">Ingresa tu correo y te enviaremos instrucciones.</p>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {shown && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {serverMsg || fallback}
          </Alert>
        )}

        <form>
          <div className="input-wrapper">
            <InputField
              text="Correo electrónico"
              type="email"
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <Button
            fullWidth
            variant="contained"
            disabled={loading}
            onClick={handleSend}
            sx={{
              mt: 3,
              textTransform: "none",
              fontSize: "1rem",
              borderRadius: "8px",
              backgroundColor: !loading ? "rgb(50, 22, 155)" : "rgba(50,22,155,.4)",
              "&:hover": {
                backgroundColor: !loading ? "rgb(35, 10, 120)" : "rgba(50,22,155,.4)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Enviar correo"}
          </Button>
        </form>

        <Button onClick={onBackToLogin} sx={{ mt: 2 }}>
          Volver al inicio de sesión
        </Button>
      </div>
    </div>
  );
}
