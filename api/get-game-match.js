export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "RAWG API Key not configured." }); }
    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const favoriteIds = urlParams.get('ids')?.split(',');
        if (!favoriteIds || favoriteIds.length === 0) { return response.status(400).json({ message: "No favorite games provided." }); }

        const favoriteGamesDetails = await Promise.all(
            favoriteIds.map(id => fetch(`https://api.rawg.io/api/games/${id}?key=${RAWG_API_KEY}`).then(res => res.json()))
        );

        const genreIds = new Set(), tagIds = new Set();
        const commonGenres = new Set(), commonTags = new Set();

        favoriteGamesDetails.forEach(game => {
            game.genres.forEach(g => { genreIds.add(g.id); commonGenres.add(g.name); });
            game.tags.slice(0, 5).forEach(t => { tagIds.add(t.id); commonTags.add(t.name); });
        });

        if (genreIds.size === 0 && tagIds.size === 0) { return response.status(404).json({ message: "No se pudieron encontrar detalles." }); }

        const recommendationUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&genres=${Array.from(genreIds).join(',')}&tags=${Array.from(tagIds).join(',')}&exclude=${favoriteIds.join(',')}&metacritic=80,100&ordering=-rating&page_size=20`;
        const recommendationResponse = await fetch(recommendationUrl);
        if (!recommendationResponse.ok) throw new Error('Failed to fetch recommendation.');
        const recommendationData = await recommendationResponse.json();
        if (!recommendationData.results || recommendationData.results.length === 0) { return response.status(404).json({ message: "¡No se encontró un match! Prueba con otros juegos." }); }
        
        const randomMatch = recommendationData.results[Math.floor(Math.random() * recommendationData.results.length)];
        
        // Devolvemos la recomendación Y las estadísticas
        response.status(200).json({
            recommendation: randomMatch,
            stats: {
                common_genres: Array.from(commonGenres),
                common_tags: Array.from(commonTags)
            }
        });

    } catch (error) {
        response.status(500).json({ message: "Server error.", details: error.message });
    }
}