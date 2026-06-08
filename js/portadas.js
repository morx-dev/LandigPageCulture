document.addEventListener("DOMContentLoaded", () => {
    const catalogGrid = document.getElementById("catalog-grid");
    const searchInput = document.getElementById("search-input");

    if (!catalogGrid || !searchInput) return;

    // Lógica del Buscador Visual (No elimina elementos, solo los oculta/muestra)
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        // Seleccionamos todas las tarjetas de colecciones individuales (etiquetas <a>) dentro de la cuadrícula
        const tarjetas = catalogGrid.querySelectorAll("a.group");

        tarjetas.forEach(tarjeta => {
            // Buscamos el H3 que tiene el nombre de la colección (Travis Scott, Chrome Hearts, etc.)
            const tituloElemento = tarjeta.querySelector("h3");
            
            if (tituloElemento) {
                const nombreColeccion = tituloElemento.textContent.toLowerCase();

                // Si el nombre contiene lo que escribió el usuario, se muestra; si no, se oculta
                if (nombreColeccion.includes(query)) {
                    tarjeta.style.display = ""; // Muestra la tarjeta (vuelve a su estado original de Tailwind)
                } else {
                    tarjeta.style.display = "none"; // Oculta la tarjeta
                }
            }
        });
    });
});