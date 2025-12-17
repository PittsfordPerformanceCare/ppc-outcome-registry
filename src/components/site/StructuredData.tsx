import { Helmet } from "react-helmet";

// Canonical IDs for consistent entity references
export const CANONICAL_IDS = {
  organization: "https://muse-meadow-app.lovable.app/#organization",
  physician: "https://muse-meadow-app.lovable.app/#physician-dr-luckey",
  website: "https://muse-meadow-app.lovable.app/#website",
};

interface LocalBusinessProps {
  type?: "MedicalBusiness" | "Physician" | "HealthAndBeautyBusiness";
  name?: string;
  description?: string;
  url?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  priceRange?: string;
  image?: string;
  sameAs?: string[];
  medicalSpecialty?: string[];
}

export const LocalBusinessSchema = ({
  type = "MedicalBusiness",
  name = "Pittsford Performance Care",
  description = "Specialized neurologic rehabilitation for concussion recovery and musculoskeletal performance. Evidence-based care with measured outcomes.",
  url = "https://muse-meadow-app.lovable.app",
  telephone = "+1-585-203-1050",
  email = "info@pittsfordperformance.com",
  address = {
    streetAddress: "3800 Monroe Ave, Suite 22",
    addressLocality: "Pittsford",
    addressRegion: "NY",
    postalCode: "14534",
    addressCountry: "US",
  },
  geo = {
    latitude: 43.0962,
    longitude: -77.5147,
  },
  openingHours = ["Mo-Fr 08:00-17:00"],
  priceRange = "$$",
  image = "https://muse-meadow-app.lovable.app/og-image.png",
  sameAs = [],
  medicalSpecialty = ["Neurology", "Sports Medicine", "Physical Medicine and Rehabilitation"],
}: LocalBusinessProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    "@id": CANONICAL_IDS.organization,
    name,
    description,
    url,
    telephone,
    email,
    address: {
      "@type": "PostalAddress",
      ...address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: geo.latitude,
      longitude: geo.longitude,
    },
    openingHoursSpecification: openingHours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.split(" ")[0].split("-").map((day) => {
        const dayMap: Record<string, string> = {
          Mo: "Monday",
          Tu: "Tuesday",
          We: "Wednesday",
          Th: "Thursday",
          Fr: "Friday",
          Sa: "Saturday",
          Su: "Sunday",
        };
        return dayMap[day] || day;
      }),
      opens: hours.split(" ")[1]?.split("-")[0] || "08:00",
      closes: hours.split(" ")[1]?.split("-")[1] || "17:00",
    })),
    priceRange,
    image,
    sameAs,
    medicalSpecialty,
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
      geoRadius: "50000",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Healthcare Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Concussion Evaluation & Treatment",
            description: "Comprehensive neurologic evaluation for post concussion symptoms including vestibular, oculomotor, and cognitive assessment.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Musculoskeletal Performance Care",
            description: "Neurologically informed evaluation and treatment for chronic pain and movement dysfunction.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Neurologic Rehabilitation",
            description: "Targeted rehabilitation addressing the neurologic drivers of symptoms and functional limitations.",
          },
        },
      ],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// Canonical Physician schema for Dr. C. Robert Luckey
export const PhysicianSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": CANONICAL_IDS.physician,
    name: "Dr. C. Robert Luckey, DC",
    givenName: "C. Robert",
    familyName: "Luckey",
    honorificSuffix: "DC",
    jobTitle: "Clinical Director",
    worksFor: {
      "@id": CANONICAL_IDS.organization,
    },
    medicalSpecialty: ["Neurology", "Sports Medicine", "Chiropractic"],
    description: "Clinical director at Pittsford Performance Care specializing in neurologic driven concussion recovery and musculoskeletal performance care.",
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

// MedicalWebPage schema for authority/governance pages
interface MedicalWebPageProps {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  about?: string[];
}

export const MedicalWebPageSchema = ({
  name,
  description,
  url,
  datePublished = "2025-01-01",
  dateModified = new Date().toISOString().split("T")[0],
  about = [],
}: MedicalWebPageProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": url,
    name,
    description,
    url,
    datePublished,
    dateModified,
    inLanguage: "en-US",
    isPartOf: {
      "@id": CANONICAL_IDS.website,
    },
    about: about.map((topic) => ({
      "@type": "Thing",
      name: topic,
    })),
    publisher: {
      "@type": "MedicalBusiness",
      "@id": CANONICAL_IDS.organization,
    },
    author: {
      "@type": "Person",
      "@id": CANONICAL_IDS.physician,
    },
    mainContentOfPage: {
      "@type": "WebPageElement",
      cssSelector: "main",
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", "p"],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbSchema = ({ items }: BreadcrumbProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export const FAQSchema = ({ items }: FAQProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

interface ArticleProps {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}

export const ArticleSchema = ({
  headline,
  description,
  url,
  datePublished = "2025-01-01",
  dateModified = "2025-12-12",
  image = "https://muse-meadow-app.lovable.app/og-image.png",
}: ArticleProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url,
    datePublished,
    dateModified,
    author: {
      "@type": "Person",
      "@id": CANONICAL_IDS.physician,
    },
    publisher: {
      "@type": "MedicalBusiness",
      "@id": CANONICAL_IDS.organization,
    },
    image,
    mainEntityOfPage: {
      "@type": "MedicalWebPage",
      "@id": url,
    },
    inLanguage: "en-US",
    isPartOf: {
      "@id": CANONICAL_IDS.website,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

interface MedicalConditionProps {
  name: string;
  description: string;
  url: string;
  signOrSymptom?: string[];
  possibleTreatment?: string[];
}

export const MedicalConditionSchema = ({
  name,
  description,
  url,
  signOrSymptom = [],
  possibleTreatment = [],
}: MedicalConditionProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    name,
    description,
    url,
    signOrSymptom: signOrSymptom.map((symptom) => ({
      "@type": "MedicalSignOrSymptom",
      name: symptom,
    })),
    possibleTreatment: possibleTreatment.map((treatment) => ({
      "@type": "MedicalTherapy",
      name: treatment,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};
