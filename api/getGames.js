// Contenido para /api/getGames.js
export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "La clave de API de RAWG no está configurada." }); }

    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const year = urlParams.get('year'); // Recibimos el año como parámetro

        if (!year) {
            return response.status(400).json({ message: "No se proporcionó un año." });
        }

        // Creamos el rango de fechas para el año solicitado
        const dates = `${year}-01-01,${year}-12-31`;
        // Pedimos los juegos de ese año, ordenados por la mejor puntuación de Metacritic
        const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=${dates}&ordering=-metacritic&page_size=40`;

        const apiResponse = await fetch(url);
        if (!apiResponse.ok) throw new Error(`Error al obtener datos de RAWG. Estado: ${apiResponse.status}`);
        const data = await apiResponse.json();
        
        const games = data.results.map(game => ({
            id: game.id,
            title: game.name,
            imageUrl: game.background_image,
            platforms: game.platforms?.map(p => p.platform.name).join(', ') || 'N/D',
            releaseDate: game.released,
            metacritic: game.metacritic || null,
            steamUrl: game.stores?.find(s => s.store.slug === 'steam')?.url,
            trailerUrl: game.clip?.clip,
            description: game.description || null, // Incluimos descripción para el modal
            short_screenshots: game.short_screenshots || []
        }));

        response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        response.status(200).json(games);

    } catch (error) {
        console.error("ERROR EN getGames:", error.message);
        response.status(500).json({ message: "Error interno del servidor.", details: error.message });
    }
}