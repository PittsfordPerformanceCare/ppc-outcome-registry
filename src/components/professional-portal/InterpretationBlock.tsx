import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { InterpretationSection } from "@/data/professionalOutcomes";

interface InterpretationBlockProps {
  sections: InterpretationSection[];
}

export function InterpretationBlock({ sections }: InterpretationBlockProps) {
  return (
    <Accordion type="single" collapsible className="border border-slate-200 rounded-lg overflow-hidden">
      {sections.map((section, idx) => (
        <AccordionItem
          key={idx}
          value={`section-${idx}`}
          className="border-b border-slate-100 last:border-b-0"
        >
          <AccordionTrigger className="px-5 py-4 text-sm font-medium text-slate-800 hover:no-underline hover:bg-slate-50/50">
            {section.title}
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">
            {section.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
