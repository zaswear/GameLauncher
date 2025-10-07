// Contenido para /api/get-random-game.js
export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "RAWG API Key not configured." }); }
    try {
        const randomPage = Math.floor(Math.random() * 25) + 1;
        // Buscamos juegos excelentes (Metacritic > 88) de una página aleatoria
        const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&metacritic=88,100&page=${randomPage}&page_size=40`;
        const apiResponse = await fetch(url);
        if (!apiResponse.ok) throw new Error('Failed to fetch random games.');
        const data = await apiResponse.json();
        if (!data.results || data.results.length === 0) { return response.status(404).json({ message: "No game found, try again!" }); }

        // Elegimos uno al azar de la lista obtenida
        const randomGame = data.results[Math.floor(Math.random() * data.results.length)];
        
        // Pedimos los detalles completos de ese juego para tener una tarjeta rica en información
        const detailsUrl = `https://api.rawg.io/api/games/${randomGame.id}?key=${RAWG_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        if(!detailsResponse.ok) throw new Error('Failed to fetch game details.');
        const gameDetails = await detailsResponse.json();

        response.status(200).json(gameDetails);
    } catch (error) {
        response.status(500).json({ message: "Server error.", details: error.message });
    }
}