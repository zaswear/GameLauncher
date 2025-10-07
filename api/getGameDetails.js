export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "La clave de API de RAWG no está configurada." }); }
    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const gameId = urlParams.get('id');
        const lang = urlParams.get('lang') || 'es';
        if (!gameId) { return response.status(400).json({ message: "No se proporcionó un ID de juego." }); }
        
        const url = `https://api.rawg.io/api/games/${gameId}?key=${RAWG_API_KEY}&lang=${lang}`;
        
        const apiResponse = await fetch(url);
        if (!apiResponse.ok) throw new Error(`Error al obtener detalles de RAWG.`);
        const gameDetails = await apiResponse.json();

        response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
        response.status(200).json(gameDetails);
    } catch (error) {
        response.status(500).json({ message: "Error interno del servidor.", details: error.message });
    }
}