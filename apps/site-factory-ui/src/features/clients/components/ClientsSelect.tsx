"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { ClientItem } from "@sf/shared/clients";

type Props = {
  value: string;
  onChange: (v: string) => void;
  items: ClientItem[];
  disabled?: boolean;
  placeholder?: string;
};

export function ClientSelect({
  value,
  onChange,
  items,
  disabled,
  placeholder = "Sélectionner un client",
}: Props) {
  const [open, setOpen] = React.useState(false);

  const selected = items.find(c => c.name === value) ?? null;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between">
          <span className="truncate">{selected ? selected.name : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Rechercher un client…" />
          <CommandEmpty>Aucun client trouvé.</CommandEmpty>

          <CommandGroup>
            {items.map(c => (
              <CommandItem
                key={c.name}
                value={c.name}
                onSelect={() => {
                  onChange(c.name);
                  setOpen(false);
                }}
                className="flex items-center justify-between">
                <span className="truncate">{c.name}</span>

                <div className="flex items-center gap-2">
                  {typeof c.projectsCount === "number" ? (
                    <span className="text-xs text-muted-foreground">{c.projectsCount}</span>
                  ) : null}

                  <Check
                    className={cn("h-4 w-4", value === c.name ? "opacity-100" : "opacity-0")}
                  />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
