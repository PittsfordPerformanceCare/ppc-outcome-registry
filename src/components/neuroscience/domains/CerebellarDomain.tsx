import { EducationalNeuroscienceDomainPage } from "../EducationalNeuroscienceDomainPage";

export function CerebellarDomain() {
  return (
    <EducationalNeuroscienceDomainPage
      domainName="Cerebellar"
      overview={
        <>
          <p className="mb-4">
            In educational neuroscience literature, the cerebellum is commonly discussed in relation 
            to motor coordination, procedural learning, and the timing of sequential actions. While 
            historically emphasized for its role in movement, contemporary research increasingly 
            explores cerebellar contributions to cognitive and language-related processes.
          </p>
          <p className="mb-4">
            Cerebellar-associated functions are often described as supporting the automatization of 
            learned skills, the fine-tuning of motor sequences, and the coordination of complex 
            movements. Some literature also discusses potential cerebellar involvement in aspects 
            of language processing, particularly those requiring precise timing.
          </p>
          <p className="mb-4">
            These functions develop throughout childhood and adolescence, with individual variation 
            influenced by experience, practice, and developmental timing. The cerebellum operates 
            as part of distributed networks involving multiple brain regions.
          </p>
          <p className="text-sm text-muted-foreground italic">
            This content is informational only and does not constitute clinical guidance or 
            intervention rationale.
          </p>
        </>
      }
      educatorObservations={
        <>
          <p className="mb-4">
            In classroom settings, educators sometimes notice variations in how learners approach 
            tasks requiring motor coordination, sequential actions, or procedural fluency. These 
            observations may include differences in:
          </p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary mt-1">•</span>
              <span>Handwriting fluency, letter formation, or fine motor tasks</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary mt-1">•</span>
              <span>Coordination during physical education or movement activities</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary mt-1">•</span>
              <span>Timing and rhythm in music, speech, or sequential tasks</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary mt-1">•</span>
              <span>Automatization of procedures that others perform fluently</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary mt-1">•</span>
              <span>Balance or postural control during seated or standing activities</span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Such patterns are naturally variable across learners, tasks, and contexts. Similar 
            observations may reflect different underlying factors, and individual patterns may 
            change with development, practice, and experience.
          </p>
        </>
      }
      neurosciencePerspectives={
        <>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Procedural Learning and Automatization</h4>
              <p className="text-sm text-muted-foreground">
                Educational neuroscience literature often discusses cerebellar involvement in 
                procedural learning—the gradual acquisition of skills that become automatic with 
                practice. This automatization process may vary considerably across individuals 
                and skill domains.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Timing and Sequencing</h4>
              <p className="text-sm text-muted-foreground">
                The cerebellum is sometimes described as contributing to precise timing of actions 
                and the coordination of sequential movements. This timing function may interact 
                with other systems involved in attention, motor planning, and sensory processing.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Motor-Cognitive Interactions</h4>
              <p className="text-sm text-muted-foreground">
                Contemporary perspectives increasingly discuss cerebellar contributions beyond 
                pure motor functions. Some literature explores potential involvement in aspects 
                of language, working memory, and cognitive fluency, though these relationships 
                remain areas of ongoing research.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Experience-Dependent Development</h4>
              <p className="text-sm text-muted-foreground">
                Cerebellar development and function are often described as experience-dependent, 
                meaning that practice and environmental factors may influence how these systems 
                develop over time. Individual trajectories vary considerably.
              </p>
            </div>
          </div>
        </>
      }
      contextualModifiers={
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Educational neuroscience literature often emphasizes that observed patterns related 
            to motor coordination and procedural fluency may be influenced by many factors:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-amber-500 mt-1">•</span>
              <span><strong>Practice and experience:</strong> Skill automatization typically requires 
              extensive, varied practice over time.</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-amber-500 mt-1">•</span>
              <span><strong>Task complexity:</strong> Novel or complex sequences may require more 
              conscious attention than familiar routines.</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-amber-500 mt-1">•</span>
              <span><strong>Fatigue and physical state:</strong> Motor coordination may vary with 
              physical tiredness, hunger, or illness.</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-amber-500 mt-1">•</span>
              <span><strong>Stress and anxiety:</strong> Performance pressure may affect motor 
              fluency differently across individuals.</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-amber-500 mt-1">•</span>
              <span><strong>Developmental timing:</strong> Motor skill development follows 
              individual trajectories with considerable natural variation.</span>
            </li>
          </ul>
        </>
      }
      misconceptions={
        <>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">"Motor difficulties indicate broader cognitive limitations"</h4>
              <p className="text-sm text-muted-foreground">
                Motor coordination and cognitive abilities involve distinct but sometimes 
                overlapping systems. Variation in one domain does not necessarily predict 
                variation in others.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">"The cerebellum is only about movement"</h4>
              <p className="text-sm text-muted-foreground">
                Contemporary research discusses cerebellar contributions to multiple functions 
                beyond motor control, though its precise role in cognitive processes remains 
                an area of ongoing investigation.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">"Skills should automatize at similar rates"</h4>
              <p className="text-sm text-muted-foreground">
                The pace of skill automatization varies considerably across individuals and 
                skill types. Different learners may require different amounts of practice to 
                achieve fluency.
              </p>
            </div>
          </div>
        </>
      }
      professionalQuestions={[
        "How consistent are observed motor patterns across different types of tasks?",
        "In what contexts does coordination appear more or less fluent?",
        "How has the pattern changed over time with practice and development?",
        "What factors in the environment might be influencing what is observed?",
        "How might fatigue, stress, or novelty be contributing to current observations?",
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
