// Contenido para /api/search-games.js
export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "RAWG API Key not configured." }); }
    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const query = urlParams.get('query');
        if (!query) { return response.status(400).json({ message: "No query provided." }); }

        const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=5`;
        const apiResponse = await fetch(url);
        if (!apiResponse.ok) throw new Error('Failed to search games.');
        const data = await apiResponse.json();
        
        // Devolvemos solo los datos necesarios para las sugerencias
        const suggestions = data.results.map(game => ({
            id: game.id,
            name: game.name,
            year: game.released ? new Date(game.released).getFullYear() : 'N/A'
        }));

        response.status(200).json(suggestions);
    } catch (error) {
        response.status(500).json({ message: "Server error.", details: error.message });
    }
}