// Contenido actualizado para /api/getGames.js
export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "La clave de API de RAWG no está configurada." }); }

    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const searchTerm = urlParams.get('search');
        let url;

        if (searchTerm) {
            url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(searchTerm)}&page_size=20`;
        } else {
            const now = new Date();
            const currentYear = now.getFullYear();
            const startYear = currentYear - 10;
            const endYear = currentYear + 1;
            url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=${startYear}-01-01,${endYear}-12-31&ordering=-added&page_size=100`;
        }

        const apiResponse = await fetch(url);
        if (!apiResponse.ok) throw new Error(`Error al obtener datos de RAWG. Estado: ${apiResponse.status}`);
        const data = await apiResponse.json();
        
        const games = data.results.map(game => ({
            id: game.id,
            title: game.name,
            imageUrl: game.background_image,
            // --- CAMBIO IMPORTANTE: Enviamos el array completo de plataformas, no solo los nombres ---
            platforms: game.platforms || [], 
            releaseDate: game.released,
            genre: game.genres?.map(g => g.name).join(', ') || 'Indefinido',
            metacritic: game.metacritic || null,
            steamUrl: game.stores?.find(s => s.store.slug === 'steam')?.url,
            trailerUrl: game.clip?.clip
        }));

        response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        response.status(200).json(games);

    } catch (error) {
        console.error("ERROR EN getGames:", error.message);
        response.status(500).json({ message: "Error interno del servidor.", details: error.message });
    }
}