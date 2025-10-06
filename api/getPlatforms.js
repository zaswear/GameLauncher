// Contenido para /api/getPlatforms.js
export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) {
        return response.status(500).json({ message: "La clave de API de RAWG no está configurada." });
    }

    try {
        const url = `https://api.rawg.io/api/platforms?key=${RAWG_API_KEY}`;
        const apiResponse = await fetch(url);
        if (!apiResponse.ok) {
            throw new Error(`Error al obtener plataformas de RAWG. Estado: ${apiResponse.status}`);
        }
        const data = await apiResponse.json();
        
        // Filtramos para quedarnos solo con las plataformas principales que nos interesan
        const mainPlatformIds = [4, 187, 1, 7]; // PC, PlayStation, Xbox, Nintendo
        const filteredPlatforms = data.results.filter(p => mainPlatformIds.includes(p.id));

        response.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
        response.status(200).json(filteredPlatforms);
    } catch (error) {
        console.error("ERROR EN getPlatforms:", error.message);
        response.status(500).json({ message: "Error interno del servidor.", details: error.message });
    }
}