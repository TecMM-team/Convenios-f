import InputField from "../../common/TextField/InputField";
import { Button, CircularProgress, Box, Paper } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { createRecord } from "~/utils/apiUtils";
import { useAuthContext } from "../../context/AuthContext";

type ChangeFormProps = {};
const CHANGE_PATH = "/cuenta/change_pass";

export default function ChangeForm({  }: ChangeFormProps) {
  const { logout, setNoti } = useAuthContext();
  
  const [changing, setChanging] = useState(false);
  
  const [form, setForm] = useState({
    pass: "",
    new_pass: "",
    confirmNewPassword: ""
  });

  const logoutTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  const on = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(s => ({ ...s, [k]: e.target.value }));

  const validate = () => {
    if (!form.pass || !form.new_pass || !form.confirmNewPassword)
      return "Completa todos los campos.";

    if (form.new_pass !== form.confirmNewPassword)
      return "La nueva contraseña y su confirmación no coinciden.";

    if (form.new_pass.length < 8)
      return "La nueva contraseña debe tener al menos 8 caracteres.";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validate();
    if (err) return setNoti({
      open: true,
      type: "error",
      message: err
    });

    try {
      setChanging(true);
      setNoti({ open: false, type: "info", message: "" });

      const payload = {
        pass: form.pass,
        new_pass: form.new_pass
      };
      
      const res = await createRecord({data: payload, endpoint:CHANGE_PATH});

      if (res.statusCode >= 200 && res.statusCode < 300) {
        setNoti({
          open: true,
          type: "success",
          message: "Contraseña cambiada exitosamente. Serás desconectado en 3 segundos."
        });

        logoutTimerRef.current = window.setTimeout(() => {
          logout();
        }, 3000);

        return;
      }

      setNoti({
        open: true,
        type: "error",
        message: res.errorMessage || "Ocurrió un error al cambiar la contraseña. Verifica tu contraseña actual."
      });

    } catch (e: any) {
      console.error(e);
      setNoti({
        open: true,
        type: "error",
        message: e.message || "Error de conexión. Inténtalo de nuevo."
      });
    } finally {
      setChanging(false); 
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 4, maxWidth: 500 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <InputField
              text="Contraseña Actual"
              type="password"
              showToggle={true}
              onChange={on("pass")}
              size="100%"
            />

            <InputField
              text="Nueva Contraseña"
              type="password"
              showToggle={true}
              onChange={on("new_pass")}
              size="100%"
            />

            <InputField
              text="Repetir Nueva Contraseña"
              type="password"
              showToggle={true}
              onChange={on("confirmNewPassword")}
              size="100%"
            />
          </Box>

          <Button
            type="submit" 
            variant="contained"
            disabled={changing} 
            sx={{
              mt: 3,
              backgroundColor: "#4C6EF5",
              "&:hover": { backgroundColor: "#4C6EF5", opacity: 0.9 }
            }}
          >
            {changing ? ( 
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}