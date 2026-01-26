import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  type SlideProps,
} from "@mui/material";
import { useEffect, useState } from "react";

interface SnackAlertProps {
  open: boolean;
  close: () => void;
  type: "error" | "warning" | "info" | "success";
  mensaje?: string;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

const alertTitles: Record<SnackAlertProps["type"], string> = {
  error: "Error",
  warning: "Precaución",
  info: "Información",
  success: "Completado",
};

export default function SnackAlert({
  open,
  close,
  type,
  mensaje = "",
}: SnackAlertProps) {
  const [internalType, setInternalType] = useState(type);

  useEffect(() => {
    if (open) setInternalType(type);
  }, [open, type]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={close}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      slots={{
        transition: SlideTransition,
      }}
    >
      <Alert
        variant="filled"
        onClose={close}
        severity={internalType}
        sx={{ width: "100%" }}
      >
        <AlertTitle>{alertTitles[internalType]}</AlertTitle>
        {mensaje}
      </Alert>
    </Snackbar>
  );
}
