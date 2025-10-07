// Contenido para /api/getGameDetails.js
export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "RAWG API Key not configured." }); }
    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const gameId = urlParams.get('id');
        if (!gameId) { return response.status(400).json({ message: "No game ID provided." }); }
        
        const url = `https://api.rawg.io/api/games/${gameId}?key=${RAWG_API_KEY}`;
        
        const apiResponse = await fetch(url);
        if (!apiResponse.ok) throw new Error(`Failed to fetch details from RAWG.`);
        const gameDetails = await apiResponse.json();

        response.status(200).json(gameDetails);
    } catch (error) {
        response.status(500).json({ message: "Server error.", details: error.message });
    }
}