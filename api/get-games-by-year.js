export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "RAWG API Key not configured." }); }
    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const year = parseInt(urlParams.get('year'));
        if (!year) { return response.status(400).json({ message: "No year provided." }); }

        const currentYear = new Date().getFullYear();
        let ordering = '';

        // --- LÓGICA CORREGIDA ---
        if (year < currentYear) {
            // Para años pasados, ordenamos por la mejor nota de Metacritic.
            // Simplificamos la query para que sea más fiable.
            ordering = '-metacritic';
        } else {
            // Para el año actual y futuros, ordenamos por fecha de lanzamiento para crear un calendario.
            ordering = 'released';
        }

        const url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=${year}-01-01,${year}-12-31&ordering=${ordering}&page_size=20`;
        
        const apiResponse = await fetch(url);
        if (!apiResponse.ok) throw new Error('Failed to fetch games for the selected year.');
        const data = await apiResponse.json();
        
        // Filtramos en el servidor los juegos que no tienen imagen, para asegurar la calidad de la lista
        const filteredResults = data.results.filter(game => game.background_image);
        
        response.status(200).json(filteredResults);
        
    } catch (error) {
        response.status(500).json({ message: "Server error.", details: error.message });
    }
}