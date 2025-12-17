import React from "react";
import LexiconTerm from "@/components/patient/LexiconTerm";
import { getLexiconByTerm, LexiconEntry } from "@/data/patientLexicon";

// Terms to wrap in specific articles - Phase 1 controlled rollout
const articleLexiconTerms: Record<string, string[]> = {
  "visual-vestibular-mismatch": ["vestibular system", "sensory mismatch", "neuroplasticity"],
};

// Track which terms have been used to ensure only first occurrence is wrapped
const usedTermsInArticle = new Set<string>();

export const resetArticleLexiconTracking = () => {
  usedTermsInArticle.clear();
};

export const processTextWithLexicon = (
  text: string,
  articleSlug?: string
): React.ReactNode => {
  // If no article slug or no terms defined for this article, return plain text
  if (!articleSlug || !articleLexiconTerms[articleSlug]) {
    return text;
  }

  const allowedTerms = articleLexiconTerms[articleSlug];
  
  // Find all lexicon entries that match allowed terms for this article
  const termsToMatch: { term: string; entry: LexiconEntry; regex: RegExp }[] = [];
  
  for (const termKey of allowedTerms) {
    // Skip if already used in this article
    if (usedTermsInArticle.has(termKey)) continue;
    
    const entry = getLexiconByTerm(termKey);
    if (entry && entry.version === "v1") { // Only v1 terms for Phase 1
      // Create case-insensitive regex for the term and its aliases
      const allTerms = [entry.label, ...entry.aliases];
      for (const t of allTerms) {
        termsToMatch.push({
          term: termKey,
          entry,
          regex: new RegExp(`\\b(${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "i"),
        });
      }
    }
  }

  if (termsToMatch.length === 0) {
    return text;
  }

  // Find the first matching term in the text
  let earliestMatch: { index: number; length: number; termKey: string; entry: LexiconEntry; matchedText: string } | null = null;

  for (const { term, entry, regex } of termsToMatch) {
    const match = text.match(regex);
    if (match && match.index !== undefined) {
      if (!earliestMatch || match.index < earliestMatch.index) {
        earliestMatch = {
          index: match.index,
          length: match[0].length,
          termKey: term,
          entry,
          matchedText: match[0],
        };
      }
    }
  }

  if (!earliestMatch) {
    return text;
  }

  // Mark this term as used
  usedTermsInArticle.add(earliestMatch.termKey);

  // Split text and wrap the matched term
  const before = text.slice(0, earliestMatch.index);
  const after = text.slice(earliestMatch.index + earliestMatch.length);

  return (
    <>
      {before}
      <LexiconTerm term={earliestMatch.entry.label} definition={earliestMatch.entry.definition}>
        {earliestMatch.matchedText}
      </LexiconTerm>
      {processTextWithLexicon(after, articleSlug)}
    </>
  );
};

export const getArticleLexiconTerms = (articleSlug: string): string[] => {
  return articleLexiconTerms[articleSlug] || [];
};
