export type PublicLanguage = "es" | "en";

export interface PublicDictionary {
  navbar: {
    services: string;
    evidence: string;
    standards: string;
    trackDevice: string;
    trackShort: string;
    staffLogin: string;
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
  },
  en: {
    navbar: {
      services: "Services",
      evidence: "Evidence",
      standards: "Standards & Warranty",
      trackDevice: "Track Device",
      trackShort: "Track",
      staffLogin: "Staff Login",
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
  },
};
