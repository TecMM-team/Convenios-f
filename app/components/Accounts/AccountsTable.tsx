import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DataGrid,
  GridPagination,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import { Box, Button, Chip, Toolbar } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { getData, deleteRecord } from "~/utils/apiUtils";
import "./styles/AccountsTable.css";
import { RowMenu } from "../../common/RowMenu/RowMenu";

interface Account {
  id_Cuenta: number;
  nombre: string;
  correo: string;
  rol: string;
  rfc: string;
  estado: "Activo" | "Inactivo";
  id_Unidad_Academica: number;
  unidad: string;
}

interface AccountsTableProps {
  query: string;
  setModo: (modo: string) => void;
  setSelecccion: (seleccion: any) => void
}

export default function AccountsTable({ query, setModo, setSelecccion }: AccountsTableProps) {
  const [rows, setRows] = useState<Account[]>([]);
  const [filteredRows, setFilteredRows] = useState<Account[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const normalizeText = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .toLowerCase()
      .trim();

  useEffect(() => {
    async function fetchAccounts() {
      setLoading(true);
      const response = await getData({
        endpoint: "/cuenta/convenios",
        query: `?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}`,
      });
      if (response.statusCode === 200 && response.data?.data) {
        setRows(response.data.data);
        setFilteredRows(response.data.data);
        setRowCount(response.data.total);
      } else {
        setRows([]);
        setFilteredRows([]);
        setRowCount(0);
      }
      setLoading(false);
    }
    fetchAccounts();
  }, [paginationModel]);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredRows(rows);
      return;
    }

    const normalizedQuery = normalizeText(query);
    const terms = normalizedQuery
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const filtered = rows.filter((row) => {
      const fields = [
        row.nombre,
        row.correo,
        row.rol,
        row.unidad,
        row.estado,
        row.rfc,
      ].map((v) => normalizeText(v || ""));

      return terms.every((term) =>
        fields.some((field) => {
          const tokens = field.split(/\s+/);
          return tokens.some(
            (token) =>
              token.startsWith(term) || token === term 
          );
        })
      );
    });

    setFilteredRows(filtered);
  }, [query, rows]);

  const handleVer = useCallback((row: Account) => {
    // Lógica para ver detalles
  }, []);

  const handleEditar = useCallback((row: Account) => {
    setModo("editar");
    setSelecccion(row);
    console.log(row);
  }, []);

  const handleToggleEstado = useCallback(async (row: Account) => {
    const nextEstado = row.estado === "Activo" ? "Inactivo" : "Activo";
    const endpoint = `/cuenta/${row.id_Cuenta}/${nextEstado}`; 
    try {
        const response = await deleteRecord({
            endpoint: endpoint,
        });
        if (response.statusCode >= 200 && response.statusCode < 300) {
            setRows((prev) =>
                prev.map((r) =>
                    r.id_Cuenta === row.id_Cuenta ? { ...r, estado: nextEstado } : r
                )
            );
        } else {
            console.error("Error al actualizar el estado:", response.errorMessage);
            alert("No se pudo actualizar el estado de la cuenta.");
        }

    } catch (error) {
        console.error("Error de conexión o excepción inesperada:", error);
        alert("Ocurrió un error inesperado al intentar conectar con el servidor.");
    }
}, []);

  const getRoleColor = (rol: string):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    const colors = {
      Coordinador: "info",
      Revisor: "warning",
      Director: "secondary",
      "Director Unidad": "secondary",
      "Director General": "secondary",
      Gestor: "success",
      Organización: "default",
    } as const;
    return colors[rol as keyof typeof colors] || "default";
  };

  const getStatusColor = (estado: string) =>
    estado === "Activo" ? "success" : "error";

  const columns: GridColDef<Account>[] = useMemo(
    () => [
      { field: "correo", headerName: "CORREO", flex: 1.3, minWidth: 200 },
      {
        field: "nombre",
        headerName: "NOMBRE O RAZÓN SOCIAL",
        flex: 1.5,
        minWidth: 200,
      },
      {
        field: "rol",
        headerName: "ROL",
        flex: 0.8,
        minWidth: 140,
        renderCell: (params) => (
          <Chip
            label={params.value}
            color={getRoleColor(params.value)}
            variant="filled"
            size="small"
            className="chip-role"
          />
        ),
      },
      {
        field: "unidad",
        headerName: "UNIDAD ACADÉMICA",
        flex: 1,
        minWidth: 160,
      },
      {
        field: "estado",
        headerName: "ESTADO",
        flex: 0.7,
        minWidth: 120,
        renderCell: (params) => (
          <Chip
            label={params.value}
            color={getStatusColor(params.value)}
            variant="filled"
            size="small"
            className="chip-status"
          />
        ),
      },
      {
        field: "acciones",
        headerName: "ACCIONES",
        flex: 0.4,
        minWidth: 100,
        sortable: false,
        renderCell: (params) => (
          <RowMenu<Account>
            row={params.row}
            estado={params.row.estado}
            onVer={handleVer}
            onEditar={handleEditar}
            onToggleEstado={handleToggleEstado}
          />
        ),
      },
    ],
    [handleVer, handleEditar, handleToggleEstado]
  );

  const CustomFooter = () => (
    <Toolbar className="footer-toolbar">
      <Box className="export-section-inline">
        <Button
          startIcon={<DownloadIcon fontSize="small" />}
          variant="text"
          sx={{
            textTransform: "none",
            color: "#333",
            fontWeight: 500,
            fontFamily: "madaniArabicRegular",
          }}
          onClick={() => console.log("Exportar Excel")}
        >
          Exportar Excel
        </Button>
      </Box>
      <GridPagination />
    </Toolbar>
  );

  return (
    <Box className="accounts-table-container">
      <DataGrid
        className="accounts-table"
        disableColumnMenu
        rows={filteredRows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id_Cuenta}
        paginationMode="server"
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 20]}
        slots={{ footer: CustomFooter }}
        sx={{
          border: "none",
          "& .MuiDataGrid-columnHeaders": { fontWeight: 600 },
        }}
      />
    </Box>
  );
}
