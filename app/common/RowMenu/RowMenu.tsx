import * as React from "react";
import {
  IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SendIcon from "@mui/icons-material/Send";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CancelIcon from "@mui/icons-material/Cancel";
import VerifiedIcon from "@mui/icons-material/Verified";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export interface RowMenuProps<T> {
  row: T;
  onVer?: (r: T) => void;
  onEditar?: (r: T) => void;
  onToggleEstado?: (r: T) => void;
  onCancelar?: (r: T) => void;
  onEnviarRevision?: (r: T) => void;
  onEnviarValidar?: (r: T) => void;
  onValidar?: (r: T) => void;
  onCorregir?: (r: T) => void;
  onRequiereAjuste?: (r: T) => void;
  estado?: string;
}

export function RowMenu<T>({
  row,
  onVer,
  onEditar,
  onToggleEstado,
  onCancelar,
  onEnviarRevision,
  onEnviarValidar,
  onValidar,
  onCorregir,
  onRequiereAjuste,
  estado,
}: RowMenuProps<T>) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const close = () => setAnchorEl(null);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {onVer && (
          <MenuItem onClick={() => { onVer(row); close(); }}>
            <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Ver</ListItemText>
          </MenuItem>
        )}

        {onEditar && (
          <MenuItem onClick={() => { onEditar(row); close(); }}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
        )}

        {onEnviarRevision && (
          <MenuItem onClick={() => { onEnviarRevision(row); close(); }}>
            <ListItemIcon><SendIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Enviar a revisión</ListItemText>
          </MenuItem>
        )}

        {onEnviarValidar && (
          <MenuItem onClick={() => { onEnviarValidar(row); close(); }}>
            <ListItemIcon><AssignmentTurnedInIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Enviar a validar</ListItemText>
          </MenuItem>
        )}

        {onValidar && (
          <MenuItem onClick={() => { onValidar(row); close(); }}>
            <ListItemIcon><VerifiedIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Validar</ListItemText>
          </MenuItem>
        )}

        {onCorregir && (
          <MenuItem onClick={() => { onCorregir(row); close(); }}>
            <ListItemIcon><EditNoteIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Corregir</ListItemText>
          </MenuItem>
        )}

        {onRequiereAjuste && (
          <MenuItem onClick={() => { onRequiereAjuste(row); close(); }}>
            <ListItemIcon><ErrorOutlineIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Requiere Ajuste</ListItemText>
          </MenuItem>
        )}
        
                {onCancelar && (
                  <MenuItem onClick={() => { onCancelar(row); close(); }}>
                    <ListItemIcon><CancelIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Cancelar</ListItemText>
                  </MenuItem>
                )}

        {onToggleEstado && (
          <MenuItem onClick={() => { onToggleEstado(row); close(); }}>
            <ListItemIcon>
              {estado === "Activo"
                ? <BlockIcon fontSize="small" />
                : <CheckCircleIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>{estado === "Activo" ? "Desactivar" : "Activar"}</ListItemText>
          </MenuItem>
        )}

      </Menu>
    </>
  );
}