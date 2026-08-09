export type PublicLanguage = "es" | "en";

export interface PublicDictionary {
  navbar: {
    services: string;
    evidence: string;
    standards: string;
    trackDevice: string;
    trackShort: string;
    staffLogin: string;
    bookAppointment: string;
  };
  home: {
    statusBadge: string;
    heroTitlePart1: string;
    heroTitleHighlight: string;
    heroTitlePart2: string;
    heroSubtitle: string;
    ctaTrack: string;
    ctaServices: string;
    features: {
      evidence: string;
      esdLab: string;
      originalParts: string;
      writtenWarranty: string;
    };
    servicesHeaderBadge: string;
    servicesTitle: string;
    servicesSubtitle: string;
    serviceCards: {
      servers: {
        title: string;
        desc: string;
        bullet1: string;
        bullet2: string;
      };
      android: {
        title: string;
        desc: string;
        bullet1: string;
        bullet2: string;
      };
      laptops: {
        title: string;
        desc: string;
        bullet1: string;
        bullet2: string;
      };
      gaming: {
        title: string;
        desc: string;
        bullet1: string;
        bullet2: string;
      };
    };
    evidenceBadge: string;
    evidenceTitle: string;
    evidenceSubtitle: string;
    sliders: {
      cleaning: {
        beforeLabel: string;
        afterLabel: string;
        title: string;
        desc: string;
        category: string;
      };
      assembly: {
        beforeLabel: string;
        afterLabel: string;
        title: string;
        desc: string;
        category: string;
      };
    };
    whyVikingTitle: string;
    whyVikingSubtitle: string;
    whyCards: {
      log: {
        title: string;
        desc: string;
      };
      warranty: {
        title: string;
        desc: string;
      };
      b2b: {
        title: string;
        desc: string;
      };
    };
    footer: {
      tagline: string;
      trackOrder: string;
      servicesB2b: string;
      visualEvidence: string;
      standardsWarranty: string;
      staffAccess: string;
      copyrightPrefix: string;
      fromText: string;
      rightsReserved: string;
    };
  };
  publicLayout: {
    portalSubtitle: string;
    staffAccess: string;
    footerCopyright: string;
    footerSupport: string;
  };
  statusPage: {
    badge: string;
    title: string;
    subtitle: string;
    clientDniLabel: string;
    clientDniPlaceholder: string;
    securityCodeLabel: string;
    securityCodePlaceholder: string;
    securityCodeHelp: string;
    searchButton: string;
    searchingButton: string;
    securityNotice: string;
    notFoundTitle: string;
    notFoundDesc: string;
    tryAgainButton: string;
    contactSupport: string;
    backToHome: string;
    orderInfoTitle: string;
    deviceLabel: string;
    serialLabel: string;
    intakeDateLabel: string;
    estimatedCostLabel: string;
    diagnosticHistoryTitle: string;
    diagnosticHistorySubtitle: string;
    toastMissingFields: string;
    toastNotFound: string;
    toastSuccess: string;
  };
  bottomNav: {
    home: string;
    booking: string;
    track: string;
    staff: string;
  };
  booking: {
    pageTitlePart1: string;
    pageTitleHighlight: string;
    pageSubtitle: string;
    step1Title: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    deviceTypeLabel: string;
    deviceTypePlaceholder: string;
    deviceOptions: {
      general: string;
      pc: string;
      laptop: string;
      mobile: string;
      gaming: string;
    };
    step2Title: string;
    selectDateLabel: string;
    pickDatePlaceholder: string;
    availableSlotsLabel: string;
    selectDateFirst: string;
    selectDeviceFirst: string;
    loadingSlots: string;
    noSlots: string;
    step3Title: string;
    notesLabel: string;
    notesPlaceholder: string;
    buttonBack: string;
    buttonContinue: string;
    buttonSubmit: string;
    buttonProcessing: string;
    successTitle: string;
    successDesc: string;
    successReturn: string;
    toastError: string;
    stepName: string;
    stepDevice: string;
    stepDate: string;
    stepTime: string;
  };
}

export const publicDictionaries: Record<PublicLanguage, PublicDictionary> = {
  es: {
    navbar: {
      services: "Servicios",
      evidence: "Evidencia",
      standards: "Estándar & Garantía",
      trackDevice: "Rastrear Equipo",
      trackShort: "Rastrear",
      staffLogin: "Staff Login",
      bookAppointment: "Agenda tu Turno",
    },
    home: {
      statusBadge: "Laboratorio de Precisión & Diagnóstico Digital",
      heroTitlePart1: "Soporte Técnico de",
      heroTitleHighlight: "Alta Precisión",
      heroTitlePart2: "& Mantenimiento Especializado",
      heroSubtitle:
        "Ingeniería de hardware y diagnóstico transparente para empresas, servidores PC, notebooks y consolas. Trazabilidad en tiempo real y rigor militar en cada soldadura.",
      ctaTrack: "Consultar Estado de Equipo (QR)",
      ctaServices: "Servicios Corporativos",
      features: {
        evidence: "Evidencia Foto & Video en Vivo",
        esdLab: "Laboratorio ESD Homologado",
        originalParts: "Repuestos Grado Original",
        writtenWarranty: "Garantía Escrita 100% Auditada",
      },
      servicesHeaderBadge: "Capacidades de Taller",
      servicesTitle: "Soluciones Integrales para Flotas & Hardware",
      servicesSubtitle:
        "Diseñado tanto para usuarios particulares como para empresas con demanda crítica de continuidad operativa.",
      serviceCards: {
        servers: {
          title: "Mantenimiento Corporativo & PC",
          desc: "Soporte preventivo y correctivo para estaciones de trabajo de alto rendimiento, PC de escritorio y servidores empresariales.",
          bullet1:
            "Mantenimiento térmico profesional con pastas de alta conductividad y almohadillas térmicas.",
          bullet2:
            "Gestión de cables, limpieza interna exhaustiva y auditoría de fuentes de poder.",
        },
        android: {
          title: "Servicio Técnico Android",
          desc: "Diagnóstico digital y solución especializada para teléfonos Android. Cambio garantizado de pantallas y placas de carga.",
          bullet1:
            "Reemplazo de módulos de pantalla OLED e IPS con encastre y prueba de control total.",
          bullet2:
            "Cambio de placas sub-pines de carga, conectores USB-C y flex del dispositivo.",
        },
        laptops: {
          title: "Reparación de Notebooks",
          desc: "Especialistas en equipos portátiles comerciales, ultrabooks y notebooks gaming. Solución definitiva a fallas térmicas y estructurales.",
          bullet1:
            "Reconstrucción de bisagras y anclajes en chasis de aluminio o policarbonato.",
          bullet2:
            "Cambio de pantallas y baterías con calibración de ciclos de vida del equipo.",
        },
        gaming: {
          title: "Mantenimiento PlayStation & Xbox",
          desc: "Soporte técnico integral para PlayStation 3, PlayStation 4 (Fat, Slim, Pro) y toda la familia Xbox (360, One y Series X/S).",
          bullet1:
            "Limpieza profunda de turbinas, disipadores y cambio de pasta térmica de alta calidad.",
          bullet2:
            "Reducción drástica de ruido en ventiladores y prevención de apagados térmicos.",
        },
      },
      evidenceBadge: "Evidencia de Resultados",
      evidenceTitle: "Comparativa Visual de Laboratorio",
      evidenceSubtitle:
        "Desliza sobre cada imagen para observar la calidad de terminación y limpieza en nuestros servicios de mantenimiento y armado.",
      sliders: {
        cleaning: {
          beforeLabel: "ANTES (SUCIO)",
          afterLabel: "LIMPIO & OPTIMIZADO",
          title: "Limpieza Profunda & Mantenimiento Preventivo",
          desc: "Remoción minuciosa de polvo acumulado y obstrucciones térmicas en ventiladores y disipadores para restaurar el flujo de aire y prevenir sobrecalentamiento.",
          category: "Mantenimiento de PC",
        },
        assembly: {
          beforeLabel: "ANTES DEL SERVICIO",
          afterLabel: "ENSAMBLADO FINAL",
          title: "Armado Profesional & Gestión de Cables",
          desc: "Ensamblaje a medida de equipos de escritorio, organización profesional de cableado interno (cable management) y verificación integral de hardware.",
          category: "Armado de Equipos",
        },
      },
      whyVikingTitle: "El Estándar más alto en Soporte Técnico",
      whyVikingSubtitle:
        "Transparencia absoluta y profesionalismo técnico sin compromisos ni promesas vacías.",
      whyCards: {
        log: {
          title: "Bitácora Multimedia",
          desc: "Cada paso del diagnóstico es documentado con fotografías de alta definición en tu línea de tiempo privada accesible vía código WOVIK.",
        },
        warranty: {
          title: "Garantía Auditada",
          desc: "Entregamos informes técnicos formales con detalle de repuestos instalados, seriales homologados y garantía escrita respaldada por el taller.",
        },
        b2b: {
          title: "Atención B2B a Flotas",
          desc: "Planes de mantenimiento preventivo continuado para parques informáticos de empresas, estudios profesionales y laboratorios creativos.",
        },
      },
      footer: {
        tagline:
          "Laboratorio de mantenimiento informático, diagnóstico micro-electrónico y seguimiento en tiempo real.",
        trackOrder: "Rastrear Orden",
        servicesB2b: "Servicios B2B",
        visualEvidence: "Evidencia Visual",
        standardsWarranty: "Estándar & Garantía",
        staffAccess: "Acceso Técnico (Staff)",
        copyrightPrefix: "de",
        fromText: "de",
        rightsReserved: "Todos los derechos reservados.",
      },
    },
    publicLayout: {
      portalSubtitle: "Portal de Clientes",
      staffAccess: "Acceso Staff",
      footerCopyright:
        "Viking App Systems. Todos los derechos reservados.",
      footerSupport: "Soporte Técnico Vikingo",
    },
    statusPage: {
      badge: "Portal Oficial de Seguimiento",
      title: "Rastrear Estado de Orden",
      subtitle:
        "Consulta en tiempo real el avance técnico, bitácora fotográfica y diagnóstico de tu dispositivo en laboratorio.",
      clientDniLabel: "DNI del Titular",
      clientDniPlaceholder: "Ej: 38450123",
      securityCodeLabel: "Código de Seguridad WOVIK",
      securityCodePlaceholder: "XXXXX",
      securityCodeHelp:
        "El código impreso en tu comprobante térmico o enviado por WhatsApp.",
      searchButton: "Consultar Estado Digital",
      searchingButton: "Verificando en Base de Datos...",
      securityNotice:
        "Acceso cifrado en lectura de solo lectura. Para dudas sobre importes o autorizaciones comunícate directamente con el taller.",
      notFoundTitle: "Orden No Encontrada",
      notFoundDesc:
        "No encontramos una orden activa que coincida con el DNI y código de seguridad ingresados. Verifica los datos del comprobante.",
      tryAgainButton: "Intentar con Otros Datos",
      contactSupport: "Contactar a Soporte",
      backToHome: "Volver al Inicio",
      orderInfoTitle: "Detalle de Orden y Equipo",
      deviceLabel: "Dispositivo",
      serialLabel: "Número de Serie",
      intakeDateLabel: "Fecha de Ingreso",
      estimatedCostLabel: "Presupuesto / Importe",
      diagnosticHistoryTitle: "Línea de Tiempo de Diagnóstico",
      diagnosticHistorySubtitle:
        "Registro auditado con evidencia visual cargada por el cuerpo técnico.",
      toastMissingFields:
        "Por favor ingrese tanto el DNI como el código de seguridad WOVIK.",
      toastNotFound: "Orden no encontrada en los registros.",
      toastSuccess: "Estado de orden consultado exitosamente.",
    },
    bottomNav: {
      home: "Inicio",
      booking: "Reservar",
      track: "Clientes",
      staff: "Personal",
    },
    booking: {
      pageTitlePart1: "Agenda tu",
      pageTitleHighlight: "Turno",
      pageSubtitle: "Sigue los pasos debajo para agendar un turno con nuestro laboratorio de precisión.",
      step1Title: "1. Detalles Personales & del Equipo",
      fullNameLabel: "Nombre Completo",
      fullNamePlaceholder: "Ej: Juan Pérez",
      phoneLabel: "Número de Teléfono (WhatsApp)",
      phonePlaceholder: "Ej: +54 9 11 1234 5678",
      deviceTypeLabel: "Tipo de Equipo / Servicio",
      deviceTypePlaceholder: "Selecciona una categoría",
      deviceOptions: {
        general: "Asesoramiento General",
        pc: "PC de Escritorio / Servidor",
        laptop: "Notebook / Ultrabook",
        mobile: "Smartphone Android",
        gaming: "Consola de Videojuegos",
      },
      step2Title: "2. Seleccionar Fecha y Hora",
      selectDateLabel: "Seleccionar Fecha",
      pickDatePlaceholder: "Elegir una fecha",
      availableSlotsLabel: "Horarios Disponibles",
      selectDateFirst: "Seleccione una fecha primero",
      selectDeviceFirst: "Selecciona un tipo de equipo primero",
      loadingSlots: "Cargando horarios...",
      noSlots: "No hay horarios disponibles para esta fecha",
      step3Title: "3. Revisar & Confirmar",
      notesLabel: "Notas Adicionales (Opcional)",
      notesPlaceholder: "Describe brevemente el problema...",
      buttonBack: "Atrás",
      buttonContinue: "Continuar",
      buttonSubmit: "Confirmar Reserva",
      buttonProcessing: "Procesando...",
      successTitle: "Reserva Confirmada",
      successDesc: "Tu turno ha sido agendado exitosamente. Recibirás una confirmación en breve.",
      successReturn: "Volver al Inicio",
      toastError: "Hubo un error al crear la reserva. Por favor verifique su conexión e intente nuevamente.",
      stepName: "Nombre:",
      stepDevice: "Equipo:",
      stepDate: "Fecha:",
      stepTime: "Hora:",
    },
  },
  en: {
    navbar: {
      services: "Services",
      evidence: "Evidence",
      standards: "Standards & Warranty",
      trackDevice: "Track Device",
      trackShort: "Track",
      staffLogin: "Staff Login",
      bookAppointment: "Book Appointment",
    },
    home: {
      statusBadge: "Precision Hardware Lab & Digital Diagnostics",
      heroTitlePart1: "High-Precision",
      heroTitleHighlight: "Tech Support",
      heroTitlePart2: "& Specialized Maintenance",
      heroSubtitle:
        "Hardware engineering and transparent diagnostics for enterprises, PC servers, notebooks, and gaming consoles. Real-time traceability with military rigor in every joint.",
      ctaTrack: "Check Repair Status (QR)",
      ctaServices: "Corporate Services",
      features: {
        evidence: "Live Photo & Video Evidence",
        esdLab: "Certified ESD Laboratory",
        originalParts: "Original-Grade Replacement Parts",
        writtenWarranty: "100% Audited Written Warranty",
      },
      servicesHeaderBadge: "Workshop Capabilities",
      servicesTitle: "Comprehensive Hardware & Fleet Solutions",
      servicesSubtitle:
        "Engineered for both individual clients and enterprises requiring critical operational continuity.",
      serviceCards: {
        servers: {
          title: "Corporate & PC Maintenance",
          desc: "Preventive and corrective support for high-performance workstations, desktop computers, and enterprise servers.",
          bullet1:
            "Professional thermal maintenance using high-conductivity pastes and thermal pads.",
          bullet2:
            "Impeccable cable management, internal deep cleaning, and power supply auditing.",
        },
        android: {
          title: "Android Technical Service",
          desc: "Digital diagnostics and specialized solutions for Android smartphones. Guaranteed replacement of screens and charging boards.",
          bullet1:
            "Replacement of OLED and IPS screen modules with precision fitting and full quality control.",
          bullet2:
            "Replacement of charging daughterboards, USB-C connectors, and internal flex cables.",
        },
        laptops: {
          title: "Notebook & Laptop Repair",
          desc: "Specialists in commercial laptops, ultrabooks, and gaming notebooks. Permanent fixes for thermal and structural failures.",
          bullet1:
            "Reconstruction of hinges and anchors on aluminum or polycarbonate chassis.",
          bullet2:
            "Screen and battery replacement with battery cycle calibration.",
        },
        gaming: {
          title: "PlayStation & Xbox Maintenance",
          desc: "Comprehensive technical support for PlayStation 3, PlayStation 4 (Fat, Slim, Pro), and the Xbox family (360, One, Series X/S).",
          bullet1:
            "Deep cleaning of turbine fans and heatsinks plus premium thermal paste replacement.",
          bullet2:
            "Drastic fan noise reduction and thermal shutdown prevention.",
        },
      },
      evidenceBadge: "Visual Evidence",
      evidenceTitle: "Laboratory Before & After Comparison",
      evidenceSubtitle:
        "Slide across each image to inspect our finishing quality and cleanliness in maintenance and custom build services.",
      sliders: {
        cleaning: {
          beforeLabel: "BEFORE (DUSTY)",
          afterLabel: "CLEAN & OPTIMIZED",
          title: "Deep Cleaning & Preventive Maintenance",
          desc: "Thorough removal of accumulated dust and thermal blockages in fans and heatsinks to restore airflow and prevent overheating.",
          category: "PC Maintenance",
        },
        assembly: {
          beforeLabel: "BEFORE SERVICE",
          afterLabel: "FINAL ASSEMBLY",
          title: "Professional Assembly & Cable Management",
          desc: "Custom desktop PC building, professional internal wiring routing (cable management), and thorough hardware stress testing.",
          category: "Custom PC Building",
        },
      },
      whyVikingTitle: "The Highest Standard in Technical Support",
      whyVikingSubtitle:
        "Absolute transparency and professional engineering without compromises or empty promises.",
      whyCards: {
        log: {
          title: "Multimedia Logbook",
          desc: "Every step of your diagnostic is documented with high-definition photos in your private timeline accessible via your WOVIK code.",
        },
        warranty: {
          title: "Audited Warranty",
          desc: "We deliver formal technical reports detailing installed replacement parts, certified serials, and written workshop warranty.",
        },
        b2b: {
          title: "B2B Fleet Maintenance",
          desc: "Ongoing preventive maintenance plans for corporate IT equipment, creative studios, and professional laboratories.",
        },
      },
      footer: {
        tagline:
          "IT hardware maintenance lab, micro-electronic diagnostics, and real-time repair tracking.",
        trackOrder: "Track Order",
        servicesB2b: "B2B Services",
        visualEvidence: "Visual Evidence",
        standardsWarranty: "Standards & Warranty",
        staffAccess: "Staff Technical Access",
        copyrightPrefix: "from",
        fromText: "from",
        rightsReserved: "All rights reserved.",
      },
    },
    publicLayout: {
      portalSubtitle: "Client Portal",
      staffAccess: "Staff Access",
      footerCopyright:
        "Viking App Systems. All rights reserved.",
      footerSupport: "Viking Technical Support",
    },
    statusPage: {
      badge: "Official Tracking Portal",
      title: "Track Work Order Status",
      subtitle:
        "Check technical progress, photographic logbook, and hardware diagnostics in real time.",
      clientDniLabel: "Client ID / DNI",
      clientDniPlaceholder: "e.g., 38450123",
      securityCodeLabel: "WOVIK Security Code",
      securityCodePlaceholder: "XXXXX",
      securityCodeHelp:
        "The security code printed on your thermal ticket or sent via WhatsApp.",
      searchButton: "Check Digital Status",
      searchingButton: "Querying Database...",
      securityNotice:
        "Encrypted read-only access. For billing inquiries or quote authorizations, contact the workshop directly.",
      notFoundTitle: "Order Not Found",
      notFoundDesc:
        "We couldn't find an active order matching the provided ID and security code. Please double-check your receipt details.",
      tryAgainButton: "Try Another Code",
      contactSupport: "Contact Support",
      backToHome: "Back to Home",
      orderInfoTitle: "Order & Device Details",
      deviceLabel: "Device",
      serialLabel: "Serial Number",
      intakeDateLabel: "Intake Date",
      estimatedCostLabel: "Quote / Amount",
      diagnosticHistoryTitle: "Diagnostic Timeline",
      diagnosticHistorySubtitle:
        "Audited history with visual evidence uploaded by our engineering team.",
      toastMissingFields:
        "Please enter both your Client DNI and WOVIK security code.",
      toastNotFound: "Work order not found in records.",
      toastSuccess: "Work order status retrieved successfully.",
    },
    bottomNav: {
      home: "Home",
      booking: "Book",
      track: "Clients",
      staff: "Staff",
    },
    booking: {
      pageTitlePart1: "Schedule",
      pageTitleHighlight: "Service",
      pageSubtitle: "Follow the steps below to book an appointment with our precision lab.",
      step1Title: "1. Personal & Device Details",
      fullNameLabel: "Full Name",
      fullNamePlaceholder: "e.g., John Doe",
      phoneLabel: "Phone Number (WhatsApp)",
      phonePlaceholder: "e.g., +1 234 567 8900",
      deviceTypeLabel: "Device / Service Type",
      deviceTypePlaceholder: "Select a category",
      deviceOptions: {
        general: "General Advisory",
        pc: "PC Server / Workstation",
        laptop: "Laptop / Ultrabook",
        mobile: "Android Smartphone",
        gaming: "Gaming Console",
      },
      step2Title: "2. Schedule Appointment",
      selectDateLabel: "Select Date",
      pickDatePlaceholder: "Pick a date",
      availableSlotsLabel: "Available Time Slots",
      selectDateFirst: "Select a date first",
      selectDeviceFirst: "Select a device type first",
      loadingSlots: "Loading slots...",
      noSlots: "No slots available for this date",
      step3Title: "3. Review & Submit",
      notesLabel: "Additional Notes (Optional)",
      notesPlaceholder: "Describe the issue briefly...",
      buttonBack: "Back",
      buttonContinue: "Continue",
      buttonSubmit: "Confirm Booking",
      buttonProcessing: "Processing...",
      successTitle: "Booking Confirmed",
      successDesc: "Your appointment has been scheduled successfully. You will receive a confirmation shortly.",
      successReturn: "Return to Home",
      toastError: "An error occurred while creating the booking. Please check your connection and try again.",
      stepName: "Name:",
      stepDevice: "Device:",
      stepDate: "Date:",
      stepTime: "Time:",
    },
  },
};
