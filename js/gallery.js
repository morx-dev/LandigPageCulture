document.addEventListener('DOMContentLoaded', () => {
    const catalogGrid = document.getElementById('catalog-grid');
    const searchInput = document.getElementById('search-input');
    
    // Detectamos automáticamente qué tipo de prenda mostrar basándonos en el body
    const categoriaPagina = document.body.getAttribute('data-page-category');
    
    let todosLosProductos = [];
    let busquedaTexto = '';

    // Cambiar dinámicamente el título estético superior de la página
    const titulos = { "camisas": "Colección T-Shirts", "sueteres": "Colección Hoodies", "t-over": "Colección T-Over" };
    if(document.getElementById('seccion-titulo') && titulos[categoriaPagina]) {
        document.getElementById('seccion-titulo').textContent = titulos[categoriaPagina];
    }

    // 1. Petición rápida al archivo JSON de datos
    async function cargarCatalogo() {
        try {
            const respuesta = await fetch('js/data.json');
            todosLosProductos = await respuesta.json();
            renderizarProductos();
        } catch (error) {
            console.error("Error al leer el archivo data.json:", error);
            if(catalogGrid) {
                catalogGrid.innerHTML = `<p class="text-center text-zinc-400 col-span-full">No se pudo cargar el catálogo en este momento.</p>`;
            }
        }
    }

    // 2. Renderizado de las prendas con Nombre, Precio y Franquicia
    function renderizarProductos() {
        if (!catalogGrid) return;
        catalogGrid.innerHTML = '';

        // Filtrado doble: Primero por el tipo de página, luego por lo que escriban en el buscador
        const productosFiltrados = todosLosProductos.filter(prod => {
            const perteneceALaPagina = (prod.linea === categoriaPagina);
            const coincideConBusqueda = prod.catalogo.toLowerCase().includes(busquedaTexto.toLowerCase()) || 
                                         prod.titulo.toLowerCase().includes(busquedaTexto.toLowerCase());
            return perteneceALaPagina && coincideConBusqueda;
        });

        // Validar si el catálogo está vacío
        if (productosFiltrados.length === 0) {
            catalogGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-box-open text-zinc-300 text-3xl mb-3"></i>
                    <p class="text-zinc-400 text-sm uppercase tracking-wide">No hay prendas disponibles para esta búsqueda</p>
                </div>`;
            return;
        }

        // Armar las tarjetas de la cuadrícula con el estilo urbano solicitado
        productosFiltrados.forEach(prod => {
            const tarjeta = document.createElement('div');
            tarjeta.className = "bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-100 flex flex-col group fade-in-up";
            
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

    // 3. Escuchador en tiempo real para la barra de búsqueda
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            busquedaTexto = e.target.value;
            renderizarProductos();
        });
    }

    // 4. Lógica del Lightbox (Modal de ampliación) integrada y segura
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');

    if (catalogGrid && modal && modalImg) {
        catalogGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('trigger-lightbox')) {
                const rutaImagen = e.target.getAttribute('data-src');
                modalImg.src = rutaImagen;
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

    // Iniciar carga de datos al arrancar
    cargarCatalogo();
});