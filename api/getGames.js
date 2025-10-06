// Este código NO va en tu HTML. Es un archivo separado en tu proyecto.
// Importa un cliente para hacer peticiones HTTP (como 'axios' o 'node-fetch')
import fetch from 'node-fetch';

export default async function handler(request, response) {
  // 1. La API Key se guarda de forma segura como una variable de entorno
  const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;
  const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;

  // 2. Tu backend obtiene un token de autenticación
  const tokenResponse = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`, {
    method: 'POST',
  });
  const tokenJson = await tokenResponse.json();
  const accessToken = tokenJson.access_token;

  // 3. Llama a la API de IGDB con el token y la clave
  const apiResponse = await fetch("https://api.igdb.com/v4/games", {
    method: 'POST',
    headers: {
      'Client-ID': IGDB_CLIENT_ID,
      'Authorization': `Bearer ${accessToken}`,
    },
    // Este es un ejemplo de petición para juegos próximos, muy esperados y con carátula
    body: 'fields name, cover.url, platforms.abbreviation, first_release_date, summary; where first_release_date > 1727827200 & cover.url != null & platforms = (6, 167, 169); sort popularity desc; limit 50;'
  });

  // 4. Devuelve los datos a tu página (frontend)
  const games = await apiResponse.json();
  response.status(200).json(games);
}