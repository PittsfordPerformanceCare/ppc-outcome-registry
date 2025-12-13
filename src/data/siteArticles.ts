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
  },
  {
    slug: "limbic-overload-after-concussion",
    title: "Limbic Overload After Concussion: When the Brain Stays in Threat Mode",
    category: "concussion",
    readTime: "9 min read",
    excerpt: "Understanding why symptoms amplify, tolerance collapses, and recovery feels fragile—even when everything should be better.",
    heroContent: "You startle easily. Crowds feel threatening. Stress that used to be manageable now overwhelms you. Recovery feels fragile—one bad day and you're back to square one. This isn't anxiety or weakness. It's limbic overload, and it's one of the most misunderstood consequences of concussion.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Limbic–Prefrontal",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When limbic threat regulation becomes overactive after concussion, secondary overload often appears in the Frontal (Executive) and Autonomic domains—which is why stress tolerance collapses and symptoms escalate quickly under pressure."
      },
      {
        type: "heading",
        content: "Recognizing Limbic Overload"
      },
      {
        type: "callout",
        content: "Do any of these experiences sound familiar?",
        variant: "symptom"
      },
      {
        type: "list",
        content: "",
        items: [
          "Heightened anxiety or sense of dread that appeared after injury",
          "Feeling 'on edge' or unsafe in environments that used to feel normal",
          "Symptoms flaring with stress, noise, crowds, or time pressure",
          "Recovery that feels fragile or unpredictable",
          "Emotional responses that feel disproportionate to the situation",
          "Difficulty calming down once activated",
          "Avoiding situations that might trigger symptoms"
        ]
      },
      {
        type: "paragraph",
        content: "These experiences are common after concussion. They are neurologic, not psychological weakness. And they are treatable once properly understood."
      },
      {
        type: "heading",
        content: "What the Limbic–Prefrontal System Does"
      },
      {
        type: "paragraph",
        content: "Your limbic system is the brain's threat detection center. It constantly scans your environment and internal state for danger. When it detects threat, it activates protective responses—increased alertness, heightened vigilance, preparation for action."
      },
      {
        type: "paragraph",
        content: "Your prefrontal cortex modulates this response. It evaluates whether the threat is real, inhibits overreaction, and helps you return to calm. Together, these systems regulate emotional stability, confidence, and your capacity to tolerate stress."
      },
      {
        type: "heading",
        content: "What Changes After Concussion"
      },
      {
        type: "paragraph",
        content: "Concussion can shift this balance. The limbic system becomes sensitized—detecting threat where none exists. The prefrontal cortex loses some of its inhibitory control. The result is a nervous system biased toward protection."
      },
      {
        type: "callout",
        content: "The brain becomes overly protective. The margin for stress narrows. Normal demands feel risky.",
        variant: "insight"
      },
      {
        type: "paragraph",
        content: "This isn't irrational fear—it's a neurologic shift in how your brain assesses safety. The threshold for triggering protective responses has lowered, and the capacity to calm those responses has diminished."
      },
      {
        type: "heading",
        content: "How Limbic Overload Amplifies Symptoms"
      },
      {
        type: "paragraph",
        content: "Limbic dysregulation doesn't create symptoms out of nowhere. It amplifies existing neurologic strain. When other systems are struggling, limbic overload makes everything worse."
      },
      {
        type: "list",
        content: "",
        items: [
          "Vestibular instability triggers limbic threat detection, escalating dizziness into panic",
          "Autonomic strain activates limbic vigilance, amplifying fatigue and reducing endurance",
          "Cognitive load creates limbic stress, causing frontal shutdown and brain fog",
          "Visual processing strain feels threatening, making busy environments unbearable"
        ]
      },
      {
        type: "paragraph",
        content: "Persistent autonomic strain often keeps the limbic system on high alert, reducing stress tolerance and making recovery feel unstable. Similarly, visual processing difficulties can trigger threat responses in environments that should feel safe."
      },
      {
        type: "heading",
        content: "Primary vs Secondary Limbic Dysfunction"
      },
      {
        type: "paragraph",
        content: "This distinction is critical: limbic overload is often secondary, not primary. The brain enters threat mode because other neurologic systems are unstable. The limbic system is responding appropriately to a nervous system that genuinely feels unsafe."
      },
      {
        type: "callout",
        content: "Treating limbic symptoms alone rarely works if upstream neurologic drivers remain unresolved.",
        variant: "insight"
      },
      {
        type: "paragraph",
        content: "When vestibular function is unreliable, when autonomic regulation is unstable, when visual processing is inefficient—the limbic system has good reason to stay vigilant. Calming the limbic response requires stabilizing the systems that are triggering it."
      },
      {
        type: "heading",
        content: "Why This Is Often Misinterpreted as Anxiety"
      },
      {
        type: "paragraph",
        content: "The symptoms of limbic overload closely resemble anxiety: heightened vigilance, avoidance, difficulty calming down, sense of dread. It's understandable that these experiences get labeled as psychological."
      },
      {
        type: "paragraph",
        content: "But this framing is incomplete. Limbic overload after concussion reflects altered neurologic regulation, not a mental health condition. The nervous system has shifted into a protective state because of real physiologic instability—not because of irrational fear or psychological vulnerability."
      },
      {
        type: "inline-cta",
        content: "Understanding whether your symptoms reflect limbic overload—and what's driving it—requires comprehensive neurologic evaluation."
      },
      {
        type: "heading",
        content: "How PPC Evaluates Limbic–Prefrontal Involvement"
      },
      {
        type: "paragraph",
        content: "Our evaluation examines the full neurologic picture. We assess which domains are unstable, which are compensating, and how these cascades are affecting limbic regulation."
      },
      {
        type: "paragraph",
        content: "The goal is to identify whether limbic overload is primary—or a downstream response to other unresolved dysfunction. This distinction fundamentally changes the treatment approach."
      },
      {
        type: "heading",
        content: "What This Means for Recovery"
      },
      {
        type: "paragraph",
        content: "Stability returns when the nervous system regains a sense of safety. This doesn't come from reassurance or willpower—it comes from resolving the neurologic instabilities that are triggering protective responses."
      },
      {
        type: "paragraph",
        content: "Limbic calm follows integration. When vestibular function stabilizes, when autonomic regulation improves, when visual processing becomes efficient—the limbic system naturally downregulates. Recovery becomes durable once the cascades resolve."
      },
      {
        type: "callout",
        content: "When the nervous system feels genuinely safe again, the need for constant vigilance dissolves. This is neurologic recovery, not just symptom management.",
        variant: "insight"
      },
      {
        type: "paragraph",
        content: "If recovery feels fragile or symptoms escalate under stress, a clinician-led neurologic evaluation can help clarify whether limbic overload is a primary issue—or a downstream response to other unresolved domains."
      }
    ],
    relatedArticles: [
      "autonomic-nervous-system-flow",
      "visual-vestibular-mismatch",
      "frontal-system-fog-after-concussion",
      "post-concussion-performance-decline"
    ],
    primaryCTA: {
      label: "Schedule Neurologic Evaluation",
      route: "/patient/concierge",
      description: "Understand what's driving your symptoms and create a path to stable recovery."
    },
    secondaryCTA: {
      label: "Take the Concussion Self-Test",
      route: "/patient/self-tests/concussion",
      description: "Get an initial assessment of your symptom patterns."
    }
  },
  {
    slug: "proprioceptive-dysfunction-after-concussion",
    title: "Proprioceptive Dysfunction After Concussion: When the Body Loses Its Map",
    category: "concussion",
    readTime: "8 min read",
    excerpt: "Understanding why movement feels heavy, coordination feels off, and pain can persist even when imaging looks normal.",
    heroContent: "Your body doesn't feel connected. Simple movements feel heavy or clumsy. You're strong on paper, but something feels asymmetrical. Joints ache without injury. Fatigue sets in early. This isn't weakness or damage—it's proprioceptive dysfunction, and it's far more common after concussion than most people realize.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Proprioceptive",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When proprioceptive feedback becomes unreliable after concussion, secondary compensation often appears in the Cerebellar and Autonomic domains—which is why movement efficiency drops and fatigue escalates quickly."
      },
      {
        type: "heading",
        content: "Recognizing Proprioceptive Dysfunction"
      },
      {
        type: "callout",
        content: "Do any of these experiences sound familiar?",
        variant: "symptom"
      },
      {
        type: "list",
        content: "",
        items: [
          "Your body doesn't feel connected or coordinated",
          "Movement feels heavy or requires more effort than it should",
          "You feel asymmetrical despite being strong",
          "Joints ache or fatigue early without clear injury",
          "You don't trust your movement the way you used to",
          "Balance feels off even when vestibular tests are normal",
          "You grip harder or move stiffer than necessary"
        ]
      },
      {
        type: "paragraph",
        content: "These experiences are common after concussion. They are neurologic—reflecting how the brain maps and controls the body—not structural damage or weakness. And they are treatable once properly understood."
      },
      {
        type: "heading",
        content: "What the Proprioceptive Domain Does"
      },
      {
        type: "paragraph",
        content: "Proprioception is your brain's internal body map. Sensors in your joints, muscles, and connective tissues constantly send information about position, movement, and load. This allows your brain to coordinate movement without conscious effort."
      },
      {
        type: "paragraph",
        content: "When proprioception works well, you know where your body is in space, how much force to apply, and how to distribute load efficiently. Movement feels automatic, fluid, and reliable."
      },
      {
        type: "heading",
        content: "What Changes After Concussion"
      },
      {
        type: "paragraph",
        content: "Concussion can disrupt the sensory feedback from joints and muscles. The brain receives less accurate information about body position, force, and movement. Instead of sensing precisely, it begins to guess."
      },
      {
        type: "callout",
        content: "The body map becomes blurry. Movements that used to be automatic now require conscious effort. The system becomes inefficient.",
        variant: "insight"
      },
      {
        type: "paragraph",
        content: "This isn't about muscle strength—it's about the brain's ability to sense and coordinate. The hardware is intact, but the software has degraded."
      },
      {
        type: "heading",
        content: "How Proprioceptive Dysfunction Drives Symptoms"
      },
      {
        type: "paragraph",
        content: "When the brain can't accurately sense body position and load, it compensates in ways that create secondary problems:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Uneven load absorption leads to joint irritation and overuse",
          "Late muscle firing creates inefficient movement patterns",
          "Guarding and stiffness emerge as protective strategies",
          "Asymmetry causes chronic overload on one side",
          "Increased effort depletes energy and triggers autonomic fatigue",
          "Pain appears without tissue damage because load distribution is wrong"
        ]
      },
      {
        type: "paragraph",
        content: "This explains why some people develop persistent pain, joint problems, or movement difficulties after concussion—even when imaging shows no structural damage."
      },
      {
        type: "heading",
        content: "Primary vs Secondary Proprioceptive Dysfunction"
      },
      {
        type: "paragraph",
        content: "Proprioceptive dysfunction is often secondary to other domain failures. Common upstream drivers include cerebellar timing deficits that affect coordination, vestibular instability that disrupts spatial orientation, and brainstem energy limitations that reduce sensory processing capacity."
      },
      {
        type: "callout",
        content: "Treating strength without restoring body awareness often reinforces compensation rather than resolving it.",
        variant: "insight"
      },
      {
        type: "paragraph",
        content: "This is why strengthening programs sometimes fail or even worsen symptoms. The brain is layering force on top of faulty sensing, which amplifies rather than corrects the underlying problem."
      },
      {
        type: "heading",
        content: "Why Imaging and Strength Tests Look Normal"
      },
      {
        type: "paragraph",
        content: "Imaging assesses structure—bones, discs, ligaments. Strength tests measure output—how much force you can generate. Neither captures proprioceptive function, which lives in the space between structure and strength."
      },
      {
        type: "paragraph",
        content: "You can have normal imaging, pass strength tests, and still have significant proprioceptive dysfunction. The problem isn't what you can do—it's how efficiently and accurately you can do it."
      },
      {
        type: "inline-cta",
        content: "If movement feels off despite normal tests, specialized evaluation of body awareness and motor control can reveal what's actually happening."
      },
      {
        type: "heading",
        content: "How PPC Evaluates Proprioceptive Involvement"
      },
      {
        type: "paragraph",
        content: "Our evaluation examines how the brain maps and controls the body. We assess symmetry, timing, load distribution, and coordination—not just strength or range of motion."
      },
      {
        type: "paragraph",
        content: "The goal is to identify whether proprioceptive dysfunction is primary, or whether it reflects compensation for cerebellar, vestibular, or brainstem issues. This distinction determines where treatment should focus first."
      },
      {
        type: "heading",
        content: "What This Means for Recovery and Performance"
      },
      {
        type: "paragraph",
        content: "Movement confidence returns when the brain can accurately sense and coordinate the body again. Pain often resolves when load redistributes properly across joints and tissues. Efficiency improves before intensity needs to increase."
      },
      {
        type: "callout",
        content: "Recovery is about integration, not force. When the body map becomes clear again, movement becomes automatic, efficient, and reliable.",
        variant: "insight"
      },
      {
        type: "paragraph",
        content: "If movement feels heavy, asymmetrical, or unreliable after concussion, a clinician-led neurologic evaluation can help determine whether proprioceptive dysfunction is primary—or compensatory—and what to address first."
      }
    ],
    relatedArticles: [
      "cerebellar-timing-and-coordination",
      "visual-vestibular-mismatch",
      "autonomic-nervous-system-flow",
      "post-concussion-performance-decline"
    ],
    primaryCTA: {
      label: "Schedule Neurologic Evaluation",
      route: "/patient/concierge",
      description: "Understand why movement feels off and create a path to efficient, confident function."
    },
    secondaryCTA: {
      label: "Take the Concussion Self-Test",
      route: "/patient/self-tests/concussion",
      description: "Get an initial assessment of your symptom patterns."
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
  },
  {
    slug: "proprioceptive-dysfunction-and-chronic-pain",
    title: "Proprioceptive Dysfunction and Chronic Pain: When the Body Loses Load Awareness",
    category: "msk",
    readTime: "8 min read",
    excerpt: "Understanding why pain persists, movement feels heavy or asymmetrical, and imaging often looks normal — even when strength is intact.",
    heroContent: "You've tried rest. You've tried strengthening. Your imaging came back normal. But the pain keeps returning — or never quite leaves. If this sounds familiar, the issue may not be structural damage. It may be proprioceptive dysfunction — when the nervous system loses its ability to sense and manage load accurately.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Proprioceptive",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When proprioceptive feedback becomes unreliable, secondary compensation often appears in the Cerebellar and Autonomic domains — which is why effort rises, fatigue escalates, and pain persists despite adequate strength."
      },
      { type: "heading", content: "Do Any of These Sound Familiar?" },
      {
        type: "callout",
        variant: "symptom",
        content: "Proprioceptive dysfunction often presents as persistent discomfort that doesn't match imaging findings:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Pain that persists despite normal imaging",
          "One side 'doing more work' than the other",
          "Feeling heavy, stiff, or unreliable during movement",
          "Early fatigue or irritation with simple tasks",
          "'I'm strong, but my body doesn't feel coordinated'",
          "Recurring strains or flare-ups without clear injury"
        ]
      },
      {
        type: "paragraph",
        content: "These experiences are common. They reflect neurologic control issues — not signs of structural damage."
      },
      { type: "heading", content: "What the Proprioceptive Domain Controls" },
      {
        type: "paragraph",
        content: "Proprioception is the brain's internal system for body position, force grading, and load awareness. It tells the nervous system how much force to apply, where load is being absorbed, and how to distribute stress across joints and tissues."
      },
      {
        type: "paragraph",
        content: "Efficient, pain-free movement depends on accurate proprioceptive feedback. When that feedback becomes unreliable, the nervous system starts guessing — and those guesses often lead to uneven loading, compensation, and tissue overload."
      },
      { type: "heading", content: "What Changes When Proprioceptive Control Breaks Down" },
      {
        type: "paragraph",
        content: "When the body loses accurate load awareness, several patterns emerge:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Late or poorly graded muscle activation",
          "Over-reliance on certain joints or tissues",
          "Guarding, stiffness, or excessive co-contraction",
          "Increased effort for basic movement"
        ]
      },
      {
        type: "callout",
        variant: "insight",
        content: "The nervous system guesses instead of senses. Load concentrates instead of distributing. Tissues absorb stress they weren't designed to handle."
      },
      { type: "heading", content: "How Proprioceptive Dysfunction Creates Chronic Pain" },
      {
        type: "paragraph",
        content: "Chronic pain emerges when load is unevenly distributed, compensation becomes habitual, and tissues are repeatedly overloaded despite normal structure. Pain in this context is the result — not the cause."
      },
      {
        type: "paragraph",
        content: "Examples include hip dominance shifting stress to the low back, one leg absorbing more force during running, or shoulder irritation from poor joint position awareness. In each case, the tissue experiencing pain isn't necessarily damaged — it's overloaded."
      },
      {
        type: "inline-cta",
        content: "If pain persists despite normal imaging and adequate strength, a neurologic MSK evaluation can determine whether proprioceptive dysfunction is the missing link."
      },
      { type: "heading", content: "Primary vs. Secondary Proprioceptive Dysfunction" },
      {
        type: "paragraph",
        content: "Proprioceptive dysfunction may be primary — meaning the proprioceptive system itself is impaired — or it may be compensatory, emerging downstream from other neurologic drivers."
      },
      {
        type: "paragraph",
        content: "Common upstream drivers include cerebellar timing deficits, vestibular instability, and brainstem energy limitation. When these systems are impaired, the body loses access to accurate sensory integration — and proprioception suffers as a result."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Treating strength without restoring proprioceptive awareness often reinforces compensation rather than resolving pain."
      },
      { type: "heading", content: "Why Imaging and Strength Tests Can Look Normal" },
      {
        type: "paragraph",
        content: "Imaging evaluates structure — bones, discs, tendons, and ligaments. Strength tests measure output — how much force a muscle can produce. But proprioceptive deficits live between structure and strength: they affect control, coordination, and load management."
      },
      {
        type: "paragraph",
        content: "A normal MRI and strong muscles can coexist with a very real proprioceptive control problem. This is why pain persists for many people despite reassuring test results."
      },
      { type: "heading", content: "How PPC Evaluates Proprioceptive Involvement" },
      {
        type: "paragraph",
        content: "At PPC, evaluation is domain-based and function-focused:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Assessment of symmetry, timing, and load control during real movement",
          "Identification of primary vs. compensatory drivers",
          "Functional movement screening under progressive demand",
          "Fatigue-based testing to reveal breakdown patterns",
          "Validated outcome measures to track meaningful change over time"
        ]
      },
      {
        type: "paragraph",
        content: "The goal is to determine whether proprioceptive dysfunction is driving load imbalance — and what needs to be addressed first."
      },
      { type: "heading", content: "What This Means for Recovery" },
      {
        type: "paragraph",
        content: "When proprioceptive control is restored, load redistributes properly. Pain resolves as tissues are no longer chronically overloaded. Movement becomes lighter before it becomes stronger. Efficiency improves before intensity increases."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Confidence returns with integration — not force. When the nervous system can sense load accurately, it can manage load safely."
      },
      { type: "heading", content: "Moving Forward" },
      {
        type: "paragraph",
        content: "If pain persists despite rest, strengthening, or normal imaging, a clinician-led neurologic and musculoskeletal evaluation can help determine whether proprioceptive dysfunction is driving load imbalance — and what to address first."
      }
    ],
    relatedArticles: [
      "cerebellar-timing-and-coordination",
      "motor-timing-deficits",
      "movement-asymmetry",
      "chronic-pain-without-structural-damage"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Determine whether proprioceptive dysfunction is driving your chronic pain — and build a path to durable recovery."
    },
    secondaryCTA: {
      label: "Take MSK Self-Assessment",
      route: "/patient/self-tests/msk"
    }
  },
  {
    slug: "cerebellar-timing-deficits-and-chronic-pain",
    title: "Cerebellar Timing Deficits and Chronic Pain: When Movement Loses Precision",
    category: "msk",
    readTime: "8 min read",
    excerpt: "Why pain emerges when the brain struggles to coordinate force, timing, and sequencing — even when strength is preserved.",
    heroContent: "Your strength tests look fine. Your imaging is clean. But movement still feels stiff, delayed, or out of sync — and pain keeps returning. If this sounds familiar, the issue may not be your muscles or joints. It may be your timing.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Cerebellar",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When cerebellar timing breaks down, secondary compensation often appears in the Proprioceptive and Autonomic domains — increasing effort, stiffness, and pain."
      },
      { type: "heading", content: "Do Any of These Sound Familiar?" },
      {
        type: "callout",
        variant: "symptom",
        content: "Cerebellar timing deficits often present as stiffness, hesitation, or inefficiency — not weakness:"
      },
      {
        type: "list",
        content: "",
        items: [
          "'I feel stiff or robotic'",
          "'I know what I want to do, but my body lags'",
          "Movements feel effortful or delayed",
          "Pain worsens with speed or fatigue",
          "Coordination feels off even though strength is intact",
          "Simple tasks require more concentration than they should"
        ]
      },
      {
        type: "paragraph",
        content: "These experiences reflect neurologic timing — not structural damage. They are common, measurable, and addressable."
      },
      { type: "heading", content: "What the Cerebellar Domain Controls" },
      {
        type: "paragraph",
        content: "The cerebellum is the brain's timing center. It predicts, sequences, and coordinates movement — allowing smooth transitions between muscle groups and efficient force distribution across joints."
      },
      {
        type: "paragraph",
        content: "Efficient movement depends on anticipation, not reaction. The cerebellum allows the nervous system to pre-activate muscles before load arrives — so tissues are ready to absorb and distribute force. When this prediction fails, movement becomes reactive, guarded, and inefficient."
      },
      { type: "heading", content: "What Changes When Cerebellar Timing Breaks Down" },
      {
        type: "paragraph",
        content: "When cerebellar timing is impaired, several patterns emerge:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Delayed muscle firing — stabilizers activate late",
          "Poor sequencing — movements feel choppy or out of order",
          "Overcorrection and rigidity — the body guards against unpredictability",
          "Increased co-contraction — opposing muscles fire together, wasting energy"
        ]
      },
      {
        type: "callout",
        variant: "insight",
        content: "The brain reacts instead of predicts. Movement becomes guarded. Effort rises. And tissues absorb stress they were never designed to handle."
      },
      { type: "heading", content: "How Cerebellar Dysfunction Creates Chronic Pain" },
      {
        type: "paragraph",
        content: "When timing is off, load concentrates instead of distributing. Late muscle activation means joints and tissues absorb shock rather than sharing it across the kinetic chain. Over time, this creates cumulative overload — and pain develops secondarily."
      },
      {
        type: "paragraph",
        content: "Pain in this context is not a signal of damage. It is a signal of inefficiency — the consequence of a control system that can no longer predict and coordinate load."
      },
      {
        type: "inline-cta",
        content: "If pain worsens with speed, fatigue, or complexity — but imaging looks normal — a neurologic MSK evaluation can reveal whether timing is the missing link."
      },
      { type: "heading", content: "Primary vs. Secondary Cerebellar Dysfunction" },
      {
        type: "paragraph",
        content: "Cerebellar timing deficits may be primary — meaning the cerebellum itself is impaired — or they may emerge secondarily from other neurologic limitations."
      },
      {
        type: "paragraph",
        content: "Common upstream drivers include vestibular instability, proprioceptive mismatch, and autonomic energy constraints. When these systems are impaired, the cerebellum loses access to accurate sensory input — and timing degrades as a result."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Treating strength without restoring timing often reinforces compensatory motor patterns."
      },
      { type: "heading", content: "Why Imaging and Strength Tests Look Normal" },
      {
        type: "paragraph",
        content: "Imaging evaluates structure — bones, discs, tendons, and ligaments. Strength tests measure output — how much force a muscle can produce. But cerebellar timing deficits live between structure and strength: they affect when muscles fire, how force is sequenced, and whether movement is predictive or reactive."
      },
      {
        type: "paragraph",
        content: "A normal MRI and strong muscles can coexist with a very real timing problem. This is why pain and stiffness persist for many people despite reassuring test results."
      },
      { type: "heading", content: "How PPC Evaluates Cerebellar Involvement" },
      {
        type: "paragraph",
        content: "At PPC, evaluation is domain-based and function-focused:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Assessment of timing, rhythm, and sequencing during real movement",
          "Evaluation of symmetry and coordination under progressive demand",
          "Identification of primary vs. compensatory drivers",
          "Fatigue-based testing to reveal breakdown patterns",
          "Validated outcome measures to track meaningful change over time"
        ]
      },
      {
        type: "paragraph",
        content: "The goal is to determine whether cerebellar timing is driving inefficiency and overload — and what needs to be addressed first."
      },
      { type: "heading", content: "What This Means for Recovery" },
      {
        type: "paragraph",
        content: "When cerebellar timing is restored, movement becomes predictive again. Muscles fire in sequence. Force distributes efficiently. Effort decreases. And pain often resolves as tissues are no longer chronically overloaded."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Timing improves before strength matters. Fluidity precedes power. Confidence returns with coordination — not force."
      },
      { type: "heading", content: "Moving Forward" },
      {
        type: "paragraph",
        content: "If pain persists despite rest, strengthening, or normal imaging — and movement feels stiff, delayed, or effortful — a clinician-led neurologic and musculoskeletal evaluation can help determine whether cerebellar timing is driving the problem, and what to address first."
      }
    ],
    relatedArticles: [
      "proprioceptive-dysfunction-and-chronic-pain",
      "movement-asymmetry",
      "motor-timing-deficits",
      "chronic-pain-without-structural-damage"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Determine whether cerebellar timing is driving your chronic pain — and build a path to durable recovery."
    },
    secondaryCTA: {
      label: "Take MSK Self-Assessment",
      route: "/patient/self-tests/msk"
    }
  },
  {
    slug: "vestibular-dysfunction-and-chronic-pain",
    title: "Vestibular Dysfunction and Chronic Pain: When the Body Can't Stabilize Itself",
    category: "msk",
    readTime: "8 min read",
    excerpt: "Why pain emerges when balance, orientation, and motion sensing break down — even when imaging looks normal.",
    heroContent: "Your neck and back are constantly tight. You brace before you move. Certain motions make you uneasy — or exhausted. If this sounds familiar, the issue may not be your joints or muscles. It may be your vestibular system — the part of the brain that tells you where you are in space.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Vestibular",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When vestibular stability is unreliable, secondary compensation often appears in the Cervical and Autonomic domains — increasing stiffness and pain."
      },
      { type: "heading", content: "Do Any of These Sound Familiar?" },
      {
        type: "callout",
        variant: "symptom",
        content: "Vestibular dysfunction often presents as stiffness, bracing, or motion intolerance — not dizziness alone:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Chronic neck or upper back tightness that never fully resolves",
          "Feeling unstable or 'off' during movement",
          "Bracing or guarding before transitions (standing, turning, bending)",
          "Motion intolerance — discomfort in cars, elevators, or crowds",
          "Postural fatigue — exhaustion from standing or sitting upright",
          "Pain that worsens with head movement or position changes"
        ]
      },
      {
        type: "paragraph",
        content: "These experiences reflect neurologic instability — not structural damage. They are common, measurable, and addressable."
      },
      { type: "heading", content: "What the Vestibular System Controls" },
      {
        type: "paragraph",
        content: "The vestibular system is the brain's balance and orientation center. It senses head position, detects motion, and coordinates postural reflexes — allowing the body to stabilize itself automatically, without conscious effort."
      },
      {
        type: "paragraph",
        content: "Efficient posture and movement depend on accurate vestibular input. When the vestibular system is impaired, the nervous system loses its anchor — and the body compensates by bracing, guarding, and over-stabilizing."
      },
      { type: "heading", content: "What Changes When Vestibular Function Breaks Down" },
      {
        type: "paragraph",
        content: "When vestibular input becomes unreliable, several patterns emerge:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Excessive bracing — muscles lock to create artificial stability",
          "Motion intolerance — certain movements feel threatening",
          "Postural fatigue — maintaining upright posture becomes exhausting",
          "Hypervigilance — the nervous system stays on high alert"
        ]
      },
      {
        type: "callout",
        variant: "insight",
        content: "The body compensates for unreliable balance by creating stiffness. That stiffness is protective — but over time, it becomes the source of pain."
      },
      { type: "heading", content: "How Vestibular Dysfunction Creates Chronic Pain" },
      {
        type: "paragraph",
        content: "When the vestibular system fails to provide reliable orientation, the body recruits muscles to do the job instead. The cervical spine, upper back, and shoulders become chronically overloaded — not because of injury, but because they are working to stabilize a system that should stabilize itself."
      },
      {
        type: "paragraph",
        content: "Pain in this context is not a signal of damage. It is a signal of overwork — the consequence of muscles substituting for a vestibular system that can no longer anchor posture and movement."
      },
      {
        type: "inline-cta",
        content: "If pain concentrates in the neck, upper back, or shoulders — and imaging looks normal — a neurologic MSK evaluation can reveal whether vestibular instability is the missing link."
      },
      { type: "heading", content: "Primary vs. Secondary Vestibular Dysfunction" },
      {
        type: "paragraph",
        content: "Vestibular dysfunction may be primary — meaning the vestibular system itself is impaired — or it may emerge secondarily from other neurologic limitations."
      },
      {
        type: "paragraph",
        content: "Common upstream drivers include brainstem energy constraints and cerebellar timing deficits. When these systems are impaired, vestibular processing degrades — and instability increases as a result."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Treating muscle tightness without restoring vestibular stability often provides temporary relief — but the pattern returns."
      },
      { type: "heading", content: "Why Imaging and Strength Tests Look Normal" },
      {
        type: "paragraph",
        content: "Imaging evaluates structure — bones, discs, tendons, and ligaments. Strength tests measure output — how much force a muscle can produce. But vestibular dysfunction lives in the control system: it affects how the brain orients the body in space and how muscles coordinate to maintain stability."
      },
      {
        type: "paragraph",
        content: "A normal MRI and strong muscles can coexist with a very real vestibular problem. This is why chronic tightness and pain persist for many people despite reassuring test results."
      },
      { type: "heading", content: "How PPC Evaluates Vestibular Involvement" },
      {
        type: "paragraph",
        content: "At PPC, evaluation is domain-based and function-focused:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Assessment of balance, orientation, and postural control",
          "Evaluation of motion tolerance and vestibular reflexes",
          "Identification of primary vs. compensatory drivers",
          "Fatigue-based testing to reveal breakdown patterns",
          "Validated outcome measures to track meaningful change over time"
        ]
      },
      {
        type: "paragraph",
        content: "The goal is to determine whether vestibular instability is driving compensatory bracing and overload — and what needs to be addressed first."
      },
      { type: "heading", content: "What This Means for Recovery" },
      {
        type: "paragraph",
        content: "When vestibular function is restored, the body no longer needs to brace for stability. Muscles relax. Posture becomes effortless. And pain often resolves as tissues are no longer chronically overloaded."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Stability returns when the nervous system trusts its orientation. Stiffness releases when bracing is no longer needed."
      },
      { type: "heading", content: "Moving Forward" },
      {
        type: "paragraph",
        content: "If pain persists in the neck, upper back, or shoulders — and movement feels guarded, unstable, or exhausting — a clinician-led neurologic and musculoskeletal evaluation can help determine whether vestibular dysfunction is driving the problem, and what to address first."
      }
    ],
    relatedArticles: [
      "cerebellar-timing-deficits-and-chronic-pain",
      "movement-asymmetry",
      "chronic-pain-without-structural-damage"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Determine whether vestibular instability is driving your chronic pain — and build a path to durable recovery."
    },
    secondaryCTA: {
      label: "Take MSK Self-Assessment",
      route: "/patient/self-tests/msk"
    }
  },
  {
    slug: "autonomic-dysfunction-and-chronic-pain",
    title: "Autonomic Dysfunction and Chronic Pain: When the System Runs Out of Capacity",
    category: "msk",
    readTime: "8 min read",
    excerpt: "Why pain emerges when the nervous system loses its ability to regulate energy, recovery, and load tolerance — even when tissues are intact.",
    heroContent: "You rest, but you never fully recover. Activity flares symptoms for days. Your endurance is gone — and pain seems to amplify out of proportion to what you actually did. If this sounds familiar, the issue may not be your muscles or joints. It may be your autonomic nervous system.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Autonomic",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When autonomic regulation falters, secondary compensation often appears in the Proprioceptive and Limbic domains — increasing pain sensitivity and fatigue."
      },
      { type: "heading", content: "Do Any of These Sound Familiar?" },
      {
        type: "callout",
        variant: "symptom",
        content: "Autonomic dysfunction often presents as low endurance, flare cycles, and pain that seems disproportionate to activity:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Low endurance — even light activity wipes you out",
          "Flare cycles — symptoms spike after exertion and take days to settle",
          "Delayed recovery — rest doesn't restore energy the way it used to",
          "Pain amplification — symptoms seem out of proportion to what you did",
          "Sleep that doesn't refresh — waking tired despite adequate hours",
          "Sensitivity to temperature, light, or sound"
        ]
      },
      {
        type: "paragraph",
        content: "These experiences reflect neurologic regulation issues — not tissue damage or deconditioning. They are common, measurable, and addressable."
      },
      { type: "heading", content: "What the Autonomic System Controls" },
      {
        type: "paragraph",
        content: "The autonomic nervous system regulates everything that happens automatically — heart rate, blood pressure, digestion, temperature, and recovery. It determines how much capacity you have to meet physical and cognitive demands, and how quickly you recover after exertion."
      },
      {
        type: "paragraph",
        content: "When the autonomic system is functioning well, you can push, recover, and adapt. When it is impaired, the system runs in a constant energy deficit — and pain often emerges as a warning signal that capacity has been exceeded."
      },
      { type: "heading", content: "What Changes When Autonomic Regulation Breaks Down" },
      {
        type: "paragraph",
        content: "When autonomic regulation is impaired, several patterns emerge:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Energy deficit — the body cannot meet basic demands without strain",
          "Flare-crash cycles — overexertion leads to prolonged symptom spikes",
          "Pain amplification — the nervous system becomes hypersensitive",
          "Poor recovery — rest fails to restore baseline function"
        ]
      },
      {
        type: "callout",
        variant: "insight",
        content: "The body protects itself by amplifying pain when capacity is exceeded. Pain becomes a brake — not a signal of damage, but a warning that the system is running on empty."
      },
      { type: "heading", content: "How Autonomic Dysfunction Creates Chronic Pain" },
      {
        type: "paragraph",
        content: "When the autonomic system cannot regulate energy and recovery, the nervous system enters a protective state. Pain thresholds drop. Inflammation increases. Tissues that would normally tolerate load become irritable and hypersensitive."
      },
      {
        type: "paragraph",
        content: "Pain in this context is not a signal of structural damage. It is a signal of system overload — the consequence of a nervous system that can no longer buffer demands or recover from exertion."
      },
      {
        type: "inline-cta",
        content: "If pain flares after activity, recovery takes too long, and endurance has collapsed — a neurologic MSK evaluation can reveal whether autonomic dysfunction is the missing link."
      },
      { type: "heading", content: "Primary vs. Secondary Autonomic Dysfunction" },
      {
        type: "paragraph",
        content: "Autonomic dysfunction may be primary — meaning the autonomic system itself is impaired — or it may emerge secondarily from other neurologic limitations."
      },
      {
        type: "paragraph",
        content: "Common upstream drivers include brainstem energy constraints, vestibular instability, and cerebellar timing deficits. When these systems are impaired, autonomic regulation degrades — and capacity collapses as a result."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Pushing through fatigue without restoring autonomic regulation often deepens the deficit — making recovery longer and symptoms worse."
      },
      { type: "heading", content: "Why Imaging and Strength Tests Look Normal" },
      {
        type: "paragraph",
        content: "Imaging evaluates structure — bones, discs, tendons, and ligaments. Strength tests measure output — how much force a muscle can produce. But autonomic dysfunction lives in the regulation system: it affects how the body manages energy, recovers from exertion, and modulates pain sensitivity."
      },
      {
        type: "paragraph",
        content: "A normal MRI and strong muscles can coexist with a very real autonomic problem. This is why fatigue, flare cycles, and amplified pain persist for many people despite reassuring test results."
      },
      { type: "heading", content: "How PPC Evaluates Autonomic Involvement" },
      {
        type: "paragraph",
        content: "At PPC, evaluation is domain-based and function-focused:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Assessment of heart rate variability and autonomic tone",
          "Evaluation of exertion tolerance and recovery patterns",
          "Identification of primary vs. compensatory drivers",
          "Fatigue-based testing to reveal breakdown patterns",
          "Validated outcome measures to track meaningful change over time"
        ]
      },
      {
        type: "paragraph",
        content: "The goal is to determine whether autonomic dysfunction is driving pain amplification and energy collapse — and what needs to be addressed first."
      },
      { type: "heading", content: "What This Means for Recovery" },
      {
        type: "paragraph",
        content: "When autonomic regulation is restored, capacity returns. The body can tolerate exertion without crashing. Pain thresholds normalize. And recovery becomes predictable again."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Endurance returns when the nervous system can regulate energy. Pain settles when the system is no longer in survival mode."
      },
      { type: "heading", content: "Moving Forward" },
      {
        type: "paragraph",
        content: "If pain flares after activity, recovery takes too long, and endurance has collapsed — a clinician-led neurologic and musculoskeletal evaluation can help determine whether autonomic dysfunction is driving the problem, and what to address first."
      }
    ],
    relatedArticles: [
      "concussion-energy-crisis-and-recovery",
      "proprioceptive-dysfunction-and-chronic-pain",
      "chronic-pain-without-structural-damage"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Determine whether autonomic dysfunction is driving your chronic pain — and build a path to durable recovery."
    },
    secondaryCTA: {
      label: "Take MSK Self-Assessment",
      route: "/patient/self-tests/msk"
    }
  },
  {
    slug: "frontal-control-dysfunction-and-chronic-pain",
    title: "Frontal Control Dysfunction and Chronic Pain: When the Brain Can't Organize Movement",
    category: "msk",
    readTime: "8 min read",
    excerpt: "Why pain emerges when the brain struggles to plan, sequence, and inhibit movement — even when strength and structure are intact.",
    heroContent: "You try to move efficiently, but everything feels effortful. You over-grip, over-brace, and over-recruit muscles that should stay quiet. Simple tasks require too much concentration. If this sounds familiar, the issue may not be your muscles or joints. It may be frontal motor control.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Frontal (Executive Motor)",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When frontal motor control weakens, secondary compensation often appears in the Cerebellar and Proprioceptive domains — increasing effort and pain."
      },
      { type: "heading", content: "Do Any of These Sound Familiar?" },
      {
        type: "callout",
        variant: "symptom",
        content: "Frontal control dysfunction often presents as over-effort, poor inhibition, and inefficient movement planning:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Over-gripping or over-bracing during simple tasks",
          "Difficulty 'turning off' muscles that should relax",
          "Movement feels effortful even when strength is adequate",
          "Poor motor planning — needing to think through movements that should be automatic",
          "Fatigue from concentration, not just exertion",
          "Pain that worsens with complexity or multitasking"
        ]
      },
      {
        type: "paragraph",
        content: "These experiences reflect neurologic control issues — not weakness or structural damage. They are common, measurable, and addressable."
      },
      { type: "heading", content: "What Frontal Motor Control Does" },
      {
        type: "paragraph",
        content: "The frontal cortex is the brain's executive motor center. It plans movement, sequences muscle activation, and — critically — inhibits muscles that should stay quiet. Efficient movement depends on knowing what not to do as much as what to do."
      },
      {
        type: "paragraph",
        content: "When frontal control is functioning well, movement is smooth, automatic, and economical. When it is impaired, the brain loses its ability to organize movement efficiently — and the body compensates with over-effort."
      },
      { type: "heading", content: "What Changes When Frontal Control Breaks Down" },
      {
        type: "paragraph",
        content: "When frontal motor control is impaired, several patterns emerge:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Poor inhibition — muscles that should relax stay active",
          "Over-effort — simple tasks require excessive force and concentration",
          "Inefficient motor planning — movements feel choppy or disorganized",
          "Cognitive load — movement requires conscious attention that depletes energy"
        ]
      },
      {
        type: "callout",
        variant: "insight",
        content: "The brain compensates for poor planning by recruiting everything at once. That over-recruitment wastes energy and overloads tissues."
      },
      { type: "heading", content: "How Frontal Dysfunction Creates Chronic Pain" },
      {
        type: "paragraph",
        content: "When the frontal cortex cannot organize movement efficiently, the body defaults to brute force. Muscles co-contract when they should alternate. Stabilizers fire when they should rest. Tissues absorb load they were never designed to handle — not because of injury, but because of poor motor organization."
      },
      {
        type: "paragraph",
        content: "Pain in this context is not a signal of damage. It is a signal of inefficiency — the consequence of a control system that can no longer plan, inhibit, and sequence movement effectively."
      },
      {
        type: "inline-cta",
        content: "If movement feels effortful, over-braced, or mentally exhausting — and imaging looks normal — a neurologic MSK evaluation can reveal whether frontal control is the missing link."
      },
      { type: "heading", content: "Primary vs. Secondary Frontal Dysfunction" },
      {
        type: "paragraph",
        content: "Frontal control dysfunction may be primary — meaning the frontal motor system itself is impaired — or it may emerge secondarily from other neurologic limitations."
      },
      {
        type: "paragraph",
        content: "Common upstream drivers include cerebellar timing deficits and autonomic energy constraints. When these systems are impaired, the frontal cortex loses the resources it needs to plan and inhibit efficiently — and over-effort increases as a result."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Strengthening without restoring motor planning often reinforces over-recruitment — making movement less efficient, not more."
      },
      { type: "heading", content: "Why Imaging and Strength Tests Look Normal" },
      {
        type: "paragraph",
        content: "Imaging evaluates structure — bones, discs, tendons, and ligaments. Strength tests measure output — how much force a muscle can produce. But frontal control dysfunction lives in the planning system: it affects how the brain organizes movement, inhibits unnecessary activation, and sequences muscle firing."
      },
      {
        type: "paragraph",
        content: "A normal MRI and strong muscles can coexist with a very real frontal control problem. This is why over-effort, fatigue, and pain persist for many people despite reassuring test results."
      },
      { type: "heading", content: "How PPC Evaluates Frontal Involvement" },
      {
        type: "paragraph",
        content: "At PPC, evaluation is domain-based and function-focused:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Assessment of motor planning and sequencing",
          "Evaluation of inhibition and muscle relaxation patterns",
          "Identification of primary vs. compensatory drivers",
          "Fatigue-based testing to reveal breakdown patterns",
          "Validated outcome measures to track meaningful change over time"
        ]
      },
      {
        type: "paragraph",
        content: "The goal is to determine whether frontal control dysfunction is driving over-effort and tissue overload — and what needs to be addressed first."
      },
      { type: "heading", content: "What This Means for Recovery" },
      {
        type: "paragraph",
        content: "When frontal control is restored, movement becomes organized again. Muscles fire in sequence and relax on cue. Effort decreases. And pain often resolves as tissues are no longer chronically overloaded."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Efficiency returns when the brain can plan. Pain settles when over-effort is no longer necessary."
      },
      { type: "heading", content: "Moving Forward" },
      {
        type: "paragraph",
        content: "If movement feels effortful, over-braced, or mentally exhausting — a clinician-led neurologic and musculoskeletal evaluation can help determine whether frontal control dysfunction is driving the problem, and what to address first."
      }
    ],
    relatedArticles: [
      "motor-timing-deficits",
      "chronic-pain-without-structural-damage",
      "cerebellar-timing-deficits-and-chronic-pain"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Determine whether frontal control dysfunction is driving your chronic pain — and build a path to durable recovery."
    },
    secondaryCTA: {
      label: "Take MSK Self-Assessment",
      route: "/patient/self-tests/msk"
    }
  },
  {
    slug: "brainstem-dysfunction-and-chronic-pain",
    title: "Brainstem Dysfunction and Chronic Pain: When the System Can't Settle",
    category: "msk",
    readTime: "8 min read",
    excerpt: "Why pain emerges when the brainstem loses its ability to regulate baseline tone, reflexes, and stress tolerance — even when tissues are intact.",
    heroContent: "Your nervous system never seems to settle. Muscles stay tight. Reflexes feel heightened. Stress tolerance is gone — and pain seems to spread or amplify without a clear cause. If this sounds familiar, the issue may not be your muscles or joints. It may be your brainstem.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Brainstem",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When brainstem regulation falters, secondary compensation often appears across all MSK control domains — lowering pain thresholds globally."
      },
      { type: "heading", content: "Do Any of These Sound Familiar?" },
      {
        type: "callout",
        variant: "symptom",
        content: "Brainstem dysfunction often presents as heightened sensitivity, poor baseline tone, and low stress tolerance:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Muscles that never fully relax — even at rest",
          "Heightened reflexes or startle responses",
          "Low stress tolerance — small demands trigger large responses",
          "Pain that spreads or migrates without clear injury",
          "Sensitivity to light, sound, or environmental changes",
          "Difficulty calming down after exertion or stress"
        ]
      },
      {
        type: "paragraph",
        content: "These experiences reflect neurologic regulation issues — not tissue damage or psychological weakness. They are common, measurable, and addressable."
      },
      { type: "heading", content: "What the Brainstem Controls" },
      {
        type: "paragraph",
        content: "The brainstem is the brain's baseline regulator. It controls autonomic functions, modulates reflexes, and sets the tone for the entire nervous system. It determines whether the body operates in a calm, regulated state — or a heightened, protective state."
      },
      {
        type: "paragraph",
        content: "When the brainstem is functioning well, the nervous system can settle after stress, regulate pain signals appropriately, and maintain stable baseline tone. When it is impaired, the system stays on high alert — and pain thresholds drop globally."
      },
      { type: "heading", content: "What Changes When Brainstem Regulation Breaks Down" },
      {
        type: "paragraph",
        content: "When brainstem regulation is impaired, several patterns emerge:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Poor baseline tone — muscles stay tight even without demand",
          "Heightened reflexes — the nervous system over-responds to stimuli",
          "Low stress tolerance — small inputs create large outputs",
          "Global pain amplification — thresholds drop across the entire body"
        ]
      },
      {
        type: "callout",
        variant: "insight",
        content: "The nervous system operates as if threat is constant. Pain becomes a baseline state — not a response to specific damage."
      },
      { type: "heading", content: "How Brainstem Dysfunction Creates Chronic Pain" },
      {
        type: "paragraph",
        content: "When the brainstem cannot regulate baseline tone, the entire nervous system shifts into a protective state. Pain signals are amplified. Muscles guard without clear reason. Tissues that would normally tolerate load become hypersensitive."
      },
      {
        type: "paragraph",
        content: "Pain in this context is not a signal of structural damage. It is a signal of dysregulation — the consequence of a nervous system that can no longer settle, modulate, or buffer incoming signals."
      },
      {
        type: "inline-cta",
        content: "If pain seems global, reflexes feel heightened, and the nervous system never settles — a neurologic MSK evaluation can reveal whether brainstem dysfunction is the missing link."
      },
      { type: "heading", content: "Primary vs. Secondary Brainstem Dysfunction" },
      {
        type: "paragraph",
        content: "Brainstem dysfunction may be primary — meaning the brainstem itself is impaired — or it may emerge secondarily from other neurologic limitations."
      },
      {
        type: "paragraph",
        content: "Common upstream drivers include autonomic dysregulation and vestibular instability. When these systems are impaired, brainstem regulation degrades — and the entire nervous system loses its ability to settle."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Treating local pain without restoring brainstem regulation often provides temporary relief — but the pattern returns."
      },
      { type: "heading", content: "Why Imaging and Strength Tests Look Normal" },
      {
        type: "paragraph",
        content: "Imaging evaluates structure — bones, discs, tendons, and ligaments. Strength tests measure output — how much force a muscle can produce. But brainstem dysfunction lives in the regulation system: it affects how the nervous system modulates tone, processes pain, and responds to stress."
      },
      {
        type: "paragraph",
        content: "A normal MRI and strong muscles can coexist with a very real brainstem regulation problem. This is why widespread pain, heightened sensitivity, and poor stress tolerance persist for many people despite reassuring test results."
      },
      { type: "heading", content: "How PPC Evaluates Brainstem Involvement" },
      {
        type: "paragraph",
        content: "At PPC, evaluation is domain-based and function-focused:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Assessment of baseline tone and reflex modulation",
          "Evaluation of autonomic regulation and stress response",
          "Identification of primary vs. compensatory drivers",
          "Fatigue-based testing to reveal breakdown patterns",
          "Validated outcome measures to track meaningful change over time"
        ]
      },
      {
        type: "paragraph",
        content: "The goal is to determine whether brainstem dysfunction is driving global pain amplification — and what needs to be addressed first."
      },
      { type: "heading", content: "What This Means for Recovery" },
      {
        type: "paragraph",
        content: "When brainstem regulation is restored, the nervous system can settle. Baseline tone normalizes. Pain thresholds rise. And the body can respond to stress without amplification."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Pain settles when the nervous system can settle. Tolerance returns when regulation is restored."
      },
      { type: "heading", content: "Moving Forward" },
      {
        type: "paragraph",
        content: "If pain seems global, reflexes feel heightened, and the nervous system never settles — a clinician-led neurologic and musculoskeletal evaluation can help determine whether brainstem dysfunction is driving the problem, and what to address first."
      }
    ],
    relatedArticles: [
      "autonomic-dysfunction-and-chronic-pain",
      "vestibular-dysfunction-and-chronic-pain",
      "chronic-pain-without-structural-damage"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Determine whether brainstem dysfunction is driving your chronic pain — and build a path to durable recovery."
    },
    secondaryCTA: {
      label: "Take MSK Self-Assessment",
      route: "/patient/self-tests/msk"
    }
  },
  {
    slug: "visual-processing-dysfunction-and-chronic-pain",
    title: "Visual Processing Dysfunction and Chronic Pain: When the Brain Misjudges Space and Load",
    category: "msk",
    readTime: "8 min read",
    excerpt: "Why pain emerges when the brain miscalculates distance, depth, and movement — leading to over-bracing and tissue overload.",
    heroContent: "You misjudge distances. You bump into things. Movement feels uncertain — and your neck, shoulders, or back are constantly tight. If this sounds familiar, the issue may not be your muscles or joints. It may be your visual processing system.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Visual–Oculomotor",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When visual input is unreliable, secondary compensation often appears in the Cervical and Proprioceptive domains — increasing strain and pain."
      },
      { type: "heading", content: "Do Any of These Sound Familiar?" },
      {
        type: "callout",
        variant: "symptom",
        content: "Visual processing dysfunction often presents as spatial uncertainty, over-bracing, and visual-motor mismatch:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Misjudging distances or bumping into objects",
          "Difficulty navigating crowds or complex environments",
          "Over-bracing in the neck, shoulders, or upper back",
          "Visual fatigue — eyes tire quickly during tasks",
          "Discomfort with screens, scrolling, or busy visual fields",
          "Movement feels uncertain or hesitant"
        ]
      },
      {
        type: "paragraph",
        content: "These experiences reflect neurologic processing issues — not eye problems or structural damage. They are common, measurable, and addressable."
      },
      { type: "heading", content: "What Visual Processing Controls" },
      {
        type: "paragraph",
        content: "The visual system does more than see — it calculates space, depth, and motion. It tells the brain where objects are, how fast they are moving, and where the body is relative to the environment. Efficient movement depends on accurate visual-spatial processing."
      },
      {
        type: "paragraph",
        content: "When visual processing is functioning well, movement through space is automatic and confident. When it is impaired, the brain loses its spatial anchor — and the body compensates by bracing, guarding, and over-stabilizing."
      },
      { type: "heading", content: "What Changes When Visual Processing Breaks Down" },
      {
        type: "paragraph",
        content: "When visual input becomes unreliable, several patterns emerge:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Poor spatial accuracy — distances and depths are miscalculated",
          "Visual-motor mismatch — movements don't match visual expectations",
          "Over-bracing — the body guards against spatial uncertainty",
          "Cervical strain — the neck works overtime to stabilize the head and eyes"
        ]
      },
      {
        type: "callout",
        variant: "insight",
        content: "The body compensates for unreliable vision by creating stiffness. That stiffness protects against spatial miscalculation — but over time, it becomes the source of pain."
      },
      { type: "heading", content: "How Visual Dysfunction Creates Chronic Pain" },
      {
        type: "paragraph",
        content: "When the visual system fails to provide reliable spatial information, the body recruits muscles to compensate. The cervical spine, shoulders, and upper back become chronically overloaded — not because of injury, but because they are working to stabilize a system that should stabilize itself."
      },
      {
        type: "paragraph",
        content: "Pain in this context is not a signal of damage. It is a signal of overwork — the consequence of muscles substituting for a visual system that can no longer anchor movement in space."
      },
      {
        type: "inline-cta",
        content: "If pain concentrates in the neck, shoulders, or upper back — and imaging looks normal — a neurologic MSK evaluation can reveal whether visual processing dysfunction is the missing link."
      },
      { type: "heading", content: "Primary vs. Secondary Visual Dysfunction" },
      {
        type: "paragraph",
        content: "Visual processing dysfunction may be primary — meaning the visual system itself is impaired — or it may emerge secondarily from other neurologic limitations."
      },
      {
        type: "paragraph",
        content: "Common upstream drivers include vestibular instability and cerebellar timing deficits. When these systems are impaired, visual processing degrades — and spatial accuracy suffers as a result."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Treating muscle tightness without restoring visual processing often provides temporary relief — but the pattern returns."
      },
      { type: "heading", content: "Why Imaging and Strength Tests Look Normal" },
      {
        type: "paragraph",
        content: "Imaging evaluates structure — bones, discs, tendons, and ligaments. Strength tests measure output — how much force a muscle can produce. But visual processing dysfunction lives in the spatial calculation system: it affects how the brain maps the environment and coordinates movement through space."
      },
      {
        type: "paragraph",
        content: "A normal MRI and strong muscles can coexist with a very real visual processing problem. This is why chronic neck and shoulder pain persists for many people despite reassuring test results."
      },
      { type: "heading", content: "How PPC Evaluates Visual Involvement" },
      {
        type: "paragraph",
        content: "At PPC, evaluation is domain-based and function-focused:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Assessment of visual-spatial processing and depth perception",
          "Evaluation of eye movement control and visual-motor integration",
          "Identification of primary vs. compensatory drivers",
          "Fatigue-based testing to reveal breakdown patterns",
          "Validated outcome measures to track meaningful change over time"
        ]
      },
      {
        type: "paragraph",
        content: "The goal is to determine whether visual processing dysfunction is driving compensatory bracing and overload — and what needs to be addressed first."
      },
      { type: "heading", content: "What This Means for Recovery" },
      {
        type: "paragraph",
        content: "When visual processing is restored, the body no longer needs to brace for spatial uncertainty. Muscles relax. Movement becomes confident. And pain often resolves as tissues are no longer chronically overloaded."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Confidence returns when the brain trusts its spatial map. Stiffness releases when bracing is no longer needed."
      },
      { type: "heading", content: "Moving Forward" },
      {
        type: "paragraph",
        content: "If pain concentrates in the neck, shoulders, or upper back — and movement feels uncertain or visually demanding — a clinician-led neurologic and musculoskeletal evaluation can help determine whether visual processing dysfunction is driving the problem, and what to address first."
      }
    ],
    relatedArticles: [
      "visual-vestibular-mismatch",
      "proprioceptive-dysfunction-and-chronic-pain",
      "chronic-pain-without-structural-damage"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Determine whether visual processing dysfunction is driving your chronic pain — and build a path to durable recovery."
    },
    secondaryCTA: {
      label: "Take MSK Self-Assessment",
      route: "/patient/self-tests/msk"
    }
  },
  {
    slug: "limbic-modulation-and-chronic-pain",
    title: "Limbic Modulation and Chronic Pain: When the System Stays on Guard",
    category: "msk",
    readTime: "8 min read",
    excerpt: "Why pain persists when the brain's threat-detection system remains elevated — even after tissues have healed.",
    heroContent: "The injury healed. The imaging is clear. But the pain persists — and it flares with stress, fatigue, or unpredictability. If this sounds familiar, the issue may not be your tissues. It may be your limbic system — the part of the brain that decides whether you are safe or under threat.",
    sections: [
      {
        type: "callout",
        content: "Primary Neurologic Domain: Limbic–Prefrontal",
        variant: "info"
      },
      {
        type: "paragraph",
        content: "When limbic modulation remains elevated, secondary compensation often appears in the Autonomic and Motor Control domains — sustaining pain despite healing."
      },
      { type: "heading", content: "Do Any of These Sound Familiar?" },
      {
        type: "callout",
        variant: "symptom",
        content: "Limbic involvement in chronic pain often presents as protective tension, threat perception, and pain that persists beyond expected healing:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Pain that persists despite healing",
          "Symptoms that flare with stress, fatigue, or uncertainty",
          "Protective tension — muscles guard even at rest",
          "Hypervigilance — constantly monitoring for pain or threat",
          "Avoidance of movement or activities that once felt normal",
          "A sense that the body is fragile or unpredictable"
        ]
      },
      {
        type: "paragraph",
        content: "These experiences reflect neurologic protective amplification — not psychological weakness or imagined symptoms. They are common, measurable, and addressable."
      },
      { type: "heading", content: "What the Limbic System Controls" },
      {
        type: "paragraph",
        content: "The limbic system is the brain's threat-detection center. It evaluates whether the environment — and the body — is safe or under threat. When it perceives danger, it amplifies protective responses: muscle tension, pain sensitivity, and avoidance."
      },
      {
        type: "paragraph",
        content: "When limbic modulation is functioning well, the system accurately distinguishes between real threat and normal sensation. When it is dysregulated, the system stays on guard — and pain persists as a protective signal, even when tissues have healed."
      },
      { type: "heading", content: "What Changes When Limbic Modulation Stays Elevated" },
      {
        type: "paragraph",
        content: "When the limbic system remains in a protective state, several patterns emerge:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Threat perception — normal sensations are interpreted as dangerous",
          "Protective tension — muscles guard against movement",
          "Pain persistence — pain continues beyond tissue healing timelines",
          "Avoidance — activities are restricted to prevent anticipated pain"
        ]
      },
      {
        type: "callout",
        variant: "insight",
        content: "The brain amplifies pain not because tissues are damaged, but because the system has not yet received the signal that it is safe. Pain becomes a protective brake — not a damage signal."
      },
      { type: "heading", content: "How Limbic Dysregulation Creates Chronic Pain" },
      {
        type: "paragraph",
        content: "When the limbic system perceives ongoing threat, it keeps the nervous system in a protective mode. Pain thresholds drop. Muscles stay tense. Movement becomes guarded. And the body operates as if injury is ongoing — even when it is not."
      },
      {
        type: "paragraph",
        content: "Pain in this context is not a signal of structural damage. It is a signal of protective amplification — the consequence of a nervous system that has not yet downregulated its threat response."
      },
      {
        type: "inline-cta",
        content: "If pain persists despite healing, and symptoms flare with stress or unpredictability — a neurologic MSK evaluation can reveal whether limbic modulation is the missing link."
      },
      { type: "heading", content: "Primary vs. Secondary Limbic Involvement" },
      {
        type: "paragraph",
        content: "Limbic dysregulation may be primary — meaning the limbic system itself is driving the protective response — or it may emerge secondarily from other neurologic limitations."
      },
      {
        type: "paragraph",
        content: "Common upstream drivers include autonomic dysregulation and brainstem dysfunction. When these systems are impaired, the limbic system receives signals that reinforce threat perception — and protective amplification continues."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Reassurance alone rarely resolves limbic-driven pain. The system needs evidence of safety — through graded exposure and neurologic integration — not just words."
      },
      { type: "heading", content: "Why Imaging and Strength Tests Look Normal" },
      {
        type: "paragraph",
        content: "Imaging evaluates structure — bones, discs, tendons, and ligaments. Strength tests measure output — how much force a muscle can produce. But limbic modulation lives in the threat-detection system: it affects how the brain interprets sensation and whether protective responses remain elevated."
      },
      {
        type: "paragraph",
        content: "A normal MRI and strong muscles can coexist with a very real limbic regulation problem. This is why pain persists for many people despite reassuring test results and completed healing timelines."
      },
      { type: "heading", content: "How PPC Evaluates Limbic Involvement" },
      {
        type: "paragraph",
        content: "At PPC, evaluation is domain-based and function-focused:"
      },
      {
        type: "list",
        content: "",
        items: [
          "Assessment of protective responses and pain behavior patterns",
          "Evaluation of autonomic and stress regulation",
          "Identification of primary vs. compensatory drivers",
          "Graded exposure testing to assess threat tolerance",
          "Validated outcome measures to track meaningful change over time"
        ]
      },
      {
        type: "paragraph",
        content: "The goal is to determine whether limbic modulation is sustaining protective pain — and what needs to be addressed first."
      },
      { type: "heading", content: "What This Means for Recovery" },
      {
        type: "paragraph",
        content: "When limbic modulation is restored, the nervous system receives the signal that it is safe. Protective tension releases. Pain thresholds normalize. And movement becomes possible again without triggering amplification."
      },
      {
        type: "callout",
        variant: "insight",
        content: "Pain settles when the system feels safe. Recovery accelerates when protection is no longer needed."
      },
      { type: "heading", content: "Moving Forward" },
      {
        type: "paragraph",
        content: "If pain persists despite healing, and symptoms flare with stress, fatigue, or unpredictability — a clinician-led neurologic and musculoskeletal evaluation can help determine whether limbic modulation is sustaining the problem, and what to address first."
      }
    ],
    relatedArticles: [
      "autonomic-dysfunction-and-chronic-pain",
      "chronic-pain-without-structural-damage",
      "brainstem-dysfunction-and-chronic-pain"
    ],
    primaryCTA: {
      label: "Schedule MSK Evaluation",
      route: "/patient/concierge",
      description: "Determine whether limbic modulation is sustaining your chronic pain — and build a path to durable recovery."
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
