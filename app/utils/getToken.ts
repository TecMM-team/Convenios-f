interface TokenPayload {
  id_Cuenta: number;
  rol: string;
  id_Unidad_Academica: number;
  nombre: string;
  correo: string;
  iat: number;
  exp: number;
}

interface ParsedToken {
  id_Cuenta: number;
  rol: string;
  id_Unidad_Academica: number;
  nombre: string;
  correo: string;
  token: string;
}

export function parseJwt(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload) as TokenPayload;
  } catch {
    console.error('Error al parsear el JWT');
    return null;
  }
}

export default function getToken(): ParsedToken | null {
  const jwt = localStorage.getItem('authToken');
  if (!jwt) {
    return null;
  }

  const parsedJwt = parseJwt(jwt);
  if (!parsedJwt) {
    return null;
  }

  const { exp, id_Cuenta, rol, id_Unidad_Academica, nombre, correo } = parsedJwt;

  if (exp * 1000 < Date.now()) {
    localStorage.removeItem('authToken');
    return null;
  }

  const data: ParsedToken = {
    id_Cuenta,
    rol,
    id_Unidad_Academica,
    nombre,
    correo,
    token: jwt,
  };

  return data;
}
