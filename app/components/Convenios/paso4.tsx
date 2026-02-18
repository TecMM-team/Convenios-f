import { Box, Typography, Button, Grid, IconButton, Divider } from "@mui/material";
import { useState, useMemo, useEffect, useRef, type ChangeEvent, useCallback } from "react";
import { ArrowForward, ArrowBack, CheckCircle, Visibility, Delete, Article } from "@mui/icons-material";
import { createRecord, getData, getBinaryData, deleteRecord, updateRecord } from '~/utils/apiUtils'; 
import { useSearchParams } from 'react-router';
import Swal from 'sweetalert2';

export type TipoOrganizacion = 'Empresa' | 'Persona Fisica' | 'Persona Física' | 'Dependencia';
type TipoConfigKey = 'Empresa' | 'Persona Fisica' | 'Dependencia';

interface AnexosProps {
  setPaso: (paso: number) => void;
  tipoOrganizacion: TipoOrganizacion; 
  folio: string;
  idConvenio: number;
}

interface DocumentoGuardadoAPI {
    id_Anexo: number;
    ruta_archivo: string; 
    tipo_documento: string; 
}

interface Documento {
    nombre: string; 
    key: string;    
    subido: boolean;
    nombreArchivo: string;
    archivo?: File | null;
    idAnexo?: number; 
    urlObjeto?: string; 
}

type BaseDoc = Omit<Documento, 'subido' | 'nombreArchivo' | 'archivo' | 'idAnexo' | 'urlObjeto'>;

const DOCUMENTOS_CONFIG: Record<TipoOrganizacion, BaseDoc[]> = {
  'Empresa': [
    { nombre: "Acta Constitutiva", key: "Acta" },
    { nombre: "Poder del Representante Legal", key: "Poder" },
    { nombre: "Alta ante Hacienda", key: "AltaHacienda" },
    { nombre: "Identificación Oficial", key: "Identificacion" },
    { nombre: "Comprobante de Domicilio", key: "Comprobante" },
    { nombre: "Convenio Firmado", key: "ConvenioFirmado" },
  ],
  'Persona Fisica': [
    { nombre: "Alta ante Hacienda", key: "AltaHacienda" },
    { nombre: "Identificación Oficial", key: "Identificacion" },
    { nombre: "Comprobante de Domicilio", key: "Comprobante" },
    { nombre: "Convenio Firmado", key: "ConvenioFirmado" },
  ],
  'Persona Física': [
    { nombre: "Alta ante Hacienda", key: "AltaHacienda" },
    { nombre: "Identificación Oficial", key: "Identificacion" },
    { nombre: "Comprobante de Domicilio", key: "Comprobante" },
    { nombre: "Convenio Firmado", key: "ConvenioFirmado" },
  ],
  'Dependencia': [
    { nombre: "Poder del Representante Legal / Nombramiento / Decreto", key: "Nombramiento" },
    { nombre: "Identificación Oficial", key: "Identificacion" },
    { nombre: "Comprobante de Domicilio", key: "Comprobante" },
    { nombre: "Convenio Firmado", key: "ConvenioFirmado" },
  ],
};

const getTipoConfigKey = (tipo: TipoOrganizacion): TipoConfigKey => {
  const normalized = (tipo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("dependencia")) return "Dependencia";
  if (normalized.includes("persona")) return "Persona Fisica";
  return "Empresa";
};

const getTipoOwner = (tipo: TipoOrganizacion): 'Empresa' | 'Dependencia' | 'Persona Física' => {
  const normalized = (tipo || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("dependencia")) return "Dependencia";
  if (normalized.includes("persona")) return "Persona Física";
  return "Empresa";
};

interface AnexoItemProps {
  documento: Documento;
  handleFileChange: (key: string, file: File) => void;
  handleDelete: (key: string) => void;
  handleView: (key: string) => void;
}

const AnexoItem = ({ documento, handleFileChange, handleDelete, handleView }: AnexoItemProps) => {
    const { key, nombre, subido, nombreArchivo } = documento;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => fileInputRef.current?.click();

    const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === "application/pdf") handleFileChange(key, file);
            else alert("Por favor, selecciona un archivo PDF.");
        }
        event.target.value = ''; 
    };

    const fileDisplay = subido ? (
        <Box sx={{ p: 1.5, borderRadius: '4px', display: 'flex', alignItems: 'center', backgroundColor: '#e8f5e9' }}>
            <CheckCircle color="success" sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight="bold">{nombreArchivo}</Typography>
        </Box>
    ) : (
        <Box sx={{ p: 2, backgroundColor: 'transparent', borderRadius: '4px', display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0' }}>
            <Article color="disabled" sx={{ mr: 1 }} />
            <Typography color="textSecondary">No se ha subido ningún documento.</Typography>
        </Box>
    );

    return (
        <Box sx={{ my: 0.05, pt: 0.1, pb: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>{nombre}</Typography>
            <Grid container alignItems="center" spacing={1}>
                <Grid item xs={8}>{fileDisplay}</Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <input type="file" accept="application/pdf" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} />
                    <Box sx={{ display: 'inline-flex' }}>
                        <Button 
                            variant={subido ? "outlined" : "contained"} 
                            size="small"
                            onClick={handleButtonClick}
                            sx={{ mr: 1 }}
                        >
                            {subido ? 'Reemplazar' : 'Subir PDF'}
                        </Button>
                        {subido && (
                            <>
                            <IconButton onClick={() => handleView(key)} aria-label="Ver Documento"><Visibility /></IconButton>
                            <IconButton onClick={() => handleDelete(key)} aria-label="Eliminar Documento"><Delete color="error" /></IconButton>
                            </>
                        )}
                    </Box>
                </Grid>
            </Grid>
            <Divider sx={{ mt: 2 }} />
        </Box>
    );
};

export default function AnexosPaso4({ setPaso, tipoOrganizacion, folio, idConvenio }: AnexosProps) {
  const [isLoading, setIsLoading] = useState(true); 
  const [documentos, setDocumentos] = useState<Documento[]>([]); 
  const documentosRef = useRef(documentos);
  const [searchParams] = useSearchParams();
  
  useEffect(() => { documentosRef.current = documentos; }, [documentos]);
  
  const tipoConfig = getTipoConfigKey(tipoOrganizacion);
  const tipoOwner = getTipoOwner(tipoOrganizacion);

  const UPLOAD_ENDPOINT = "/media/upload"; 
  const FETCH_ENDPOINT_BASE = `/media/anexo/${idConvenio}`; 
  const DOWNLOAD_ENDPOINT_BASE = `/media/download/${idConvenio}`; 

  const documentosBase = useMemo(() => DOCUMENTOS_CONFIG[tipoConfig].map(doc => ({
      ...doc, subido: false, nombreArchivo: "", archivo: null, idAnexo: undefined, urlObjeto: undefined,
  })), [tipoConfig]); 

  const getFileNameFromPath = (fullPath: string) => fullPath.split(/[\/\\]/).pop() || 'documento.pdf';

  const fetchFileBinary = useCallback(async (docKey: string, filename: string) => {
      try {
          const result = await getBinaryData({ endpoint: `${DOWNLOAD_ENDPOINT_BASE}/${docKey}` });
          if (result.statusCode !== 200 || !result.data || result.data.byteLength === 0) {
              console.warn(`Error al precargar ${docKey}.`);
              return null;
          }
          const blob = new Blob([result.data], { type: 'application/pdf' });
          return new File([blob], filename, { type: 'application/pdf' });
      } catch (error) {
          console.error(`Error inesperado al precargar el binario para ${docKey}:`, error);
          return null;
      }
  }, [DOWNLOAD_ENDPOINT_BASE]); 

  const fetchSavedDocuments = useCallback(async () => {
      setIsLoading(true);
      documentosRef.current.forEach(doc => doc.urlObjeto && URL.revokeObjectURL(doc.urlObjeto));
      setDocumentos(documentosBase); 

      try {
          const result = await getData({ endpoint: FETCH_ENDPOINT_BASE });
          const dataArray = result.data?.Anexos || result.data?.tipos; 
          
          if (result.statusCode < 200 || result.statusCode >= 300 || !dataArray) {
              console.warn("No se encontraron documentos guardados o hubo un error al cargar.");
              return;
          }

          const documentosGuardados = dataArray as DocumentoGuardadoAPI[];
          const precargaPromesas = documentosBase.map(async baseDoc => {
              const savedDoc = documentosGuardados.find(d => d.tipo_documento === baseDoc.nombre);
              if (!savedDoc) return baseDoc;
              
              const nombreArchivoExtraido = getFileNameFromPath(savedDoc.ruta_archivo);
              const fileObject = await fetchFileBinary(baseDoc.key, nombreArchivoExtraido);
              
              const urlObjeto = fileObject ? URL.createObjectURL(fileObject) : undefined;
              
              return {
                  ...baseDoc, subido: true, idAnexo: savedDoc.id_Anexo, 
                  nombreArchivo: nombreArchivoExtraido, archivo: fileObject, urlObjeto, 
              };
          });
          
          setDocumentos(await Promise.all(precargaPromesas)); 
      } catch (error) {
          console.error("Error al cargar y precargar documentos:", error);
          setDocumentos(documentosBase);
      } finally {
          setIsLoading(false);
      }
  }, [FETCH_ENDPOINT_BASE, documentosBase, fetchFileBinary]); 

  useEffect(() => {
    fetchSavedDocuments();
    return () => documentosRef.current.forEach(doc => doc.urlObjeto && URL.revokeObjectURL(doc.urlObjeto));
  }, [fetchSavedDocuments]); 

  const todosSubidos = documentos.every(doc => doc.subido);

  const updateDocumentState = (key: string, update: Partial<Documento>) => {
    setDocumentos(docs => docs.map(doc => {
      if (doc.key !== key) return doc;
      if (doc.urlObjeto && update.urlObjeto === undefined) URL.revokeObjectURL(doc.urlObjeto);
      return { ...doc, ...update };
    }));
  };

  const handleFileChange = (key: string, file: File) => {
    updateDocumentState(key, { 
        subido: true, 
        nombreArchivo: file.name, 
        archivo: file, 
        urlObjeto: undefined,
    });
  };

  const handleDelete = async (key: string) => {
    const docToDelete = documentos.find(doc => doc.key === key);
    if (!docToDelete) return;

    const resetDoc = { subido: false, nombreArchivo: "", archivo: null, idAnexo: undefined, urlObjeto: undefined };

    if (!docToDelete.idAnexo) return updateDocumentState(key, resetDoc);

    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar documento?',
      text: `¿Estás seguro de que deseas eliminar permanentemente "${docToDelete.nombre}"? Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
        const deleteResult = await deleteRecord({ endpoint: `/media/anexo/${docToDelete.idAnexo}` });

        if (deleteResult.statusCode >= 200 && deleteResult.statusCode < 300) {
            await Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'Documento eliminado exitosamente.',
              confirmButtonColor: '#1976d2'
            });
            updateDocumentState(key, resetDoc);
        } else {
            console.error("Error al eliminar documento:", deleteResult.errorMessage);
            await Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Error al eliminar: ${deleteResult.errorMessage}`,
              confirmButtonColor: '#1976d2'
            });
        }
    } catch (error) {
        console.error("Error inesperado al eliminar:", error);
        await Swal.fire({
          icon: 'error',
          title: 'Error inesperado',
          text: 'Ocurrió un error inesperado al intentar eliminar el documento.',
          confirmButtonColor: '#1976d2'
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleView = async (key: string) => {
    const docToView = documentos.find(doc => doc.key === key);
    if (!docToView) return;

    const fileURL = docToView.archivo ? URL.createObjectURL(docToView.archivo) : docToView.urlObjeto;
    
    if (!fileURL) {
        await Swal.fire({
          icon: 'warning',
          title: 'Archivo no disponible',
          text: docToView.subido 
            ? 'El archivo está guardado pero no pudo ser precargado. Intente recargar la página.' 
            : `No hay archivo cargado para visualizar la clave: ${key}`,
          confirmButtonColor: '#1976d2'
        });
        return;
    }

    try {
        const newWindow = window.open(fileURL, '_blank');
        if (!newWindow) {
          await Swal.fire({
            icon: 'error',
            title: 'Bloqueado',
            text: 'El navegador bloqueó la apertura de la vista previa.',
            confirmButtonColor: '#1976d2'
          });
        }
        if (docToView.archivo && !docToView.urlObjeto) setTimeout(() => URL.revokeObjectURL(fileURL), 100);
    } catch (error) {
        console.error("Error al intentar abrir el archivo:", error);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible abrir el documento.',
          confirmButtonColor: '#1976d2'
        });
    }
  };


  const handleSave = async () => {
    const archivosAsubir = documentos.filter(doc => doc.archivo instanceof File);

    if (archivosAsubir.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sin archivos',
        text: 'No hay archivos nuevos o reemplazados pendientes de guardar.',
        confirmButtonColor: '#1976d2'
      });
      return;
    }

    const formData = new FormData();
    archivosAsubir.forEach(doc => doc.archivo && formData.append(doc.key, doc.archivo));
    formData.append('tipoPersona', tipoOwner);
    formData.append('folio', folio);
    formData.append('idConvenio', idConvenio.toString());

    setIsLoading(true);
    try {
        const result = await createRecord({ endpoint: UPLOAD_ENDPOINT, data: formData });

        if (result.statusCode >= 200 && result.statusCode < 300) {
            await Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: `Documentos de ${tipoOrganizacion} guardados correctamente.`,
              confirmButtonColor: '#1976d2'
            });
            await fetchSavedDocuments();
        } else {
            console.error("Error al guardar documentos:", result.errorMessage);
            await Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Error al guardar los archivos: ${result.errorMessage}`,
              confirmButtonColor: '#1976d2'
            });
        }
    } catch (error) {
        console.error("Error inesperado:", error);
        await Swal.fire({
          icon: 'error',
          title: 'Error inesperado',
          text: 'Ocurrió un error inesperado al intentar guardar.',
          confirmButtonColor: '#1976d2'
        });
    } finally {
        setIsLoading(false);
    }
  };


  const handleContinue = async () => {
    if (!todosSubidos) {
      alert("Por favor, sube y **guarda** todos los documentos requeridos antes de continuar.");
      return;
    }
    
    // Actualizar el ultimo_paso en el backend antes de avanzar
    const numeroConvenio = searchParams.get('numero_convenio');
    if (numeroConvenio) {
      try {
        await updateRecord({
          data: { 
            numero_convenio: numeroConvenio,
            ultimo_paso: 4 
          },
          endpoint: '/convenios/draft'
        });
      } catch (error) {
        console.error('Error al actualizar ultimo_paso:', error);
      }
    }
    
    setPaso(5);
  }

  const commonBtnSx = { padding: "10px 24px", fontSize: "1rem", fontWeight: "bold", textTransform: "none" };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h5" gutterBottom>Documentos Requeridos para: {tipoOrganizacion}</Typography>
        <Divider sx={{ mb: 3 }}/>

        {isLoading && documentos.length === 0 ? (
            <Typography variant="h6" color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>Cargando documentos guardados y precargando archivos...</Typography>
        ) : (
            documentos.map(doc => <AnexoItem key={doc.key} documento={doc} handleFileChange={handleFileChange} handleDelete={handleDelete} handleView={handleView} />)
        )}
      
        <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", mt: 4 }}>
            <Box>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<ArrowBack />} 
                  onClick={() => setPaso(3)} 
                  disabled={isLoading} 
                  sx={{ 
                    mr: 2,
                    padding: '10px 24px', 
                    fontSize: '1rem', 
                    fontWeight: 'bold', 
                    textTransform: 'none' 
                  }}
                >
                  Regresar
                </Button>
                
                <Button
                  variant="contained" 
                  color="primary" 
                  endIcon={<ArrowForward />} 
                  onClick={handleContinue} 
                  disabled={!todosSubidos || isLoading}
                  sx={{ 
                    mr: 2,
                    padding: '10px 24px', 
                    fontSize: '1rem', 
                    fontWeight: 'bold', 
                    textTransform: 'none' 
                  }}
                >
                  Continuar
                </Button>
                
                <Button
                  variant="outlined" 
                  color="primary" 
                  onClick={handleSave} 
                  disabled={isLoading || documentos.some(doc => doc.archivo && doc.archivo instanceof File) === false} 
                  sx={{ 
                    padding: '10px 24px', 
                    fontSize: '1rem', 
                    fontWeight: 'bold', 
                    textTransform: 'none' 
                  }}
                >
                  {isLoading ? 'Guardando...' : 'Guardar Archivos'}
                </Button>
            </Box>
        </Box>
    </Box>
  );
}
