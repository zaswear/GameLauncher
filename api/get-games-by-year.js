export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "RAWG API Key not configured." }); }
    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const year = parseInt(urlParams.get('year'));
        if (!year) { return response.status(400).json({ message: "No year provided." }); }

        const currentYear = new Date().getFullYear();
        let ordering = '';
        let metacriticFilter = ''; // Variable para el filtro de Metacritic

        if (year < currentYear) {
            // Para años pasados, ordenamos por la mejor nota de Metacritic.
            ordering = '-metacritic';
            // --- MODIFICACIÓN AQUÍ ---
            // Se añade el filtro para que la nota de Metacritic esté entre 55 y 100.
            metacriticFilter = '&metacritic=55,100'; 
        } else {
            // Para el año actual y futuros, ordenamos por fecha de lanzamiento.
            ordering = 'released';
            metacriticFilter = ''; // No aplicamos filtro de nota para juegos futuros
        }

        // Se añade la variable metacriticFilter al final de la URL
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