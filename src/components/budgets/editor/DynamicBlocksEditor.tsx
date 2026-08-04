'use client';

import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  AlignLeft, 
  List, 
  AlertTriangle, 
  GripVertical 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BudgetFormSchemaType } from '@/lib/validations/budget';
import { ContentBlockType, WarningSeverity } from '@/types/budget';

export const DynamicBlocksEditor: React.FC = () => {
  const { register, control, watch, setValue } = useFormContext<BudgetFormSchemaType>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'blocks',
  });

  const addBlock = (type: ContentBlockType) => {
    const newId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    if (type === 'TEXT_PARAGRAPH') {
      append({
        id: newId,
        type: 'TEXT_PARAGRAPH',
        title: 'Resumen de Diagnóstico Técnico',
        content: '',
      });
    } else if (type === 'BULLET_LIST') {
      append({
        id: newId,
        type: 'BULLET_LIST',
        title: 'Puntos Clave y Hallazgos',
        items: [''],
      });
    } else if (type === 'WARNING_NOTE') {
      append({
        id: newId,
        type: 'WARNING_NOTE',
        title: 'Nota / Aclaración Importante',
        content: '',
        severity: 'warning',
      });
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlignLeft className="w-5 h-5 text-primary" />
            Bloques de Contenido Dinámico
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Agrega párrafos de diagnóstico, listas de puntos o notas de advertencia. Reordena según sea necesario.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock('TEXT_PARAGRAPH')}
            className="text-xs"
          >
            <AlignLeft className="w-3.5 h-3.5 mr-1" />
            + Párrafo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock('BULLET_LIST')}
            className="text-xs"
          >
            <List className="w-3.5 h-3.5 mr-1" />
            + Lista de Puntos
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock('WARNING_NOTE')}
            className="text-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            + Advertencia
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {fields.length === 0 ? (
          <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
            No se han agregado bloques de texto. Haz clic arriba para agregar párrafos o listas de diagnóstico.
          </div>
        ) : (
          fields.map((field, index) => {
            const blockType = watch(`blocks.${index}.type`);

            return (
              <div
                key={field.id}
                className="group relative border rounded-lg p-4 bg-card/50 hover:bg-card transition-colors space-y-3"
              >
                {/* Block Header Toolbar */}
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded bg-muted">
                      {blockType === 'TEXT_PARAGRAPH'
                        ? 'PÁRRAFO'
                        : blockType === 'BULLET_LIST'
                        ? 'LISTA DE PUNTOS'
                        : 'NOTA ADVERTENCIA'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                      className="h-7 w-7"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                      className="h-7 w-7"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-7 w-7 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Block Title Field */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Título de la Sección / Bloque</Label>
                  <Input
                    {...register(`blocks.${index}.title`)}
                    placeholder="Ej. Diagnóstico de Estado y Evaluación..."
                    className="mt-1 text-sm h-8"
                  />
                </div>

                {/* TEXT_PARAGRAPH Fields */}
                {blockType === 'TEXT_PARAGRAPH' && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Contenido del Párrafo</Label>
                    <textarea
                      {...register(`blocks.${index}.content`)}
                      rows={3}
                      placeholder="Escribe la observación detallada del diagnóstico o las notas técnicas de reparación..."
                      className="w-full mt-1 p-2 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                )}

                {/* WARNING_NOTE Fields */}
                {blockType === 'WARNING_NOTE' && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Nivel de Severidad</Label>
                      <Select
                        defaultValue={watch(`blocks.${index}.severity`) || 'warning'}
                        onValueChange={(val: WarningSeverity) =>
                          setValue(`blocks.${index}.severity`, val)
                        }
                      >
                        <SelectTrigger className="mt-1 h-8 text-xs">
                          <SelectValue placeholder="Seleccionar severidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Información General</SelectItem>
                          <SelectItem value="warning">Advertencia / Atención</SelectItem>
                          <SelectItem value="important">Importante / Crítico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Contenido de la Advertencia</Label>
                      <textarea
                        {...register(`blocks.${index}.content`)}
                        rows={2}
                        placeholder="Aviso referente a respaldo de datos del cliente, límites de garantía o limitaciones de hardware..."
                        className="w-full mt-1 p-2 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                )}

                {/* BULLET_LIST Fields */}
                {blockType === 'BULLET_LIST' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Ítems de la Lista</Label>
                    <BulletListEditor blockIndex={index} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

interface BulletListEditorProps {
  blockIndex: number;
}

const BulletListEditor: React.FC<BulletListEditorProps> = ({ blockIndex }) => {
  const { register, control } = useFormContext<BudgetFormSchemaType>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `blocks.${blockIndex}.items` as never,
  });

  return (
    <div className="space-y-2">
      {fields.map((item, itemIdx) => (
        <div key={item.id} className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">•</span>
          <Input
            {...register(`blocks.${blockIndex}.items.${itemIdx}` as never)}
            placeholder={`Ítem #${itemIdx + 1}`}
            className="h-8 text-xs flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(itemIdx)}
            disabled={fields.length === 1}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => append('' as never)}
        className="text-xs text-primary h-7 mt-1"
      >
        <Plus className="w-3 h-3 mr-1" />
        Agregar Ítem a la Lista
      </Button>
    </div>
  );
};
