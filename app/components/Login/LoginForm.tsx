import "../../routes/styles/Login.css";
import { useState } from "react";
import axios from "axios";
import { Button, CircularProgress } from "@mui/material";
import InputField from "../../common/TextField/InputField";
import { parseJwt } from "../../utils/getToken";
import { useAuthContext } from "../../context/AuthContext";
import RegisterForm from "./RegisterForm";
import ResetPasswordEmailOnly from "./ChangePassword";

export default function LoginForm() {
  const { login, setNoti } = useAuthContext();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async () => {
    if (!correo || !contrasena) {
      setNoti({
        open: true,
        type: "error",
        message: "Por favor completa todos los campos",
      });
      return;
    }

    setLoading(true);
    try {
      const domain = import.meta.env.VITE_PUBLIC_URL;
      const apiKey = import.meta.env.VITE_PUBLIC_API_KEY;
      const response = await axios.post(
        `${domain}/login`,
        {
          mail: correo,
          pass: contrasena,
        },
        {
          headers: {
            "api_key": apiKey,
          },
        }
      );

      if (response.status === 200 && response.data?.token) {
        const parsed = parseJwt(response.data.token);
        if (!parsed) throw new Error("Token inválido");

        const userData = {
          id_Cuenta: parsed.id_Cuenta,
          rol: parsed.rol,
          id_Unidad_Academica: parsed.id_Unidad_Academica,
          nombre: parsed.nombre,
          correo: parsed.correo,
          token: response.data.token,
        };

        login(userData);
        setNoti({
          open: true,
          type: "success",
          message: `Bienvenido, ${parsed.nombre}`,
        });
      } else {
        setNoti({
          open: true,
          type: "error",
          message: "Credenciales incorrectas",
        });
      }
    } catch (error: any) {
      setNoti({
        open: true,
        type: "error",
        message:
          error.response?.data?.msg ||
          "Error en el servidor o conexión con el backend",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = correo.trim() !== "" && contrasena.trim() !== "";

  if (isRegistering) {
    return <RegisterForm onBackToLogin={() => setIsRegistering(false)} />;
  }

  if (isResetting) {
    return <ResetPasswordEmailOnly onBackToLogin={() => setIsResetting(false)} />;
  }

  return (
    <div className="login-form">
      <div className="login-box">
        <h2 className="login-header">Gestión de Convenios</h2>
        <p className="login-subtitle">Inicie sesión para acceder a su cuenta</p>

        <div className="input-wrapper">
          <InputField
            text="Correo electrónico"
            type="email"
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>

        <div className="input-wrapper">
          <InputField
            text="Contraseña"
            type="password"
            showToggle
            onChange={(e) => setContrasena(e.target.value)}
          />
        </div>

        <div className="login-links">
          <a
            href="#"
            className="login-link"
            onClick={(e) => {
              e.preventDefault();
              setIsRegistering(true);
            }}
          >
            ¿No tienes cuenta? Regístrate
          </a>
          <a
            href="#"
            className="login-link"
            onClick={(e) => {
              e.preventDefault();
              setIsResetting(true);
            }}
          >
            Recuperar Contraseña
          </a>
        </div>

        <Button
          fullWidth
          variant="contained"
          disabled={!isFormValid || loading}
          onClick={handleLogin}
          sx={{
            mt: 3,
            backgroundColor: isFormValid
              ? "rgb(50, 22, 155)"
              : "rgba(50, 22, 155, 0.4)",
            textTransform: "none",
            fontSize: "1rem",
            borderRadius: "8px",
            boxShadow: isFormValid ? "0 3px 6px rgba(0,0,0,0.2)" : "none",
            "&:hover": {
              backgroundColor: isFormValid
                ? "rgb(35, 10, 120)"
                : "rgba(50, 22, 155, 0.4)",
              boxShadow: isFormValid
                ? "0 4px 10px rgba(0,0,0,0.25)"
                : "none",
            },
            transition: "all 0.25s ease-in-out",
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Iniciar Sesión"
          )}
        </Button>
      </div>
    </div>
  );
}
