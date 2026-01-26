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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { createRecord } from "~/utils/apiUtils";
import { useAuthContext } from "~/context/AuthContext";

interface ValidarCoordinadorModalProps {
  open: boolean;
  onClose: () => void;
  convenio: {
    id_Convenio: number;
    numero_Convenio: string;
  } | null;
  onSuccess: () => void;
}

export default function ValidarCoordinadorModal({ open, onClose, convenio, onSuccess }: ValidarCoordinadorModalProps) {
  const { user, setNoti } = useAuthContext();
  const [observaciones, setObservaciones] = useState<string>("");
  const [validando, setValidando] = useState(false);

  const handleValidar = async () => {
    if (!convenio || !user?.id_Cuenta) {
      setNoti({
        open: true,
        type: "error",
        message: "No se pudo identificar el convenio o el usuario"
      });
      return;
    }

    setValidando(true);
    try {
      const response = await createRecord({
        endpoint: '/convenios/validar-coordinador',
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
          message: "Convenio validado exitosamente"
        });
        setObservaciones("");
        onClose();
        onSuccess();
      } else {
        setNoti({
          open: true,
          type: "error",
          message: response.errorMessage || "Error al validar el convenio"
        });
      }
    } catch (error) {
      setNoti({
        open: true,
        type: "error",
        message: "Error al validar el convenio"
      });
    } finally {
      setValidando(false);
    }
  };

  const handleClose = () => {
    if (!validando) {
      setObservaciones("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Validar Convenio {convenio?.numero_Convenio}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Importante:</strong> Una vez validado el convenio, este cambiará a estado "Validado" y se considerará completamente aprobado.
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            Observaciones o comentarios (Opcional)
          </Typography>
          <TextField
            multiline
            rows={6}
            fullWidth
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Escribe aquí cualquier observación o comentario final sobre el convenio..."
            variant="outlined"
            disabled={validando}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: "16px 24px" }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<CloseIcon />}
          onClick={handleClose}
          disabled={validando}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={validando ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
          onClick={handleValidar}
          disabled={validando}
          sx={{
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          {validando ? "Validando..." : "Validar Convenio"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
