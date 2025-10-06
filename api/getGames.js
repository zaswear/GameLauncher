import fetch from 'node-fetch';

export default async function handler(request, response) {
    // Usamos 'destructuring' para obtener las variables de entorno. Es más limpio.
    const { IGDB_CLIENT_ID, IGDB_CLIENT_SECRET } = process.env;

    // ✅ La "red de seguridad": todo el código va dentro de un bloque try...catch.
    try {
        // --- 1. Obtener token de autenticación de Twitch ---
        const tokenResponse = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`, {
            method: 'POST',
        });

        // ✅ Verificación de error específico.
        if (!tokenResponse.ok) {
            throw new Error(`Fallo al obtener el token de Twitch. Estado: ${tokenResponse.status}`);
        }
        const tokenJson = await tokenResponse.json();
        const accessToken = tokenJson.access_token;

        // --- 2. Construir la query para la API de IGDB ---
        // ✅ Usamos la fecha actual para que la query siempre sea relevante.
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const oneYearFromNow = nowInSeconds + 31536000; // Un año en segundos
        
        const body = `
            fields name, cover.url, platforms.abbreviation, first_release_date, summary, genres.name, hypes;
            where first_release_date > ${nowInSeconds} & first_release_date < ${oneYearFromNow} & cover.url != null & platforms = (6, 167, 169) & hypes > 5;
            sort hypes desc;
            limit 25;
        `;

        // --- 3. Llamar a la API de IGDB ---
        const apiResponse = await fetch("https://api.igdb.com/v4/games", {
            method: 'POST',
            headers: {
                'Client-ID': IGDB_CLIENT_ID,
                'Authorization': `Bearer ${accessToken}`,
            },
            body: body
        });

        // ✅ Verificación de error específico.
        if (!apiResponse.ok) {
            throw new Error(`Fallo al obtener datos de IGDB. Estado: ${apiResponse.status}`);
        }
        const games = await apiResponse.json();

        // --- 4. Devolver los datos al frontend ---
        // Se añade una cabecera para permitir el caché por 1 hora, reduciendo llamadas a la API.
        response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        response.status(200).json(games);

    } catch (error) {
        // ✅ Si algo falla en el bloque 'try', se ejecuta esto.
        // Registra el error real en los logs de Vercel para que puedas verlo.
        console.error("ERROR EN LA FUNCIÓN DEL SERVIDOR:", error.message);
        // Envía una respuesta de error clara al frontend.
        response.status(500).json({ 
            message: "Error interno del servidor.",
            details: error.message 
        });
    }
}