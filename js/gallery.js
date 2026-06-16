document.addEventListener('DOMContentLoaded', () => {
    
    // === SELECCIÓN DE ELEMENTOS DEL DOM ===
    // Ajustados exactamente a los IDs de tu colecciones.html
    const catalogGrid = document.getElementById('contenedor-prendas');
    const searchInput = document.getElementById('search-input');
    const tituloColeccion = document.getElementById('titulo-coleccion');
    
    // === ESTADOS DE LA APLICACIÓN ===
    let todosLosProductos = [];
    let busquedaTexto = '';

    // CAPTURA LA COLECCIÓN DESDE LA URL (Ej: ?coleccion=travis-scott-|-cactus-jack)
    const parametros = new URLSearchParams(window.location.search);
    const coleccionSeleccionada = parametros.get('coleccion');

    // === 1. PETICIÓN FETCH HACIA TU JSON ===
    async function cargarCatalogo() {
        try {
            const respuesta = await fetch('js/data.json');
            const datos = await respuesta.json();
            todosLosProductos = datos.productos;
            
            // Colocar el título dinámico en el Header basado en los productos encontrados
            actualizarTituloCabecera();
            
            // Dibujar las prendas
            renderizarProductos();
        } catch (error) {
            console.error("Error al leer el archivo data.json:", error);
            if(catalogGrid) {
                catalogGrid.innerHTML = `<p class="text-center text-zinc-400 col-span-full">No se pudo cargar la colección en este momento.</p>`;
            }
        }
    }

    // === 2. FUNCIÓN PARA LIMPIAR URLS Y COMPARARLAS ===
    // Convierte "TRAVIS SCOTT | CACTUS JACK" en "travis-scott-|-cactus-jack"
    function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '') // Elimina cualquier cosa que no sea letra, número o espacio (adiós al '|')
        .replace(/\s+/g, '-');       // Convierte los espacios restantes en un single guión
}

    // === 3. ACTUALIZAR EL H1 DEL HEADER ===
    function actualizarTituloCabecera() {
        if (!tituloColeccion || !coleccionSeleccionada) return;

        // Buscamos el primer producto que coincida con la colección de la URL para obtener el nombre real y limpio
        const coincidencia = todosLosProductos.find(prod => normalizarTexto(prod.catalogo) === coleccionSeleccionada.toLowerCase());
        
        if (coincidencia) {
            tituloColeccion.textContent = coincidencia.catalogo;
        } else {
            // Si no encuentra productos, intenta transformar el parámetro de la URL para que no quede feo
            tituloColeccion.textContent = coleccionSeleccionada.replace(/-/g, ' ');
        }
    }

    // === 4. FILTRADO Y RENDERIZADO DE PRENDAS ===
    function renderizarProductos() {
        if (!catalogGrid) return;
        catalogGrid.innerHTML = '';

        // Filtrado inteligente
        const productosFiltrados = todosLosProductos.filter(prod => {
            // 1. Filtrar por la colección de la URL
            let perteneceALaColeccion = true;
            if (coleccionSeleccionada) {
                perteneceALaColeccion = (normalizarTexto(prod.catalogo) === coleccionSeleccionada.toLowerCase());
            }
            
            // 2. Filtrar por el buscador de texto (busca en título o marca)
            const coincideConBusqueda = prod.catalogo.toLowerCase().includes(busquedaTexto.toLowerCase()) || 
                                         prod.titulo.toLowerCase().includes(busquedaTexto.toLowerCase());
            
            return perteneceALaColeccion && coincideConBusqueda;
        });

        // Si la colección no tiene prendas registradas aún
        if (productosFiltrados.length === 0) {
            catalogGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-box-open text-zinc-300 text-3xl mb-3"></i>
                    <p class="text-zinc-400 text-sm uppercase tracking-wide">No hay prendas disponibles para esta búsqueda</p>
                </div>`;
            return;
        }

        // Construcción dinámica de tus tarjetas urbanas
        productosFiltrados.forEach(prod => {
            const tarjeta = document.createElement('div');
            tarjeta.className = "bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-100 flex flex-col group";
            
            tarjeta.innerHTML = `
                <div class="aspect-[3/4] overflow-hidden bg-zinc-100 relative cursor-pointer">
                    <img src="${prod.imagen}" alt="${prod.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 trigger-lightbox" data-src="${prod.imagen}">
                    <span class="absolute top-3 left-3 bg-zinc-950/80 text-white font-black text-[9px] tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-sm">
                        ${prod.catalogo}
                    </span>
                </div>
                
                <div class="p-5 flex flex-col flex-grow justify-between">
                    <div>
                        <h3 class="text-xs font-bold text-zinc-800 uppercase tracking-wide line-clamp-2">${prod.titulo}</h3>
                    </div>
                    
                    <div class="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
                        <span class="text-sm font-black text-pink-500">${prod.precio}</span>
                        
                        <a href="https://wa.me/50259595955?text=Hola,%20me%20interesa%20el%20producto:%20${encodeURIComponent(prod.titulo)}" 
                           target="_blank" 
                           class="text-zinc-400 hover:text-green-500 transition-colors text-xs flex items-center gap-1 font-bold">
                           <i class="fab fa-whatsapp text-sm"></i> Pedir
                        </a>
                    </div>
                </div>
            `;
            catalogGrid.appendChild(tarjeta);
        });
    }

    // === 5. BARRA DE BÚSQUEDA ===
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            busquedaTexto = e.target.value;
            renderizarProductos();
        });
    }

    // === 6. MODAL LIGHTBOX ===
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');

    if (catalogGrid && modal && modalImg) {
        catalogGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('trigger-lightbox')) {
                modalImg.src = e.target.getAttribute('data-src');
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        });

        modal.addEventListener('click', () => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
            modalImg.src = '';
        });
    }

    // Arrancar la carga
    cargarCatalogo();
});