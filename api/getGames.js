import fetch from 'node-fetch';

export default async function handler(request, response) {
    const { IGDB_CLIENT_ID, IGDB_CLIENT_SECRET } = process.env;

    // --- NUEVAS LÍNEAS DE DEPURACIÓN ---
    console.log('--- INICIANDO FUNCIÓN getGames ---');
    console.log('Client ID que estoy usando:', IGDB_CLIENT_ID);
    console.log('Client Secret que estoy usando (parcial):', IGDB_CLIENT_SECRET ? `${IGDB_CLIENT_SECRET.substring(0, 4)}...` : 'INDEFINIDO O VACÍO');
    // ------------------------------------

    try {
        const tokenResponse = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`, {
            method: 'POST',
        });

        if (!tokenResponse.ok) {
            // Este log nos dará el detalle del error de Twitch
            const errorBody = await tokenResponse.text();
            console.error('Error recibido de Twitch:', errorBody);
            throw new Error(`Fallo al obtener el token de Twitch. Estado: ${tokenResponse.status}`);
        }
        const tokenJson = await tokenResponse.json();
        const accessToken = tokenJson.access_token;
        
        // El resto del código sigue igual...
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const oneYearFromNow = nowInSeconds + 31536000;
        const body = `
            fields name, cover.url, platforms.abbreviation, first_release_date, summary, genres.name, hypes;
            where first_release_date > ${nowInSeconds} & first_release_date < ${oneYearFromNow} & cover.url != null & platforms = (6, 167, 169) & hypes > 5;
            sort hypes desc;
            limit 25;
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