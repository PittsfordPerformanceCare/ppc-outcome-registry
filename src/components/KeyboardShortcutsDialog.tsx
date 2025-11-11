import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
  category?: string;
}

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  additionalShortcuts?: Shortcut[];
}

const defaultShortcuts: Shortcut[] = [
  { keys: ["Esc"], description: "Go back to previous page", category: "Navigation" },
  { keys: ["H"], description: "Go to home page", category: "Navigation" },
  { keys: ["?"], description: "Show keyboard shortcuts", category: "Help" },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
  additionalShortcuts = [],
}: KeyboardShortcutsDialogProps) {
  const allShortcuts = [...defaultShortcuts, ...additionalShortcuts];
  
  // Group shortcuts by category
  const groupedShortcuts = allShortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <Badge
                          key={keyIndex}
                          variant="outline"
                          className="font-mono text-xs px-2 py-1"
                        >
                          {key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
          <p>
            Note: Keyboard shortcuts are disabled when typing in input fields
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
