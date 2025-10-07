// Contenido para /api/getDiscoverGames.js
export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "La clave de API de RAWG no está configurada." }); }

    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const lang = urlParams.get('lang') || 'es'; // 'es' por defecto
        
        const randomPage = Math.floor(Math.random() * 20) + 1;
        const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&metacritic=85,100&page=${randomPage}&page_size=40&lang=${lang}`;

        const apiResponse = await fetch(url);
        if (!apiResponse.ok) throw new Error(`Error al obtener datos de RAWG.`);
        const data = await apiResponse.json();
        
        const games = data.results.map(game => ({
            id: game.id,
            title: game.name,
            imageUrl: game.background_image,
            genres: game.genres.map(g => g.name)
        }));

        response.setHeader('Cache-Control', 'no-cache');
        response.status(200).json(games);

    } catch (error) {
        response.status(500).json({ message: "Error interno del servidor.", details: error.message });
    }
}