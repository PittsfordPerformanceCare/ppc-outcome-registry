import * as React from "react";
import { format, parse, isValid, getYear, getMonth, getDaysInMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DOBPickerProps {
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function DOBPicker({
  value,
  onChange,
  placeholder = "Select date of birth",
  className,
  minYear = 1900,
  maxYear = new Date().getFullYear(),
}: DOBPickerProps) {
  const [open, setOpen] = React.useState(false);
  
  // Parse the current value
  const currentDate = value ? parse(value, "yyyy-MM-dd", new Date()) : null;
  const isValidDate = currentDate && isValid(currentDate);
  
  const [selectedYear, setSelectedYear] = React.useState<number | null>(
    isValidDate ? getYear(currentDate) : null
  );
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(
    isValidDate ? getMonth(currentDate) : null
  );
  const [selectedDay, setSelectedDay] = React.useState<number | null>(
    isValidDate ? currentDate.getDate() : null
  );

  // Generate year options (newest first for easier selection)
  const years = React.useMemo(() => {
    const yearArray: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      yearArray.push(y);
    }
    return yearArray;
  }, [minYear, maxYear]);

  // Generate day options based on selected year and month
  const days = React.useMemo(() => {
    if (selectedYear === null || selectedMonth === null) return [];
    const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [selectedYear, selectedMonth]);

  // Update the value when all three are selected
  React.useEffect(() => {
    if (selectedYear !== null && selectedMonth !== null && selectedDay !== null) {
      // Validate day is still valid for this month
      const daysInMonth = getDaysInMonth(new Date(selectedYear, selectedMonth));
      const validDay = Math.min(selectedDay, daysInMonth);
      
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(validDay).padStart(2, "0")}`;
      onChange(dateStr);
    }
  }, [selectedYear, selectedMonth, selectedDay, onChange]);

  // Sync state when value prop changes externally
  React.useEffect(() => {
    if (value) {
      const parsed = parse(value, "yyyy-MM-dd", new Date());
      if (isValid(parsed)) {
        setSelectedYear(getYear(parsed));
        setSelectedMonth(getMonth(parsed));
        setSelectedDay(parsed.getDate());
      }
    }
  }, [value]);

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    setSelectedYear(year);
    // Adjust day if needed when month/year changes
    if (selectedMonth !== null && selectedDay !== null) {
      const daysInMonth = getDaysInMonth(new Date(year, selectedMonth));
      if (selectedDay > daysInMonth) {
        setSelectedDay(daysInMonth);
      }
    }
  };

  const handleMonthChange = (monthStr: string) => {
    const month = parseInt(monthStr, 10);
    setSelectedMonth(month);
    // Adjust day if needed
    if (selectedYear !== null && selectedDay !== null) {
      const daysInMonth = getDaysInMonth(new Date(selectedYear, month));
      if (selectedDay > daysInMonth) {
        setSelectedDay(daysInMonth);
      }
    }
  };

  const handleDayChange = (dayStr: string) => {
    setSelectedDay(parseInt(dayStr, 10));
  };

  const displayValue = isValidDate
    ? format(currentDate, "MMMM d, yyyy")
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 bg-popover" align="start">
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">Select your date of birth</p>
          
          <div className="grid grid-cols-3 gap-2">
            {/* Month Selector */}
            <Select
              value={selectedMonth !== null ? String(selectedMonth) : undefined}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] bg-popover">
                {MONTHS.map((month, index) => (
                  <SelectItem key={month} value={String(index)}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Day Selector */}
            <Select
              value={selectedDay !== null ? String(selectedDay) : undefined}
              onValueChange={handleDayChange}
              disabled={selectedMonth === null || selectedYear === null}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] bg-popover">
                {days.map((day) => (
                  <SelectItem key={day} value={String(day)}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Selector */}
            <Select
              value={selectedYear !== null ? String(selectedYear) : undefined}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] bg-popover">
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {displayValue && (
            <p className="text-sm text-muted-foreground text-center pt-2 border-t">
              Selected: <span className="font-medium text-foreground">{displayValue}</span>
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
