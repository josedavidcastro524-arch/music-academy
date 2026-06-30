// Datos de cursos por nivel
const cursos = {
    principiante: [
        {
            titulo: 'Guitarra - Acordes Básicos',
            instrumento: '🎸',
            horas: 8,
            lecciones: 12,
            descripcion: 'Aprende los primeros acordes y técnica básica'
        },
        {
            titulo: 'Teclado - Introducción',
            instrumento: '⌨️',
            horas: 6,
            lecciones: 10,
            descripcion: 'Posición de manos y primeras melodías'
        },
        {
            titulo: 'Batería - Fundamentos',
            instrumento: '🥁',
            horas: 7,
            lecciones: 11,
            descripcion: 'Grip de palillos y ritmos básicos'
        },
        {
            titulo: 'Teoría Musical Básica',
            instrumento: '♪',
            horas: 5,
            lecciones: 8,
            descripcion: 'Notas, escalas y ritmos fundamentales'
        }
    ],
    intermedio: [
        {
            titulo: 'Guitarra - Técnicas Avanzadas',
            instrumento: '🎸',
            horas: 15,
            lecciones: 20,
            descripcion: 'Bending, tapping, arpeggios y más'
        },
        {
            titulo: 'Teclado - Progresiones de Acordes',
            instrumento: '⌨️',
            horas: 12,
            lecciones: 18,
            descripcion: 'Armonía y composición de canciones'
        },
        {
            titulo: 'Batería - Patrones Avanzados',
            instrumento: '🥁',
            horas: 14,
            lecciones: 19,
            descripcion: 'Independencia de miembros y grooves'
        },
        {
            titulo: 'Improvisación I',
            instrumento: '♪',
            horas: 10,
            lecciones: 15,
            descripcion: 'Primeros pasos en improvisación'
        }\n    ],\n    avanzado: [\n        {\n            titulo: 'Guitarra - Improvisación Profesional',\n            instrumento: '🎸',\n            horas: 20,\n            lecciones: 25,\n            descripcion: 'Escalas avanzadas y técnicas modernas'\n        },\n        {\n            titulo: 'Teclado - Sintetización',\n            instrumento: '⌨️',\n            horas: 18,\n            lecciones: 22,\n            descripcion: 'Síntesis, efectos y producción'\n        },\n        {\n            titulo: 'Batería - Estilos Internacionales',\n            instrumento: '🥁',\n            horas: 19,\n            lecciones: 24,\n            descripcion: 'Jazz, metal, funk y más géneros'\n        },\n        {\n            titulo: 'Teoría Avanzada',\n            instrumento: '♪',\n            horas: 16,\n            lecciones: 20,\n            descripcion: 'Modulaciones y estructuras complejas'\n        }\n    ],\n    profesional: [\n        {\n            titulo: 'Guitarra - Maestría en Vivo',\n            instrumento: '🎸',\n            horas: 25,\n            lecciones: 30,\n            descripcion: 'Performances profesionales y conexión con audiencia'\n        },\n        {\n            titulo: 'Teclado - Productor de Audio',\n            instrumento: '⌨️',\n            horas: 24,\n            lecciones: 28,\n            descripcion: 'DAW, mezcla y masterización profesional'\n        },\n        {\n            titulo: 'Batería - Nivel Grammy',\n            instrumento: '🥁',\n            horas: 26,\n            lecciones: 31,\n            descripcion: 'Técnicas de grabación y sesión profesional'\n        },\n        {\n            titulo: 'Composición y Arreglos',\n            instrumento: '♪',\n            horas: 22,\n            lecciones: 27,\n            descripcion: 'Creación de música profesional para todos los medios'\n        }\n    ]\n};\n\n// Función para renderizar cursos\nfunction renderCursos(nivel = 'principiante') {\n    const container = document.getElementById('cursos-container');\n    const cursosList = cursos[nivel];\n    \n    container.innerHTML = '';\n    \n    cursosList.forEach(curso => {\n        const cursoCard = document.createElement('div');\n        cursoCard.className = 'curso-card';\n        cursoCard.innerHTML = `\n            <div class=\"curso-imagen\">${curso.instrumento}</div>\n            <div class=\"curso-contenido\">\n                <span class=\"curso-nivel\">${nivel.charAt(0).toUpperCase() + nivel.slice(1)}</span>\n                <h3>${curso.titulo}</h3>\n                <p class=\"curso-description\">${curso.descripcion}</p>\n                <div class=\"curso-stats\">\n                    <span><i class=\"fas fa-clock\"></i> ${curso.horas}h</span>\n                    <span><i class=\"fas fa-book\"></i> ${curso.lecciones} lecciones</span>\n                </div>\n            </div>\n        `;\n        container.appendChild(cursoCard);\n    });\n}\n\n// Event listeners para tabs de niveles\ndocument.addEventListener('DOMContentLoaded', function() {\n    // Renderizar cursos iniciales\n    renderCursos('principiante');\n    \n    // Event listeners para tabs\n    const tabs = document.querySelectorAll('.nivel-tab');\n    tabs.forEach(tab => {\n        tab.addEventListener('click', function() {\n            // Remover clase active de todos\n            tabs.forEach(t => t.classList.remove('active'));\n            // Agregar clase active al clickeado\n            this.classList.add('active');\n            // Renderizar cursos\n            renderCursos(this.dataset.nivel);\n        });\n    });\n\n    // Smooth scroll para links de navegación\n    document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {\n        anchor.addEventListener('click', function(e) {\n            e.preventDefault();\n            const target = document.querySelector(this.getAttribute('href'));\n            if (target) {\n                target.scrollIntoView({ behavior: 'smooth' });\n            }\n        });\n    });\n\n    // Menu toggle para mobile\n    const menuToggle = document.querySelector('.menu-toggle');\n    if (menuToggle) {\n        menuToggle.addEventListener('click', function() {\n            const navLinks = document.querySelector('.nav-links');\n            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';\n        });\n    }\n\n    // Agregar animaciones en scroll\n    const observerOptions = {\n        threshold: 0.1,\n        rootMargin: '0px 0px -100px 0px'\n    };\n\n    const observer = new IntersectionObserver(function(entries) {\n        entries.forEach(entry => {\n            if (entry.isIntersecting) {\n                entry.target.style.opacity = '1';\n                entry.target.style.transform = 'translateY(0)';\n            }\n        });\n    }, observerOptions);\n\n    document.querySelectorAll('.instrumento-card, .caracteristica, .plan-card').forEach(el => {\n        el.style.opacity = '0';\n        el.style.transform = 'translateY(20px)';\n        el.style.transition = 'all 0.6s ease';\n        observer.observe(el);\n    });\n\n    // Botones de acción\n    const btnComenzar = document.querySelector('.hero-buttons .btn-primary');\n    const btnVerCursos = document.querySelector('.hero-buttons .btn-secondary');\n\n    if (btnComenzar) {\n        btnComenzar.addEventListener('click', function() {\n            alert('¡Bienvenido! Regístrate para comenzar tu viaje musical.');\n        });\n    }\n\n    if (btnVerCursos) {\n        btnVerCursos.addEventListener('click', function() {\n            document.getElementById('cursos').scrollIntoView({ behavior: 'smooth' });\n        });\n    }\n\n    // Botones de planes\n    document.querySelectorAll('.plan-card .btn').forEach(btn => {\n        btn.addEventListener('click', function() {\n            const planName = this.parentElement.querySelector('h3').textContent;\n            alert(`¡Excelente! Has seleccionado el plan ${planName}`);\n        });\n    });\n\n    // Botones de instrumentos\n    document.querySelectorAll('.instrumento-card .btn').forEach(btn => {\n        btn.addEventListener('click', function() {\n            document.getElementById('cursos').scrollIntoView({ behavior: 'smooth' });\n        });\n    });\n});\n\n// Función para animar números\nfunction animateCounter(element, target, duration = 2000) {\n    let current = 0;\n    const increment = target / (duration / 16);\n    \n    const timer = setInterval(() => {\n        current += increment;\n        if (current >= target) {\n            element.textContent = target;\n            clearInterval(timer);\n        } else {\n            element.textContent = Math.floor(current);\n        }\n    }, 16);\n}\n\n// Animar contadores cuando se vea la sección\nwindow.addEventListener('scroll', function() {\n    const comunidadSection = document.querySelector('.comunidad');\n    if (comunidadSection && !comunidadSection.hasAttribute('data-animated')) {\n        const rect = comunidadSection.getBoundingClientRect();\n        if (rect.top < window.innerHeight) {\n            comunidadSection.setAttribute('data-animated', 'true');\n            document.querySelectorAll('.stat h3').forEach(stat => {\n                const text = stat.textContent;\n                const number = parseInt(text.replace(/\\D/g, ''));\n                const suffix = text.replace(/[0-9]/g, '');\n                animateCounter(stat, number, 2000);\n                // Agregar sufijo después\n                setTimeout(() => {\n                    stat.textContent = number + suffix;\n                }, 2000);\n            });\n        }\n    }\n});\n