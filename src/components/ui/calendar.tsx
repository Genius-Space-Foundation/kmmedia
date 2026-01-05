"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * Calendar component provides a customizable date selection interface
 * 
 * @param {string} className - Additional CSS classes
 * @param {object} classNames - Custom class names for different elements
 * @param {boolean} [showOutsideDays=true] - Whether to show days outside the current month
 * @param {object} props - Additional props passed to DayPicker
 * @returns {JSX.Element} Calendar component
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-gray-900",
        nav: "space-x-1 flex items-center justify-between w-full px-4 relative",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 shadow-none"
        ),
        nav_button_previous: "absolute left-4 top-3.5",
        nav_button_next: "absolute right-4 top-3.5",
        table: "w-full border-collapse",
        head_row: "flex border-b border-gray-200 py-2",
        head_cell:
          "text-gray-700 rounded-md w-9 font-medium text-[0.8rem] flex-1 flex items-center justify-center",
        row: "flex w-full mt-1",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:z-10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
        day_today: "bg-gray-100 text-gray-900 font-semibold",
        day_outside:
          "day-outside text-gray-400 opacity-50 aria-selected:bg-gray-100/50 aria-selected:text-gray-400 aria-selected:opacity-30",
        day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-gray-100 aria-selected:text-gray-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeft className="h-4 w-4" aria-label="Previous month" />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRight className="h-4 w-4" aria-label="Next month" />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
