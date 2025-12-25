import { EducationalNeuroscienceDomainPage } from "../EducationalNeuroscienceDomainPage";

export function FrontalDomain() {
  return (
    <EducationalNeuroscienceDomainPage
      domainName="Frontal"
      overview={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            The frontal domain is commonly discussed in educational neuroscience literature 
            in relation to functions often associated with planning, organization, working memory, 
            and the regulation of attention and behavior. These functions are sometimes referred 
            to collectively as "executive functions" in professional and academic discourse.
          </p>
          <p>
            Educational neuroscience perspectives emphasize that frontal-associated functions 
            develop across childhood and adolescence, with considerable individual variability 
            in timing and expression. The literature frequently notes that these functions are 
            distributed across interconnected brain systems rather than localized to a single region.
          </p>
          <p>
            This reference is provided for informational purposes only. It does not describe 
            any specific learner, predict outcomes, or guide educational decisions.
          </p>
        </div>
      }
      educatorObservations={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            In classroom settings, educators sometimes notice patterns that educational 
            neuroscience literature often discusses in relation to frontal-associated functions. 
            These observations vary widely across individuals, tasks, and contexts.
          </p>
          <ul className="space-y-2 mt-3">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                Some learners may appear to benefit from additional time when transitioning 
                between activities or shifting between different types of tasks.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                Patterns of organization—such as managing materials, sequencing steps, 
                or tracking multiple instructions—sometimes vary across different classroom 
                contexts and task demands.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                The ability to hold and manipulate information during complex tasks may 
                appear more or less consistent depending on factors such as task familiarity, 
                environmental structure, and emotional state.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                Patterns of sustained attention and impulse modulation sometimes differ 
                across settings, time of day, or types of activities.
              </span>
            </li>
          </ul>
          <p className="mt-3 italic">
            These observations are descriptive and reflect natural variability. They do not 
            indicate deficits, disorders, or specific educational needs.
          </p>
        </div>
      }
      neurosciencePerspectives={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Educational neuroscience literature offers multiple, non-exclusive perspectives 
            on frontal-associated functions:
          </p>
          <ul className="space-y-3 mt-3">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <div>
                <strong>Developmental Variability:</strong> Research often discusses how 
                frontal-associated functions develop along extended timelines, with 
                considerable individual differences in pace and pattern. What appears 
                at one age may shift substantially with continued development.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <div>
                <strong>Distributed Systems:</strong> Contemporary perspectives emphasize 
                that functions traditionally associated with frontal regions emerge from 
                coordinated activity across multiple brain areas. Single-region explanations 
                are increasingly viewed as oversimplified in the literature.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <div>
                <strong>Context Sensitivity:</strong> Educational neuroscience frequently 
                notes that frontal-associated functions may vary based on task demands, 
                environmental supports, emotional state, and prior experience. Consistency 
                across contexts is not assumed.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <div>
                <strong>Plasticity:</strong> The literature often discusses how experience 
                and environment may shape the development of these functions over time, 
                reflecting the brain's capacity for change.
              </div>
            </li>
          </ul>
        </div>
      }
      contextualModifiers={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Educational neuroscience literature commonly identifies factors that may 
            influence observed patterns associated with frontal functions. These modifiers 
            underscore why single-cause interpretations are discouraged:
          </p>
          <ul className="space-y-2 mt-3">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              <span>
                <strong>Task Structure:</strong> The degree of explicit structure, 
                scaffolding, and clarity in task instructions may influence performance.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              <span>
                <strong>Emotional Load:</strong> States such as anxiety, excitement, 
                or stress may affect functions often associated with frontal regions.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              <span>
                <strong>Environmental Context:</strong> Noise levels, visual distractions, 
                social dynamics, and physical comfort may all contribute to variability.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              <span>
                <strong>Novelty vs. Familiarity:</strong> New or unfamiliar tasks may 
                place different demands on frontal-associated functions compared to 
                well-practiced routines.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              <span>
                <strong>Fatigue and Transitions:</strong> Time of day, recent transitions, 
                and accumulated cognitive demands may influence observed patterns.
              </span>
            </li>
          </ul>
        </div>
      }
      misconceptions={
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Several common misunderstandings about frontal-associated functions appear 
            in popular discourse:
          </p>
          <ul className="space-y-2 mt-3">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                <strong>Fixed Capacity:</strong> The assumption that executive functions 
                represent fixed traits is not well-supported. The literature emphasizes 
                developmental change and context sensitivity.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                <strong>Single Location:</strong> While often discussed in relation to 
                frontal regions, these functions involve distributed networks. 
                Localization claims oversimplify current understanding.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                <strong>Uniform Development:</strong> The literature does not support 
                assumptions of uniform developmental timelines. Individual variability 
                is the norm, not the exception.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                <strong>Behavior as Diagnosis:</strong> Observable patterns should not 
                be interpreted as diagnostic indicators. Behavior reflects multiple 
                interacting factors.
              </span>
            </li>
          </ul>
        </div>
      }
      professionalQuestions={[
        "How consistent are these patterns across different settings and task types?",
        "How might environmental or contextual factors be influencing what is observed?",
        "What does the developmental literature suggest about variability at this age?",
        "How do different task structures appear to affect engagement and performance?",
        "What aspects of the learning environment might be relevant to consider?",
      ]}
      governingDocuments={[
        "PPC Educational Neuroscience Reference Policy (Revised – Legal Hardened)",
        "PSOF Governance Charter",
        "PSOF Product Principles",
        "PSOF Phase 3 – Role Semantics Alignment",
        "PSOF Phase 4 – Persistence, Memory & Lifecycle Governance",
        "PSOF-Safe Educational Neuroscience Layer Framework",
      ]}
    />
  );
}
