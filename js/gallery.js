import { productos } from './data.js';

export function inicializarGaleria() {
    const grid = document.getElementById('gallery-grid');
    const botones = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');

    // Función para abrir el efecto flotante
    function abrirFlotante(url) {
        modalImg.src = url;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden'; // Bloquea el scroll al estar abierto
    }

    // Cerrar el efecto flotante
    modal.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    });

    function renderizar(categoriaFiltrada = 'todos') {
        grid.innerHTML = '';
        const filtrados = categoriaFiltrada === 'todos' 
            ? productos 
            : productos.filter(p => p.categoria === categoriaFiltrada);

        filtrados.forEach((prod, index) => {
            const card = document.createElement('div');
            // Añadimos la clase fade-in-up
            card.className = "group cursor-pointer bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all fade-in-up";
            
            // Esto hace que aparezcan una por una (staggered animation)
            card.style.animationDelay = `${index * 0.1}s`;
            
            card.innerHTML = `
                <div class="overflow-hidden rounded-xl aspect-square bg-zinc-50">
                    <img src="${prod.imagen}" alt="${prod.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                </div>
                <div class="mt-4 text-left px-2 pb-2">
                    <h4 class="font-bold text-sm uppercase italic text-zinc-800">${prod.titulo}</h4>
                    <p class="text-pink-500 text-[10px] font-bold tracking-widest uppercase mt-1">${prod.categoria}</p>
                </div>
            `;
            
            card.addEventListener('click', () => abrirFlotante(prod.imagen));
            grid.appendChild(card);
        });
    }

    botones.forEach(btn => {
        btn.addEventListener('click', (e) => {
            botones.forEach(b => b.classList.remove('active', 'bg-pink-500', 'text-white', 'border-pink-500'));
            e.target.classList.add('active', 'bg-pink-500', 'text-white', 'border-pink-500');
            renderizar(e.target.getAttribute('data-filter'));
        });
    });

    renderizar();
}