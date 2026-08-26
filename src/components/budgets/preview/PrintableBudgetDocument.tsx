import React from 'react';
import Image from 'next/image';
import { BudgetTableRow, DynamicContentBlock } from '@/types/budget';
import logoSvg from '@/components/assets/images/LOGO.svg';

interface PrintableBudgetDocumentProps {
  title: string;
  mode?: 'MAINTENANCE' | 'NEW_EQUIPMENT';
  clientName?: string;
  clientDni?: string | number;
  clientAddress?: string;
  clientPhoneNumber?: string;
  clientEmail?: string;
  deviceModel?: string;
  deviceSerialNumber?: string;
  blocks?: DynamicContentBlock[];
  items?: BudgetTableRow[];
  labors?: { description: string; amount: number }[];
  taxPercentage?: number;
  currency?: string;
  notes?: string;
  termsAndConditions?: string;
  staffName?: string;
}

export const PrintableBudgetDocument: React.FC<PrintableBudgetDocumentProps> = ({
  title,
  mode = 'MAINTENANCE',
  clientName = '',
  clientDni = '',
  clientAddress = '',
  clientPhoneNumber = '',
  clientEmail = '',
  deviceModel = '',
  deviceSerialNumber = '',
  blocks = [],
  items = [],
  labors = [],
  taxPercentage = 0,
  currency = '$',
  notes = '',
  termsAndConditions = '',
  staffName = '',
}) => {
  // Compute Totals
  let regularSubtotal = 0;
  let hiddenSubtotal = 0;
  let totalDiscounts = 0;

  (items || []).forEach((item) => {
    if (item.rowType === 'REGULAR_ITEM' || item.rowType === 'SPARE_PART_ITEM') {
      regularSubtotal += (item.quantity || 0) * (item.unitPrice || 0);
    } else if (item.rowType === 'HIDDEN_UNIT_PRICE_ITEM') {
      hiddenSubtotal += (item.quantity || 0) * (item.unitPrice || 0);
    } else if (item.rowType === 'BONIFICATION') {
      if (!item.isFree) {
        totalDiscounts += item.discountAmount || 0;
      }
    }
  });

  const laborTotal = (labors || []).reduce((acc, l) => acc + (l.amount || 0), 0);
  const itemsSubtotal = regularSubtotal + hiddenSubtotal;
  const taxableAmount = Math.max(0, itemsSubtotal + laborTotal - totalDiscounts);
  const taxAmount = (taxableAmount * (taxPercentage || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  const todayStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      id="viking-printable-budget-document"
      className="hidden print:block bg-white text-slate-900 font-sans p-6 space-y-4 max-w-4xl mx-auto border-none shadow-none text-xs"
    >
      {/* 1. Official Header: SVG Logo (+10% size) on Dark Container + EL VIKINGO STORE + Contact Info */}
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
        <div className="flex items-start gap-4">
          {/* Black Logo Container Box (+10% Enlarged) */}
          <div className="bg-black p-2 rounded-xl border border-slate-800 shadow-md flex items-center justify-center shrink-0 w-20 h-20">
            <Image
              src={logoSvg}
              alt="Logo El Vikingo Store"
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
              priority
            />
          </div>

          <div className="space-y-0.5">
            <h1 className="font-black text-lg tracking-tight uppercase text-slate-950">
              EL VIKINGO STORE
            </h1>
            <div className="text-[10px] font-mono text-slate-700 space-y-0.5">
              <p>FECHA: <span className="font-semibold">{todayStr}</span></p>
              <p>2604845489</p>
              <p>elvikingosr@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="text-right space-y-1">
          <span className="inline-block bg-slate-950 text-white font-extrabold text-[10px] uppercase px-3 py-1.5 rounded shadow-sm tracking-wider">
            {mode === 'MAINTENANCE' ? 'PRESUPUESTO' : 'PRESUPUESTO EQUIPO NUEVO'}
          </span>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block pt-1">
            Servicio Técnico Especializado
          </p>
        </div>
      </div>

      {/* Document Main Title */}
      <div className="py-1">
        <h2 className="text-sm font-bold uppercase text-slate-800 tracking-tight">{title}</h2>
      </div>

      {/* 2. Compact Customer & Hardware Data Bar (Space-saving Lego Block) */}
      <div className="bg-slate-50 border border-slate-300 rounded p-2.5 space-y-1 text-[11px] text-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-0.5">
          <div>
            <span className="font-bold text-slate-500 uppercase text-[9px] mr-1">TITULAR:</span>
            <span className="font-bold text-slate-900">{clientName || 'Cliente no registrado'}</span>
            {clientDni && <span className="text-slate-600 ml-1.5">(DNI: {clientDni})</span>}
          </div>
          {clientPhoneNumber && (
            <div>
              <span className="font-bold text-slate-500 uppercase text-[9px] mr-1">TEL:</span>
              <span className="font-mono font-medium">{clientPhoneNumber}</span>
            </div>
          )}
          {clientAddress && (
            <div>
              <span className="font-bold text-slate-500 uppercase text-[9px] mr-1">DIR:</span>
              <span>{clientAddress}</span>
            </div>
          )}
        </div>

        {(deviceModel || deviceSerialNumber) && (
          <div className="pt-1 border-t border-slate-200 flex flex-wrap items-center justify-between text-[10px]">
            <div>
              <span className="font-bold text-slate-500 uppercase text-[9px] mr-1">EQUIPO EN TALLER:</span>
              <span className="font-bold text-slate-900">{deviceModel || 'General'}</span>
            </div>
            {deviceSerialNumber && (
              <div>
                <span className="font-bold text-slate-500 uppercase text-[9px] mr-1">N° SERIE:</span>
                <span className="font-mono font-semibold text-slate-700">{deviceSerialNumber}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Diagnostic & Content Blocks (Compact Lego Blocks) */}
      {blocks && blocks.length > 0 && (
        <div className="space-y-2">
          {blocks.map((block) => (
            <div key={block.id} className="space-y-1">
              <h3 className="font-bold text-[11px] uppercase tracking-wide text-slate-800 border-b border-slate-200 pb-0.5">
                {block.title}
              </h3>

              {block.type === 'TEXT_PARAGRAPH' && (
                <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line">{block.content}</p>
              )}

              {block.type === 'BULLET_LIST' && block.items && (
                <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5 pl-1">
                  {block.items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}

              {block.type === 'WARNING_NOTE' && (
                <div className="p-2 bg-amber-50 border-l-2 border-amber-500 text-[10px] text-amber-900 font-medium">
                  {block.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. Table of Line Items & Spare Parts (High-contrast Print Optimized) */}
      <div className="space-y-1 pt-1">
        <table className="w-full border-collapse border border-slate-300 text-[11px]">
          <thead>
            <tr className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <th className="p-1.5 text-left border border-slate-900">DESCRIPCIÓN DE COMPONENTES / SERVICIOS</th>
              <th className="p-1.5 text-center border border-slate-900 w-16">CANT.</th>
              <th className="p-1.5 text-right border border-slate-900 w-28">PRECIO UNIT.</th>
              <th className="p-1.5 text-right border border-slate-900 w-28">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((item, idx) => {
              if (item.rowType === 'SUBTOTAL_GROUP') {
                return (
                  <tr key={item.id || idx} className="bg-slate-100 font-bold border-t-2 border-b-2 border-slate-400">
                    <td colSpan={3} className="p-1.5 text-right uppercase text-[10px] text-slate-700">
                      {item.description}:
                    </td>
                    <td className="p-1.5 text-right font-mono text-slate-900">
                      {currency} {(item.lineTotal || 0).toFixed(2)}
                    </td>
                  </tr>
                );
              }

              if (item.rowType === 'BONIFICATION') {
                return (
                  <tr key={item.id || idx} className="bg-emerald-50 text-emerald-900 border-b border-slate-200">
                    <td colSpan={3} className="p-1.5 font-semibold">
                      🎁 {item.description}
                      {item.isFree && (
                        <span className="ml-2 text-[9px] bg-emerald-100 px-1 py-0.5 rounded text-emerald-800 border border-emerald-300">
                          BONIFICADO
                        </span>
                      )}
                    </td>
                    <td className="p-1.5 text-right font-mono font-bold text-emerald-700">
                      {item.isFree ? 'BONIFICADO' : `-${currency} ${(item.discountAmount || 0).toFixed(2)}`}
                    </td>
                  </tr>
                );
              }

              if (item.rowType === 'HIDDEN_UNIT_PRICE_ITEM') {
                return (
                  <tr key={item.id || idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-1.5 font-medium text-slate-800">{item.description}</td>
                    <td className="p-1.5 text-center font-mono text-slate-600">{item.quantity}</td>
                    <td className="p-1.5 text-right font-mono text-slate-600"></td>
                    <td className="p-1.5 text-right font-mono font-semibold text-slate-900"></td>
                  </tr>
                );
              }

              const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);

              return (
                <tr key={item.id || idx} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-1.5 font-medium text-slate-800">{item.description}</td>
                  <td className="p-1.5 text-center font-mono text-slate-600">{item.quantity}</td>
                  <td className="p-1.5 text-right font-mono text-slate-600">
                    {currency} {(item.unitPrice || 0).toFixed(2)}
                  </td>
                  <td className="p-1.5 text-right font-mono font-semibold text-slate-900">
                    {currency} {lineTotal.toFixed(2)}
                  </td>
                </tr>
              );
            })}

            {/* Labor fees */}
            {(labors || []).map((labor, idx) => (
              <tr key={`labor_${idx}`} className="border-b border-slate-200 bg-slate-50/50">
                <td colSpan={3} className="p-1.5 font-medium text-slate-800">
                  🔧 <span className="font-semibold">{labor.description}</span>
                </td>
                <td className="p-1.5 text-right font-mono font-semibold text-slate-900">
                  {currency} {(labor.amount || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Summary Totals Box (Aligned Right) */}
      <div className="flex justify-end pt-1">
        <div className="w-64 bg-slate-50 border border-slate-300 rounded p-2.5 space-y-1 text-[11px]">
          <div className="flex justify-between text-slate-600">
            <span>Componentes & Repuestos:</span>
            <span className="font-mono">{currency} {itemsSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Mano de Obra / Armado:</span>
            <span className="font-mono">{currency} {laborTotal.toFixed(2)}</span>
          </div>
          {totalDiscounts > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium border-t border-slate-200 pt-1">
              <span>Descuentos Aplicados:</span>
              <span className="font-mono">-{currency} {totalDiscounts.toFixed(2)}</span>
            </div>
          )}
          {taxPercentage > 0 && (
            <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1">
              <span>Impuestos ({taxPercentage}%):</span>
              <span className="font-mono">{currency} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t-2 border-slate-900 pt-1 mt-1">
            <span>TOTAL GENERAL:</span>
            <span className="font-mono text-slate-950">{currency} {grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 6. Notes, Validez & Footer Sign-off (Space-saving Lego Footer) */}
      <div className="pt-2 border-t border-slate-300 space-y-2 text-[10px] text-slate-600">
        {notes && (
          <div>
            <h4 className="font-bold text-slate-800 uppercase text-[9px]">Aclaraciones y Observaciones:</h4>
            <p className="whitespace-pre-line leading-tight">{notes}</p>
          </div>
        )}

        {termsAndConditions && (
          <div>
            <h4 className="font-bold text-slate-800 uppercase text-[9px]">Garantía y Condiciones:</h4>
            <p className="whitespace-pre-line leading-tight">{termsAndConditions}</p>
          </div>
        )}

        <div className="pt-3 flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-slate-200">
          <p>Presupuesto generado por {staffName}</p>
          <p className="font-bold text-slate-800 tracking-wider">¡GRACIAS POR SU CONFIANZA!</p>
        </div>
      </div>
    </div>
  );
};
