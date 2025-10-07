// Contenido para /api/getDiscoverGames.js
export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "La clave de API de RAWG no está configurada." }); }

    try {
        const randomPage = Math.floor(Math.random() * 20) + 1;
        const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&metacritic=85,100&page=${randomPage}&page_size=40`;

        const apiResponse = await fetch(url);
        if (!apiResponse.ok) throw new Error(`Error al obtener datos de RAWG. Estado: ${apiResponse.status}`);
        const data = await apiResponse.json();
        
        // AHORA INCLUIMOS LOS GÉNEROS EN LA RESPUESTA
        const games = data.results.map(game => ({
            id: game.id,
            title: game.name,
            imageUrl: game.background_image,
            genres: game.genres.map(g => g.name) // Array con los nombres de los géneros
        }));

        response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        response.status(200).json(games);

    } catch (error) {
        console.error("ERROR EN getDiscoverGames:", error.message);
        response.status(500).json({ message: "Error interno del servidor.", details: error.message });
    }
}