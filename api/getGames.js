import fetch from 'node-fetch';

export default async function handler(request, response) {
    const { IGDB_CLIENT_ID, IGDB_CLIENT_SECRET } = process.env;

    try {
        const tokenResponse = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`, {
            method: 'POST',
        });
        if (!tokenResponse.ok) throw new Error(`Fallo al obtener el token de Twitch. Estado: ${tokenResponse.status}`);
        const tokenJson = await tokenResponse.json();
        const accessToken = tokenJson.access_token;

        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        const startOfYearInSeconds = Math.floor(startOfYear.getTime() / 1000);
        const endOfYearInSeconds = Math.floor(endOfYear.getTime() / 1000);
        
        const fields = "fields name, cover.url, platforms.abbreviation, first_release_date, summary, genres.name, hypes, videos.video_id, videos.name, websites.url, websites.category;";
        const baseQuery = `where category = 0 & first_release_date >= ${startOfYearInSeconds} & first_release_date <= ${endOfYearInSeconds} & cover.url != null & platforms = {6,167,169}`;

        // Petición 1: Juegos Mainstream (que NO sean indies)
        const mainstreamBody = `${fields} ${baseQuery} & genres != 32; sort hypes desc; limit 25;`;
        
        // Petición 2: Juegos Indie (género ID 32)
        const indieBody = `${fields} ${baseQuery} & genres = 32; sort hypes desc; limit 25;`;

        const fetchIGDB = (body) => fetch("https://api.igdb.com/v4/games", {
            method: 'POST',
            headers: { 'Client-ID': IGDB_CLIENT_ID, 'Authorization': `Bearer ${accessToken}` },
            body: body
        });

        const [mainstreamResponse, indieResponse] = await Promise.all([
            fetchIGDB(mainstreamBody),
            fetchIGDB(indieBody)
        ]);

        if (!mainstreamResponse.ok || !indieResponse.ok) throw new Error(`Fallo al obtener datos de IGDB.`);

        const mainstreamGames = await mainstreamResponse.json();
        const indieGames = await indieResponse.json();

        const allGames = [...mainstreamGames, ...indieGames];
        const uniqueGames = new Map();
        allGames.forEach(game => {
            if (!uniqueGames.has(game.id)) {
                uniqueGames.set(game.id, game);
            }
        });
        
        const combinedResults = Array.from(uniqueGames.values());

        response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        response.status(200).json(combinedResults);

    } catch (error) {
        console.error("ERROR EN LA FUNCIÓN:", error.message);
        response.status(500).json({ 
            message: "Error interno del servidor.",
            details: error.message 
        });
    }
}