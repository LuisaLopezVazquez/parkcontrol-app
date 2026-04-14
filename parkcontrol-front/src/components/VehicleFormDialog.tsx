import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Vehicle } from "@/services/mockData";
import * as api from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const vehicleFormSchema = z.object({
  id: z.string().optional(),
  plate: z.string().min(1, "La placa es obligatoria"),
  brand: z.string().min(1, "Marca obligatoria"),
  model: z.string().min(1, "Modelo obligatorio"),
  color: z.string().min(1, "Color obligatorio"),
  ownerName: z.string().min(1, "Nombre del propietario obligatorio"),
  unit: z.string().min(1, "Unidad obligatoria"),
  registeredAt: z.string().min(1, "Fecha de registro obligatoria"),
  spotNumber: z.string().optional(),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

function emptyDefaults(): VehicleFormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    plate: "",
    brand: "",
    model: "",
    color: "",
    ownerName: "",
    unit: "",
    registeredAt: today,
    spotNumber: "",
  };
}

function fromVehicle(v: Vehicle): VehicleFormValues {
  return {
    id: v.id,
    plate: v.plate,
    brand: v.brand,
    model: v.model,
    color: v.color,
    ownerName: v.ownerName,
    unit: v.unit,
    registeredAt: v.registeredAt,
    spotNumber: v.spotNumber ?? "",
  };
}

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  vehicle: Vehicle | null;
  onSaved: () => void;
}

export function VehicleFormDialog({ open, onOpenChange, mode, vehicle, onSaved }: VehicleFormDialogProps) {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: emptyDefaults(),
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && vehicle) {
      form.reset(fromVehicle(vehicle));
    } else {
      form.reset(emptyDefaults());
    }
  }, [open, mode, vehicle, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const spotNumber = values.spotNumber?.trim() ? values.spotNumber.trim() : undefined;
      if (mode === "create") {
        await api.createVehicle({
          plate: values.plate.trim(),
          brand: values.brand.trim(),
          model: values.model.trim(),
          color: values.color.trim(),
          ownerName: values.ownerName.trim(),
          unit: values.unit.trim(),
          registeredAt: values.registeredAt,
          spotNumber,
        });
        toast.success("Vehículo registrado");
      } else if (vehicle) {
        await api.updateVehicle(vehicle.id, {
          plate: values.plate.trim(),
          brand: values.brand.trim(),
          model: values.model.trim(),
          color: values.color.trim(),
          ownerName: values.ownerName.trim(),
          unit: values.unit.trim(),
          registeredAt: values.registeredAt,
          spotNumber,
        });
        toast.success("Vehículo actualizado");
      }
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-heading)]">
            {mode === "create" ? "Registrar vehículo" : "Editar vehículo"}
          </DialogTitle>
          <DialogDescription>
            Los datos se guardan en <code className="rounded bg-muted px-1 text-xs">server/db.json</code>.
            El identificador se asigna automáticamente al crear.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4 py-2">
          {mode === "edit" && vehicle && (
            <div className="grid gap-2">
              <Label htmlFor="veh-id">ID</Label>
              <Input id="veh-id" value={vehicle.id} disabled className="bg-muted" />
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="veh-plate">Placa</Label>
              <Input id="veh-plate" {...form.register("plate")} placeholder="ABC-1234" />
              {form.formState.errors.plate && (
                <p className="text-xs text-destructive">{form.formState.errors.plate.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="veh-spot">Cajón (opcional)</Label>
              <Input id="veh-spot" {...form.register("spotNumber")} placeholder="A-01" />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="veh-brand">Marca</Label>
              <Input id="veh-brand" {...form.register("brand")} />
              {form.formState.errors.brand && (
                <p className="text-xs text-destructive">{form.formState.errors.brand.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="veh-model">Modelo</Label>
              <Input id="veh-model" {...form.register("model")} />
              {form.formState.errors.model && (
                <p className="text-xs text-destructive">{form.formState.errors.model.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="veh-color">Color</Label>
              <Input id="veh-color" {...form.register("color")} />
              {form.formState.errors.color && (
                <p className="text-xs text-destructive">{form.formState.errors.color.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="veh-registered">Fecha de registro</Label>
              <Input id="veh-registered" type="date" {...form.register("registeredAt")} />
              {form.formState.errors.registeredAt && (
                <p className="text-xs text-destructive">{form.formState.errors.registeredAt.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="veh-owner">Propietario</Label>
            <Input id="veh-owner" {...form.register("ownerName")} />
            {form.formState.errors.ownerName && (
              <p className="text-xs text-destructive">{form.formState.errors.ownerName.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="veh-unit">Unidad (departamento)</Label>
            <Input id="veh-unit" {...form.register("unit")} placeholder="101-A" />
            {form.formState.errors.unit && (
              <p className="text-xs text-destructive">{form.formState.errors.unit.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando…" : mode === "create" ? "Registrar" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
