// Site Articles Data - Cluster Articles for /site/articles
// Following Lead Engine 3.0 CTA Strategy

export interface ArticleData {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  heroContent: string;
  sections: ArticleSection[];
  relatedArticles: string[];
  primaryCTA: CTAConfig;
  secondaryCTA?: CTAConfig;
}

export interface ArticleSection {
  type: 'heading' | 'paragraph' | 'list' | 'callout' | 'inline-cta';
  content: string;
  items?: string[];
  variant?: 'info' | 'warning' | 'symptom' | 'insight';
}

export interface CTAConfig {
  label: string;
  route: string;
  description?: string;
}

// ============================================
// CONCUSSION CLUSTER ARTICLES
// ============================================

export const concussionArticles: ArticleData[] = [
  {
    slug: "post-concussion-performance-decline",
    title: "Post-Concussion Performance Decline: When Recovery Stalls",
    category: "concussion",
    readTime: "10 min read",
    excerpt: "Understanding why your symptoms persist and what neurologic evaluation can reveal about your recovery.",
    heroContent: "You were cleared to return to normal activities. Your imaging came back clean. But weeks—or months—later, you still don't feel like yourself. Performance has declined. Fatigue is constant. Something is off, and no one can explain why.",
    sections: [
      {
        type: "callout",
        content: "If you've been told \"everything looks normal\" but you're still struggling, you're not imagining it. Post-concussion performance decline is real, measurable, and treatable.",
        variant: "insight"
      },
      {
        type: "heading",
        content: "What Is Post-Concussion Performance Decline?"
      },
      {
        type: "paragraph",
        content: "Post-concussion performance decline occurs when the brain's metabolic and functional systems haven't fully recovered despite structural normality. Standard imaging sees the anatomy; it doesn't see the processing speed, the integration efficiency, or the energy demands that are failing."
      },
      {
        type: "heading",
        content: "Common Signs You May Recognize"
      },
      {
        type: "callout",
        content: "Do any of these sound familiar?",
        variant: "symptom"
      },
      {
        type: "list",
        content: "",
        items: [
          "Mental fatigue after tasks that used to be easy",
          "Trouble concentrating in busy environments",
          "Slower reaction time or processing speed",
          "Exercise intolerance—getting wiped out from light activity",
          "Light and sound sensitivity that hasn't resolved",
          "Feeling \"off\" but unable to explain why",
          "Sleep that doesn't restore your energy"
        ]
      },
      {
        type: "inline-cta",
        content: "If this sounds familiar, a comprehensive neurologic evaluation can identify what's driving these symptoms."
      },
      {
        type: "heading",
        content: "Why Standard Care Misses It"
      },
      {
        type: "paragraph",
        content: "Most concussion protocols focus on symptom resolution and rest. Once you can tolerate activity without immediate symptom spike, you're \"cleared.\" But this doesn't mean your brain has fully recovered its processing capacity, energy efficiency, or system integration."
      },
      {
        type: "paragraph",
        content: "The systems most often affected—vestibular, visual, cerebellar, and autonomic—require specialized testing that goes beyond a standard neurologic exam."
      },
      {
        type: "heading",
        content: "The Five-System Model"
      },
      {
        type: "paragraph",
        content: "At PPC, we evaluate five interconnected systems that commonly fail after concussion:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Visual processing and eye movement control",
          "Vestibular function and spatial orientation",
          "Cerebellar timing and coordination",
          "Autonomic regulation (heart rate, fatigue, recovery)",
          "Cognitive-motor integration"
        ]
      },
      {
        type: "paragraph",
        content: "Each system can be individually normal but fail when asked to work together. Our evaluation specifically tests these integration points."
      },
      {
        type: "heading",
        content: "What a Neurologic Evaluation Reveals"
      },
      {
        type: "paragraph",
        content: "A comprehensive neurologic evaluation identifies exactly which systems are underperforming and why. This isn't about finding something \"wrong\"—it's about finding the specific functional gaps that explain your experience."
      },
      {
        type: "callout",
        content: "When you know what's not working, you can target treatment precisely. This is why recovery accelerates after proper evaluation.",
        variant: "insight"
      },
      {
        type: "heading",
        content: "Moving Forward"
      },
      {
        type: "paragraph",
        content: "Post-concussion performance decline doesn't have to be permanent. With the right evaluation and targeted intervention, the systems that are struggling can be retrained and rehabilitated. The first step is understanding exactly what's happening."
      }
    ],
    relatedArticles: [
      "visual-vestibular-mismatch",
      "cerebellar-timing-and-coordination",
      "autonomic-nervous-system-flow"
    ],
    primaryCTA: {
      label: "Schedule Neurologic Evaluation",
      route: "/patient/concierge",
      description: "Identify what's driving your symptoms with a comprehensive neurologic assessment."
    },
    secondaryCTA: {
      label: "Take the Concussion Self-Test",
      route: "/patient/self-tests/concussion",
      description: "Get an initial severity assessment before your evaluation."
    }
  },
  {
    slug: "visual-vestibular-mismatch",
    title: "Visual-Vestibular Mismatch: When Your Eyes and Inner Ear Disagree",
    category: "concussion",
    readTime: "8 min read",
    excerpt: "Understanding the sensory conflict that makes busy environments unbearable after concussion.",
    heroContent: "Grocery stores are overwhelming. Scrolling on your phone makes you nauseous. Being a passenger in a car feels wrong. This isn't anxiety—it's visual-vestibular mismatch, one of the most common and treatable causes of persistent post-concussion symptoms.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Visual–Oculomotor",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When visual–oculomotor processing becomes inefficient after concussion, secondary compensation often appears in the Vestibular and Frontal domains—which is why busy environments, reading, and sustained focus become exhausting."
      },
      {
        type: "heading",
        content: "What Is Visual-Vestibular Mismatch?"
      },
      {
        type: "paragraph",
        content: "Your brain uses three systems to know where you are in space: your eyes (visual system), your inner ear (vestibular system), and your body position sensors (proprioception). When these systems send conflicting information, your brain struggles to create a coherent picture of reality."
      },
      {
        type: "paragraph",
        content: "After concussion, the calibration between these systems can be disrupted. Your eyes say one thing; your inner ear says another. The result is a constant, low-grade sense of disorientation that spikes in challenging environments."
      },
      {
        type: "heading",
        content: "Recognizing the Symptoms"
      },
      {
        type: "callout",
        content: "Visual-vestibular mismatch symptoms often appear in specific situations:",
        variant: "symptom"
      },
      {
        type: "list",
        content: "",
        items: [
          "Dizziness or nausea in busy visual environments (stores, crowds, patterns)",
          "Discomfort when scrolling on screens or watching action sequences",
          "Feeling \"off\" as a car or train passenger",
          "Difficulty with escalators, elevators, or moving walkways",
          "Fatigue after visual tasks like reading or screen work",
          "A sense that the ground is moving or unstable",
          "Headaches triggered by visual complexity"
        ]
      },
      {
        type: "inline-cta",
        content: "These symptoms are measurable and addressable. The first step is identifying the specific mismatch pattern."
      },
      {
        type: "heading",
        content: "Why Standard Tests Miss It"
      },
      {
        type: "paragraph",
        content: "Traditional vestibular testing examines each system in isolation. The inner ear is tested separately from the eyes. But the problem isn't with either system alone—it's with how they integrate. Standard testing can come back completely normal while the integration failure persists."
      },
      {
        type: "callout",
        content: "\"Your vestibular testing was normal\" doesn't mean your vestibular system is working correctly with your visual system.",
        variant: "insight"
      },
      {
        type: "heading",
        content: "How Visual Strain Cascades Into Other Domains"
      },
      {
        type: "paragraph",
        content: "When the visual–oculomotor system is inefficient, other neurologic domains compensate. The Frontal system works harder to maintain focus and suppress distractions, leading to cognitive fatigue and brain fog. Meanwhile, the Autonomic system may become dysregulated from chronic sensory conflict—contributing to headaches, nausea, and exercise intolerance."
      },
      {
        type: "heading",
        content: "How We Evaluate Visual-Vestibular Integration"
      },
      {
        type: "paragraph",
        content: "Our evaluation specifically challenges the integration between visual and vestibular systems. We test how your brain handles sensory conflict—situations where your eyes and inner ear are deliberately given different information."
      },
      {
        type: "paragraph",
        content: "This reveals the specific patterns of mismatch and guides targeted treatment."
      },
      {
        type: "heading",
        content: "Treatment Approach"
      },
      {
        type: "paragraph",
        content: "Treatment involves carefully dosed exercises that retrain your brain to properly integrate conflicting sensory information. This must be done gradually—too much challenge too soon can trigger symptom flares and slow progress."
      },
      {
        type: "paragraph",
        content: "The goal is to rebuild the brain's ability to handle sensory conflict without triggering symptoms. Most patients see meaningful improvement within weeks of targeted intervention."
      },
      {
        type: "heading",
        content: "Living With Symptoms vs. Resolving Them"
      },
      {
        type: "paragraph",
        content: "Many people with visual-vestibular mismatch develop avoidance strategies—they stop going to stores, limit screen time, always drive instead of riding as a passenger. These adaptations reduce symptom exposure but don't address the underlying problem."
      },
      {
        type: "callout",
        content: "You don't have to avoid the activities that trigger symptoms. With proper treatment, your brain can relearn how to handle these situations normally.",
        variant: "insight"
      },
      {
        type: "paragraph",
        content: "At PPC, determining whether visual–oculomotor dysfunction is primary—or compensatory—helps guide what to address first in concussion recovery."
      }
    ],
    relatedArticles: [
      "frontal-system-fog",
      "autonomic-nervous-system-flow",
      "post-concussion-performance-decline",
      "cerebellar-timing-and-coordination"
    ],
    primaryCTA: {
      label: "Schedule Neurologic Evaluation",
      route: "/patient/concierge",
      description: "Identify your specific visual-vestibular mismatch pattern."
    },
    secondaryCTA: {
      label: "Take the Concussion Self-Test",
      route: "/patient/self-tests/concussion"
    }
  },
  {
    slug: "cerebellar-timing-and-coordination",
    title: "Cerebellar Timing and Coordination: The Brain's Master Clock",
    category: "concussion",
    readTime: "9 min read",
    excerpt: "How cerebellar dysfunction after concussion affects everything from balance to cognition.",
    heroContent: "The cerebellum is your brain's timing center. It coordinates movement, calibrates sensory input, and ensures that everything happens in the right sequence at the right speed. After concussion, cerebellar function often suffers—even when traditional testing looks normal.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Cerebellar",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When cerebellar timing and coordination are disrupted after concussion, secondary compensation often appears in the Proprioceptive and Autonomic domains—which is why movement feels inefficient, effort escalates quickly, and fatigue sets in early."
      },
      {
        type: "heading",
        content: "What the Cerebellum Does"
      },
      {
        type: "paragraph",
        content: "Think of the cerebellum as the conductor of an orchestra. Each section (each brain system) knows its part, but without the conductor's precise timing, the music falls apart. The cerebellum doesn't create movement—it refines and coordinates it."
      },
      {
        type: "paragraph",
        content: "After concussion, the cerebellum's timing precision can be disrupted. Movements become less smooth. Reactions are delayed. Balance feels off. Cognitive tasks that require quick processing become exhausting."
      },
      {
        type: "heading",
        content: "Signs of Cerebellar Dysfunction"
      },
      {
        type: "callout",
        content: "Cerebellar issues often present as subtle coordination and timing problems:",
        variant: "symptom"
      },
      {
        type: "list",
        content: "",
        items: [
          "Feeling \"clumsy\" or less coordinated than before",
          "Difficulty with fine motor tasks (writing, typing, using tools)",
          "Balance problems, especially with eyes closed or on uneven surfaces",
          "Slowed reaction time that affects driving or sports",
          "Slurred or slow speech",
          "Difficulty tracking moving objects smoothly",
          "Cognitive tasks feeling slower and more effortful"
        ]
      },
      {
        type: "heading",
        content: "The Cerebellar-Concussion Connection"
      },
      {
        type: "paragraph",
        content: "The cerebellum is particularly vulnerable to concussive forces because of its position at the back of the brain and its high metabolic demands. Even mild concussions can affect cerebellar timing—and because standard neurologic exams don't test cerebellar precision, these deficits often go undetected."
      },
      {
        type: "paragraph",
        content: "This timing inefficiency often overlaps with motor sequencing delays, increasing effort and reducing movement efficiency. As effort increases, autonomic load rises, further limiting endurance and recovery."
      },
      {
        type: "inline-cta",
        content: "Specialized testing can reveal cerebellar timing deficits that standard exams miss."
      },
      {
        type: "heading",
        content: "How We Assess Cerebellar Function"
      },
      {
        type: "paragraph",
        content: "Our evaluation includes precise measurements of:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Reaction time and rate of force development",
          "Eye movement coordination and pursuit smoothness",
          "Balance under various sensory conditions",
          "Motor sequencing and timing accuracy",
          "Cognitive processing speed under load"
        ]
      },
      {
        type: "paragraph",
        content: "These measurements reveal whether cerebellar timing is contributing to your symptoms and guide targeted rehabilitation."
      },
      {
        type: "heading",
        content: "Treatment and Rehabilitation"
      },
      {
        type: "paragraph",
        content: "Cerebellar rehabilitation involves exercises that challenge timing precision at the edge of your current ability. The cerebellum learns through repetition and error correction—we provide structured challenges that drive this adaptation."
      },
      {
        type: "callout",
        content: "The cerebellum is highly plastic. With targeted training, timing precision can be restored even months or years after injury.",
        variant: "insight"
      },
      {
        type: "paragraph",
        content: "At PPC, identifying cerebellar timing as a primary driver—rather than a downstream compensation—helps determine what to address first in recovery."
      }
    ],
    relatedArticles: [
      "visual-vestibular-mismatch",
      "autonomic-nervous-system-flow",
      "frontal-system-fog",
      "post-concussion-performance-decline"
    ],
    primaryCTA: {
      label: "Schedule Neurologic Evaluation",
      route: "/patient/concierge",
      description: "Assess your cerebellar function with specialized timing tests."
    },
    secondaryCTA: {
      label: "Take the Concussion Self-Test",
      route: "/patient/self-tests/concussion"
    }
  },
  {
    slug: "autonomic-nervous-system-flow",
    title: "Autonomic Nervous System Flow: When Your Body's Autopilot Fails",
    category: "concussion",
    readTime: "8 min read",
    excerpt: "Understanding autonomic dysregulation after concussion and its wide-ranging symptoms.",
    heroContent: "Your autonomic nervous system controls everything your body does automatically—heart rate, blood pressure, digestion, temperature, and energy regulation. After concussion, this \"autopilot\" system often malfunctions, creating symptoms that seem unrelated to a brain injury.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Autonomic",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When autonomic regulation becomes inefficient after concussion, secondary compensation often appears in the Brainstem and Limbic–Prefrontal domains—which is why exercise tolerance drops, recovery slows, and symptoms amplify under stress."
      },
      {
        type: "heading",
        content: "What Is Autonomic Dysregulation?"
      },
      {
        type: "paragraph",
        content: "The autonomic nervous system (ANS) has two branches: the sympathetic (\"fight or flight\") and parasympathetic (\"rest and digest\"). These systems should shift smoothly based on your body's needs. After concussion, this balance can be disrupted, leaving you stuck in one state or unable to transition appropriately."
      },
      {
        type: "heading",
        content: "Recognizing Autonomic Symptoms"
      },
      {
        type: "callout",
        content: "Autonomic dysregulation can manifest in many ways:",
        variant: "symptom"
      },
      {
        type: "list",
        content: "",
        items: [
          "Exercise intolerance—getting exhausted from light activity",
          "Rapid heart rate with minimal exertion",
          "Dizziness when standing up (orthostatic intolerance)",
          "Difficulty regulating body temperature",
          "Digestive changes—nausea, appetite loss, irregularity",
          "Sleep that doesn't feel restorative",
          "Anxiety-like symptoms without clear cause",
          "Fatigue that doesn't match your activity level"
        ]
      },
      {
        type: "paragraph",
        content: "These symptoms are often dismissed as \"anxiety\" or \"deconditioning,\" but they reflect real physiologic dysfunction in how your autonomic system regulates your body."
      },
      {
        type: "paragraph",
        content: "Autonomic inefficiency often overlaps with an underlying energy regulation problem, making even light activity feel disproportionately exhausting. Persistent autonomic strain can also increase limbic reactivity, amplifying symptoms and reducing stress tolerance."
      },
      {
        type: "inline-cta",
        content: "Autonomic dysfunction is measurable. Heart rate variability and orthostatic testing can reveal the specific patterns of dysregulation."
      },
      {
        type: "heading",
        content: "The Concussion-Autonomic Connection"
      },
      {
        type: "paragraph",
        content: "The brain regions that control autonomic function are vulnerable to the metabolic disruption that occurs after concussion. The brainstem, hypothalamus, and insular cortex all play roles in autonomic regulation—and all can be affected by concussive forces."
      },
      {
        type: "callout",
        content: "Autonomic dysfunction is one of the most common—and most overlooked—consequences of concussion.",
        variant: "insight"
      },
      {
        type: "heading",
        content: "Assessment and Testing"
      },
      {
        type: "paragraph",
        content: "We evaluate autonomic function through:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Heart rate variability analysis",
          "Orthostatic testing (blood pressure and heart rate with position change)",
          "Graded exercise testing to assess exercise tolerance",
          "Symptom provocation protocols"
        ]
      },
      {
        type: "paragraph",
        content: "These tests reveal whether your autonomic system is responding appropriately to physiologic challenges."
      },
      {
        type: "heading",
        content: "Rebuilding Autonomic Capacity"
      },
      {
        type: "paragraph",
        content: "Treatment involves gradually rebuilding your autonomic system's ability to handle challenge. This typically includes:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Structured aerobic exercise progression (the Buffalo Protocol approach)",
          "Breathing and vagal tone exercises",
          "Sleep optimization",
          "Hydration and nutrition strategies"
        ]
      },
      {
        type: "paragraph",
        content: "The goal is to restore your body's ability to smoothly shift between sympathetic and parasympathetic states as demands change."
      },
      {
        type: "paragraph",
        content: "At PPC, identifying autonomic dysfunction as a primary driver—rather than a downstream stress response—helps determine what to address first in concussion recovery."
      }
    ],
    relatedArticles: [
      "frontal-system-fog",
      "post-concussion-performance-decline",
      "visual-vestibular-mismatch",
      "cerebellar-timing-and-coordination"
    ],
    primaryCTA: {
      label: "Schedule Neurologic Evaluation",
      route: "/patient/concierge",
      description: "Assess your autonomic function and exercise tolerance."
    },
    secondaryCTA: {
      label: "Take the Concussion Self-Test",
      route: "/patient/self-tests/concussion"
    }
  },
  {
    slug: "frontal-system-fog-after-concussion",
    title: "Frontal System Fog: When Thinking Feels Like Wading Through Mud",
    category: "concussion",
    readTime: "9 min read",
    excerpt: "Understanding the cognitive fog that persists after concussion and how frontal lobe function affects everyday thinking.",
    heroContent: "The words are there, but they won't come out right. Decisions that used to be automatic now require conscious effort. You start tasks and lose track of what you were doing. This isn't laziness or lack of focus—it's frontal system dysfunction after concussion.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Frontal (Executive)",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When frontal executive systems become overloaded after concussion, secondary compensation often reflects unresolved dysfunction in the Visual–Oculomotor, Autonomic, or Cerebellar domains—which is why thinking feels effortful, focus fades quickly, and mental endurance collapses later in the day."
      },
      {
        type: "callout",
        content: "If you feel like you're thinking through fog—slower, less sharp, more effortful—your frontal systems may not have fully recovered from concussion.",
        variant: "insight"
      },
      {
        type: "heading",
        content: "What the Frontal System Does"
      },
      {
        type: "paragraph",
        content: "Your frontal lobes are the CEO of your brain. They manage executive functions: planning, decision-making, working memory, impulse control, attention regulation, and cognitive flexibility. When these systems work well, thinking feels effortless. When they're compromised, every cognitive task becomes a struggle."
      },
      {
        type: "paragraph",
        content: "After concussion, frontal system function often suffers—even when structural imaging looks normal. The metabolic and connectivity disruptions that occur after concussion particularly affect these high-level processing networks."
      },
      {
        type: "heading",
        content: "Signs of Frontal System Fog"
      },
      {
        type: "callout",
        content: "Do these cognitive changes sound familiar?",
        variant: "symptom"
      },
      {
        type: "list",
        content: "",
        items: [
          "Word-finding difficulties—the word is 'on the tip of your tongue' but won't come",
          "Difficulty organizing thoughts or tasks",
          "Losing track of what you were doing mid-task",
          "Trouble following conversations, especially in groups",
          "Reduced mental stamina—brain fatigue after cognitive work",
          "Difficulty making decisions, even simple ones",
          "Feeling overwhelmed by multi-step tasks",
          "Reduced ability to filter distractions",
          "Slower processing speed for complex information"
        ]
      },
      {
        type: "inline-cta",
        content: "If cognitive fog is affecting your daily life, comprehensive neurologic evaluation can identify the specific frontal systems that need rehabilitation."
      },
      {
        type: "heading",
        content: "Why Standard Testing Misses It"
      },
      {
        type: "paragraph",
        content: "Most cognitive screening after concussion uses brief, standardized tests administered in quiet rooms. But your frontal systems fail under real-world conditions—multiple demands, distractions, time pressure, and sustained effort. The gap between test performance and daily function is where frontal fog lives."
      },
      {
        type: "callout",
        content: "Passing a 10-minute cognitive screen doesn't mean your frontal systems can handle an 8-hour workday.",
        variant: "insight"
      },
      {
        type: "heading",
        content: "The Energy-Cognition Connection"
      },
      {
        type: "paragraph",
        content: "Frontal lobe function is metabolically expensive. These brain regions consume enormous amounts of energy. After concussion, when the brain's energy systems are compromised, the frontal lobes often bear the brunt. This is why cognitive fog is typically worse later in the day, after sustained mental effort, or when you're already fatigued."
      },
      {
        type: "paragraph",
        content: "Persistent visual processing strain often drives frontal system fatigue, making sustained thinking and focus difficult. As autonomic regulation becomes inefficient, mental stamina drops even faster under stress or cognitive demand."
      },
      {
        type: "heading",
        content: "How We Assess Frontal Function"
      },
      {
        type: "paragraph",
        content: "Our evaluation specifically challenges frontal systems under realistic conditions:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Sustained attention and cognitive endurance testing",
          "Working memory under increasing load",
          "Cognitive flexibility and task-switching",
          "Processing speed across multiple domains",
          "Executive function during divided attention",
          "Decision-making speed and accuracy under pressure"
        ]
      },
      {
        type: "paragraph",
        content: "This reveals the specific frontal system deficits that explain your daily struggles and guides targeted rehabilitation."
      },
      {
        type: "heading",
        content: "Rehabilitation Approaches"
      },
      {
        type: "paragraph",
        content: "Frontal system rehabilitation involves structured cognitive training that progressively challenges your capacity. This isn't generic 'brain games'—it's targeted intervention based on your specific deficit patterns."
      },
      {
        type: "paragraph",
        content: "Equally important is metabolic support: optimizing sleep, managing cognitive load throughout the day, and strategic rest periods. The goal is rebuilding frontal capacity while preventing the depletion that worsens function."
      },
      {
        type: "callout",
        content: "Cognitive fog doesn't have to be permanent. With targeted intervention, frontal function can be rebuilt—even months or years after injury.",
        variant: "insight"
      },
      {
        type: "paragraph",
        content: "At PPC, frontal fog is rarely treated in isolation—identifying which lower-level domains are overloading the executive system helps determine what to address first."
      }
    ],
    relatedArticles: [
      "visual-vestibular-mismatch",
      "autonomic-nervous-system-flow",
      "post-concussion-performance-decline",
      "concussion-energy-crisis-and-recovery"
    ],
    primaryCTA: {
      label: "Schedule Neurologic Evaluation",
      route: "/patient/concierge",
      description: "Identify what's driving your cognitive fog with comprehensive assessment."
    },
    secondaryCTA: {
      label: "Take the Concussion Self-Test",
      route: "/patient/self-tests/concussion",
      description: "Get an initial assessment of your cognitive symptoms."
    }
  },
  {
    slug: "concussion-energy-crisis-and-recovery",
    title: "Concussion Energy Crisis: Why Your Brain Runs Out of Fuel",
    category: "concussion",
    readTime: "10 min read",
    excerpt: "Understanding the metabolic disruption that makes everything exhausting after concussion.",
    heroContent: "You sleep eight hours and wake up exhausted. Simple tasks drain you. By afternoon, your brain feels like it's running on empty. This isn't depression or laziness—it's the metabolic energy crisis that follows concussion, and understanding it is the first step to recovery.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Brainstem",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When brainstem regulation becomes inefficient after concussion, secondary compensation often appears in the Autonomic and Frontal (Executive) domains—which is why energy availability drops, recovery slows, and even simple physical or cognitive tasks feel disproportionately exhausting."
      },
      {
        type: "heading",
        content: "The Brain's Energy Demands"
      },
      {
        type: "paragraph",
        content: "Your brain is only 2% of your body weight but consumes 20% of your energy. It's the most metabolically demanding organ you have. This energy comes from glucose and oxygen, processed through intricate cellular machinery that generates ATP—the fuel that powers every thought, every movement, every sensation."
      },
      {
        type: "paragraph",
        content: "After concussion, this energy system is disrupted at multiple levels. The result is a brain that can't meet its own energy demands—a metabolic crisis that explains why everything feels so exhausting."
      },
      {
        type: "heading",
        content: "What Happens During the Energy Crisis"
      },
      {
        type: "callout",
        content: "Concussion triggers a cascade of metabolic disruptions:",
        variant: "insight"
      },
      {
        type: "list",
        content: "",
        items: [
          "Ion imbalances that require extra energy to correct",
          "Mitochondrial dysfunction that reduces ATP production",
          "Altered blood flow regulation that limits fuel delivery",
          "Increased inflammation that diverts resources",
          "Impaired glucose metabolism at the cellular level"
        ]
      },
      {
        type: "paragraph",
        content: "The brain compensates by limiting activity—which is why rest helps initially. But the metabolic dysfunction can persist long after the acute phase resolves."
      },
      {
        type: "paragraph",
        content: "When the brainstem cannot regulate baseline energy efficiently, autonomic stability often breaks down, limiting endurance and recovery capacity. As energy availability drops, the frontal system fatigues quickly, making thinking and focus feel effortful even early in the day."
      },
      {
        type: "heading",
        content: "Recognizing Energy Crisis Symptoms"
      },
      {
        type: "callout",
        content: "The energy crisis manifests in predictable patterns:",
        variant: "symptom"
      },
      {
        type: "list",
        content: "",
        items: [
          "Fatigue that doesn't improve with rest",
          "Mental exhaustion after minimal cognitive work",
          "Physical exhaustion after minimal physical work",
          "Symptoms that worsen as the day progresses",
          "Need for frequent breaks during activities",
          "Recovery that requires hours or days after exertion",
          "Sleep that isn't restorative",
          "Brain fog that appears when 'fuel' runs low"
        ]
      },
      {
        type: "inline-cta",
        content: "If fatigue is your dominant symptom, understanding your metabolic status is essential for recovery planning."
      },
      {
        type: "heading",
        content: "The Boom-Bust Cycle"
      },
      {
        type: "paragraph",
        content: "Many people with post-concussion energy crisis fall into a destructive pattern: feeling relatively good, overdoing it, then crashing and spending days recovering. Each cycle can worsen overall function and delay recovery."
      },
      {
        type: "callout",
        content: "Breaking the boom-bust cycle requires understanding your actual energy capacity—not your perceived capacity or your pre-injury capacity.",
        variant: "insight"
      },
      {
        type: "heading",
        content: "How We Assess Metabolic Function"
      },
      {
        type: "paragraph",
        content: "Our evaluation includes:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Graded exertion testing to identify symptom thresholds",
          "Heart rate variability analysis",
          "Autonomic function testing",
          "Cognitive load testing to measure mental energy capacity",
          "Recovery pattern assessment"
        ]
      },
      {
        type: "paragraph",
        content: "This reveals your current metabolic capacity and guides pacing strategies and progressive loading protocols."
      },
      {
        type: "heading",
        content: "Rebuilding Energy Capacity"
      },
      {
        type: "paragraph",
        content: "Recovery from metabolic crisis involves carefully calibrated challenge. Too little stimulus and systems don't adapt. Too much and you trigger the crash cycle. The key is finding your threshold and systematically expanding it."
      },
      {
        type: "paragraph",
        content: "Treatment typically involves:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Sub-symptom threshold aerobic exercise (Buffalo Protocol)",
          "Strategic cognitive loading with planned recovery",
          "Sleep optimization for metabolic restoration",
          "Nutritional support for energy production",
          "Pacing strategies for daily function"
        ]
      },
      {
        type: "callout",
        content: "The energy crisis resolves when metabolic systems recover—but this requires intentional rehabilitation, not just time.",
        variant: "insight"
      },
      {
        type: "paragraph",
        content: "At PPC, restoring energy availability begins with identifying whether brainstem regulation is the primary driver—rather than pushing conditioning or rest alone."
      }
    ],
    relatedArticles: [
      "frontal-system-fog-after-concussion",
      "autonomic-nervous-system-flow",
      "post-concussion-performance-decline"
    ],
    primaryCTA: {
      label: "Schedule Neurologic Evaluation",
      route: "/patient/concierge",
      description: "Assess your metabolic function and create a recovery plan."
    },
    secondaryCTA: {
      label: "Take the Concussion Self-Test",
      route: "/patient/self-tests/concussion",
      description: "Get an initial assessment of your energy and fatigue symptoms."
    }
  }
];

// ============================================
// PEDIATRIC CLUSTER ARTICLES
// ============================================

export const pediatricArticles: ArticleData[] = [
  {
    slug: "pediatric-concussion-care",
    title: "Pediatric Concussion Care: What Parents Need to Know",
    category: "pediatric",
    readTime: "11 min read",
    excerpt: "Understanding how concussions affect developing brains and why specialized pediatric care matters.",
    heroContent: "Children are not small adults—their brains are still developing, and concussion affects them differently. If your child's concussion symptoms aren't resolving, specialized neurologic evaluation can identify what's driving the persistent problems.",
    sections: [
      {
        type: "heading",
        content: "Why Pediatric Concussion Is Different"
      },
      {
        type: "paragraph",
        content: "The developing brain has different vulnerabilities and different recovery patterns than the adult brain. Children may struggle to articulate their symptoms. Academic and social demands create unique challenges. And the stakes are high—unresolved symptoms can affect school performance, social development, and long-term brain health."
      },
      {
        type: "callout",
        content: "Children with persistent concussion symptoms deserve specialized evaluation that accounts for developmental factors.",
        variant: "insight"
      },
      {
        type: "heading",
        content: "Signs Your Child May Need Further Evaluation"
      },
      {
        type: "callout",
        content: "Watch for these indicators that recovery isn't progressing normally:",
        variant: "symptom"
      },
      {
        type: "list",
        content: "",
        items: [
          "Symptoms persisting beyond 2-4 weeks",
          "Declining academic performance",
          "Avoiding activities they used to enjoy",
          "Increased irritability or emotional changes",
          "Headaches that aren't improving",
          "Sleep changes—too much, too little, or unrefreshing",
          "Light or sound sensitivity",
          "Difficulty concentrating in class",
          "Balance or coordination problems"
        ]
      },
      {
        type: "heading",
        content: "The Developing Brain's Unique Challenges"
      },
      {
        type: "paragraph",
        content: "Children's brains are actively building and refining neural connections. This plasticity can aid recovery, but it also means that disrupted development during a critical window can have lasting effects. Early identification and appropriate intervention are essential."
      },
      {
        type: "inline-cta",
        content: "If your child is struggling with persistent symptoms, comprehensive neurologic evaluation can provide answers."
      },
      {
        type: "heading",
        content: "School Accommodations and Academic Support"
      },
      {
        type: "paragraph",
        content: "Many children with persistent post-concussion symptoms need temporary academic accommodations. Our evaluation provides documentation and specific recommendations for:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Extended time on tests and assignments",
          "Reduced screen time and visual demands",
          "Rest breaks during the school day",
          "Modified physical education participation",
          "Quiet testing environments"
        ]
      },
      {
        type: "heading",
        content: "Return to Learn Before Return to Play"
      },
      {
        type: "paragraph",
        content: "For student athletes, cognitive recovery should precede physical recovery. The brain needs to handle academic demands before it's asked to handle the additional load of sports participation. We guide families through appropriate staging of return to both school and sport."
      },
      {
        type: "heading",
        content: "When to Seek Specialized Care"
      },
      {
        type: "paragraph",
        content: "If your child's symptoms have persisted beyond the expected recovery window, or if they're struggling despite following standard concussion protocols, specialized neurologic evaluation can identify what's being missed."
      },
      {
        type: "callout",
        content: "Most pediatric concussions resolve with appropriate rest and graduated return. When they don't, specific systems are usually struggling—and those systems can be identified and treated.",
        variant: "insight"
      }
    ],
    relatedArticles: [
      "post-concussion-performance-decline",
      "visual-vestibular-mismatch",
      "cerebellar-timing-and-coordination"
    ],
    primaryCTA: {
      label: "Schedule Pediatric Evaluation",
      route: "/patient/concierge",
      description: "Get answers about your child's persistent concussion symptoms."
    },
    secondaryCTA: {
      label: "Take the Concussion Self-Test",
      route: "/patient/self-tests/concussion"
    }
  }
];

// ============================================
// ATHLETE CLUSTER ARTICLES
// ============================================

export const athleteArticles: ArticleData[] = [
  {
    slug: "neuro-athlete-recovery",
    title: "Neuro-Athlete Recovery: Returning to Peak Performance After Concussion",
    category: "athlete",
    readTime: "10 min read",
    excerpt: "Why athletes often struggle with post-concussion performance and how neurologic evaluation guides full recovery.",
    heroContent: "You've been cleared to play. But you're not the same athlete you were before. Reaction time is off. Decision-making under pressure has slowed. You fatigue faster than teammates. This isn't about effort or mental toughness—it's about brain function that hasn't fully recovered.",
    sections: [
      {
        type: "heading",
        content: "The Athlete's Concussion Challenge"
      },
      {
        type: "paragraph",
        content: "Athletic performance demands the highest levels of neurologic function—millisecond reaction times, precise coordination, rapid decision-making, and sustained energy output. These are exactly the functions most affected by concussion. Standard return-to-play protocols verify that basic symptoms have resolved, not that peak performance capacity has returned."
      },
      {
        type: "callout",
        content: "Being medically cleared to play is not the same as being ready to perform at your pre-injury level.",
        variant: "insight"
      },
      {
        type: "heading",
        content: "Signs Your Neurologic Function Hasn't Fully Recovered"
      },
      {
        type: "callout",
        content: "Athletes often report:",
        variant: "symptom"
      },
      {
        type: "list",
        content: "",
        items: [
          "Slower reaction time in game situations",
          "Difficulty reading the field/court/ice quickly",
          "Delayed processing of plays and patterns",
          "Fatigue that comes on faster than before",
          "Reduced endurance that doesn't improve with conditioning",
          "Feeling \"off\" even when symptom-free at rest",
          "Decreased confidence in performance situations",
          "Less precise motor control"
        ]
      },
      {
        type: "heading",
        content: "What We Assess in Athletes"
      },
      {
        type: "paragraph",
        content: "Our neurologic evaluation for athletes specifically tests the high-level functions that athletic performance requires:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Reaction time and rate of force development",
          "Visual processing speed and eye movement control",
          "Vestibular function under dynamic conditions",
          "Cerebellar timing and coordination precision",
          "Autonomic response to exertion",
          "Cognitive-motor integration under load"
        ]
      },
      {
        type: "inline-cta",
        content: "This evaluation reveals whether you're truly ready to perform—not just ready to participate."
      },
      {
        type: "heading",
        content: "The Sub-Threshold Problem"
      },
      {
        type: "paragraph",
        content: "Many athletes are symptom-free at rest but experience performance degradation under the demands of competition. Standard protocols don't test at these intensities. Our evaluation specifically challenges the systems under sport-relevant conditions."
      },
      {
        type: "heading",
        content: "Targeted Return-to-Performance Protocols"
      },
      {
        type: "paragraph",
        content: "Based on evaluation findings, we develop targeted rehabilitation that addresses your specific deficits. This isn't generic \"vestibular therapy\" or \"cognitive rest\"—it's precisely dosed training for the systems that are limiting your performance."
      },
      {
        type: "callout",
        content: "The goal isn't just returning to play—it's returning to your pre-injury performance level or better.",
        variant: "insight"
      },
      {
        type: "heading",
        content: "Career Longevity and Brain Health"
      },
      {
        type: "paragraph",
        content: "Ensuring full neurologic recovery before resuming high-level competition isn't just about current performance—it's about long-term brain health. Returning to contact sports before full recovery increases risk of subsequent injury and cumulative effects."
      }
    ],
    relatedArticles: [
      "post-concussion-performance-decline",
      "cerebellar-timing-and-coordination",
      "autonomic-nervous-system-flow"
    ],
    primaryCTA: {
      label: "Schedule Athletic Evaluation",
      route: "/patient/concierge",
      description: "Assess your readiness to return to peak performance."
    },
    secondaryCTA: {
      label: "Take the Concussion Self-Test",
      route: "/patient/self-tests/concussion"
    }
  }
];

// ============================================
// MSK CLUSTER ARTICLES
// ============================================

export const mskArticles: ArticleData[] = [
  {
    slug: "motor-timing-deficits",
    title: "Motor Timing Deficits: When Your Body Can't Fire in the Right Sequence",
    category: "msk",
    readTime: "7 min read",
    excerpt: "Pain can persist even when imaging looks normal—because the issue may be timing. When muscles fire late or out of sequence, joints and tissues absorb load they were never designed to handle.",
    heroContent: "If you've been told \"everything looks fine,\" but your body still feels off—weak, unstable, or painful with movement—you're not alone. In many persistent MSK cases, the real problem isn't damage. It's timing.",
    sections: [
      {
        type: "callout",
        variant: "insight",
        content: "Pain isn't always a sign of damage. Sometimes it's a sign your nervous system is struggling to coordinate movement under real-world load."
      },
      { type: "heading", content: "What Is a Motor Timing Deficit?" },
      {
        type: "paragraph",
        content: "A motor timing deficit occurs when the nervous system fails to activate the right muscles at the right time. Even small timing delays can change how force is distributed across a joint—creating overload, compensations, and repeated flare-ups."
      },
      {
        type: "paragraph",
        content: "This often shows up after injury, after prolonged pain, or when your body has learned protective movement strategies. The result can be a pattern where movement is technically possible, but inefficient—like a car that drives with misfiring cylinders."
      },
      { type: "heading", content: "Recognizing the Signs" },
      {
        type: "callout",
        variant: "symptom",
        content: "Motor timing issues often feel like instability, fatigue, or inconsistency—especially under speed, load, or endurance demand."
      },
      {
        type: "list",
        content: "",
        items: [
          "Pain that flares with activity but calms with rest—then returns",
          "Feeling \"unstable\" or \"not supported\" in a joint (knee, hip, shoulder, back)",
          "Early fatigue with simple tasks (stairs, jogging, lifting, prolonged standing)",
          "Muscles that feel tight or overworked after small amounts of movement",
          "A sense that your body \"can't find the groove\" or moves differently day to day",
          "Recurring strains or \"tweaks\" without a clear new injury"
        ]
      },
      {
        type: "inline-cta",
        content: "If this pattern feels familiar, an evaluation focused on motor control and timing can identify what standard imaging and exams often miss."
      },
      { type: "heading", content: "Why Standard Care Misses It" },
      {
        type: "paragraph",
        content: "Standard MSK care often focuses on structure: joints, tissues, and imaging findings. But timing deficits live in the control system—how your brain and nervous system coordinate force, sequencing, and stabilization. A normal MRI can coexist with a very real movement-control problem."
      },
      {
        type: "callout",
        variant: "insight",
        content: "When the control system is the bottleneck, strengthening alone may not solve it—because strength without timing can reinforce compensation."
      },
      { type: "heading", content: "How We Evaluate" },
      {
        type: "list",
        content: "",
        items: [
          "Movement sequencing screens (how you coordinate multi-joint tasks)",
          "Single-leg and dynamic stability testing (force absorption and control)",
          "Reaction-time and rapid stabilization demands (when appropriate)",
          "Fatigue-based testing to reveal breakdown patterns",
          "Outcome measures to track functional change over time"
        ]
      },
      { type: "heading", content: "Treatment Approach" },
      {
        type: "paragraph",
        content: "Treatment focuses on restoring efficient sequencing and stabilization—not just reducing pain. That may include targeted neuromuscular training, graded load exposure, and precision drills that rebuild timing under realistic movement demands."
      },
      {
        type: "paragraph",
        content: "As timing improves, load distribution normalizes. Many patients notice fewer flare-ups, better endurance, and a more stable, confident movement pattern."
      },
      {
        type: "callout",
        variant: "insight",
        content: "The goal isn't to \"push through\" pain. The goal is to restore control so the same activity no longer creates overload."
      }
    ],
    relatedArticles: [
      "movement-asymmetry",
      "chronic-pain-without-structural-damage",
      "post-injury-performance-loss"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Identify whether motor timing and sequencing are driving your pain, instability, or recurring flare-ups."
    },
    secondaryCTA: {
      label: "Take MSK Self-Assessment",
      route: "/patient/self-tests/msk"
    }
  },
  {
    slug: "movement-asymmetry",
    title: "Movement Asymmetry: When One Side Quietly Does More Work",
    category: "msk",
    readTime: "6 min read",
    excerpt: "Asymmetry isn't just a strength issue—it's often a control issue. When one side compensates, tissues overload and performance drops even if imaging looks normal.",
    heroContent: "You may not feel weak—but you might feel uneven. Many people with chronic pain or recurring injury develop a subtle shift where one side carries more load, stabilizes more, and tires faster.",
    sections: [
      {
        type: "callout",
        variant: "insight",
        content: "Your body is brilliant at adapting. The problem is that long-term compensation can become the reason pain persists."
      },
      { type: "heading", content: "What Is Movement Asymmetry?" },
      {
        type: "paragraph",
        content: "Movement asymmetry means the left and right sides are not sharing load equally during tasks like walking, squatting, running, lifting, or even standing. This can develop after injury, surgery, repeated strains, or long periods of pain-driven guarding."
      },
      {
        type: "paragraph",
        content: "Over time, the stronger or more stable side becomes the default. The compensating side may feel tight, sore, or overworked—while the under-contributing side becomes less coordinated and less reliable."
      },
      { type: "heading", content: "Common Signs" },
      {
        type: "callout",
        variant: "symptom",
        content: "Asymmetry often shows up as 'one-sided fatigue' or recurring discomfort that seems to move around."
      },
      {
        type: "list",
        content: "",
        items: [
          "One hip, knee, shoulder, or low back side always feels tighter",
          "Pain that alternates locations depending on activity",
          "You shift weight to one side without realizing it",
          "One leg feels weaker during stairs, lunges, or running",
          "Recurrent strains on the same side (hamstring, calf, groin, shoulder)",
          "You feel 'crooked' after workouts or long days"
        ]
      },
      {
        type: "inline-cta",
        content: "A targeted evaluation can identify where asymmetry is coming from—and which system is driving the compensation."
      },
      { type: "heading", content: "Why Standard Care Misses It" },
      {
        type: "paragraph",
        content: "Many exams assess a body part in isolation. But asymmetry is a systems problem—coordination, timing, balance, and load tolerance. If the root issue is neurologic control, treating only the painful area can provide short-term relief without restoring symmetry."
      },
      {
        type: "callout",
        variant: "insight",
        content: "If the nervous system trusts one side more, it will keep choosing that side—until we retrain stability and control on the other."
      },
      { type: "heading", content: "How We Evaluate" },
      {
        type: "list",
        content: "",
        items: [
          "Side-to-side comparisons during functional tasks (squat, hinge, step-down)",
          "Single-leg stability and force absorption testing",
          "Balance and coordination screens under fatigue",
          "Movement efficiency and sequencing checks",
          "Outcome measures to track progress objectively over time"
        ]
      },
      { type: "heading", content: "Treatment Approach" },
      {
        type: "paragraph",
        content: "Treatment targets the driver of compensation and rebuilds symmetry through precision loading, neuromuscular retraining, and graded exposure. The goal is to restore trust and capacity on the under-performing side—so the body doesn't have to cheat."
      },
      {
        type: "callout",
        variant: "insight",
        content: "When symmetry returns, many people notice pain becomes less 'random,' endurance improves, and movement feels smoother and more confident."
      }
    ],
    relatedArticles: [
      "motor-timing-deficits",
      "chronic-pain-without-structural-damage",
      "post-injury-performance-loss"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Find out whether asymmetry and compensation are overloading your joints and limiting recovery."
    },
    secondaryCTA: {
      label: "Take MSK Self-Assessment",
      route: "/patient/self-tests/msk"
    }
  },
  {
    slug: "chronic-pain-without-structural-damage",
    title: "Chronic Pain Without Structural Damage: When Imaging Is Normal but Pain Isn't",
    category: "msk",
    readTime: "8 min read",
    excerpt: "Normal imaging doesn't mean normal function. Chronic pain can persist when the nervous system remains protective—altering timing, load tolerance, and sensitivity.",
    heroContent: "It can be deeply frustrating to hear, \"Your MRI looks fine,\" when pain is still limiting your life. The good news is that this pattern is common—and it often points toward a functional problem in how your nervous system is regulating movement and sensitivity.",
    sections: [
      {
        type: "callout",
        variant: "insight",
        content: "You don't need a scary scan to have real pain. Pain is a protective output—and protection can stay on long after tissues have healed."
      },
      { type: "heading", content: "What Does 'Normal Imaging' Actually Mean?" },
      {
        type: "paragraph",
        content: "Imaging can be extremely helpful for identifying fractures, tears, severe degeneration, or other structural problems. But many pain conditions are driven by factors that don't show up on scans—like timing deficits, load intolerance, persistent guarding, altered coordination, or heightened sensitivity in the nervous system."
      },
      {
        type: "paragraph",
        content: "In other words: structure can look fine while function is still impaired."
      },
      { type: "heading", content: "Common Signs" },
      {
        type: "callout",
        variant: "symptom",
        content: "These patterns often suggest a protective nervous system state rather than a new injury."
      },
      {
        type: "list",
        content: "",
        items: [
          "Pain that changes location or quality without a new injury",
          "Pain that spikes with stress, poor sleep, or fatigue",
          "A sense of stiffness, guarding, or 'bracing' during movement",
          "Flare-ups after activity that used to be easy",
          "Sensitivity to load, impact, or prolonged positions",
          "Feeling weaker or less coordinated than expected"
        ]
      },
      {
        type: "inline-cta",
        content: "If your scans are normal but your function isn't, the next step is a functional evaluation—not more guessing."
      },
      { type: "heading", content: "Why Standard Care Misses It" },
      {
        type: "paragraph",
        content: "When imaging is reassuring, care can drift toward rest, generic strengthening, or symptom management. Those can help—but if the primary limiter is the nervous system's control and tolerance, the plan must address movement coordination, load progression, and sensitivity patterns in a structured way."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Pain relief isn't the only goal. Restoring trust, tolerance, and control is what makes relief hold."
      },
      { type: "heading", content: "How We Evaluate" },
      {
        type: "list",
        content: "",
        items: [
          "Functional movement assessment under realistic load",
          "Motor control and sequencing screens",
          "Balance and stability testing when appropriate",
          "Fatigue-based testing to reveal breakdown patterns",
          "Validated outcome measures to track meaningful change over time"
        ]
      },
      { type: "heading", content: "Treatment Approach" },
      {
        type: "paragraph",
        content: "Treatment focuses on restoring function progressively: improving movement efficiency, rebuilding load tolerance, and reducing protective guarding through graded exposure and precision training. The goal is to help the nervous system re-learn that movement is safe and controllable."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Many patients improve when care shifts from 'find the damage' to 'rebuild the system that controls movement.'"
      }
    ],
    relatedArticles: [
      "motor-timing-deficits",
      "movement-asymmetry",
      "post-injury-performance-loss"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Get a functional, neurologic MSK assessment when imaging doesn't match your lived experience."
    },
    secondaryCTA: {
      label: "Take MSK Self-Assessment",
      route: "/patient/self-tests/msk"
    }
  },
  {
    slug: "post-injury-performance-loss",
    title: "Post-Injury Performance Loss: When You're 'Healed' but Not the Same",
    category: "msk",
    readTime: "7 min read",
    excerpt: "You can be cleared and still underperform. Post-injury performance loss often reflects timing delays, compensation, and reduced load tolerance—especially under speed, fatigue, and sport demand.",
    heroContent: "Many athletes and active adults reach a confusing stage after injury: you're cleared, your scans are fine, and you can train—but you don't feel like yourself. Speed, confidence, endurance, and explosiveness don't return the way you expected.",
    sections: [
      {
        type: "callout",
        variant: "insight",
        content: "Being 'cleared' usually means you're safe from major structural risk. It does not always mean your system is ready for full performance demands."
      },
      { type: "heading", content: "What Is Post-Injury Performance Loss?" },
      {
        type: "paragraph",
        content: "Post-injury performance loss describes a persistent gap between what your body can technically do and what it can do efficiently under real intensity. This often stems from compensation patterns, delayed stabilization, reduced force absorption, or fatigue-driven breakdown."
      },
      {
        type: "paragraph",
        content: "The body may protect the previously injured area by shifting load elsewhere. Over time, that can limit speed and power—and increase the risk of secondary issues."
      },
      { type: "heading", content: "Recognizing the Signs" },
      {
        type: "callout",
        variant: "symptom",
        content: "Performance loss is often revealed under speed, fatigue, reaction, and complexity—not during basic strength tests."
      },
      {
        type: "list",
        content: "",
        items: [
          "You can train, but you can't reach your previous intensity or pace",
          "You fatigue earlier than expected or feel 'heavy' during movement",
          "Confidence is low during cutting, landing, sprinting, or lifting",
          "You avoid certain positions without realizing it",
          "New aches appear in other areas (hip, back, opposite knee/ankle)",
          "Performance drops most under fatigue or high-speed demands"
        ]
      },
      {
        type: "inline-cta",
        content: "If you feel 'cleared but not ready,' the next step is testing that matches real performance demand—not just basic strength."
      },
      { type: "heading", content: "Why Standard Care Misses It" },
      {
        type: "paragraph",
        content: "Traditional rehab often focuses on pain reduction and basic strength milestones. Those matter—but performance requires timing, sequencing, and force absorption under reactive conditions. If those aren't tested, the gap can persist even when the injury is healed."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Performance is a coordination problem as much as a strength problem—especially under fatigue and speed."
      },
      { type: "heading", content: "How We Evaluate" },
      {
        type: "list",
        content: "",
        items: [
          "Force absorption and landing mechanics under progressive demand",
          "Side-to-side symmetry during sport-relevant tasks",
          "Sequencing and stabilization timing screens",
          "Fatigue-based testing to reveal performance breakdown",
          "Outcome measures to quantify return-to-function progress"
        ]
      },
      { type: "heading", content: "Treatment Approach" },
      {
        type: "paragraph",
        content: "Treatment is built around restoring readiness: improving timing, symmetry, and force control under progressive load. This often includes precision neuromuscular drills, graded exposure to speed and impact, and structured progressions that rebuild confidence through measurable milestones."
      },
      {
        type: "callout",
        variant: "insight",
        content: "The goal is not just to return to activity—it's to return to performance with stability, endurance, and trust in your body."
      }
    ],
    relatedArticles: [
      "motor-timing-deficits",
      "movement-asymmetry",
      "chronic-pain-without-structural-damage"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Identify the performance limiter—timing, symmetry, force absorption, or fatigue breakdown—and build a clear return plan."
    },
    secondaryCTA: {
      label: "Take MSK Self-Assessment",
      route: "/patient/self-tests/msk"
    }
  },
  {
    slug: "asymmetric-loading",
    title: "Asymmetric Loading: When One Side Absorbs More Than Its Share",
    category: "msk",
    readTime: "6 min read",
    excerpt: "Asymmetric loading occurs when one side of the body consistently absorbs more force than the other—often without pain at first. Over time, this imbalance can drive chronic pain, fatigue, and recurring injury.",
    heroContent: "You may not notice it in the mirror, but your body might be loading one side more than the other with every step, lift, or landing. Over time, that quiet imbalance can wear tissues down and limit performance.",
    sections: [
      {
        type: "callout",
        variant: "insight",
        content: "Your body will always choose the path of least resistance. If one side feels more stable or predictable, it will quietly do more work."
      },
      { type: "heading", content: "What Is Asymmetric Loading?" },
      {
        type: "paragraph",
        content: "Asymmetric loading refers to a pattern where force is distributed unevenly between the left and right sides of the body. This often develops after injury, pain, or prolonged compensation—even when strength appears equal on basic testing."
      },
      {
        type: "paragraph",
        content: "The nervous system prioritizes stability and predictability. If one side feels safer, it will be favored during movement, causing the other side to contribute less over time."
      },
      { type: "heading", content: "Common Signs" },
      {
        type: "callout",
        variant: "symptom",
        content: "Asymmetric loading often shows up as recurring pain or fatigue on the same side of the body."
      },
      {
        type: "list",
        content: "",
        items: [
          "Recurring pain on one side (hip, knee, ankle, shoulder, or back)",
          "One leg or arm fatigues faster during workouts",
          "Feeling stronger or more stable on one side",
          "Shoes wearing unevenly over time",
          "Discomfort that appears after longer activity, not immediately",
          "Recurrent overuse injuries without a clear cause"
        ]
      },
      {
        type: "inline-cta",
        content: "If one side always seems to take the hit, a targeted evaluation can identify why your body keeps choosing that strategy."
      },
      { type: "heading", content: "Why Standard Care Misses It" },
      {
        type: "paragraph",
        content: "Many assessments focus on strength or range of motion in isolation. But asymmetric loading is a coordination and control issue—how force is managed dynamically during movement. These patterns often only appear during functional or fatigue-based testing."
      },
      {
        type: "callout",
        variant: "insight",
        content: "You can be strong on both sides and still load one side far more during real movement."
      },
      { type: "heading", content: "How We Evaluate" },
      {
        type: "list",
        content: "",
        items: [
          "Side-to-side force absorption during functional tasks",
          "Single-leg and unilateral loading assessments",
          "Dynamic balance and stability testing",
          "Movement sequencing under progressive demand",
          "Outcome measures to track symmetry over time"
        ]
      },
      { type: "heading", content: "Treatment Approach" },
      {
        type: "paragraph",
        content: "Treatment focuses on restoring balanced force distribution by improving control, confidence, and timing on the underperforming side. As symmetry improves, tissues are no longer overloaded—and pain and fatigue often decrease."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Balanced loading reduces wear and tear—not by forcing symmetry, but by restoring trust in both sides."
      }
    ],
    relatedArticles: [
      "movement-asymmetry",
      "motor-timing-deficits",
      "post-injury-performance-loss"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Identify whether asymmetric loading is driving recurring pain, fatigue, or overuse injury."
    },
    secondaryCTA: {
      label: "Take MSK Self-Assessment",
      route: "/patient/self-tests/msk"
    }
  },
  {
    slug: "movement-heaviness-early-fatigue",
    title: "Movement Heaviness & Early Fatigue: When Simple Tasks Feel Harder Than They Should",
    category: "msk",
    readTime: "7 min read",
    excerpt: "Feeling heavy or fatigued early during activity is often a control and efficiency issue—not a conditioning problem. When timing and load management break down, effort skyrockets.",
    heroContent: "If everyday movement feels heavier than it used to—stairs, walking, light workouts—you may be dealing with a neurologic efficiency problem rather than weakness or poor fitness.",
    sections: [
      {
        type: "callout",
        variant: "insight",
        content: "Fatigue isn't always about endurance. Sometimes it's about how efficiently your nervous system coordinates movement."
      },
      { type: "heading", content: "What Causes Movement Heaviness?" },
      {
        type: "paragraph",
        content: "Movement heaviness often reflects inefficiency in how force is generated, absorbed, and transferred. When timing is off or stabilization is delayed, muscles work harder than necessary to complete simple tasks."
      },
      {
        type: "paragraph",
        content: "This can develop after injury, prolonged pain, or periods of reduced activity—and it often persists even when strength and conditioning return."
      },
      { type: "heading", content: "Common Signs" },
      {
        type: "callout",
        variant: "symptom",
        content: "Heaviness and early fatigue usually appear first during sustained or repetitive activity."
      },
      {
        type: "list",
        content: "",
        items: [
          "Legs or arms feel heavy early during walks or workouts",
          "Needing frequent breaks during simple tasks",
          "Fatigue that doesn't match your fitness level",
          "Movement feels effortful rather than smooth",
          "Symptoms worsen with speed or repetition",
          "Recovery takes longer than expected after activity"
        ]
      },
      {
        type: "inline-cta",
        content: "When effort feels disproportionate to activity, a neurologic MSK evaluation can reveal where efficiency is being lost."
      },
      { type: "heading", content: "Why Standard Care Misses It" },
      {
        type: "paragraph",
        content: "Heaviness and fatigue are often attributed to deconditioning, age, or motivation. But if the nervous system is coordinating movement inefficiently, endurance training alone can reinforce fatigue rather than resolve it."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Improving efficiency often reduces fatigue faster than simply trying to 'get in better shape.'"
      },
      { type: "heading", content: "How We Evaluate" },
      {
        type: "list",
        content: "",
        items: [
          "Movement efficiency and sequencing assessments",
          "Stability testing under sustained demand",
          "Fatigue-based movement screens",
          "Side-to-side contribution analysis",
          "Validated outcome measures to track functional endurance"
        ]
      },
      { type: "heading", content: "Treatment Approach" },
      {
        type: "paragraph",
        content: "Treatment targets efficiency first—improving timing, coordination, and load sharing—before layering endurance. As movement becomes more economical, fatigue often decreases and confidence returns."
      },
      {
        type: "callout",
        variant: "insight",
        content: "When movement costs less energy, endurance improves without forcing volume."
      }
    ],
    relatedArticles: [
      "motor-timing-deficits",
      "movement-asymmetry",
      "chronic-pain-without-structural-damage"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Determine whether neurologic efficiency—not conditioning—is limiting your endurance and recovery."
    },
    secondaryCTA: {
      label: "Take MSK Self-Assessment",
      route: "/patient/self-tests/msk"
    }
  }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getAllArticles = (): ArticleData[] => {
  return [...concussionArticles, ...pediatricArticles, ...athleteArticles, ...mskArticles];
};

export const getArticleBySlug = (category: string, slug: string): ArticleData | undefined => {
  const allArticles = getAllArticles();
  return allArticles.find(article => article.category === category && article.slug === slug);
};

export const getArticlesByCategory = (category: string): ArticleData[] => {
  const allArticles = getAllArticles();
  return allArticles.filter(article => article.category === category);
};

export const getRelatedArticles = (article: ArticleData): ArticleData[] => {
  const allArticles = getAllArticles();
  return article.relatedArticles
    .map(slug => allArticles.find(a => a.slug === slug))
    .filter((a): a is ArticleData => a !== undefined);
};

// Category metadata for the articles index
export const articleCategories = [
  {
    slug: "concussion",
    name: "Concussion Recovery",
    description: "Understanding persistent post-concussion symptoms and the path to recovery",
    articles: concussionArticles
  },
  {
    slug: "pediatric",
    name: "Pediatric Care",
    description: "Specialized care for developing brains after concussion",
    articles: pediatricArticles
  },
  {
    slug: "athlete",
    name: "Athlete Recovery",
    description: "Returning to peak performance after neurologic injury",
    articles: athleteArticles
  },
  {
    slug: "msk",
    name: "Musculoskeletal",
    description: "Neuromuscular drivers of chronic pain and movement dysfunction",
    articles: mskArticles
  }
];
