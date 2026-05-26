// Espera a que todo el documento HTML esté completamente cargado y parseado antes de ejecutar el JS
document.addEventListener('DOMContentLoaded', () => {
    
    // === SELECCIÓN DE ELEMENTOS DEL DOM ===
    // Contenedor principal donde se inyectará la cuadrícula de productos
    const catalogGrid = document.getElementById('catalog-grid');
    // Campo de entrada de texto (input) para realizar las búsquedas en tiempo real
    const searchInput = document.getElementById('search-input');
    
    // === DETECCIÓN DE CATEGORÍA ===
    // Lee el atributo personalizado 'data-page-category' asignado en la etiqueta <body> de cada HTML
    // Esto nos indica si el usuario está parado en "tshirts", "hoodies", o "t-over"
    const categoriaPagina = document.body.getAttribute('data-page-category');
    
    // === ESTADOS DE LA APLICACIÓN ===
    // Arreglo global donde guardaremos la lista completa de prendas obtenidas desde el archivo JSON
    let todosLosProductos = [];
    // Cadena de texto reactiva que almacena lo que el usuario escribe en la barra de búsqueda
    let busquedaTexto = '';

    // === CAMBIO DINÁMICO DE TÍTULOS ===
    // Diccionario de mapeo estético para convertir el ID técnico de la categoría en un título limpio
    const titulos = { 
        "tshirts": "Colección T-Shirts", 
        "hoodies": "Colección Hoodies", 
        "t-over": "Colección T-Over" 
    };
    
    // Si existe el elemento del título en el HTML y la categoría actual está registrada en el diccionario...
    if(document.getElementById('seccion-titulo') && titulos[categoriaPagina]) {
        // Reemplaza el texto original por el título de la colección correspondiente
        document.getElementById('seccion-titulo').textContent = titulos[categoriaPagina];
    }

    // === 1. PETICIÓN HTTP (FETCH) DEL ARCHIVO DE DATOS ===
    // Función asíncrona dedicada a traer los productos desde el backend local (data.json)
    async function cargarCatalogo() {
        try {
            // Realiza la petición asíncrona hacia la ubicación del archivo de datos
            const respuesta = await fetch('js/data.json');
            
            // Convierte la respuesta plana recibida en un objeto/arreglo de JavaScript manipulable
            todosLosProductos = await respuesta.json();
            
            // Una vez que los datos están listos en memoria, dispara la función para dibujarlos en pantalla
            renderizarProductos();
        } catch (error) {
            // Captura y muestra cualquier fallo en la consola (ej: si el JSON está mal formado o no existe)
            console.error("Error al leer el archivo data.json:", error);
            
            // Si ocurre un error, muestra un mensaje amigable al usuario en lugar de dejar la pantalla en blanco
            if(catalogGrid) {
                catalogGrid.innerHTML = `<p class="text-center text-zinc-400 col-span-full">No se pudo cargar el catálogo en este momento.</p>`;
            }
        }
    }

 // === 2. FILTRADO Y RENDERIZADO DE PRODUCTOS ===
    function renderizarProductos() {
        if (!catalogGrid) return;
        catalogGrid.innerHTML = '';

        // CAPTURA LA COLECCIÓN DESDE LA URL (Ej: ?coleccion=tortugas-ninja)
        const parametros = new URLSearchParams(window.location.search);
        const coleccionSeleccionada = parametros.get('coleccion');

        // --- SISTEMA DE TRIPLE FILTRADO INTELIGENTE ---
        const productosFiltrados = todosLosProductos.filter(prod => {
            // 1. Validar la categoría (tshirts, hoodies, t-over)
            const perteneceALaPagina = (prod.linea === categoriaPagina);
            
            // 2. Validar la colección específica si viene en la URL
            let perteneceALaColeccion = true;
            if (coleccionSeleccionada) {
                perteneceALaColeccion = (prod.catalogo.toLowerCase().replace(/\s+/g, '-') === coleccionSeleccionada.toLowerCase());
            }
            
            // 3. Validar el buscador de texto
            const coincideConBusqueda = prod.catalogo.toLowerCase().includes(busquedaTexto.toLowerCase()) || 
                                         prod.titulo.toLowerCase().includes(busquedaTexto.toLowerCase());
            
            return perteneceALaPagina && belongsToCollection && coincideConBusqueda;
        });

        // [El resto de tu código de renderizado, innerHTML y lightbox se queda EXACTAMENTE IGUAL]

        // --- VALIDACIÓN DE CATÁLOGO VACÍO ---
        // Si después de filtrar el arreglo, la longitud es 0, significa que nada coincidió con los criterios
        if (productosFiltrados.length === 0) {
            // Inyecta un diseño limpio informando que no hay stock o resultados disponibles
            catalogGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-box-open text-zinc-300 text-3xl mb-3"></i>
                    <p class="text-zinc-400 text-sm uppercase tracking-wide">No hay prendas disponibles para esta búsqueda</p>
                </div>`;
            return; // Termina la ejecución de la función de forma prematura
        }

        // --- CONSTRUCCIÓN DE LAS TARJETAS URBANAS ---
        // Recorre uno por uno los productos que superaron con éxito los filtros establecidos
        productosFiltrados.forEach(prod => {
            // Crea un nodo <div> contenedor en la memoria del navegador
            const tarjeta = document.createElement('div');
            
            // Asigna los estilos de Tailwind CSS responsivos junto con la animación de entrada "fade-in-up"
            tarjeta.className = "bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-zinc-100 flex flex-col group fade-in-up";
            
            // Estructura el contenido interno de la tarjeta usando Template Literals (``)
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
            // Agrega físicamente la tarjeta recién armada como un hijo nuevo dentro de la cuadrícula general
            catalogGrid.appendChild(tarjeta);
        });
    }

    // === 3. ESCUCHADOR DE ENTRADA (INPUT) DE BÚSQUEDA ===
    // Si la barra de búsqueda se encuentra presente en el documento...
    if (searchInput) {
        // Escucha cada pulsación de tecla o cambio en tiempo real realizado por el usuario
        searchInput.addEventListener('input', (e) => {
            // Almacena el valor actual escrito en el campo de texto en nuestra variable de estado
            busquedaTexto = e.target.value;
            
            // Vuelve a invocar el renderizado para actualizar de inmediato las prendas visibles en pantalla
            renderizarProductos();
        });
    }

    // === 4. LÓGICA INTEGRADA DEL MODAL LIGHTBOX ===
    // Selección de los elementos estructurales encargados de magnificar la imagen de la prenda
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');

    // Validación grupal: Registra los eventos únicamente si todos los componentes del modal existen en el DOM
    if (catalogGrid && modal && modalImg) {
        
        // Técnica de Delegación de Eventos: Escuchamos los clics en toda la cuadrícula
        catalogGrid.addEventListener('click', (e) => {
            // Comprueba de forma estricta si el elemento específico al que se le dio clic posee la clase 'trigger-lightbox'
            if (e.target.classList.contains('trigger-lightbox')) {
                // Obtiene la ruta de la imagen guardada en el atributo personalizado 'data-src'
                const rutaImagen = e.target.getAttribute('data-src');
                
                // Asigna esa ruta a la etiqueta de imagen del modal
                modalImg.src = rutaImagen;
                
                // Muestra el modal en pantalla completa cambiando las clases utilitarias de visualización
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        });

        // Escucha los clics sobre cualquier región del modal abierto (fondo oscuro o botón de cierre)
        modal.addEventListener('click', () => {
            // Oculta el modal de la interfaz revirtiendo las clases de Tailwind
            modal.classList.remove('flex');
            modal.classList.add('hidden');
            
            // Vacía el atributo src para liberar memoria del navegador y evitar parpadeos visuales al abrir otro
            modalImg.src = '';
        });
    }

    // === EJECUCIÓN INICIAL ===
    // Dispara automáticamente la lectura de datos del catálogo JSON tan pronto como el script arranca
    cargarCatalogo();
});