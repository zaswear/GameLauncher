// Contenido para /api/get-games-by-year.js
export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "RAWG API Key not configured." }); }
    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const year = urlParams.get('year');
        if (!year) { return response.status(400).json({ message: "No year provided." }); }

        const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=${year}-01-01,${year}-12-31&ordering=-metacritic&page_size=12`;
        const apiResponse = await fetch(url);
        if (!apiResponse.ok) throw new Error('Failed to fetch games for the selected year.');
        const data = await apiResponse.json();
        response.status(200).json(data.results);
    } catch (error) {
        response.status(500).json({ message: "Server error.", details: error.message });
    }
}