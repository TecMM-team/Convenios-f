import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { createRecord } from "~/utils/apiUtils";
import { useAuthContext } from "~/context/AuthContext";

interface CorregirModalProps {
  open: boolean;
  onClose: () => void;
  convenio: {
    id_Convenio: number;
    numero_Convenio: string;
  } | null;
  onSuccess: () => void;
}

export default function CorregirModal({ open, onClose, convenio, onSuccess }: CorregirModalProps) {
  const { user, setNoti } = useAuthContext();
  const [observaciones, setObservaciones] = useState<string>("");
  const [corrigiendo, setCorrigiendo] = useState(false);

  const handleCorregir = async () => {
    if (!convenio || !user?.id_Cuenta) {
      setNoti({
        open: true,
        type: "error",
        message: "No se pudo identificar el convenio o el usuario"
      });
      return;
    }

    if (!observaciones.trim()) {
      setNoti({
        open: true,
        type: "warning",
        message: "Por favor, escribe las observaciones para solicitar correcciones"
      });
      return;
    }

    setCorrigiendo(true);
    try {
      const response = await createRecord({
        endpoint: '/convenios/solicitar-correccion',
        data: {
          id_Convenio: convenio.id_Convenio,
          observaciones: observaciones,
          id_Usuario: user.id_Cuenta
        }
      });

      if (response.statusCode === 200) {
        setNoti({
          open: true,
          type: "success",
          message: "Solicitud de corrección enviada exitosamente"
        });
        setObservaciones("");
        onClose();
        // Refrescar la tabla después de cerrar el modal
        setTimeout(() => {
          onSuccess();
        }, 100);
      } else {
        setNoti({
          open: true,
          type: "error",
          message: response.errorMessage || "Error al solicitar corrección"
        });
      }
    } catch (error) {
      setNoti({
        open: true,
        type: "error",
        message: "Error al solicitar corrección"
      });
    } finally {
      setCorrigiendo(false);
    }
  };

  const handleClose = () => {
    if (!corrigiendo) {
      setObservaciones("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Solicitar Corrección - Convenio {convenio?.numero_Convenio}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Importante:</strong> El convenio cambiará a estado "En Corrección" y se notificará al Gestor que lo creó para que realice los ajustes necesarios.
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            Observaciones o correcciones requeridas <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={6}
            fullWidth
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Escribe aquí las correcciones o ajustes que debe realizar el Gestor..."
            variant="outlined"
            disabled={corrigiendo}
            required
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: "16px 24px" }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<CloseIcon />}
          onClick={handleClose}
          disabled={corrigiendo}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={corrigiendo ? <CircularProgress size={20} color="inherit" /> : <EditIcon />}
          onClick={handleCorregir}
          disabled={corrigiendo}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          {corrigiendo ? "Enviando..." : "Solicitar Corrección"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
