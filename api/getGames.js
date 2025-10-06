// Este es el nuevo código completo para /api/getGames.js

export default async function handler(request, response) {
    // Leemos la nueva clave de API de RAWG
    const RAWG_API_KEY = process.env.RAWG_API_KEY;

    if (!RAWG_API_KEY) {
        return response.status(500).json({ message: "La clave de API de RAWG no está configurada." });
    }

    try {
        // --- CONSTRUYENDO LA URL PARA RAWG ---
        const now = new Date();
        const year = now.getFullYear();
        // Pedimos juegos de todo el año actual, ordenados por popularidad
        const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=${year}-01-01,${year}-12-31&ordering=-added&page_size=40`;

        // --- HACIENDO LA PETICIÓN (MUCHO MÁS SIMPLE) ---
        const apiResponse = await fetch(url);

        if (!apiResponse.ok) {
            throw new Error(`Error al obtener datos de RAWG. Estado: ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        
        // --- TRANSFORMANDO LOS DATOS DE RAWG AL FORMATO QUE NUESTRO FRONTEND ESPERA ---
        const games = data.results.map(game => {
            // Buscamos el tráiler en los datos que nos da RAWG
            const trailer = game.clip?.clip; // RAWG a veces proporciona un clip corto

            return {
                id: game.id,
                title: game.name,
                imageUrl: game.background_image,
                platforms: game.platforms?.map(p => p.platform.slug.toUpperCase()).join(', ') || 'N/D',
                releaseDate: new Date(game.released),
                releaseDateString: new Date(game.released).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase().replace('.','') || 'TBA',
                genre: game.genres?.map(g => g.name).join(', ') || 'Indefinido',
                notes: `Puntuación Metacritic: ${game.metacritic || 'N/A'}`,
                // Usamos la puntuación de Metacritic como nuestro indicador de "hype"
                isFeatured: (game.metacritic || 0) > 85, 
                steamUrl: game.stores?.find(s => s.store.slug === 'steam')?.url,
                // Si RAWG nos da un clip, lo usamos. Si no, no hay tráiler.
                trailerUrl: trailer
            };
        });

        response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache por 1 día
        response.status(200).json(games);

    } catch (error) {
        console.error("ERROR EN LA FUNCIÓN (RAWG):", error.message);
        response.status(500).json({ 
            message: "Error interno del servidor al usar la API de RAWG.",
            details: error.message 
        });
    }
}