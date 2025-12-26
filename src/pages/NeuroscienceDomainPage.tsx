import { useParams, Navigate } from "react-router-dom";
import { FrontalDomain } from "@/components/neuroscience/domains/FrontalDomain";
import { VestibularDomain } from "@/components/neuroscience/domains/VestibularDomain";
import { BrainstemDomain } from "@/components/neuroscience/domains/BrainstemDomain";
import { CerebellarDomain } from "@/components/neuroscience/domains/CerebellarDomain";
import { TemporalDomain } from "@/components/neuroscience/domains/TemporalDomain";
import { ParietalDomain } from "@/components/neuroscience/domains/ParietalDomain";
import { LimbicDomain } from "@/components/neuroscience/domains/LimbicDomain";
import { ProprioceptiveDomain } from "@/components/neuroscience/domains/ProprioceptiveDomain";
import { LimbicPrefrontalDomain } from "@/components/neuroscience/domains/LimbicPrefrontalDomain";
import { AutonomicSympatheticDomain } from "@/components/neuroscience/domains/AutonomicSympatheticDomain";
import { AutonomicParasympatheticDomain } from "@/components/neuroscience/domains/AutonomicParasympatheticDomain";
import { NeuroscienceDomainIndex } from "@/components/neuroscience/NeuroscienceDomainIndex";

const DOMAIN_COMPONENTS: Record<string, React.ComponentType> = {
  frontal: FrontalDomain,
  vestibular: VestibularDomain,
  brainstem: BrainstemDomain,
  cerebellar: CerebellarDomain,
  temporal: TemporalDomain,
  parietal: ParietalDomain,
  limbic: LimbicDomain,
  proprioceptive: ProprioceptiveDomain,
  "limbic-prefrontal": LimbicPrefrontalDomain,
  "autonomic-sympathetic": AutonomicSympatheticDomain,
  "autonomic-parasympathetic": AutonomicParasympatheticDomain,
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
