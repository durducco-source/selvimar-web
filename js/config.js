/* ==========================================================================
   SELVIMAR · CONFIGURACIÓN DE LA WEB
   --------------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas tocar para cambiar los datos de
   contacto. Edítalo con cualquier editor de texto (recomendado: Visual
   Studio Code, gratuito). Respeta siempre las comillas "  " y las comas.
   Después de guardar, recarga la página en el navegador (F5).
   ========================================================================== */

window.SELVIMAR_CONFIG = {

  /* ---- 1. DATOS DE LA EMPRESA ------------------------------------------- */
  empresa: {
    nombre: "SELVIMAR",
    subtitulo: "Serveis Integrals de Neteja",
    direccion: "Calle Mercè Rodoreda, 1-3-5 (Local 3), 17310 Lloret de Mar (Girona)",
    // Sitio web público (sin barra final). Se usa para SEO y compartir en redes.
    // Cuando tengas dominio, cámbialo aquí (por ejemplo "https://www.selvimar.com").
    url: "https://www.selvimar.example"
  },

  /* ---- 2. CONTACTO ------------------------------------------------------- */
  contacto: {
    // Teléfono que se muestra y al que se llama (tal y como quieres verlo escrito)
    telefono: "678 783 274",
    telefonoSecundario: "972 346 177",

    // WhatsApp: número en formato internacional SIN "+" NI espacios.
    // España = 34 delante. Ejemplo: 34678783274
    // ⚠ Confirma que este número tiene WhatsApp; si no, cámbialo aquí.
    whatsapp: "34678783274",

    // Mensaje que aparece escrito al abrir WhatsApp
    whatsappMensaje: "Hola, me gustaría solicitar un presupuesto de limpieza.",

    // ⚠ PENDIENTE: escribe aquí el email real de la empresa
    email: "info@tudominio.com",

    // Redes sociales. Deja "" (vacío) si no la usas: el enlace se oculta solo.
    // Ejemplo Instagram: "https://www.instagram.com/tu_usuario"
    instagram: "",
    facebook: "https://www.facebook.com/Selvimar-serveis-de-neteja-440522346065739"
  },

  /* ---- 3. FORMULARIO DE PRESUPUESTO -------------------------------------- */
  formulario: {
    // OPCIÓN A (recomendada): servicio gratuito que te envía cada solicitud por email.
    //   1) Crea una cuenta gratuita en https://formspree.io
    //   2) Crea un formulario nuevo y copia su dirección (algo como https://formspree.io/f/abcdwxyz)
    //   3) Pégala entre las comillas de "endpoint".
    // Mientras "endpoint" esté vacío, el formulario funciona igualmente:
    //   abre WhatsApp con todos los datos ya escritos (o el correo, ver "alternativa").
    endpoint: "",

    // Qué hacer si no hay "endpoint": "whatsapp" o "email"
    alternativa: "whatsapp"
  },

  /* ---- 4. RESEÑAS DE GOOGLE ---------------------------------------------- */
  resenas: {
    // Cuando tengas reseñas reales, cambia a true: se ocultan las etiquetas
    // "ejemplo" de los testimonios de muestra (recuerda sustituir sus textos en index.html).
    testimoniosReales: false,

    // Enlace a tu ficha de Google (Perfil de empresa → "Compartir ficha").
    // Si lo rellenas aparecerá el botón "Ver todas las reseñas en Google".
    enlaceGoogle: "",

    // Enlace directo para que un cliente escriba una reseña (opcional).
    enlaceEscribirResena: ""
  },

  /* ---- 5. SOBRE NOSOTROS (datos preparados, aún vacíos) ------------------- */
  // Añade aquí únicamente datos REALES y verificables. Mientras esté vacío no se muestra nada.
  // Ejemplos (bórralos si no aplican):
  //   { valor: "20", etiqueta: "años de experiencia" },
  //   { valor: "15", etiqueta: "profesionales en el equipo" }
  sobreNosotros: {
    cifras: [],
    // Certificaciones o sellos de calidad reales, por ejemplo: ["ISO 9001"]
    certificaciones: [],
    // Nombre y cargo de la persona responsable (opcional): { nombre: "", cargo: "" }
    responsable: null
  },

  /* ---- 6. DATOS LEGALES (para las páginas de privacidad y aviso legal) ---- */
  legal: {
    razonSocial: "",     // Ejemplo: "Neteges Sel-Vimar, S.L."
    nif: "",             // CIF de la empresa
    registroMercantil: "" // Ejemplo: "Registro Mercantil de Girona, tomo..., folio..."
  }
};
