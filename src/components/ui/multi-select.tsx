import * as React from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options = [],
  selected = [],
  onChange,
  placeholder = "Auswählen...",
  className
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Frühe Rückgabe wenn onChange nicht definiert ist
  if (!onChange || !Array.isArray(options) || !Array.isArray(selected)) {
    return null;
  }

  const handleSelect = (optionValue: string) => {
    const newSelected = selected.includes(optionValue)
      ? selected.filter(value => value !== optionValue)
      : [...selected, optionValue];
    onChange(newSelected);
  };

  const handleRemove = (optionValue: string) => {
    onChange(selected.filter(value => value !== optionValue));
  };

  const selectedOptions = options.filter(option => selected.includes(option.value));

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-9"
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedOptions.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="text-xs"
                  >
                    {option.label}
                    <button
                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(option.value);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-64 overflow-auto">
            <div className="p-2">
              {options.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Keine Optionen verfügbar
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      "cursor-pointer"
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}