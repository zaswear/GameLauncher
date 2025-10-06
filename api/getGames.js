<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GameLauncher Pro: Dinámico 🚀</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #0d1117; color: #e6e6e6; }
        .spinner { border: 3px solid rgba(255, 255, 255, 0.3); border-top: 3px solid #818cf8; border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .filter-btn { transition: all 0.2s ease-in-out; }
        .filter-btn.active { background-color: #4f46e5; color: white; box-shadow: 0 0 15px rgba(79, 70, 229, 0.5); }
        .modal-enter { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .metascore-good { background-color: #6c3; color: white; }
        .metascore-average { background-color: #fc3; color: white; }
        .metascore-bad { background-color: #f00; color: white; }
        .game-card { transition: transform 0.2s ease-out, box-shadow 0.2s ease-out; }
        .game-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
    </style>
</head>
<body class="min-h-screen p-4 md:p-8 flex flex-col">

    <main class="max-w-7xl mx-auto w-full flex-grow">
        <header class="mb-8 p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl">
            <h1 class="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-2">
                🚀 GameLauncher Pro
            </h1>
            <p id="current-date" class="text-gray-400 font-semibold"></p>
        </header>

        <section id="featured-section" class="mb-10">
            <h2 id="featured-title" class="text-2xl md:text-3xl font-bold text-gray-200 border-b-2 border-indigo-500 pb-2 mb-6"></h2>
            <div id="featured-games-container" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                <div id="featured-loading" class="text-center col-span-full py-10 text-lg text-indigo-400">
                    Consultando lanzamientos... <span class="spinner inline-block ml-2"></span>
                </div>
            </div>
        </section>
        
        <h3 class="text-xl md:text-2xl font-bold text-gray-200 border-b-2 border-gray-700 pb-2 mb-6">
            Catálogo de Juegos
        </h3>
        <div class="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <input type="text" id="search-input" placeholder="Buscar en el catálogo..."
                   class="w-full md:flex-grow p-3 rounded-lg bg-gray-800 text-white border-2 border-gray-700 focus:border-indigo-500 transition duration-200"
                   oninput="applyFilters()">
            <div id="year-filters" class="flex-shrink-0 flex flex-wrap gap-2 justify-center"></div>
        </div>
        
        <div id="error-message" class="hidden bg-red-800 p-4 rounded-lg mb-4 text-sm"></div>
        <div id="game-grid-container" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[300px]"></div>

        <section id="goty-section" class="mt-12">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-200 border-b-2 border-amber-400 pb-2 mb-6">
                🏆 Ganadores del Game of the Year
            </h2>
            <div id="goty-container" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2"></div>
        </section>
        
        <div id="details-panel" class="hidden fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50"></div>
    </main>

    <footer class="max-w-7xl mx-auto w-full mt-12 py-6 text-center text-gray-500 border-t border-gray-700">
        <p>Creado por Ignacio Pérez</p>
    </footer>

    <script type="module">
        let allGamesData = [];
        let activeYearFilter = null;

        async function fetchGamesFromAPI() {
            try {
                const response = await fetch('/api/getGames');
                if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
                const data = await response.json();
                return data.map(game => ({ ...game, releaseDate: game.releaseDate ? new Date(game.releaseDate) : null }));
            } catch (error) {
                document.getElementById('error-message').textContent = `No se pudieron cargar los datos. ${error.message}`;
                document.getElementById('error-message').classList.remove('hidden'); return [];
            }
        }
        
        function renderFeaturedGames(games) {
            const container = document.getElementById('featured-games-container');
            const titleElement = document.getElementById('featured-title');
            document.getElementById('featured-loading').style.display = 'none';
            container.innerHTML = '';
            
            const now = new Date();
            const dayOfWeek = now.getDay();
            const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
            const startOfWeek = new Date(new Date(now).setDate(diff));
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            const weekGames = games.filter(g => g.releaseDate && g.releaseDate >= startOfWeek && g.releaseDate <= endOfWeek);
            
            titleElement.innerHTML = `📅 Lanzamientos de esta Semana`;

            if (weekGames.length === 0) {
                container.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">No hay lanzamientos programados para esta semana.</p>`;
                return;
            }

            weekGames.forEach(game => {
                const card = document.createElement('div');
                card.className = 'group relative cursor-pointer';
                card.innerHTML = `<img src="${game.imageUrl}" alt="${game.title}" class="rounded-lg shadow-lg w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105 border-2 border-transparent group-hover:border-indigo-500"><div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent rounded-b-lg"><h3 class="text-sm font-bold text-white truncate transition-colors duration-300 group-hover:text-indigo-300">${game.title}</h3><p class="text-xs text-indigo-300">${game.releaseDateString}</p></div>`;
                card.onclick = () => toggleDetails(game.id);
                container.appendChild(card);
            });
        }
        
        function renderGameGrid(games) {
            const container = document.getElementById('game-grid-container');
            container.innerHTML = '';
            if (games.length === 0) {
                 container.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">No se encontraron juegos con los filtros seleccionados.</p>`;
                 return;
            }
            games.forEach(game => {
                const card = document.createElement('div');
                card.className = 'game-card bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer';
                card.innerHTML = `<img src="${game.imageUrl}" alt="${game.title}" class="w-full h-40 object-cover"><div class="p-4"><h3 class="text-lg font-bold text-white truncate">${game.title}</h3><p class="text-sm text-gray-400 truncate">${game.platforms || 'Plataformas no especificadas'}</p><p class="text-sm text-indigo-400 mt-2">${game.releaseDate ? game.releaseDate.toLocaleDateString('es-ES') : 'TBA'}</p></div>`;
                card.onclick = () => toggleDetails(game.id);
                container.appendChild(card);
            });
        }

        function renderGotyWinners() {
            const container = document.getElementById('goty-container');
            container.innerHTML = '';
            const gotyWinners = [
                { year: 2023, title: "Baldur's Gate 3", id: 41494 },
                { year: 2022, title: "Elden Ring", id: 326249 },
                { year: 2021, title: "It Takes Two", id: 457213 },
                { year: 2020, title: "The Last of Us Part II", id: 3070 },
                { year: 2019, title: "Sekiro: Shadows Die Twice", id: 28135 },
                { year: 2018, title: "God of War", id: 5855 },
                { year: 2017, title: "The Legend of Zelda: Breath of the Wild", id: 3647 },
                { year: 2016, title: "Overwatch", id: 556 },
                { year: 2015, title: "The Witcher 3: Wild Hunt", id: 3328 },
                { year: 2014, title: "Dragon Age: Inquisition", id: 3790 }
            ];

            gotyWinners.forEach(game => {
                const item = document.createElement('div');
                item.className = 'p-3 bg-gray-800 rounded-md cursor-pointer hover:bg-indigo-600 transition-colors';
                item.innerHTML = `<span class="font-bold text-amber-300">${game.year}</span><span class="ml-4 text-gray-300">${game.title}</span>`;
                item.onclick = () => toggleDetails(game.id);
                container.appendChild(item);
            });
        }
        
        function renderYearFilters() {
            const container = document.getElementById('year-filters');
            container.innerHTML = '';
            const currentYear = new Date().getFullYear();
            const years = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];

            years.forEach(year => {
                const btn = document.createElement('button');
                btn.textContent = year;
                btn.dataset.year = year;
                btn.className = `filter-btn px-4 py-2 text-sm font-semibold rounded-md bg-gray-700 hover:bg-indigo-600`;
                btn.onclick = () => { 
                    activeYearFilter = activeYearFilter === year ? null : year;
                    applyFilters(); 
                };
                container.appendChild(btn);
            });
        }
        
        function applyFilters() {
            let filteredGames = [...allGamesData];
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

            if (activeYearFilter) {
                filteredGames = filteredGames.filter(g => g.releaseDate && g.releaseDate.getFullYear() === activeYearFilter);
            } else {
                filteredGames = filteredGames.filter(g => g.releaseDate && g.releaseDate >= oneMonthAgo);
            }

            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            if (searchTerm) {
                filteredGames = filteredGames.filter(g => g.title.toLowerCase().includes(searchTerm));
            }

            filteredGames.sort((a,b) => (b.releaseDate || 0) - (a.releaseDate || 0));
            
            document.querySelectorAll('#year-filters .filter-btn').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.year) === activeYearFilter);
            });
            renderGameGrid(filteredGames);
        }
        window.applyFilters = applyFilters;
        
        function getMetacriticHtml(score) {
            if (!score) return '';
            let scoreClass = 'metascore-average';
            if (score >= 75) scoreClass = 'metascore-good';
            if (score < 50) scoreClass = 'metascore-bad';
            return `<div class="flex items-center gap-2"><svg class="w-6 h-6" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="#242424"/><path d="M78.62 21.38V78.62H21.38V21.38H78.62ZM87.5 12.5H12.5V87.5H87.5V12.5Z" fill="white"/><path d="M45.56 65.5V36.68H38.3V30H61.7V36.68H54.44V65.5H45.56Z" fill="white"/></svg><span class="font-bold text-gray-300">Metacritic</span><span class="font-bold text-lg px-2 rounded ${scoreClass}">${score}</span></div>`;
        }

        function toggleDetails(gameId) {
            const detailsPanel = document.getElementById('details-panel');
            const game = allGamesData.find(g => g.id === gameId);
            if (!gameId || detailsPanel.classList.contains('active')) {
                detailsPanel.classList.add('hidden');
                detailsPanel.classList.remove('active');
                detailsPanel.innerHTML = '';
            } else if (game) {
                const mediaElement = game.trailerUrl ? `<video controls autoplay muted loop class="w-full h-full rounded-lg object-cover"><source src="${game.trailerUrl}" type="video/mp4"></video>` : `<img src="${game.imageUrl}" alt="${game.title}" class="rounded-lg shadow-lg w-full">`;
                detailsPanel.innerHTML = `<div class="relative w-full max-w-5xl bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 m-4 modal-enter" onclick="event.stopPropagation()"><button onclick="window.toggleDetails()" class="absolute top-2 right-4 text-3xl font-light text-gray-400 hover:text-white">&times;</button><div class="flex flex-col md:flex-row gap-6"><div class="flex-shrink-0 w-full md:w-5/12"><div class="aspect-w-16 aspect-h-9 mb-4 bg-black rounded-lg overflow-hidden">${mediaElement}</div><div class="space-y-3">${getMetacriticHtml(game.metacritic)}${game.steamUrl ? `<a href="${game.steamUrl}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-2 w-full text-center bg-gray-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"><svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12.1,2.6c-5.5,0-10,4.2-10,9.4c0,0,0,0,0,0c0,4,2.7,7.4,6.4,8.8l2.1-2.2c-0.8-0.3-1.5-0.8-2.1-1.4 c-1.2-1.3-1.8-3-1.8-4.7c0-3.7,3.3-6.8,7.4-6.8s7.4,3,7.4,6.8c0,1.8-0.7,3.6-2.1,4.9c-0.6,0.6-1.3,1.1-2.1,1.4l2.1,2.2 c3.7-1.4,6.4-4.8,6.4-8.8C22.1,6.8,17.6,2.6,12.1,2.6z M10,12.5c-0.8,0-1.5-0.7-1.5-1.5c0-0.8,0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5 C11.5,11.8,10.8,12.5,10,12.5z M14.2,12.5c-0.8,0-1.5-0.7-1.5-1.5c0-0.8,0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5 C15.7,11.8,15,12.5,14.2,12.5z"/></svg><span>Ver en Steam</span></a>` : ''}</div></div><div class="flex-grow"><h2 class="text-4xl font-bold text-indigo-400 mb-2">${game.title}</h2><p class="mb-4 text-lg text-gray-300">${game.releaseDate ? game.releaseDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric'}) : 'Fecha no disponible'}</p><p class="mb-4 text-gray-400"><span class="font-bold text-gray-300">Plataformas:</span> ${game.platforms}</p><p class="mb-4 text-gray-400"><span class="font-bold text-gray-300">Género:</span> ${game.genre}</p></div></div></div>`;
                detailsPanel.classList.remove('hidden'); detailsPanel.classList.add('active'); detailsPanel.onclick = () => toggleDetails();
            }
        }
        window.toggleDetails = toggleDetails;
        
        async function refreshData() {
            document.getElementById('featured-loading').style.display = 'block';
            document.getElementById('error-message').classList.add('hidden');
            allGamesData = await fetchGamesFromAPI();
            renderFeaturedGames(allGamesData);
            renderGotyWinners();
            applyFilters();
        };
        window.refreshData = refreshData;

        function main() {
            document.getElementById('current-date').textContent = `Hoy es ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
            renderYearFilters();
            refreshData();
        }

        main();
    </script>
</body>
</html>