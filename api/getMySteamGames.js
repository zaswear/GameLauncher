// Contenido para /api/getMySteamGames.js
export default async function handler(request, response) {
    const STEAM_API_KEY = process.env.STEAM_API_KEY;
    const STEAM_ID = process.env.STEAM_ID;

    if (!STEAM_API_KEY || !STEAM_ID) {
        return response.status(500).json({ message: "Las variables de Steam no están configuradas en Vercel." });
    }

    try {
        // 1. Pedimos a la API de Steam la lista de todos los juegos del usuario
        const steamUrl = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${STEAM_ID}&format=json&include_appinfo=true`;
        const steamResponse = await fetch(steamUrl);
        if (!steamResponse.ok) throw new Error('No se pudo obtener la lista de juegos de Steam.');
        const steamData = await steamResponse.json();
        
        // 2. Procesamos y limpiamos los datos
        const games = steamData.response.games.map(game => {
            const playtimeHours = (game.playtime_forever / 60).toFixed(1);
            let status = 'Sin Jugar';
            if (playtimeHours > 0) status = 'Jugado';
            
            // Creamos URLs para las imágenes de Steam
            const imageUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`;

            return {
                id: game.appid,
                title: game.name,
                imageUrl: imageUrl,
                playtime: parseFloat(playtimeHours),
                status: status,
                platform: 'Steam',
                // Los logros requieren otra llamada a la API, lo dejamos como "No completado" por ahora
                completed: false 
            };
        });

        response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache por 1 hora
        response.status(200).json(games);

    } catch (error) {
        console.error("ERROR EN getMySteamGames:", error.message);
        response.status(500).json({ message: "Error interno del servidor.", details: error.message });
    }
}