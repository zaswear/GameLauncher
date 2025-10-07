export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "RAWG API Key not configured." }); }
    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const platforms = urlParams.get('platforms');
        if (!platforms) { return response.status(400).json({ message: "No platforms provided." }); }

        const randomPage = Math.floor(Math.random() * 5) + 1;
        const searchUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&platforms=${platforms}&tags=multiplayer,co-op&metacritic=80,100&ordering=-rating&page=${randomPage}&page_size=40`;
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) throw new Error('Failed to fetch co-op games.');
        const searchData = await searchResponse.json();
        if (!searchData.results || searchData.results.length === 0) { return response.status(404).json({ message: "¡No se encontró ningún juego para esa combinación! Intenta con otras plataformas." }); }

        const randomGameSummary = searchData.results[Math.floor(Math.random() * searchData.results.length)];
        const detailsUrl = `https://api.rawg.io/api/games/${randomGameSummary.id}?key=${RAWG_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        if (!detailsResponse.ok) throw new Error('Failed to fetch game details.');
        const gameDetails = await detailsResponse.json();
        response.status(200).json(gameDetails);
    } catch (error) {
        response.status(500).json({ message: "Server error.", details: error.message });
    }
}