import React from 'react';
import { designColors, standardColors, ColorDefinition, getColorByName } from '@/lib/colors';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ value, onValueChange, className }: ColorPickerProps) {
  const selectedColor = value ? getColorByName(value) : null;

  const handleColorSelect = (color: ColorDefinition) => {
    onValueChange(color.name);
  };

  const ColorSwatch = ({ color, isSelected }: { color: ColorDefinition; isSelected: boolean }) => (
    <button
      type="button"
      onClick={() => handleColorSelect(color)}
      className={cn(
        "relative w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isSelected 
          ? "border-foreground shadow-lg scale-105" 
          : "border-border hover:border-foreground/50"
      )}
      style={{ backgroundColor: color.hex }}
      title={color.name}
    >
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
        </div>
      )}
    </button>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Design Colors */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Designfarben</h4>
        <div className="grid grid-cols-6 gap-2">
          {designColors.map((color) => (
            <ColorSwatch
              key={color.name}
              color={color}
              isSelected={selectedColor?.name === color.name}
            />
          ))}
        </div>
      </div>

      {/* Standard Colors */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Standardfarben</h4>
        <div className="grid grid-cols-8 gap-2">
          {standardColors.map((color) => (
            <ColorSwatch
              key={color.name}
              color={color}
              isSelected={selectedColor?.name === color.name}
            />
          ))}
        </div>
      </div>

      {/* Selected Color Display */}
      {selectedColor && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
          <div 
            className="w-4 h-4 rounded border border-border"
            style={{ backgroundColor: selectedColor.hex }}
          />
          <span className="text-sm font-medium">{selectedColor.name}</span>
          <span className="text-xs text-muted-foreground ml-auto">{selectedColor.hex}</span>
        </div>
      )}
    </div>
  );
}