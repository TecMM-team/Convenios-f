import axios, { type AxiosRequestConfig, type ResponseType } from 'axios'; // 1. Importar ResponseType
import getToken from './getToken';

const ERROR_MAPPING: { [key: number]: { statusCode: number, errorMessage: string } } = {
  400: { statusCode: 400, errorMessage: '¡Revisa que los campos sean correctos!' },
  401: { statusCode: 401, errorMessage: '¡Usuario no autorizado!' },
  404: { statusCode: 404, errorMessage: '¡Registro no encontrado!' },
};

interface MakeCallParams {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  data?: any;
  query?: string;
  responseType?: ResponseType;
}

const makeCall = async ({
  method,
  endpoint,
  data,
  query,
  responseType = 'json',
}: MakeCallParams) => {
  const tokenData = getToken();

  if (!tokenData || !tokenData.token) {
    return {
      statusCode: 401,
      errorMessage: '¡Usuario no autorizado!',
      data: [],
    };
  }

  const { token } = tokenData;
  const apiKey = import.meta.env.VITE_PUBLIC_API_KEY;
  const domain = import.meta.env.VITE_PUBLIC_URL;
  const url = `${domain}${endpoint}${query || ''}`;
  
  const isFormData = data instanceof FormData;
  
  const headers: Record<string, string> = {
    api_key: apiKey!,
    Authorization: `Bearer ${token}`,
  };
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config: AxiosRequestConfig = {
    method,
    url,
    headers,
    data,
    responseType: responseType,
  };

  try {
    const response = await axios(config);
    return {
      statusCode: response.status,
      data: response.data,
    };
  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    
    let errorMessage = '¡Error Interno del Servidor!';
    
    if (error.response?.data) {
        if (responseType === 'arraybuffer' && error.response.data instanceof ArrayBuffer) {
             try {
                 const textDecoder = new TextDecoder();
                 const errorJson = JSON.parse(textDecoder.decode(error.response.data));
                 errorMessage = errorJson.message || errorMessage;
             } catch (e) { /* Fallback */ }
        } else {
             errorMessage = error.response.data.message || ERROR_MAPPING[statusCode]?.errorMessage || errorMessage;
        }
    }

    return {
      statusCode,
      errorMessage,
      data: [],
    };
  }
};

const getData = ({ endpoint, query }: { endpoint: string, query?: string }) => {
  if (!endpoint) {
    return { ...ERROR_MAPPING[400], data: [] };
  }
  return makeCall({ method: 'GET', endpoint, query });
};

const createRecord = ({ data, endpoint }: { data: any, endpoint: string }) => {
  if (!endpoint) { return { ...ERROR_MAPPING[400], data: [] }; }
  return makeCall({ method: 'POST', endpoint, data });
};

const updateRecord = ({ data, endpoint }: { data: any, endpoint: string }) => {
  if (!endpoint) { return { ...ERROR_MAPPING[400], data: [] }; }
  return makeCall({ method: 'PATCH', endpoint, data });
};

const deleteRecord = ({ endpoint }: { endpoint: string }) => {
  if (!endpoint) { return { ...ERROR_MAPPING[400], data: [] }; }
  return makeCall({ method: 'DELETE', endpoint });
};

const getBinaryData = ({ endpoint }: { endpoint: string }) => {
    if (!endpoint) { return { ...ERROR_MAPPING[400], data: [] }; }
    
    return makeCall({ 
        method: 'GET', 
        endpoint, 
        responseType: 'arraybuffer'
    });
};

export {
  getData,
  createRecord,
  updateRecord,
  deleteRecord,
  getBinaryData,
};