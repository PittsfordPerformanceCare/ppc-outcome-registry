// Outcome Measure Instrument Definitions with exact question text and scoring

export type InstrumentCode = 'ODI' | 'QUICKDASH' | 'LEFS' | 'NDI' | 'RPQ';

export interface QuestionOption {
  value: number;
  text: string;
}

export interface InstrumentQuestion {
  number: number;
  section?: string;
  text: string;
  options: QuestionOption[];
  allowSkip?: boolean;
  skipLabel?: string;
}

export interface InstrumentDefinition {
  code: InstrumentCode;
  name: string;
  fullName: string;
  description: string;
  totalItems: number;
  minScore: number;
  maxScore: number;
  scoreUnit: string;
  mcid: number;
  minRequiredItems?: number;
  questions: InstrumentQuestion[];
  calculateScore: (responses: Map<number, number | null>) => { 
    score: number; 
    isValid: boolean; 
    answeredCount: number;
    interpretation: string;
  };
}

// ODI - Oswestry Disability Index
export const ODI_INSTRUMENT: InstrumentDefinition = {
  code: 'ODI',
  name: 'ODI',
  fullName: 'Oswestry Disability Index',
  description: 'Measures disability related to low back pain',
  totalItems: 10,
  minScore: 0,
  maxScore: 100,
  scoreUnit: '% disability',
  mcid: 6,
  questions: [
    {
      number: 1,
      section: 'Pain Intensity',
      text: 'Pain Intensity',
      options: [
        { value: 0, text: 'I have no pain at the moment.' },
        { value: 1, text: 'The pain is very mild at the moment.' },
        { value: 2, text: 'The pain is moderate at the moment.' },
        { value: 3, text: 'The pain is fairly severe at the moment.' },
        { value: 4, text: 'The pain is very severe at the moment.' },
        { value: 5, text: 'The pain is the worst imaginable at the moment.' },
      ],
    },
    {
      number: 2,
      section: 'Personal Care',
      text: 'Personal Care (Washing, Dressing, etc.)',
      options: [
        { value: 0, text: 'I can look after myself normally without causing extra pain.' },
        { value: 1, text: 'I can look after myself normally, but it causes extra pain.' },
        { value: 2, text: 'It is painful to look after myself, and I am slow and careful.' },
        { value: 3, text: 'I need some help but manage most of my personal care.' },
        { value: 4, text: 'I need help every day in most aspects of self-care.' },
        { value: 5, text: 'I do not get dressed, wash with difficulty, and stay in bed.' },
      ],
    },
    {
      number: 3,
      section: 'Lifting',
      text: 'Lifting',
      options: [
        { value: 0, text: 'I can lift heavy weights without extra pain.' },
        { value: 1, text: 'I can lift heavy weights, but it causes extra pain.' },
        { value: 2, text: 'Pain prevents me from lifting heavy weights off the floor, but I can manage if they are conveniently positioned.' },
        { value: 3, text: 'Pain prevents me from lifting heavy weights, but I can manage light to medium weights.' },
        { value: 4, text: 'I can lift very light weights only.' },
        { value: 5, text: 'I cannot lift or carry anything.' },
      ],
    },
    {
      number: 4,
      section: 'Walking',
      text: 'Walking',
      options: [
        { value: 0, text: 'Pain does not prevent me from walking any distance.' },
        { value: 1, text: 'Pain prevents me from walking more than 1 mile.' },
        { value: 2, text: 'Pain prevents me from walking more than ½ mile.' },
        { value: 3, text: 'Pain prevents me from walking more than ¼ mile.' },
        { value: 4, text: 'I can only walk using a stick or crutches.' },
        { value: 5, text: 'I am in bed most of the time and have to crawl to the toilet.' },
      ],
    },
    {
      number: 5,
      section: 'Sitting',
      text: 'Sitting',
      options: [
        { value: 0, text: 'I can sit in any chair as long as I like.' },
        { value: 1, text: 'I can sit in my favorite chair as long as I like.' },
        { value: 2, text: 'Pain prevents me from sitting more than 1 hour.' },
        { value: 3, text: 'Pain prevents me from sitting more than 30 minutes.' },
        { value: 4, text: 'Pain prevents me from sitting more than 10 minutes.' },
        { value: 5, text: 'Pain prevents me from sitting at all.' },
      ],
    },
    {
      number: 6,
      section: 'Standing',
      text: 'Standing',
      options: [
        { value: 0, text: 'I can stand as long as I want without extra pain.' },
        { value: 1, text: 'I can stand as long as I want, but it causes extra pain.' },
        { value: 2, text: 'Pain prevents me from standing more than 1 hour.' },
        { value: 3, text: 'Pain prevents me from standing more than 30 minutes.' },
        { value: 4, text: 'Pain prevents me from standing more than 10 minutes.' },
        { value: 5, text: 'Pain prevents me from standing at all.' },
      ],
    },
    {
      number: 7,
      section: 'Sleeping',
      text: 'Sleeping',
      options: [
        { value: 0, text: 'My sleep is never disturbed by pain.' },
        { value: 1, text: 'My sleep is occasionally disturbed by pain.' },
        { value: 2, text: 'Because of pain, I have less than 6 hours sleep.' },
        { value: 3, text: 'Because of pain, I have less than 4 hours sleep.' },
        { value: 4, text: 'Because of pain, I have less than 2 hours sleep.' },
        { value: 5, text: 'Pain prevents me from sleeping at all.' },
      ],
    },
    {
      number: 8,
      section: 'Sex Life',
      text: 'Sex Life',
      allowSkip: true,
      skipLabel: 'Prefer not to answer',
      options: [
        { value: 0, text: 'My sex life is normal and causes no extra pain.' },
        { value: 1, text: 'My sex life is normal but causes some extra pain.' },
        { value: 2, text: 'My sex life is nearly normal but is very painful.' },
        { value: 3, text: 'My sex life is severely restricted by pain.' },
        { value: 4, text: 'My sex life is nearly absent because of pain.' },
        { value: 5, text: 'Pain prevents any sex life at all.' },
      ],
    },
    {
      number: 9,
      section: 'Social Life',
      text: 'Social Life',
      options: [
        { value: 0, text: 'My social life is normal and causes no extra pain.' },
        { value: 1, text: 'My social life is normal but increases the degree of pain.' },
        { value: 2, text: 'Pain has no significant effect on my social life apart from limiting more energetic activities.' },
        { value: 3, text: 'Pain has restricted my social life and I do not go out as often.' },
        { value: 4, text: 'Pain has restricted my social life to my home.' },
        { value: 5, text: 'I have no social life because of pain.' },
      ],
    },
    {
      number: 10,
      section: 'Traveling',
      text: 'Traveling',
      options: [
        { value: 0, text: 'I can travel anywhere without pain.' },
        { value: 1, text: 'I can travel anywhere but it causes extra pain.' },
        { value: 2, text: 'Pain is bad but I manage journeys over 2 hours.' },
        { value: 3, text: 'Pain restricts me to journeys of less than 1 hour.' },
        { value: 4, text: 'Pain restricts me to short necessary journeys under 30 minutes.' },
        { value: 5, text: 'Pain prevents me from traveling except to receive treatment.' },
      ],
    },
  ],
  calculateScore: (responses) => {
    let sum = 0;
    let answeredCount = 0;

    responses.forEach((value) => {
      if (value !== null && value !== undefined) {
        sum += value;
        answeredCount++;
      }
    });

    const isValid = answeredCount >= 1;
    const score = answeredCount > 0 ? (sum / (5 * answeredCount)) * 100 : 0;

    let interpretation = '';
    if (score <= 20) interpretation = 'Minimal disability';
    else if (score <= 40) interpretation = 'Moderate disability';
    else if (score <= 60) interpretation = 'Severe disability';
    else if (score <= 80) interpretation = 'Crippling disability';
    else interpretation = 'Bed-bound or exaggerating symptoms';

    return { score: Math.round(score * 10) / 10, isValid, answeredCount, interpretation };
  },
};

// QuickDASH - Disabilities of the Arm, Shoulder and Hand
export const QUICKDASH_INSTRUMENT: InstrumentDefinition = {
  code: 'QUICKDASH',
  name: 'QuickDASH',
  fullName: 'Disabilities of the Arm, Shoulder and Hand (Quick Version)',
  description: 'Measures disability related to upper extremity conditions',
  totalItems: 11,
  minScore: 0,
  maxScore: 100,
  scoreUnit: 'score',
  mcid: 10,
  minRequiredItems: 10,
  questions: [
    {
      number: 1,
      text: 'Open a tight or new jar',
      options: [
        { value: 1, text: 'No difficulty' },
        { value: 2, text: 'Mild difficulty' },
        { value: 3, text: 'Moderate difficulty' },
        { value: 4, text: 'Severe difficulty' },
        { value: 5, text: 'Unable' },
      ],
    },
    {
      number: 2,
      text: 'Do heavy household chores (e.g., wash walls, wash floors)',
      options: [
        { value: 1, text: 'No difficulty' },
        { value: 2, text: 'Mild difficulty' },
        { value: 3, text: 'Moderate difficulty' },
        { value: 4, text: 'Severe difficulty' },
        { value: 5, text: 'Unable' },
      ],
    },
    {
      number: 3,
      text: 'Carry a shopping bag or briefcase',
      options: [
        { value: 1, text: 'No difficulty' },
        { value: 2, text: 'Mild difficulty' },
        { value: 3, text: 'Moderate difficulty' },
        { value: 4, text: 'Severe difficulty' },
        { value: 5, text: 'Unable' },
      ],
    },
    {
      number: 4,
      text: 'Wash your back',
      options: [
        { value: 1, text: 'No difficulty' },
        { value: 2, text: 'Mild difficulty' },
        { value: 3, text: 'Moderate difficulty' },
        { value: 4, text: 'Severe difficulty' },
        { value: 5, text: 'Unable' },
      ],
    },
    {
      number: 5,
      text: 'Use a knife to cut food',
      options: [
        { value: 1, text: 'No difficulty' },
        { value: 2, text: 'Mild difficulty' },
        { value: 3, text: 'Moderate difficulty' },
        { value: 4, text: 'Severe difficulty' },
        { value: 5, text: 'Unable' },
      ],
    },
    {
      number: 6,
      text: 'Recreational activities in which you take some force or impact through your arm, shoulder, or hand',
      options: [
        { value: 1, text: 'No difficulty' },
        { value: 2, text: 'Mild difficulty' },
        { value: 3, text: 'Moderate difficulty' },
        { value: 4, text: 'Severe difficulty' },
        { value: 5, text: 'Unable' },
      ],
    },
    {
      number: 7,
      text: 'During the past week, to what extent has your arm, shoulder, or hand problem interfered with your normal social activities?',
      options: [
        { value: 1, text: 'Not at all' },
        { value: 2, text: 'Slightly' },
        { value: 3, text: 'Moderately' },
        { value: 4, text: 'Quite a bit' },
        { value: 5, text: 'Extremely' },
      ],
    },
    {
      number: 8,
      text: 'During the past week, were you limited in your work or other regular daily activities as a result of your arm, shoulder, or hand problem?',
      options: [
        { value: 1, text: 'Not at all' },
        { value: 2, text: 'Slightly' },
        { value: 3, text: 'Moderately' },
        { value: 4, text: 'Quite a bit' },
        { value: 5, text: 'Extremely' },
      ],
    },
    {
      number: 9,
      text: 'Arm, shoulder, or hand pain',
      options: [
        { value: 1, text: 'None' },
        { value: 2, text: 'Mild' },
        { value: 3, text: 'Moderate' },
        { value: 4, text: 'Severe' },
        { value: 5, text: 'Extreme' },
      ],
    },
    {
      number: 10,
      text: 'Tingling (pins and needles) in your arm, shoulder, or hand',
      options: [
        { value: 1, text: 'None' },
        { value: 2, text: 'Mild' },
        { value: 3, text: 'Moderate' },
        { value: 4, text: 'Severe' },
        { value: 5, text: 'Extreme' },
      ],
    },
    {
      number: 11,
      text: 'During the past week, how much difficulty have you had sleeping because of the pain in your arm, shoulder, or hand?',
      options: [
        { value: 1, text: 'No difficulty' },
        { value: 2, text: 'Mild difficulty' },
        { value: 3, text: 'Moderate difficulty' },
        { value: 4, text: 'Severe difficulty' },
        { value: 5, text: 'So much difficulty that I can\'t sleep' },
      ],
    },
  ],
  calculateScore: (responses) => {
    let sum = 0;
    let answeredCount = 0;

    responses.forEach((value) => {
      if (value !== null && value !== undefined) {
        sum += value;
        answeredCount++;
      }
    });

    const isValid = answeredCount >= 10;
    const score = isValid ? ((sum - answeredCount) / answeredCount) * 25 : 0;

    let interpretation = '';
    if (score <= 25) interpretation = 'Mild disability';
    else if (score <= 50) interpretation = 'Moderate disability';
    else if (score <= 75) interpretation = 'Severe disability';
    else interpretation = 'Very severe disability';

    return { score: Math.round(score * 10) / 10, isValid, answeredCount, interpretation };
  },
};

// LEFS - Lower Extremity Functional Scale
export const LEFS_INSTRUMENT: InstrumentDefinition = {
  code: 'LEFS',
  name: 'LEFS',
  fullName: 'Lower Extremity Functional Scale',
  description: 'Measures functional status related to lower extremity conditions',
  totalItems: 20,
  minScore: 0,
  maxScore: 80,
  scoreUnit: 'points',
  mcid: 9,
  questions: [
    { number: 1, text: 'Any of your usual work, housework, or school activities' },
    { number: 2, text: 'Your usual hobbies, recreational, or sporting activities' },
    { number: 3, text: 'Getting into or out of the bath' },
    { number: 4, text: 'Walking between rooms' },
    { number: 5, text: 'Putting on your shoes or socks' },
    { number: 6, text: 'Squatting' },
    { number: 7, text: 'Lifting an object, like a bag of groceries, from the floor' },
    { number: 8, text: 'Performing light activities around your home' },
    { number: 9, text: 'Performing heavy activities around your home' },
    { number: 10, text: 'Getting into or out of a car' },
    { number: 11, text: 'Walking 2 blocks' },
    { number: 12, text: 'Walking a mile' },
    { number: 13, text: 'Going up or down 10 stairs (about 1 flight of stairs)' },
    { number: 14, text: 'Standing for 1 hour' },
    { number: 15, text: 'Sitting for 1 hour' },
    { number: 16, text: 'Running on even ground' },
    { number: 17, text: 'Running on uneven ground' },
    { number: 18, text: 'Making sharp turns while running fast' },
    { number: 19, text: 'Hopping' },
    { number: 20, text: 'Rolling over in bed' },
  ].map((q) => ({
    ...q,
    options: [
      { value: 0, text: 'Extreme difficulty or unable to perform activity' },
      { value: 1, text: 'Quite a bit of difficulty' },
      { value: 2, text: 'Moderate difficulty' },
      { value: 3, text: 'A little bit of difficulty' },
      { value: 4, text: 'No difficulty' },
    ],
  })),
  calculateScore: (responses) => {
    let sum = 0;
    let answeredCount = 0;

    responses.forEach((value) => {
      if (value !== null && value !== undefined) {
        sum += value;
        answeredCount++;
      }
    });

    const isValid = answeredCount === 20;
    const score = sum;
    const percentage = (sum / 80) * 100;

    let interpretation = '';
    if (percentage >= 80) interpretation = 'Minimal to no disability';
    else if (percentage >= 60) interpretation = 'Mild disability';
    else if (percentage >= 40) interpretation = 'Moderate disability';
    else if (percentage >= 20) interpretation = 'Severe disability';
    else interpretation = 'Very severe disability';

    return { 
      score: Math.round(score * 10) / 10, 
      isValid, 
      answeredCount, 
      interpretation: `${interpretation} (${Math.round(percentage)}% function)` 
    };
  },
};

// Get instrument by code
export function getInstrument(code: InstrumentCode): InstrumentDefinition | null {
  switch (code) {
    case 'ODI':
      return ODI_INSTRUMENT;
    case 'QUICKDASH':
      return QUICKDASH_INSTRUMENT;
    case 'LEFS':
      return LEFS_INSTRUMENT;
    default:
      return null;
  }
}

// Get all instruments
export function getAllInstruments(): InstrumentDefinition[] {
  return [ODI_INSTRUMENT, QUICKDASH_INSTRUMENT, LEFS_INSTRUMENT];
}
