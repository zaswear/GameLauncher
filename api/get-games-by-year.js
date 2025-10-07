export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "RAWG API Key not configured." }); }
    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const year = parseInt(urlParams.get('year'));
        if (!year) { return response.status(400).json({ message: "No year provided." }); }

        const currentYear = new Date().getFullYear();
        let ordering = '';
        let metacriticFilter = '';

        if (year < currentYear) {
            // Para años pasados, mantenemos la búsqueda por la mejor nota de Metacritic.
            ordering = '-metacritic';
            metacriticFilter = '&metacritic=55,100'; 
        } else {
            // --- MODIFICACIÓN AQUÍ ---
            // Para el año actual y futuros, ahora ordenamos por popularidad para más relevancia.
            ordering = '-added';
            metacriticFilter = ''; // Mantenemos esto para incluir juegos futuros sin nota.
        }

        const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=${year}-01-01,${year}-12-31&ordering=${ordering}&page_size=20${metacriticFilter}`;
        
        const apiResponse = await fetch(url);
        if (!apiResponse.ok) throw new Error('Failed to fetch games for the selected year.');
        const data = await apiResponse.json();
        
        const filteredResults = data.results.filter(game => game.background_image);
        
        response.status(200).json(filteredResults);
        
    } catch (error) {
        response.status(500).json({ message: "Server error.", details: error.message });
    }
}