import fetch from 'node-fetch';

export default async function handler(request, response) {
    const { IGDB_CLIENT_ID, IGDB_CLIENT_SECRET } = process.env;

    try {
        const tokenResponse = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`, {
            method: 'POST',
        });

        if (!tokenResponse.ok) {
            const errorBody = await tokenResponse.text();
            console.error('Error recibido de Twitch:', errorBody);
            throw new Error(`Fallo al obtener el token de Twitch. Estado: ${tokenResponse.status}`);
        }
        const tokenJson = await tokenResponse.json();
        const accessToken = tokenJson.access_token;
        
        // --- CORRECCIÓN DE LA FECHA ---
        // Obtenemos la fecha de hoy
        const now = new Date();
        // Creamos una nueva fecha que sea el día 1 del mes actual
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Convertimos esa fecha a segundos para la API
        const startOfMonthInSeconds = Math.floor(startOfMonth.getTime() / 1000);
        
        // Usamos la nueva fecha en la query para obtener todos los juegos desde el inicio del mes
        const body = `
            fields name, cover.url, platforms.abbreviation, first_release_date, summary, genres.name, hypes, videos.video_id, videos.name, websites.url, websites.category;
            where category = 0 & first_release_date >= ${startOfMonthInSeconds} & cover.url != null & platforms = {6,167,169} & hypes > 1;
            sort first_release_date asc;
            limit 50;
        `;

        const apiResponse = await fetch("https://api.igdb.com/v4/games", {
            method: 'POST',
            headers: { 'Client-ID': IGDB_CLIENT_ID, 'Authorization': `Bearer ${accessToken}` },
            body: body
        });
        
        if (!apiResponse.ok) {
            throw new Error(`Fallo al obtener datos de IGDB. Estado: ${apiResponse.status}`);
        }
        const games = await apiResponse.json();

        response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        response.status(200).json(games);

    } catch (error) {
        console.error("ERROR FINAL EN LA FUNCIÓN:", error.message);
        response.status(500).json({ 
            message: "Error interno del servidor.",
            details: error.message 
        });
    }
}