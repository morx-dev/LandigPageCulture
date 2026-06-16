document.addEventListener("DOMContentLoaded", () => {
    const catalogGrid = document.getElementById("catalog-grid");
    const searchInput = document.getElementById("search-input");

    if (!catalogGrid || !searchInput) return;

    // Lee la categoría de la página desde el atributo data-page-category del <body>
    // tshirts.html  → "camisas"
    // hoodies.html  → "sueteres"
    // t-over.html   → "tover"
    const categoriaActual = document.body.getAttribute("data-page-category");

    // === CARGA DEL JSON Y RENDERIZADO INICIAL ===
    async function cargarPortadas() {
        try {
            const respuesta = await fetch("js/data.json");
            const datos = await respuesta.json();

            // Filtra solo las colecciones que pertenecen a la categoría de esta página
            const coleccionesFiltradas = datos.colecciones.filter(col =>
                col.linea === categoriaActual
            );

            renderizarPortadas(coleccionesFiltradas);

            // Activa el buscador una vez que los datos están listos
            activarBuscador(coleccionesFiltradas);

        } catch (error) {
            console.error("Error al leer data.json:", error);
            catalogGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-zinc-400 text-sm uppercase tracking-wide">No se pudo cargar el catálogo en este momento.</p>
                </div>`;
        }
    }

    // === RENDERIZADO DE TARJETAS DE PORTADA ===
    function renderizarPortadas(colecciones) {
        catalogGrid.innerHTML = "";

        if (colecciones.length === 0) {
            catalogGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-zinc-400 text-sm uppercase tracking-wide">No hay colecciones disponibles para esta búsqueda.</p>
                </div>`;
            return;
        }

        colecciones.forEach(col => {
            const tarjeta = document.createElement("a");
            tarjeta.href = `colecciones.html?coleccion=${col.slug}`;
            tarjeta.className = "group block relative rounded-2xl overflow-hidden bg-zinc-900 aspect-[3/4] shadow-md border border-zinc-100";

            tarjeta.innerHTML = `
                <img src="${col.imagen}" alt="Colección ${col.nombre}" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
                    <span class="text-pink-500 text-[10px] font-black tracking-widest uppercase mb-1">${col.badge}</span>
                    <h3 class="text-white font-black text-xl uppercase italic tracking-wide">${col.nombre}</h3>
                </div>
            `;

            catalogGrid.appendChild(tarjeta);
        });
    }

    // === BUSCADOR VISUAL (oculta/muestra sin eliminar) ===
    function activarBuscador(coleccionesOriginales) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();

            // Filtra desde los datos originales y re-renderiza
            const resultado = coleccionesOriginales.filter(col =>
                col.nombre.toLowerCase().includes(query)
            );

            renderizarPortadas(resultado);
        });
    }

    // Arrancar
    cargarPortadas();
});