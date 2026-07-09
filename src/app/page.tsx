import React from "react";
import Link from "next/link";
import {
  Search,
  Wrench,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Laptop,
  Gamepad2,
  Server,
  Activity,
  Award,
  Sparkles,
  ChevronRight,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/common/navbar";
import { BeforeAfterSlider } from "@/components/common/before-after-slider";

/**
 * Root Landing Page (/):
 * Premium B2B/Retail Commercial Gateway for Viking App workshop.
 * Showcases specialized computer, laptop, and console repair capabilities,
 * live interactive before/after repair evidence, and prominent thermal ticket QR tracking.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground relative overflow-x-hidden selection:bg-tertiary/20 selection:text-tertiary">
      {/* Navbar Header */}
      <Navbar />

      {/* Decorative Background Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-tertiary/15 via-info/10 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-60 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -right-60 w-[500px] h-[500px] bg-info/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 md:pt-20 md:pb-32 flex flex-col items-center text-center space-y-8 z-10">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/30 border border-border/80 text-xs font-mono text-typography tracking-wider uppercase animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-success animate-ping" />
          <span>Laboratorio de Precisión & Diagnóstico Digital</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground uppercase max-w-4xl leading-[1.1] sm:leading-[1.1]">
          Soporte Técnico de <span className="text-tertiary drop-shadow-sm">Alta Precisión</span> & Mantenimiento Especializado
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-typography font-mono leading-relaxed max-w-2xl mx-auto">
          Ingeniería de hardware y diagnóstico transparente para empresas, servidores PC, notebooks y consolas. Trazabilidad en tiempo real y rigor militar en cada soldadura.
        </p>

        {/* Primary CTA Action Bar (QR / Thermal Ticket Tracking Hook) */}
        <div className="w-full max-w-xl pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/status" className="w-full sm:w-auto flex-1">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-tertiary to-warning hover:from-tertiary/90 hover:to-warning/90 text-tertiary-foreground font-extrabold uppercase tracking-wider py-7 px-8 text-sm sm:text-base shadow-xl shadow-tertiary/20 border border-tertiary/40 group relative overflow-hidden transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
              <QrCode className="w-6 h-6 mr-3 animate-pulse" />
              <span>Consultar Estado de Equipo (QR)</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <a href="#services" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-card/80 backdrop-blur-md border-border/80 hover:border-tertiary/60 text-foreground font-mono text-xs uppercase tracking-widest py-7 px-6 hover:bg-secondary/30 transition-all"
            >
              <span>Servicios Corporativos</span>
              <ChevronRight className="ml-1 h-4 w-4 text-tertiary" />
            </Button>
          </a>
        </div>

        {/* Quick Features Strip */}
        <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl text-left border-t border-border/40 text-xs font-mono text-typography/80">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span>Evidencia Foto & Video en Vivo</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span>Laboratorio ESD Homologado</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span>Repuestos Grado Original</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span>Garantía Escrita 100% Auditada</span>
          </div>
        </div>
      </section>

      {/* B2B & Specialized Services Grid Section */}
      <section id="services" className="w-full bg-secondary/15 border-y border-border/40 py-20 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-tertiary font-bold px-3 py-1 rounded-full bg-tertiary/10 border border-tertiary/30 inline-block">
              Capacidades de Taller
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground uppercase">
              Soluciones Integrales para Flotas & Hardware
            </h2>
            <p className="text-xs sm:text-sm text-typography font-mono leading-relaxed">
              Diseñado tanto para usuarios particulares como para empresas con demanda crítica de continuidad operativa.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Service 1: Corporate Maintenance & PC Servers */}
            <Card className="bg-card/80 backdrop-blur-md border-border/80 hover:border-tertiary/60 transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col justify-between group">
              <CardHeader className="space-y-3 pb-4">
                <div className="w-12 h-12 rounded-xl bg-info/15 border border-info/30 flex items-center justify-center text-info group-hover:scale-110 transition-transform duration-300">
                  <Server className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold uppercase text-foreground">
                  Mantenimiento Corporativo & PC
                </CardTitle>
                <CardDescription className="text-xs font-mono text-typography leading-relaxed">
                  Soporte preventivo y correctivo para estaciones de trabajo de alto rendimiento, PC de escritorio y servidores empresariales.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-4 font-mono text-xs text-typography/90">
                <ul className="space-y-2 border-t border-border/40 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-info" />
                    <span>Mantenimiento térmico con pastas de metal líquido y almohadillas de alta conductividad.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-info" />
                    <span>Gestión de cables, limpieza ultrasónica y auditoría de fuentes de poder.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Service 2: Micro-soldering & Advanced Diagnostics */}
            <Card className="bg-card/80 backdrop-blur-md border-border/80 hover:border-tertiary/60 transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col justify-between group">
              <CardHeader className="space-y-3 pb-4">
                <div className="w-12 h-12 rounded-xl bg-tertiary/15 border border-tertiary/30 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform duration-300">
                  <Cpu className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold uppercase text-foreground">
                  Diagnóstico & Soldadura SMD
                </CardTitle>
                <CardDescription className="text-xs font-mono text-typography leading-relaxed">
                  Recuperación a nivel componente (SMD / BGA). Reparación de placas base sin necesidad de reemplazo completo de hardware costoso.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-4 font-mono text-xs text-typography/90">
                <ul className="space-y-2 border-t border-border/40 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                    <span>Detección de cortos con cámara térmica infrarroja y análisis de esquemáticos.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                    <span>Reemplazo de reguladores VRM, chips de control de carga y conectores dañados.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Service 3: Laptop & Ultrabook Engineering */}
            <Card className="bg-card/80 backdrop-blur-md border-border/80 hover:border-tertiary/60 transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col justify-between group">
              <CardHeader className="space-y-3 pb-4">
                <div className="w-12 h-12 rounded-xl bg-warning/15 border border-warning/30 flex items-center justify-center text-warning group-hover:scale-110 transition-transform duration-300">
                  <Laptop className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold uppercase text-foreground">
                  Reparación de Notebooks & Mac
                </CardTitle>
                <CardDescription className="text-xs font-mono text-typography leading-relaxed">
                  Especialistas en equipos portátiles comerciales, ultrabooks y notebooks gaming. Solución definitiva a fallas térmicas y estructurales.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-4 font-mono text-xs text-typography/90">
                <ul className="space-y-2 border-t border-border/40 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                    <span>Reconstrucción de bisagras y anclajes en chasis de aluminio o policarbonato.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                    <span>Cambio de pantallas OLED/IPS y baterías con calibración de ciclos de vida.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Service 4: Next-Gen Console Restoration */}
            <Card className="bg-card/80 backdrop-blur-md border-border/80 hover:border-tertiary/60 transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col justify-between group">
              <CardHeader className="space-y-3 pb-4">
                <div className="w-12 h-12 rounded-xl bg-success/15 border border-success/30 flex items-center justify-center text-success group-hover:scale-110 transition-transform duration-300">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold uppercase text-foreground">
                  Servicio Técnico de Consolas
                </CardTitle>
                <CardDescription className="text-xs font-mono text-typography leading-relaxed">
                  Soporte especializado para PlayStation 5, Xbox Series X/S, Nintendo Switch y Steam Deck. Mantenimiento para evitar el sobrecalentamiento.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-4 font-mono text-xs text-typography/90">
                <ul className="space-y-2 border-t border-border/40 pt-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span>Cambio y restauración de metal líquido en APUs de consolas next-gen.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span>Reparación de puertos HDMI 2.1 4K y joysticks con tecnología Hall Effect.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Workshop Showcase Section (Before & After Slider) */}
      <section id="workshop" className="w-full py-20 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-info font-bold px-3 py-1 rounded-full bg-info/10 border border-info/30 inline-block">
              Evidencia en Vivo
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground uppercase">
              Taller de Reparación en Acción
            </h2>
            <p className="text-xs sm:text-sm text-typography font-mono leading-relaxed">
              Desliza para comprobar la transformación empírica y el rigor técnico aplicado en nuestros bancos de trabajo.
            </p>
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BeforeAfterSlider
              beforeImage="/images/repairs/notebook-before.jpg"
              afterImage="/images/repairs/notebook-after.jpg"
              beforeLabel="SIN MANTENIMIENTO"
              afterLabel="RESTAURADO"
              title="Optimización Térmica en Notebook Gaming"
              description="Limpieza exhaustiva de radiadores obstruidos, remoción de pasta térmica seca y reemplazo por solución de alta conductividad para reducir picos de 95°C a 65°C."
              category="Notebooks & Laptops"
            />

            <BeforeAfterSlider
              beforeImage="/images/repairs/console-before.jpg"
              afterImage="/images/repairs/console-after.jpg"
              beforeLabel="PLACA OXIDADA"
              afterLabel="SOLDADURA SMD"
              title="Micro-soldadura en Puerto HDMI de Consola"
              description="Extracción limpia de puerto dañado por tracción mecánica, reconstrucción de pistas en PCB de 4 capas y soldadura bajo microscopio con estaño de plata antimagnético."
              category="Consolas & Micro-electrónica"
            />
          </div>
        </div>
      </section>

      {/* Why Viking App / Trust Section */}
      <section id="why-viking" className="w-full bg-card/40 border-t border-border/40 py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground uppercase">
              El Estándar Vikingo en Soporte
            </h2>
            <p className="text-xs sm:text-sm text-typography font-mono leading-relaxed">
              Transparencia absoluta y profesionalismo técnico sin compromisos ni promesas vacías.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-secondary/20 border border-border/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary/15 flex items-center justify-center text-tertiary">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground text-base uppercase">Bitácora Multimedia</h3>
              <p className="text-xs font-mono text-typography leading-relaxed">
                Cada paso del diagnóstico es documentado con fotografías de alta definición en tu línea de tiempo privada accesible vía código WOVIK.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-secondary/20 border border-border/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center text-success">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground text-base uppercase">Garantía Auditada</h3>
              <p className="text-xs font-mono text-typography leading-relaxed">
                Entregamos informes técnicos formales con detalle de repuestos instalados, seriales homologados y garantía escrita respaldada por el taller.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-secondary/20 border border-border/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center text-info">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground text-base uppercase">Atención B2B a Flotas</h3>
              <p className="text-xs font-mono text-typography leading-relaxed">
                Planes de mantenimiento preventivo continuado para parques informáticos de empresas, estudios profesionales y laboratorios creativos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border/60 bg-background pt-12 pb-8 px-4 sm:px-6 text-typography font-mono text-xs z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-border/30">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <span className="text-sm font-extrabold tracking-tight uppercase text-foreground">
              Viking <span className="text-tertiary">App</span> Tech Solutions
            </span>
            <p className="text-typography/60 text-[11px] max-w-xs text-center md:text-left">
              Laboratorio de mantenimiento informático, diagnóstico micro-electrónico y seguimiento en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] uppercase tracking-wider">
            <Link href="/status" className="hover:text-tertiary transition-colors">
              Rastrear Orden
            </Link>
            <a href="#services" className="hover:text-tertiary transition-colors">
              Servicios B2B
            </a>
            <a href="#workshop" className="hover:text-tertiary transition-colors">
              Casos de Éxito
            </a>
            <Link href="/login" className="text-tertiary hover:underline flex items-center gap-1 font-bold">
              <span>Acceso Técnico (Staff)</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-typography/50 text-[10px]">
          <p>&copy; {new Date().getFullYear()} Viking App Systems. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5 justify-center">
            <Wrench className="w-3 h-3 text-tertiary" />
            <span>Infraestructura Next.js 15 App Router & API REST</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
