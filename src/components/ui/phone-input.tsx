import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Phone } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CountryCode {
  code: string;
  dial: string;
  name: string;
  format: string;
  maxLength: number;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "US", dial: "+1", name: "United States", format: "(###) ###-####", maxLength: 10 },
  { code: "CA", dial: "+1", name: "Canada", format: "(###) ###-####", maxLength: 10 },
  { code: "GB", dial: "+44", name: "United Kingdom", format: "#### ######", maxLength: 10 },
  { code: "AU", dial: "+61", name: "Australia", format: "#### ### ###", maxLength: 9 },
  { code: "DE", dial: "+49", name: "Germany", format: "### ########", maxLength: 11 },
  { code: "FR", dial: "+33", name: "France", format: "# ## ## ## ##", maxLength: 9 },
  { code: "MX", dial: "+52", name: "Mexico", format: "## #### ####", maxLength: 10 },
  { code: "IN", dial: "+91", name: "India", format: "##### #####", maxLength: 10 },
];

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  showCountryCode?: boolean;
  defaultCountry?: string;
}

// Extract only digits from a string
const extractDigits = (value: string): string => {
  return value.replace(/\D/g, "");
};

// Extract digits from a stored value that may include country code prefix
const extractDigitsFromStoredValue = (value: string, countryDial: string): string => {
  // Remove the country dial code prefix if present (e.g., "+1 " from "+1 (585) 203-1050")
  let cleaned = value;
  
  // Check if value starts with the country dial code
  if (cleaned.startsWith(countryDial)) {
    cleaned = cleaned.slice(countryDial.length).trim();
  }
  
  // Extract just the digits from what remains
  const digits = extractDigits(cleaned);
  
  // If we have 11 digits starting with 1, it's likely a US number with country code baked in
  if (digits.length === 11 && digits.startsWith("1") && countryDial === "+1") {
    return digits.slice(1);
  }
  
  return digits;
};

// Format phone number based on country format pattern
const formatPhoneNumber = (digits: string, format: string, maxLength: number): string => {
  const trimmedDigits = digits.slice(0, maxLength);
  let result = "";
  let digitIndex = 0;

  for (let i = 0; i < format.length && digitIndex < trimmedDigits.length; i++) {
    if (format[i] === "#") {
      result += trimmedDigits[digitIndex];
      digitIndex++;
    } else {
      result += format[i];
    }
  }

  return result;
};

// Clean pasted phone numbers - remove common artifacts
const cleanPastedPhone = (value: string): string => {
  // Remove common prefixes and artifacts from pasted numbers
  let cleaned = value
    .replace(/^\s*tel:\s*/i, "") // Remove tel: prefix
    .replace(/^\s*\+?1?\s*[-.]?\s*/, "") // Remove +1 or 1 prefix with optional separator
    .replace(/\s*ext\.?\s*\d*$/i, "") // Remove extension
    .trim();

  // Extract just the digits
  const digits = extractDigits(cleaned);
  
  // If starts with 1 and is 11 digits (US format with country code), remove the 1
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  
  return digits;
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value = "", onChange, onBlur, showCountryCode = true, defaultCountry = "US", ...props }, ref) => {
    const [selectedCountry, setSelectedCountry] = React.useState<CountryCode>(
      COUNTRY_CODES.find(c => c.code === defaultCountry) || COUNTRY_CODES[0]
    );
    const [localValue, setLocalValue] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    const cursorPositionRef = React.useRef<number | null>(null);

    // Sync external value to local state
    React.useEffect(() => {
      if (value) {
        // Use the smarter extraction that handles country code prefixes
        const digits = extractDigitsFromStoredValue(value, selectedCountry.dial);
        const formatted = formatPhoneNumber(digits, selectedCountry.format, selectedCountry.maxLength);
        setLocalValue(formatted);
      } else {
        setLocalValue("");
      }
    }, [value, selectedCountry]);

    // Restore cursor position after formatting
    React.useEffect(() => {
      if (cursorPositionRef.current !== null && inputRef.current) {
        inputRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
        cursorPositionRef.current = null;
      }
    }, [localValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const cursorPos = e.target.selectionStart || 0;
      const previousLength = localValue.length;
      
      // Extract digits and format
      const digits = extractDigits(inputValue);
      const formatted = formatPhoneNumber(digits, selectedCountry.format, selectedCountry.maxLength);
      
      // Calculate new cursor position
      const lengthDiff = formatted.length - previousLength;
      const newCursorPos = Math.max(0, cursorPos + lengthDiff);
      cursorPositionRef.current = newCursorPos;
      
      setLocalValue(formatted);
      
      // Pass the full value with country code to parent
      const fullValue = showCountryCode && digits.length > 0 
        ? `${selectedCountry.dial} ${formatted}`
        : formatted;
      onChange?.(fullValue);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");
      const cleanedDigits = cleanPastedPhone(pastedText);
      const formatted = formatPhoneNumber(cleanedDigits, selectedCountry.format, selectedCountry.maxLength);
      
      setLocalValue(formatted);
      
      const fullValue = showCountryCode && cleanedDigits.length > 0 
        ? `${selectedCountry.dial} ${formatted}`
        : formatted;
      onChange?.(fullValue);
    };

    const handleCountryChange = (countryCode: string) => {
      const country = COUNTRY_CODES.find(c => c.code === countryCode);
      if (country) {
        setSelectedCountry(country);
        
        // Re-format existing number with new format
        const digits = extractDigits(localValue);
        const formatted = formatPhoneNumber(digits, country.format, country.maxLength);
        setLocalValue(formatted);
        
        const fullValue = showCountryCode && digits.length > 0 
          ? `${country.dial} ${formatted}`
          : formatted;
        onChange?.(fullValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter
      if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "Tab" ||
        e.key === "Escape" ||
        e.key === "Enter" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Home" ||
        e.key === "End"
      ) {
        return;
      }

      // Allow Ctrl/Cmd+A, Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+X
      if (e.metaKey || e.ctrlKey) {
        return;
      }

      // Block non-numeric input
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    };

    return (
      <div className="flex gap-2">
        {showCountryCode && (
          <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
            <SelectTrigger 
              className={cn(
                "w-[100px] shrink-0",
                "bg-background border-input"
              )}
            >
              <SelectValue>
                <span className="flex items-center gap-1.5 text-sm">
                  <span className="font-medium">{selectedCountry.dial}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_CODES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{country.dial}</span>
                    <span className="text-muted-foreground text-xs">{country.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={(node) => {
              // Handle both refs
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={localValue}
            onChange={handleInputChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onBlur={onBlur}
            placeholder={selectedCountry.format.replace(/#/g, "0")}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 focus:shadow-md",
              className
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput, type PhoneInputProps };
