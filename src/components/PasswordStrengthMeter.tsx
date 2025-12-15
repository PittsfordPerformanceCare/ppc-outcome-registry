import { usePasswordValidation, usePasswordMatch } from '@/hooks/usePasswordValidation';
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  confirmPassword?: string;
  showCriteria?: boolean;
  className?: string;
}

/**
 * Password strength meter component with visual feedback
 * 
 * Shows:
 * - Strength bar with color coding
 * - Criteria checklist
 * - Human-readable guidance
 * - Confirm password match status
 */
export function PasswordStrengthMeter({
  password,
  confirmPassword,
  showCriteria = true,
  className,
}: PasswordStrengthMeterProps) {
  const validation = usePasswordValidation(password);
  const matchValidation = usePasswordMatch(password, confirmPassword || '');
  
  const getStrengthColor = () => {
    switch (validation.strength) {
      case 'weak':
        return 'bg-destructive';
      case 'fair':
        return 'bg-orange-500';
      case 'good':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      case 'excellent':
        return 'bg-emerald-500';
      default:
        return 'bg-muted';
    }
  };
  
  const getStrengthIcon = () => {
    switch (validation.strength) {
      case 'weak':
        return <ShieldX className="h-4 w-4 text-destructive" />;
      case 'fair':
        return <ShieldAlert className="h-4 w-4 text-orange-500" />;
      case 'good':
      case 'strong':
      case 'excellent':
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };
  
  const CriteriaItem = ({ 
    met, 
    label,
    required = true 
  }: { 
    met: boolean; 
    label: string;
    required?: boolean;
  }) => (
    <li className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className={cn(
          "h-4 w-4 flex-shrink-0",
          required ? "text-muted-foreground/50" : "text-muted-foreground/30"
        )} />
      )}
      <span className={cn(
        met ? "text-foreground" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </li>
  );
  
  if (!password) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="p-4 bg-muted/50 rounded-lg border text-sm">
          <div className="font-semibold mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Password Requirements
          </div>
          <p className="text-muted-foreground text-xs mb-3">
            Use a 12+ character passphrase for best security. Avoid common words and patterns.
          </p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-muted-foreground/30 flex-shrink-0" />
              At least 12 characters
            </li>
            <li className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-muted-foreground/30 flex-shrink-0" />
              3 of 4: lowercase, uppercase, numbers, symbols
            </li>
            <li className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-muted-foreground/30 flex-shrink-0" />
              Not a commonly used password
            </li>
          </ul>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getStrengthIcon()}
            <span className="font-medium capitalize">{validation.strength}</span>
          </div>
          <span className="text-muted-foreground text-xs">
            {validation.strengthScore}/100
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-300", getStrengthColor())}
            style={{ width: `${validation.strengthScore}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {validation.guidance}
        </p>
      </div>
      
      {/* Criteria Checklist */}
      {showCriteria && (
        <div className="p-4 bg-muted/50 rounded-lg border text-sm space-y-2">
          <div className="font-semibold mb-2">Requirements:</div>
          <ul className="space-y-1.5">
            <CriteriaItem 
              met={validation.criteria.minLength} 
              label="At least 12 characters" 
            />
            <CriteriaItem 
              met={validation.criteria.notInDenylist} 
              label="Not a commonly used password" 
            />
            <li className="pt-1">
              <div className={cn(
                "text-xs mb-1.5",
                validation.criteria.criteriaMetCount >= 3 ? "text-green-600" : "text-muted-foreground"
              )}>
                {validation.criteria.criteriaMetCount >= 3 ? '✓' : '○'} At least 3 of 4 character types:
              </div>
              <ul className="ml-4 space-y-1">
                <CriteriaItem 
                  met={validation.criteria.hasLowercase} 
                  label="Lowercase letters (a-z)" 
                  required={false}
                />
                <CriteriaItem 
                  met={validation.criteria.hasUppercase} 
                  label="Uppercase letters (A-Z)" 
                  required={false}
                />
                <CriteriaItem 
                  met={validation.criteria.hasNumber} 
                  label="Numbers (0-9)" 
                  required={false}
                />
                <CriteriaItem 
                  met={validation.criteria.hasSymbol} 
                  label="Symbols (!@#$%...)" 
                  required={false}
                />
              </ul>
            </li>
          </ul>
        </div>
      )}
      
      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Confirm Password Match */}
      {confirmPassword !== undefined && confirmPassword.length > 0 && (
        <div className={cn(
          "flex items-center gap-2 text-sm p-2 rounded-lg",
          matchValidation.matches 
            ? "bg-green-500/10 text-green-700 dark:text-green-400" 
            : "bg-destructive/10 text-destructive"
        )}>
          {matchValidation.matches ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>Passwords match</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" />
              <span>{matchValidation.error}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
