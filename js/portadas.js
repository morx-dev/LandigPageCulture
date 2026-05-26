document.addEventListener("DOMContentLoaded", () => {
    const catalogGrid = document.getElementById("catalog-grid");
    const searchInput = document.getElementById("search-input");
    
    // Detectamos la categoría configurada en el HTML
    const pageCategory = document.body.getAttribute("data-page-category");
    let portadasFiltradas = [];

    if (!catalogGrid) return;

    // 1. Consumir el JSON centralizado
    fetch("data.json")
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar data.json");
            return response.json();
        })
        .then(data => {
            // Filtrar las portadas por la categoría de la página actual
            portadasFiltradas = data.portadas.filter(p => p.categoria === pageCategory);
            renderPortadas(portadasFiltradas);
        })
        .catch(error => console.error("Error cargando portadas:", error));

    // 2. Función de renderizado
    function renderPortadas(lista) {
        // Mantenemos las tres fijas que ya tenías en duro en tu HTML si la lista está vacía,
        // o inyectamos dinámicamente si hay coincidencias en el JSON.
        if (lista.length === 0) return; 

        catalogGrid.innerHTML = "";
        lista.forEach(item => {
            const card = document.createElement("a");
            card.href = `colecciones.html?coleccion=${item.id}`;
            card.className = "group block relative rounded-2xl overflow-hidden bg-zinc-900 aspect-[3/4] shadow-md border border-zinc-100";
            card.innerHTML = `
                <img src="${item.imagen}" alt="Colección ${item.titulo}" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
                    <span class="text-pink-500 text-[10px] font-black tracking-widest uppercase mb-1">${item.tag}</span>
                    <h3 class="text-white font-black text-xl uppercase italic tracking-wide">${item.titulo}</h3>
                </div>
            `;
            catalogGrid.appendChild(card);
        });
    }

    // 3. Lógica del Buscador
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtradas = portadasFiltradas.filter(p => 
                p.titulo.toLowerCase().includes(query)
            );
            renderPortadas(filtradas);
        });
    }
});