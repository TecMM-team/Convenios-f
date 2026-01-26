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
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CloseIcon from "@mui/icons-material/Close";
import { createRecord } from "~/utils/apiUtils";
import { useAuthContext } from "~/context/AuthContext";

interface RequiereAjusteModalProps {
  open: boolean;
  onClose: () => void;
  convenio: {
    id_Convenio: number;
    numero_Convenio: string;
  } | null;
  onSuccess: () => void;
}

export default function RequiereAjusteModal({ open, onClose, convenio, onSuccess }: RequiereAjusteModalProps) {
  const { user, setNoti } = useAuthContext();
  const [observaciones, setObservaciones] = useState<string>("");
  const [enviando, setEnviando] = useState(false);

  const handleRequiereAjuste = async () => {
    if (!convenio || !user?.id_Cuenta) {
      setNoti({
        open: true,
        type: "error",
        message: "No se pudo identificar el convenio o el usuario"
      });
      return;
    }

    if (!observaciones || observaciones.trim() === "") {
      setNoti({
        open: true,
        type: "warning",
        message: "Las observaciones son obligatorias cuando se requiere un ajuste"
      });
      return;
    }

    setEnviando(true);
    try {
      const response = await createRecord({
        endpoint: '/convenios/requiere-ajuste',
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
          message: "Convenio marcado como 'Requiere Ajuste'"
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
          message: response.errorMessage || "Error al marcar el convenio"
        });
      }
    } catch (error) {
      setNoti({
        open: true,
        type: "error",
        message: "Error al marcar el convenio"
      });
    } finally {
      setEnviando(false);
    }
  };

  const handleClose = () => {
    if (!enviando) {
      setObservaciones("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Requiere Ajuste - Convenio {convenio?.numero_Convenio}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Importante:</strong> Al marcar este convenio como "Requiere Ajuste", el Revisor deberá realizar las correcciones necesarias antes de poder validarlo nuevamente.
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            Observaciones o comentarios (Obligatorio) *
          </Typography>
          <TextField
            multiline
            rows={6}
            fullWidth
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Describe los ajustes que se requieren para este convenio..."
            variant="outlined"
            disabled={enviando}
            required
            error={observaciones.trim() === ""}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: "16px 24px" }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<CloseIcon />}
          onClick={handleClose}
          disabled={enviando}
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
          startIcon={enviando ? <CircularProgress size={20} color="inherit" /> : <ErrorOutlineIcon />}
          onClick={handleRequiereAjuste}
          disabled={enviando}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          {enviando ? "Enviando..." : "Requiere Ajuste"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
