export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;

    if (!RAWG_API_KEY) {
        return response.status(500).json({ message: "La clave de API de RAWG no está configurada." });
    }

    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const startYear = currentYear - 4; // Ir 4 años atrás
        const endYear = currentYear + 1;   // Mirar 1 año hacia el futuro

        // Pide juegos de un rango de 6 años, ordenados por los más añadidos recientemente
        const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=${startYear}-01-01,${endYear}-12-31&ordering=-added&page_size=100000`;

        const apiResponse = await fetch(url);

        if (!apiResponse.ok) {
            throw new Error(`Error al obtener datos de RAWG. Estado: ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        
        const games = data.results.map(game => ({
            id: game.id,
            title: game.name,
            imageUrl: game.background_image,
            platforms: game.platforms?.map(p => p.platform.name).join(', ') || 'N/D',
            releaseDate: game.released,
            releaseDateString: new Date(game.released).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase().replace('.','') || 'TBA',
            genre: game.genres?.map(g => g.name).join(', ') || 'Indefinido',
            metacritic: game.metacritic || null,
            steamUrl: game.stores?.find(s => s.store.slug === 'steam')?.url,
            trailerUrl: game.clip?.clip
        }));

        response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
        response.status(200).json(games);

    } catch (error) {
        console.error("ERROR EN LA FUNCIÓN (RAWG):", error.message);
        response.status(500).json({ 
            message: "Error interno del servidor al usar la API de RAWG.",
            details: error.message 
        });
    }
}