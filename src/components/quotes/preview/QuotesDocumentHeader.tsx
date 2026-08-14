'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Cpu, Wrench, Calendar, User, Laptop, Phone, MapPin, IdCard } from 'lucide-react';
import { BudgetMode } from '@/types/budget';
import logoImg from '@/components/images/LOGO.png';

interface QuotesDocumentHeaderProps {
  title: string;
  mode: BudgetMode;
  clientName: string;
  clientDni?: number | string;
  clientAddress?: string;
  clientPhoneNumber?: string;
  clientEmail?: string;
  deviceModel: string;
  deviceSerialNumber?: string;
  currency?: string;
}

export const QuotesDocumentHeader: React.FC<QuotesDocumentHeaderProps> = ({
  title,
  mode,
  clientName,
  clientDni,
  clientAddress,
  clientPhoneNumber,
  deviceModel,
  deviceSerialNumber,
}) => {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="border-b pb-6 space-y-4">
      {/* Brand & Document Type Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-tertiary/15 border border-tertiary/30 flex items-center justify-center overflow-hidden shadow-md shrink-0">
            <Image
              src={logoImg}
              alt="Logo Oficial Viking App"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
              priority
            />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-foreground tracking-tight uppercase">EL VIKINGO STORE</h3>
            <p className="text-[11px] text-muted-foreground font-mono">
              Tel: 2604845489 | elvikingosr@gmail.com
            </p>
          </div>
        </div>

        <div className="text-right">
          <Badge
            variant="outline"
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide gap-1.5 shadow-sm ${
              mode === 'MAINTENANCE'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {mode === 'MAINTENANCE' ? (
              <>
                <Wrench className="w-3.5 h-3.5" /> Presupuesto de Mantenimiento
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" /> Presupuesto de Equipo Nuevo
              </>
            )}
          </Badge>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-end gap-1 font-mono">
            <Calendar className="w-3 h-3" />
            {currentDate}
          </p>
        </div>
      </div>

      {/* Document Title */}
      <div className="pt-2">
        <h1 className="text-xl font-extrabold text-foreground tracking-tight">
          {title || 'Presupuesto Técnico Estimativo'}
        </h1>
      </div>

      {/* Client PII & Hardware Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 bg-muted/30 rounded-lg border border-border/40 text-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
            <User className="w-3.5 h-3.5 text-primary" />
            Datos del Cliente / Titular
          </div>
          <p className="font-bold text-foreground text-sm">{clientName || 'Cliente No Especificado'}</p>
            <div className="flex items-center gap-1">
              <IdCard className="w-3 h-3 text-muted-foreground" />
              <span>DNI / CUIT: <strong className="text-foreground">{clientDni || 'No registrado'}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span>Dirección: <strong className="text-foreground">{clientAddress || 'No registrada'}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-muted-foreground" />
              <span>Teléfono: <strong className="text-foreground">{clientPhoneNumber || 'No registrado'}</strong></span>
            </div>
        </div>

        <div className="space-y-1.5 border-t md:border-t-0 md:border-l md:pl-4 pt-2 md:pt-0">
          <div className="flex items-center gap-1.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
            <Laptop className="w-3.5 h-3.5 text-primary" />
            Datos del Equipo / Hardware
          </div>
          <p className="font-bold text-foreground text-sm">{deviceModel || 'N/A'}</p>
          {deviceSerialNumber && (
            <p className="text-muted-foreground text-[11px]">
              N° de Serie / IMEI: <strong className="text-foreground font-mono">{deviceSerialNumber}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
