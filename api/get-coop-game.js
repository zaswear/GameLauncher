// Contenido para /api/get-coop-game.js
export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "RAWG API Key not configured." }); }
    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const platforms = urlParams.get('platforms');
        if (!platforms) { return response.status(400).json({ message: "No platforms provided." }); }

        const randomPage = Math.floor(Math.random() * 5) + 1;
        const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&platforms=${platforms}&tags=multiplayer,co-op&metacritic=80,100&ordering=-rating&page=${randomPage}&page_size=40`;
        const apiResponse = await fetch(url);
        if (!apiResponse.ok) throw new Error('Failed to fetch co-op games.');
        const data = await apiResponse.json();
        if (!data.results || data.results.length === 0) { return response.status(404).json({ message: "No game found for that platform combination! Try another." }); }

        const randomGame = data.results[Math.floor(Math.random() * data.results.length)];
        response.status(200).json(randomGame);
    } catch (error) {
        response.status(500).json({ message: "Server error.", details: error.message });
    }
}