export default {
    betaWarning:
        'Versión pública preliminar, sin firma ni notarización. El sistema puede avisar de un editor desconocido. Verifica el origen en GitHub y SHA-256; no desactives la seguridad del sistema. La aceptación para producción no está completa. Guarda antes una copia de los datos importantes.',
    betaNote:
        'Windows x64 es la plataforma principal de prueba. Siguen pendientes las instalaciones MSI limpias, pruebas reales de macOS/notarización y la matriz de actualización y reversión entre versiones. Las descargas de macOS son experimentales; lee las notas primero.',
    systemRequirements:
        'Windows 10/11 x64 (requiere WebView2 y un directorio local con escritura; admite C); macOS ARM/Intel es experimental, requiere un directorio de aplicación con escritura y no tiene completa la validación en equipos reales',
    publishedOn: 'Publicada el:',
    checksums: 'Descargar sumas SHA-256',
    downloads: {
        winNsis: 'Instalador Windows x64 (recomendado)',
        winMsi: 'Windows x64 · MSI',
        macArmDmg: 'macOS Apple Silicon · DMG',
        macIntelDmg: 'macOS Intel · DMG',
        macArmApp: 'macOS Apple Silicon · Archivo App',
        macIntelApp: 'macOS Intel · Archivo App'
    },
    navFeatures: 'Funciones',
    navModes: 'Formas de uso',
    navDownload: 'Descargar',
    navDocs: 'Documentación',
    theme: 'Alternar tema claro y oscuro',
    language: 'Idioma',
    skip: 'Saltar al contenido',
    online: 'Abrir versión web',
    download: 'Obtener aplicación',
    eyebrow: 'Convierte tus planes en avances visibles',
    title: 'Proyectos claros.',
    titleAccent: 'Próximos pasos seguros.',
    intro: 'Reúne proyectos, tareas y fechas, desde la primera idea hasta el siguiente hito. Abre tu espacio en el navegador o trabaja de forma independiente en el escritorio.',
    note: 'Gratis y de código abierto · Uso local sin conexión · Integración MCP',
    previewTitle: 'Espacio del proyecto',
    previewSelect: 'Elegir vista previa',
    previewTasks: 'Lista de tareas',
    previewBoard: 'Tablero',
    previewAlt: {
        tasks: 'Lista actual de EasyProject con estadísticas de nivel superior, columnas visibles, estados y progreso.',
        board: 'Tablero actual de EasyProject con contenedores de estado de anchura fija que se ajustan en filas y tarjetas alineadas a la izquierda.'
    },
    previewNote:
        'Interfaz capturada el 26/10/2026 con datos de demostración sintéticos. La versión que aparece en la imagen pertenece al proyecto de ejemplo; los paquetes públicos de escritorio pueden tener otro aspecto.',
    windowsDownloadHint:
        'Elige el instalador x64 para el uso habitual. Abre Otros formatos si necesitas MSI.',
    macDownloadHint:
        'Una versión, dos tipos de chip: Apple Silicon para chips Apple e Intel para chips Intel. Comprueba Acerca de este Mac si tienes dudas.',
    otherFormats: 'Otros formatos (MSI / archivos App)',
    otherFormatsHint:
        'Son formatos alternativos de la misma versión, no más versiones del producto. Normalmente basta con el instalador o DMG de arriba.',
    featuresEyebrow: 'Menos cambios, más concentración',
    featuresTitle: 'De la visión general a la siguiente tarea.',
    features: [
        {
            title: 'Un proyecto, varias perspectivas',
            body: 'Listas de tareas, tableros, Gantt, equipos y calendarios laborales permanecen juntos en el mismo proyecto.',
            icon: 'pi-th-large'
        },
        {
            title: 'Relaciones claras',
            body: 'Organiza el trabajo con subtareas, predecesoras, personas asignadas y progreso; planifica con tu calendario laboral.',
            icon: 'pi-sitemap'
        },
        {
            title: 'Ten a mano los próximos plazos',
            body: 'La ventana flotante muestra las próximas tareas locales. Cambia su tamaño, contráela o acóplala a un borde.',
            icon: 'pi-window-minimize'
        },
        {
            title: 'Llévate tus datos',
            body: 'Intercambia datos con JSON, CSV y Excel, con copias de seguridad y recuperación para poder volver atrás.',
            icon: 'pi-database'
        }
    ],
    modesEyebrow: 'Empieza a tu manera',
    modesTitle: 'Conectado en línea. Independiente en local.',
    webTitle: 'Abre el navegador y empieza',
    webBody:
        'Regístrate e inicia sesión para acceder al mismo espacio remoto desde varios dispositivos, sin instalar la aplicación.',
    localTitle: 'Escritorio, también sin cuenta',
    localBody:
        'Inicia sesión al abrir o elige el uso local sin sesión. El trabajo local básico no necesita cuenta ni conexión.',
    isolation:
        'Separados por diseño: los datos locales no se suben ni se mezclan automáticamente con tu cuenta. La ventana flotante muestra tareas locales.',
    aiEyebrow: 'Un lugar para tu agente de IA',
    aiTitle: 'Que la IA trabaje con tu plan, no con otra copia.',
    aiBody: 'Consulta y gestiona proyectos, tareas y miembros mediante MCP. En los ajustes de usuario en línea puedes crear tokens personales de lectura, escritura o CRUD completo. Las conexiones locales son de solo lectura por defecto.',
    aiNote: 'Escribir y eliminar requiere autorización explícita. No compartas tokens en chats ni repositorios públicos.',
    aiLink: 'Leer guía de conexión MCP',
    downloadEyebrow: 'Descargas de escritorio',
    downloadTitle: 'Lleva tu espacio al escritorio.',
    releaseStatus: 'Todavía no hay un instalador público',
    releaseBody:
        'Los paquetes actuales son pruebas internas sin firmar. La aceptación formal no está completa. Una vez verificados y autorizados para distribución pública se mostrarán versiones, requisitos, fechas y enlaces.',
    releaseAction: 'Ver versiones públicas',
    releaseNote:
        'Mientras tanto, prueba la versión web. No se descarga ni ejecuta ningún instalador automáticamente.',
    privacyTitle: 'Datos y privacidad',
    privacyBody:
        'Esta página no necesita sesión, no lee espacios de trabajo, no comprueba cuentas y no incluye analítica ni anuncios de terceros. La versión web guarda cuentas y espacios remotos en el servidor; el modo local guarda los datos en el directorio configurado.',
    trialTitle: 'Acerca de este servicio',
    trialBody:
        'La versión web es un servicio de prueba alojado en un servidor personal. La disponibilidad y velocidad pueden variar según la región, sin compromiso de disponibilidad de producción. Conserva exportaciones o copias de los datos importantes.',
    endTitle: 'Empieza con un plan que puedas ver.',
    endBody: 'Prueba la versión web y encuentra tu ritmo de trabajo.',
    source: 'Código fuente',
    docs: 'Documentación',
    issues: 'Informar de un problema',
    contact: 'Contacto y comentarios',
    changelog: 'Cambios',
    footer: 'Gestión de proyectos de código abierto · Licencia MIT'
}
