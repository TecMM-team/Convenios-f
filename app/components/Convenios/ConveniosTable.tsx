import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DataGrid,
  GridPagination,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import { Box, Button, Chip, Toolbar, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { getData } from "~/utils/apiUtils";
import { RowMenu } from "../../common/RowMenu/RowMenu";
import { useAuthContext } from "~/context/AuthContext";
import { useNavigate } from "react-router";
import ValidarModal from "./ValidarModal";
import ValidarCoordinadorModal from "./ValidarCoordinadorModal";
import RequiereAjusteModal from "./RequiereAjusteModal";
import CorregirModal from "./CorregirModal";
import "./styles/ConveniosTable.css";
export interface Convenio {
    id_Convenio: number;
    numero_Convenio: string;
    tipo_Convenio: 'Empresa' | 'Dependencia' | 'Persona Física';
    estado: 'Incompleto' | 'Completo' | 'En Revisión' | 'En Corrección' | 'Revisado' | 'En Validación' | 'Requiere Ajuste'| 'Validado' | 'Cancelado';
    fecha_Inicio: string;
    documentos: string[];
    unidad: string;
    nombre_Organizacion: string;
}
interface ConveniosTableProps {
  query: string;
  setModo: (modo: string) => void;
  setSelecccion: (seleccion: Convenio) => void;
}

const ROLE_COLORS = {
    'Persona Física': "info",
    'Empresa': "warning",
    'Dependencia': "secondary",
} as const;

const STATUS_COLORS = {
    'Incompleto': "warning",
    'Completo': "info",
    'En Revisión': "info",
    'En Corrección': "warning",
    'Revisado': "info",
    'En Validación': "info",
    'Requiere Ajuste': "warning",
    'Validado': "success",
    'Cancelado': "error",
} as const;

const normalizeText = (text: string) =>
    (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .toLowerCase()
    .trim();

export default function ConveniosTable({ query, setModo, setSelecccion }: ConveniosTableProps) {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const [rows, setRows] = useState<Convenio[]>([]);
    const [filteredRows, setFilteredRows] = useState<Convenio[]>([]);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [validarModalOpen, setValidarModalOpen] = useState(false);
    const [convenioAValidar, setConvenioAValidar] = useState<Convenio | null>(null);
    const [validarCoordinadorModalOpen, setValidarCoordinadorModalOpen] = useState(false);
    const [convenioAValidarCoordinador, setConvenioAValidarCoordinador] = useState<Convenio | null>(null);
    const [requiereAjusteModalOpen, setRequiereAjusteModalOpen] = useState(false);
    const [convenioRequiereAjuste, setConvenioRequiereAjuste] = useState<Convenio | null>(null);
    const [corregirModalOpen, setCorregirModalOpen] = useState(false);
    const [convenioACorregir, setConvenioACorregir] = useState<Convenio | null>(null);

    useEffect(() => {
        const fetchConvenios = async () => {
            setLoading(true);
            const res = await getData({
                endpoint: "/convenios",
                query: `?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}`,
            });

            const data = res.data?.data || [];
            const total = res.data?.total || 0;

            setRows(data);
            setFilteredRows(data);
            setRowCount(total);
            setLoading(false);
        };
        fetchConvenios();
    }, [paginationModel]);

    const refetchConvenios = useCallback(async () => {
        setLoading(true);
        const res = await getData({
            endpoint: "/convenios",
            query: `?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}`,
        });

        const data = res.data?.data || [];
        const total = res.data?.total || 0;

        setRows(data);
        setFilteredRows(data);
        setRowCount(total);
        setLoading(false);
    }, [paginationModel]);

    useEffect(() => {
        if (!query.trim()) {
            setFilteredRows(rows);
            return;
        }

        const normalizedQuery = normalizeText(query);
        const terms = normalizedQuery.split(/\s+/).filter(Boolean);
        
        const SEARCH_FIELDS: Array<keyof Convenio> = [
            'numero_Convenio',
            'tipo_Convenio',
            'estado',
            'unidad',
            'nombre_Organizacion',
        ];

        const filtered = rows.filter((row) => {
            const rowText = SEARCH_FIELDS.map(field => normalizeText(row[field] as string)).join(" ");
            
            return terms.every(term => rowText.includes(term));
        });
        
        setFilteredRows(filtered);
    }, [query, rows]);

    const handleEditar = useCallback((row: Convenio) => {
        // Navegar al wizard con el numero_convenio en la URL
        navigate(`/convenios/crear?numero_convenio=${row.numero_Convenio}`);
    }, [navigate]);
    
    const handleVer = useCallback((row: Convenio) => { /* Lógica para ver */ }, []);
    
    const handleDescargarDocumento = useCallback(async (idConvenio: number, nombreDocumento: string) => {
        // Crear un mapeo de nombres a claves (inverso del backend)
        const documentoKeyMap: Record<string, string> = {
            "Acta Constitutiva": "Acta",
            "Poder del Representante Legal": "Poder",
            "Alta ante Hacienda": "AltaHacienda",
            "Identificación Oficial": "Identificacion",
            "Comprobante de Domicilio": "Comprobante",
            "Poder del Representante Legal / Nombramiento / Decreto": "Nombramiento",
            "Convenio Firmado": "ConvenioFirmado"
        };
        
        const docKey = documentoKeyMap[nombreDocumento];
        if (!docKey) {
            console.error("Documento no encontrado:", nombreDocumento);
            return;
        }
        
        const BACK_URL = import.meta.env.VITE_PUBLIC_URL;
        const API_KEY = import.meta.env.VITE_PUBLIC_API_KEY;
        const url = `${BACK_URL}/media/download/${idConvenio}/${docKey}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'api_key': API_KEY
                }
            });
            
            if (!response.ok) {
                throw new Error('Error al descargar el documento');
            }
            
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl, '_blank');
            
            // Limpiar la URL después de un tiempo
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } catch (error) {
            console.error('Error al descargar documento:', error);
            alert('No se pudo abrir el documento');
        }
    }, []);
    
    const handleEnviarRevision = useCallback(async (row: Convenio) => { /* Lógica */ }, []);
    const handleEnviarValidar = useCallback(async (row: Convenio) => { /* Lógica */ }, []);
    const handleValidar = useCallback((row: Convenio) => {
        // Si es Coordinador, usar el modal de Coordinador
        if (user?.rol === "Coordinador") {
            setConvenioAValidarCoordinador(row);
            setValidarCoordinadorModalOpen(true);
        } else {
            // Si es Revisor, usar el modal de Revisor
            setConvenioAValidar(row);
            setValidarModalOpen(true);
        }
    }, [user]);
    const handleCorregir = useCallback((row: Convenio) => {
        setConvenioACorregir(row);
        setCorregirModalOpen(true);
    }, []);
    const handleRequiereAjuste = useCallback((row: Convenio) => {
        setConvenioRequiereAjuste(row);
        setRequiereAjusteModalOpen(true);
    }, []);
    const handleCancelar = useCallback(async (row: Convenio) => { /* Lógica */ }, []);


    const getRoleColor = (rol: string) => 
        ROLE_COLORS[rol as keyof typeof ROLE_COLORS] || "default";
    
    const getStatusColor = (estado: string) => 
        STATUS_COLORS[estado as keyof typeof STATUS_COLORS] || "default";

    const getActionFunctions = useCallback((row: Convenio) => {
        const estadoActual = row.estado;
        let actions: { 
            ver?: typeof handleVer, 
            editar?: typeof handleEditar, 
            enviarRevision?: typeof handleEnviarRevision, 
            enviarValidar?: typeof handleEnviarValidar,
            validar?: typeof handleValidar,
            corregir?: typeof handleCorregir,
            requiereAjuste?: typeof handleRequiereAjuste,
            cancelar?: typeof handleCancelar 
        } = {};
        
        const { rol } = user ?? {};

        const ALLOWED_ACTIONS: Record<string, { edit: string[], cancel: string[], rev: string[], val: string[], validar: string[], corregir: string[], requiereAjuste: string[] }> = {
            Organizacion: {
                edit: ["Incompleto", "En Corrección"],
                cancel: ["Incompleto", "Completo", "En Corrección"],
                rev: ["Completo", "En Corrección"],
                val: [],
                validar: [],
                corregir: [],
                requiereAjuste: [],
            },
            Gestor: {
                edit: ["Incompleto", "En Corrección"],
                cancel: ["Incompleto", "Completo"],
                rev: ["Completo", "En Corrección"],
                val: [],
                validar: [],
                corregir: [],
                requiereAjuste: [],
            },
            Revisor: {
                edit: [],
                cancel: ["En Revisión", "Revisado", "Requiere Ajuste"],
                rev: [],
                val: [],
                validar: ["En Revisión", "Requiere Ajuste"],
                corregir: ["En Revisión", "Requiere Ajuste"],
                requiereAjuste: [],
            },
            Coordinador: {
                edit: [],
                cancel: ["En Validación"],
                rev: [],
                val: [],
                validar: ["En Validación"],
                corregir: [],
                requiereAjuste: ["En Validación"],
            },
        };

        const allowed = ALLOWED_ACTIONS[rol as keyof typeof ALLOWED_ACTIONS];
        
        if (allowed) {
            if (allowed.edit.includes(estadoActual)) actions.editar = handleEditar;
            if (allowed.cancel.includes(estadoActual)) actions.cancelar = handleCancelar;
            if (allowed.rev.includes(estadoActual)) actions.enviarRevision = handleEnviarRevision;
            if (allowed.val.includes(estadoActual)) actions.enviarValidar = handleEnviarValidar;
            if (allowed.validar.includes(estadoActual)) actions.validar = handleValidar;
            if (allowed.corregir.includes(estadoActual)) actions.corregir = handleCorregir;
            if (allowed.requiereAjuste.includes(estadoActual)) actions.requiereAjuste = handleRequiereAjuste;
        }
        
        // Remover acciones según el rol y estado final
        if (rol === "Revisor" && ["En Validación", "Validado", "Cancelado"].includes(estadoActual)) {
             actions.editar = undefined;
             actions.cancelar = undefined;
        }
        if (rol === "Coordinador" && ["Revisado", "Validado", "Cancelado"].includes(estadoActual)) {
             actions.editar = undefined;
             actions.cancelar = undefined;
        }
        
        return actions;
    }, [user, handleVer, handleEditar, handleCancelar, handleEnviarRevision, handleEnviarValidar, handleValidar, handleCorregir, handleRequiereAjuste]);

    const columns: GridColDef<Convenio>[] = useMemo(
        () => [
            { field: "numero_Convenio", headerName: "CONVENIO", flex: 1.3, minWidth: 100 },
            { field: "nombre_Organizacion", headerName: "NOMBRE O RAZÓN SOCIAL", flex: 1.5, minWidth: 250 },
            {
                field: "tipo_Convenio",
                headerName: "TIPO DE CONVENIO",
                flex: 0.8,
                minWidth: 160,
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
            { field: "unidad", headerName: "UNIDAD ACADÉMICA", flex: 1, minWidth: 160 },
            { field: "fecha_Inicio", headerName: "FECHA INICIO", flex: 1, minWidth: 160 },
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
                field: "documentos",
                headerName: "DOCUMENTOS",
                flex: 1,
                minWidth: 200,
                renderCell: (params) => {
                    const documentos = params.value as string[];
                    
                    if (!documentos || documentos.length === 0) {
                        return (
                            <Box display="flex" alignItems="center" justifyContent="flex-start" height="100%">
                                <DescriptionIcon fontSize="small" sx={{ color: "#999" }} />
                                <Box component="span" sx={{ fontSize: 13, color: "#999", ml: 1 }}>
                                    Sin documentos
                                </Box>
                            </Box>
                        );
                    }
                    
                    return (
                        <Box display="flex" alignItems="center" justifyContent="flex-start" gap={0.5} height="100%">
                            {documentos.map((doc, index) => (
                                <Tooltip key={index} title={doc} arrow>
                                    <InsertDriveFileIcon 
                                        fontSize="medium" 
                                        sx={{ color: "#424242", cursor: "pointer" }}
                                        onClick={() => handleDescargarDocumento(params.row.id_Convenio, doc)}
                                    />
                                </Tooltip>
                            ))}
                        </Box>
                    );
                },
            },
            {
                field: "acciones",
                headerName: "ACCIONES",
                flex: 0.4,
                minWidth: 100,
                sortable: false,
                renderCell: (params) => {
                    const actions = getActionFunctions(params.row);
                    return (
                        <RowMenu<Convenio>
                            row={params.row}
                            estado={params.row.estado}
                            onVer={actions.ver}
                            onEditar={actions.editar}
                            onEnviarRevision={actions.enviarRevision}
                            onEnviarValidar={actions.enviarValidar}
                            onValidar={actions.validar}
                            onCorregir={actions.corregir}
                            onRequiereAjuste={actions.requiereAjuste}
                            onCancelar={actions.cancelar}
                        />
                    );
                },
            },
        ],
        [getActionFunctions]
    );

    const exportToCSV = () => {
        if (!filteredRows || filteredRows.length === 0) return;

        const exportCols = columns.filter((c) => c.field !== "acciones");
        const headers = exportCols.map((c) => c.headerName ?? c.field);

        const escapeCell = (value: unknown) => {
            if (value == null) return "";
            let s = typeof value === "string" ? value : String(value);
            s = s.replace(/\r?\n/g, " ").replace(/"/g, '""');
            return `"${s}"`;
        };

        const rowsCsv = filteredRows.map((row) =>
            exportCols.map((col) => escapeCell((row as any)[col.field])).join(",")
        );

        const csvContent = [headers.map(escapeCell).join(","), ...rowsCsv].join("\r\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
        a.href = url;
        a.download = `convenios_export_${timestamp}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const CustomFooter = () => (
        <Toolbar className="footer-toolbar">
            <Box className="export-section-inline">
                <Button
                    startIcon={<DownloadIcon fontSize="small" />}
                    variant="text"
                    sx={{ textTransform: "none", color: "#333", fontWeight: 500 }}
                    onClick={exportToCSV}
                >
                    Exportar Excel
                </Button>
            </Box>
            <GridPagination />
        </Toolbar>
    );

    return (
        <Box className="convenios-table-container">
            <DataGrid
                className="convenios-table"
                disableColumnMenu
                rows={filteredRows}
                columns={columns}
                loading={loading}
                getRowId={(row) => row.id_Convenio}
                paginationMode="server"
                rowCount={rowCount}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 20]}
                slots={{ footer: CustomFooter }}
                sx={{ border: "none", "& .MuiDataGrid-columnHeaders": { fontWeight: 600 } }}
            />
            
            <ValidarModal
                open={validarModalOpen}
                onClose={() => setValidarModalOpen(false)}
                convenio={convenioAValidar}
                onSuccess={refetchConvenios}
            />
            
            <ValidarCoordinadorModal
                open={validarCoordinadorModalOpen}
                onClose={() => setValidarCoordinadorModalOpen(false)}
                convenio={convenioAValidarCoordinador}
                onSuccess={refetchConvenios}
            />
            
            <RequiereAjusteModal
                open={requiereAjusteModalOpen}
                onClose={() => setRequiereAjusteModalOpen(false)}
                convenio={convenioRequiereAjuste}
                onSuccess={refetchConvenios}
            />

            <CorregirModal
                open={corregirModalOpen}
                onClose={() => setCorregirModalOpen(false)}
                convenio={convenioACorregir}
                onSuccess={refetchConvenios}
            />
        </Box>
    );
}