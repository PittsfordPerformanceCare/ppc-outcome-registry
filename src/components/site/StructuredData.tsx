import { Helmet } from "react-helmet";

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
    streetAddress: "3349 Monroe Avenue, Suite 330",
    addressLocality: "Rochester",
    addressRegion: "NY",
    postalCode: "14618",
    addressCountry: "US",
  },
  geo = {
    latitude: 43.1156,
    longitude: -77.5047,
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
            description: "Comprehensive neurologic evaluation for post-concussion symptoms including vestibular, oculomotor, and cognitive assessment.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Musculoskeletal Performance Care",
            description: "Neurologically-informed evaluation and treatment for chronic pain and movement dysfunction.",
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
  author?: string;
  image?: string;
}

export const ArticleSchema = ({
  headline,
  description,
  url,
  datePublished = "2025-01-01",
  dateModified = "2025-12-12",
  author = "Pittsford Performance Care",
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
      "@type": "Organization",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "Pittsford Performance Care",
      logo: {
        "@type": "ImageObject",
        url: "https://muse-meadow-app.lovable.app/icon-512x512.png",
      },
    },
    image,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
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
