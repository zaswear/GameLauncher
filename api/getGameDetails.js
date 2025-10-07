// Contenido para /api/getGameDetails.js
export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) {
        return response.status(500).json({ message: "La clave de API de RAWG no está configurada." });
    }

    try {
        const urlParams = new URL(request.url, `https://${request.headers.host}`).searchParams;
        const gameName = urlParams.get('name'); // Recibimos el nombre del juego

        if (!gameName) {
            return response.status(400).json({ message: "No se proporcionó un nombre de juego." });
        }

        // 1. Buscamos el juego en RAWG por su nombre para obtener su ID/slug
        const searchUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(gameName)}&page_size=1`;
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) throw new Error('No se pudo buscar el juego en RAWG.');
        const searchData = await searchResponse.json();
        
        if (!searchData.results || searchData.results.length === 0) {
            throw new Error(`No se encontró el juego "${gameName}" en la base de datos.`);
        }
        
        const gameSlug = searchData.results[0].slug;

        // 2. Con el ID/slug, pedimos los detalles completos y las capturas de pantalla
        const detailsUrl = `https://api.rawg.io/api/games/${gameSlug}?key=${RAWG_API_KEY}`;
        const screenshotsUrl = `https://api.rawg.io/api/games/${gameSlug}/screenshots?key=${RAWG_API_KEY}`;
        
        const [detailsResponse, screenshotsResponse] = await Promise.all([
            fetch(detailsUrl),
            fetch(screenshotsUrl)
        ]);

        if (!detailsResponse.ok) throw new Error('No se pudieron cargar los detalles del juego.');
        
        const gameDetails = await detailsResponse.json();
        // Añadimos las capturas de pantalla al objeto de detalles
        if (screenshotsResponse.ok) {
            const screenshotsData = await screenshotsResponse.json();
            gameDetails.screenshots = screenshotsData.results;
        }

        response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // Cache por 1 día
        response.status(200).json(gameDetails);

    } catch (error) {
        console.error("ERROR EN getGameDetails:", error.message);
        response.status(500).json({ message: "Error interno del servidor.", details: error.message });
    }
}