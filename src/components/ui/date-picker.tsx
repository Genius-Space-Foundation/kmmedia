"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showTime?: boolean;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  label?: string;
  error?: string;
  id?: string;
}

/**
 * DatePicker component provides an accessible date selection interface
 * 
 * @param {Date} [value] - Selected date value
 * @param {Function} [onChange] - Callback when date changes
 * @param {boolean} [disabled=false] - Whether the picker is disabled
 * @param {string} [placeholder="Pick a date"] - Placeholder text
 * @param {string} [className] - Additional CSS classes
 * @param {boolean} [showTime=false] - Whether to show time selection
 * @param {Date} [minDate] - Minimum allowed date
 * @param {Date} [maxDate] - Maximum allowed date
 * @param {boolean} [required=false] - Whether the field is required
 * @param {string} [label] - Field label
 * @param {string} [error] - Error message
 * @param {string} [id] - HTML ID attribute
 * @returns {JSX.Element} DatePicker component
 */
const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      disabled = false,
      placeholder = "Pick a date",
      className,
      showTime = false,
      minDate,
      maxDate,
      required = false,
      label,
      error,
      id,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (date: Date | undefined) => {
      onChange?.(date);
      setOpen(false);
    };

    return (
      <div ref={ref} className={className}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                error && "border-red-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? (
                format(value, showTime ? "PPP p" : "PPP")
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50 bg-white border rounded-md shadow-lg">
            <Calendar
              mode="single"
              selected={value}
              defaultMonth={value || new Date()}
              onSelect={handleSelect}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                if (date < new Date()) return true; // Prevent past dates by default
                return false;
              }}
              initialFocus
              fromDate={minDate || new Date()}
              toDate={maxDate}
              captionLayout="dropdown"
              fromYear={minDate?.getFullYear() || new Date().getFullYear()}
              toYear={maxDate?.getFullYear() || new Date().getFullYear() + 10}
            />
          </PopoverContent>
        </Popover>
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export { DatePicker };