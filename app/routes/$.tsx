// Ruta catch-all para manejar 404s y peticiones especiales
export default function CatchAll() {
  // Simplemente retorna null para peticiones no encontradas
  // Esto evita errores en la consola para rutas como .well-known
  return null;
}

export function loader() {
  // Retorna una respuesta vacía con status 404
  return new Response(null, {
    status: 404,
    statusText: "Not Found",
  });
}
