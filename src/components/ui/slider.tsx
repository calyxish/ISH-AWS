"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  min: number;
  max: number;
  step?: number;
  value: number;
  onValueChange: (n: number) => void;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min, max, step = 1, value, onValueChange, ...props }, ref) => {
    const percent = ((value - min) / (max - min)) * 100;
    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full outline-none",
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5",
          "[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-[var(--accent)]",
          "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--surface)]",
          "[&::-webkit-slider-thumb]:shadow-none [&::-webkit-slider-thumb]:cursor-grab",
          "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:bg-[var(--accent)] [&::-moz-range-thumb]:border-2",
          "[&::-moz-range-thumb]:border-[var(--surface)]",
          className,
        )}
        style={{
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${percent}%, var(--border) ${percent}%, var(--border) 100%)`,
        }}
        {...props}
      />
    );
  },
);
Slider.displayName = "Slider";
