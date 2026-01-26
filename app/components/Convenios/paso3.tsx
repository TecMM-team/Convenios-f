import { useRef, useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Box, Button, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useAuthContext } from '~/context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router';
import { updateRecord, createRecord } from '~/utils/apiUtils';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CancelIcon from '@mui/icons-material/Cancel';
import './styles/Paso3.css';

interface FormPersonaProps {
  setPaso: (paso: number) => void;
}

const TINYMCE_TOKEN = import.meta.env.VITE_TINYMCE_TOKEN;
const BACK_URL = import.meta.env.VITE_PUBLIC_URL;

export default function Paso3({ setPaso }: FormPersonaProps) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [disabled, setDisabled] = useState(true);
  const [searchParams] = useSearchParams();

  const { setNoti } = useAuthContext();
  const navigate = useNavigate();

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
      const contenido = editorRef.current.getContent();
      console.log(contenido);
      
      // Actualizar el ultimo_paso en el backend antes de avanzar
      const numeroConvenio = searchParams.get('numero_convenio');
      if (numeroConvenio) {
        try {
          await updateRecord({
            data: { 
              numero_convenio: numeroConvenio,
              ultimo_paso: 3 
            },
            endpoint: '/convenios/draft'
          });
        } catch (error) {
          console.error('Error al actualizar ultimo_paso:', error);
        }
      }
      
      setPaso(4);
    }
  };

  const getHtml = async () => {
    const numeroConvenio = searchParams.get('numero_convenio');
    
    if (!numeroConvenio) {
      setNoti({
        open: true,
        type: "error",
        message: "No se encontró el número de convenio",
      });
      return;
    }

    const response = await createRecord({
      endpoint: '/convenios/empresa',
      data: {
        numero_convenio: numeroConvenio
      }
    });

    if (response.statusCode === 200 && response.data?.ok && editorRef && editorRef.current) {
      editorRef.current.setContent(response.data.html);
    } else {
      setNoti({
        open: true,
        type: "error",
        message: response.data?.msg || "Error al cargar la plantilla",
      });
    }
  }

  const handleButtonClick = async () => {
    if (!editorRef.current) return;
    
    // 1. Obtener el HTML actual del editor
    const htmlContent = editorRef.current.getContent();
    console.log(htmlContent);
    try {
      const response = await fetch(BACK_URL + '/convenios/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  const handleFileUpload = async (event: any) => {
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
            startIcon={<EditIcon />}
            onClick={() => setDisabled(!disabled)}
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
            {disabled ? 'Personalizar' : 'Bloquear'}
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
            getHtml();
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
