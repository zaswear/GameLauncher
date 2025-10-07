export default async function handler(request, response) {
    const RAWG_API_KEY = process.env.RAWG_API_KEY;
    if (!RAWG_API_KEY) { return response.status(500).json({ message: "La clave de API de RAWG no está configurada." }); }

    try {
        // --- 1. CORRECCIÓN: CALCULAR RANGO DE FECHAS DE 16 AÑOS ---
        const today = new Date();
        const sixteenYearsAgo = new Date();
        sixteenYearsAgo.setFullYear(today.getFullYear() - 16);

        const todayStr = today.toISOString().split('T')[0];
        const sixteenYearsAgoStr = sixteenYearsAgo.toISOString().split('T')[0];
        const dateFilter = `&dates=${sixteenYearsAgoStr},${todayStr}`;

        // Función auxiliar para hacer las peticiones a RAWG
        const fetchRAWG = (url) => fetch(url).then(res => {
            if (!res.ok) throw new Error(`Error en la API de RAWG: ${res.status}`);
            return res.json();
        });

        // --- 2. DOS PETICIONES EN PARALELO CON EL NUEVO FILTRO DE FECHA ---
        
        // Petición A: Juegos aclamados por la crítica (Metacritic > 85) en los últimos 16 años
        const acclaimedGamesUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}${dateFilter}&metacritic=85,100&page_size=30`;
        
        // Petición B: Juegos nuevos y populares en los últimos 16 años
        const newGamesUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}${dateFilter}&ordering=-added&page_size=10`;

        const [acclaimedData, newData] = await Promise.all([
            fetchRAWG(acclaimedGamesUrl),
            fetchRAWG(newGamesUrl)
        ]);
        
        let acclaimedGames = acclaimedData.results;
        let newGames = newData.results;

        // --- 3. MEZCLA INTELIGENTE DE LAS LISTAS (3 Clásicos + 1 Nuevo) ---
        
        const shuffledGames = [];
        const seenIds = new Set();

        while (acclaimedGames.length > 0 || newGames.length > 0) {
            for (let i = 0; i < 3 && acclaimedGames.length > 0; i++) {
                const game = acclaimedGames.shift();
                if (!seenIds.has(game.id)) {
                    shuffledGames.push(game);
                    seenIds.add(game.id);
                }
            }
            if (newGames.length > 0) {
                const game = newGames.shift();
                if (!seenIds.has(game.id)) {
                    shuffledGames.push(game);
                    seenIds.add(game.id);
                }
            }
        }

        // --- 4. FORMATEAR Y ENVIAR LA RESPUESTA ---

        const finalGamesList = shuffledGames.map(game => ({
            id: game.id,
            title: game.name,
            imageUrl: game.background_image,
            genres: game.genres.map(g => g.name)
        }));

        response.setHeader('Cache-Control', 'no-cache');
        response.status(200).json(finalGamesList);

    } catch (error) {
        console.error("ERROR EN getDiscoverGames:", error.message);
        response.status(500).json({ message: "Error interno del servidor.", details: error.message });
    }
}