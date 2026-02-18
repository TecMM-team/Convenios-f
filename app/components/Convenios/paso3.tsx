import { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Box, Button, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useAuthContext } from '~/context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router';
import { updateRecord, createRecord, getData } from '~/utils/apiUtils';
import getToken from '~/utils/getToken';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import './styles/Paso3.css';

interface FormPersonaProps {
  setPaso: (paso: number) => void;
  tipoOrganizacion: string;
}

const TINYMCE_TOKEN = import.meta.env.VITE_TINYMCE_TOKEN;
const BACK_URL = import.meta.env.VITE_PUBLIC_URL;

export default function Paso3({ setPaso, tipoOrganizacion }: FormPersonaProps) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const loadedConvenioRef = useRef<string | null>(null);
  const [disabled, setDisabled] = useState(true);
  const [editorReady, setEditorReady] = useState(false);
  const [searchParams] = useSearchParams();

  const { setNoti } = useAuthContext();
  const navigate = useNavigate();
  const getNumeroConvenio = () =>
    searchParams.get('numero_convenio') ||
    new URLSearchParams(window.location.search).get('numero_convenio');
  const getConvenioEndpoint = () => {
    const normalized = (tipoOrganizacion || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (normalized.includes("dependencia")) return "/convenios/dependencia";
    if (normalized.includes("persona")) return "/convenios/persona";
    return "/convenios/empresa";
  };

  // Actualizar el color de fondo cuando cambia el estado disabled
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const iframeBody = editor.getBody();
      if (iframeBody) {
        iframeBody.style.backgroundColor = disabled ? '#f5f5f5' : '#ffffff';
      }
    }
  }, [disabled]);

  const log = async () => {
    if (editorRef.current) {
      await saveContenido(false);
      setPaso(4);
    }
  };

  const saveContenido = async (showSuccessNotification = true) => {
    const numeroConvenio = getNumeroConvenio();
    if (!numeroConvenio || !editorRef.current) return false;

    const contenido = editorRef.current.getContent();
    const result = await updateRecord({
      endpoint: '/convenios/draft',
      data: {
        numero_convenio: numeroConvenio,
        contenido_Personalizado: contenido,
        ultimo_paso: 3,
      },
    });

    if (result.statusCode === 201) {
      if (showSuccessNotification) {
        setNoti({
          open: true,
          type: "success",
          message: "Contenido del convenio guardado",
        });
      }
      return true;
    }

    setNoti({
      open: true,
      type: "error",
      message: result.errorMessage || "No se pudo guardar el contenido del convenio",
    });
    return false;
  };

  const getHtml = async () => {
    const numeroConvenio = getNumeroConvenio();
    
    if (!numeroConvenio) {
      setNoti({
        open: true,
        type: "error",
        message: "No se encontró el número de convenio",
      });
      return;
    }

    const draftResponse = await getData({
      endpoint: `/convenios/draft/${numeroConvenio}`
    });
    const contenidoGuardado = draftResponse.data?.convenio?.contenido_Personalizado;
    if (draftResponse.statusCode === 201 && contenidoGuardado) {
      editorRef.current.setContent(contenidoGuardado);
      loadedConvenioRef.current = numeroConvenio;
      return;
    }

    const response = await createRecord({
      endpoint: getConvenioEndpoint(),
      data: {
        numero_convenio: numeroConvenio
      }
    });

    if (response.statusCode === 200 && response.data?.ok && editorRef && editorRef.current) {
      editorRef.current.setContent(response.data.html);
      loadedConvenioRef.current = numeroConvenio;
    } else {
      setNoti({
        open: true,
        type: "error",
        message: response.data?.msg || response.errorMessage || "Error al cargar la plantilla",
      });
    }
  }

  useEffect(() => {
    const numeroConvenio = getNumeroConvenio();
    if (!numeroConvenio || !editorRef.current || !editorReady) return;
    if (loadedConvenioRef.current === numeroConvenio) return;
    getHtml();
  }, [searchParams, editorReady]);

  const handleButtonClick = async () => {
    if (!editorRef.current) return;
    const tokenData = getToken();
    const apiKey = import.meta.env.VITE_PUBLIC_API_KEY;
    if (!tokenData?.token) {
      setNoti({
        open: true,
        type: 'error',
        message: 'Sesión inválida para generar PDF',
      });
      return;
    }
    
    // 1. Obtener el HTML actual del editor
    const htmlContent = editorRef.current.getContent();
    console.log(htmlContent);
    try {
      const response = await fetch(BACK_URL + '/convenios/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': apiKey,
          'Authorization': `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify({ htmlContent }),
      });

      if (!response.ok) throw new Error('Error al generar el PDF');

      // 2. Convertir la respuesta a un Blob (archivo binario)
      const blob = await response.blob();

      // 3. Crear una URL temporal para el archivo
      const url = window.URL.createObjectURL(blob);

      // 4. Crear un enlace "fantasma" y simular el clic para descargar
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'convenio.pdf'); // Nombre del archivo
      document.body.appendChild(link);
      link.click();

      // 5. Limpieza
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    }catch(error){
      console.error(error);
      setNoti({
        open: true,
        type: 'error',
        message: 'No se pudo descargar el PDF',
      });
    }
  };

  const handleToggleEditor = async () => {
    if (disabled) {
      setDisabled(false);
      return;
    }

    const saved = await saveContenido(true);
    if (saved) {
      setDisabled(true);
    }
  };

  const handleFileUpload = async (event: any) => {
    const tokenData = getToken();
    const apiKey = import.meta.env.VITE_PUBLIC_API_KEY;
    const file = event.target.files[0];

    // Verificar si se seleccionó un archivo
    if (!file) {
      setNoti({
        open: true,
        type: 'error',
        message: 'No se subió el archivo',
      });
      return;
    }

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch(BACK_URL + '/organizacion/archivo', {
        method: 'POST',
        headers: {
          'api_key': apiKey,
          'Authorization': `Bearer ${tokenData?.token || ''}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        if (editorRef && editorRef.current) {
          editorRef.current.setContent(data.html);
        }
      } else {
        setNoti({
          open: true,
          type: 'error',
          message: 'Ha ocurrido un error procesando el archivo',
        });
      }
    } catch (err) {
      setNoti({
        open: true,
        type: 'error',
        message: 'Ha ocurrido un error procesando el archivo',
      });
    }
    console.log('sube archivo');
  };

  return (
    <>
      {/* Lado Derecho: Botones de Personalizar y Descargar PDF */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '10px',
        }}
      >
        <Box>
          <Button
            variant="contained"
            startIcon={disabled ? <EditIcon /> : <SaveIcon />}
            onClick={handleToggleEditor}
            sx={{
              mt: 2,
              mr: 2,
              padding: '10px 24px',
              backgroundColor: '#fff',
              color: '#000',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'none', // Evita que el texto sea mayúsculas
            }}
          >
            {disabled ? 'Editar Convenio' : 'Guardar'}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".docx"
            style={{ display: 'none' }}
            onChange={handleFileUpload} // Aquí se adjunta la función
          />
          <Button
            variant="contained"
            color="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleButtonClick}
            sx={{
              mt: 2,
              mr: 2,
              padding: '10px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'none', // Evita que el texto sea mayúsculas
            }}
          >
            Descargar PDF
          </Button>
        </Box>
      </Box>
        <Editor
          apiKey={TINYMCE_TOKEN}
          onInit={(_evt, editor) => {
            editorRef.current = editor;
            setEditorReady(true);
          }}
          init={{
            height: 500,
            menubar: false,
            plugins: [
              'advlist',
              'autolink',
              'lists',
              'link',
              'image',
              'charmap',
              'preview',
              'anchor',
              'searchreplace',
              'visualblocks',
              'code',
              'fullscreen',
              'insertdatetime',
              'media',
              'table',
              'code',
              'help',
              'wordcount',
            ],
            toolbar:
              'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style: `
              body { 
                font-family: Arial, sans-serif; 
                font-size: 14px;
                margin: 2.5cm 3cm;
                padding: 0;
                background-color: ${disabled ? '#f5f5f5' : '#ffffff'};
              }
            `,
          }}
          disabled={disabled}
        />
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '20px',
        }}
      >
        {/* Botones de Regresar, Continuar y Cancelar */}
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => setPaso(2)}
            sx={{
              mr: 2,
              padding: '10px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'none',
            }}
          >
            Regresar
          </Button>
          <Button
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            onClick={log}
            sx={{
              mr: 2,
              padding: '10px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'none',
            }}
          >
            Continuar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => navigate('/convenios')}
            sx={{
              padding: '10px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    </>
  );
}
