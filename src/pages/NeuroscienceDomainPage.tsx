import { useParams, Navigate } from "react-router-dom";
import { FrontalDomain } from "@/components/neuroscience/domains/FrontalDomain";
import { VestibularDomain } from "@/components/neuroscience/domains/VestibularDomain";
import { BrainstemDomain } from "@/components/neuroscience/domains/BrainstemDomain";
import { NeuroscienceDomainIndex } from "@/components/neuroscience/NeuroscienceDomainIndex";

const DOMAIN_COMPONENTS: Record<string, React.ComponentType> = {
  frontal: FrontalDomain,
  vestibular: VestibularDomain,
  brainstem: BrainstemDomain,
};

export default function NeuroscienceDomainPage() {
  const { domain } = useParams<{ domain?: string }>();

  // If no domain specified, show the index
  if (!domain) {
    return <NeuroscienceDomainIndex />;
  }

  // Check if domain exists
  const DomainComponent = DOMAIN_COMPONENTS[domain.toLowerCase()];
  
  if (!DomainComponent) {
    return <Navigate to="/neuroscience" replace />;
  }

  return <DomainComponent />;
}
