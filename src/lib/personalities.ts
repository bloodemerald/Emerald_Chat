import { Personality, PersonalityType } from "@/types/personality";

export const PERSONALITIES: Record<PersonalityType, Personality> = {
  toxic: {
    type: "toxic",
    name: "Toxic Troll",
    color: "#FF4444",
    emoji: "💀",
    weight: 1.2,
    messageTypes: [
      { type: "reaction", weight: 3 },
      { type: "normal", weight: 2 },
      { type: "emote", weight: 1 },
    ],
    signaturePhrases: [
      "skill issue fr fr",
      "bro is lost LMAO",
      "uninstall pls",
      "trash gameplay ngl",
      "L + ratio",
    ],
    emotes: ["KEKW", "OMEGALUL", "LULW", "💀", "😂"],
  },
  speedrunner: {
    type: "speedrunner",
    name: "Speedrunner",
    color: "#FF6B35",
    emoji: "⏱️",
    weight: 0.8,
    messageTypes: [
      { type: "prediction", weight: 3 },
      { type: "normal", weight: 2 },
      { type: "reaction", weight: 1 },
    ],
    signaturePhrases: [
      "that was a slow load",
      "reset timer",
      "PB potential",
      "frame perfect",
      "skip this cutscene",
    ],
    emotes: ["PB", "SPEEDRUN", "TIME", "⏱️", "FRAMES"],
  },
  emote_spammer: {
    type: "emote_spammer",
    name: "Emote Spammer",
    color: "#9B59B6",
    emoji: "😂",
    weight: 1.0,
    messageTypes: [
      { type: "emote", weight: 5 },
      { type: "reaction", weight: 1 },
    ],
    signaturePhrases: [
      "KEKW KEKW KEKW",
      "Pog Pog Pog",
      "LULW LULW",
      "monkaS monkaS",
      "OMEGALUL OMEGALUL",
    ],
    emotes: ["KEKW", "Pog", "LULW", "monkaS", "OMEGALUL", "Pepega", "Sadge", "Copium"],
  },
  clip_goblin: {
    type: "clip_goblin",
    name: "Clip Goblin",
    color: "#E74C3C",
    emoji: "📹",
    weight: 0.9,
    messageTypes: [
      { type: "command", weight: 3 },
      { type: "reaction", weight: 2 },
      { type: "normal", weight: 1 },
    ],
    signaturePhrases: [
      "CLIP IT NOW",
      "VOD THIS",
      "EDITOR PLS",
      "SAVED",
      "CLIP THAT MOMENT",
    ],
    emotes: ["CLIP", "VOD", "SAVED", "EDITOR", "📹", "⏰"],
  },
  spoiler_police: {
    type: "spoiler_police",
    name: "Spoiler Police",
    color: "#F39C12",
    emoji: "🚨",
    weight: 0.7,
    messageTypes: [
      { type: "command", weight: 3 },
      { type: "normal", weight: 2 },
    ],
    signaturePhrases: [
      "NO SPOILERS",
      "DONT SAY IT",
      "SPOILER ALERT",
      "NEW VIEWER HERE",
      "STOP SPOILING",
    ],
    emotes: ["SPOILER", "ALERT", "NO", "🚨", "STOP", "SHH"],
  },
  wholesome: {
    type: "wholesome",
    name: "Wholesome",
    color: "#27AE60",
    emoji: "💚",
    weight: 1.1,
    messageTypes: [
      { type: "normal", weight: 3 },
      { type: "reaction", weight: 2 },
    ],
    signaturePhrases: [
      "you got this!",
      "so proud of you",
      "keep going!",
      "amazing play!",
      "you're doing great!",
    ],
    emotes: ["💚", "❤️", "✨", "🌟", "💪", "🎉", "😊", "👏"],
  },
  theorycrafter: {
    type: "theorycrafter",
    name: "Theorycrafter",
    color: "#3498DB",
    emoji: "🧮",
    weight: 0.8,
    messageTypes: [
      { type: "normal", weight: 3 },
      { type: "prediction", weight: 2 },
    ],
    signaturePhrases: [
      "DPS would be higher with X",
      "optimal rotation is",
      "math says this is better",
      "try this synergy",
      "build theory says",
    ],
    emotes: ["MATH", "DPS", "BUILD", "OPTIMAL", "🧮", "📊", "SYNERGY", "META"],
  },
  reaction_only: {
    type: "reaction_only",
    name: "Reaction Only",
    color: "#E91E63",
    emoji: "😱",
    weight: 1.3,
    messageTypes: [
      { type: "reaction", weight: 5 },
    ],
    signaturePhrases: [
      "BRO??",
      "NO WAY",
      "YOOOOO",
      "WHAAAAAT",
      "CANT BELIEVE",
    ],
    emotes: ["BRO", "NO", "WAY", "YOOO", "WHAT", "😱", "🤯", "💀"],
  },
  mobile_only: {
    type: "mobile_only",
    name: "Mobile Only",
    color: "#795548",
    emoji: "📱",
    weight: 0.9,
    messageTypes: [
      { type: "question", weight: 2 },
      { type: "normal", weight: 3 },
    ],
    signaturePhrases: [
      "my data",
      "too many effects",
      "cant see on phone",
      "lower quality pls",
      "buffering",
    ],
    emotes: ["📱", "DATA", "BUFFER", "LAG", "PHONE", "MOBILE", "📶", "📉"],
  },
  helpful: {
    type: "helpful",
    name: "Helpful Guide",
    color: "#4CAF50",
    emoji: "💡",
    weight: 1.0,
    messageTypes: [
      { type: "normal", weight: 3 },
      { type: "question", weight: 1 },
      { type: "prediction", weight: 1 },
    ],
    signaturePhrases: [
      "try going left there",
      "you should upgrade first",
      "dont forget to save",
      "tip:",
      "helpful advice:",
    ],
    emotes: ["Pog", "PogChamp", "👍", "✨"],
  },
  meme: {
    type: "meme",
    name: "Meme Lord",
    color: "#9C27B0",
    emoji: "🎭",
    weight: 1.5,
    messageTypes: [
      { type: "emote", weight: 4 },
      { type: "copypasta", weight: 2 },
      { type: "reaction", weight: 1 },
    ],
    signaturePhrases: [
      "KEKW",
      "Copium overdose",
      "PogChamp moment",
      "based and redpilled",
      "no cap fr fr",
    ],
    emotes: ["KEKW", "POGGERS", "monkaS", "EZ", "Clap", "OMEGALUL"],
  },
  backseat: {
    type: "backseat",
    name: "Backseat Gamer",
    color: "#FF9800",
    emoji: "🎮",
    weight: 1.3,
    messageTypes: [
      { type: "normal", weight: 3 },
      { type: "question", weight: 2 },
      { type: "prediction", weight: 1 },
    ],
    signaturePhrases: [
      "why didnt you pick that up??",
      "wrong choice buddy",
      "should've gone the other way",
      "you missed it",
      "not like this...",
    ],
    emotes: ["NotLikeThis", "FailFish", "SMOrc", "🤦"],
  },
  hype: {
    type: "hype",
    name: "Hype Man",
    color: "#FFD700",
    emoji: "🔥",
    weight: 1.1,
    messageTypes: [
      { type: "reaction", weight: 3 },
      { type: "emote", weight: 2 },
      { type: "normal", weight: 1 },
    ],
    signaturePhrases: [
      "LETS GOOOO",
      "youre popping off rn",
      "W streamer W chat",
      "THIS IS IT",
      "HYPE HYPE HYPE",
    ],
    emotes: ["PogChamp", "POGGERS", "Kreygasm", "🔥", "💪", "Pog"],
  },
  lurker: {
    type: "lurker",
    name: "Lurker",
    color: "#607D8B",
    emoji: "👀",
    weight: 0.5,
    messageTypes: [
      { type: "question", weight: 3 },
      { type: "normal", weight: 1 },
    ],
    signaturePhrases: [
      "whats happening",
      "wait what game is this",
      "just got here",
      "context?",
      "did i miss something",
    ],
    emotes: ["?", "👀", "🤔", "monkaHmm"],
  },
  spammer: {
    type: "spammer",
    name: "Spammer",
    color: "#E91E63",
    emoji: "📢",
    weight: 1.4,
    messageTypes: [
      { type: "emote", weight: 3 },
      { type: "copypasta", weight: 2 },
      { type: "reaction", weight: 1 },
    ],
    signaturePhrases: [
      "GG GG GG",
      "DO IT DO IT",
      "OMEGALUL",
      "SPAM THIS",
      "LETS GO LETS GO",
    ],
    emotes: ["OMEGALUL", "KEKW", "EZ", "Clap", "LULW"],
  },
  analyst: {
    type: "analyst",
    name: "Analyst",
    color: "#2196F3",
    emoji: "🧠",
    weight: 0.8,
    messageTypes: [
      { type: "normal", weight: 4 },
      { type: "prediction", weight: 2 },
    ],
    signaturePhrases: [
      "your positioning could be better",
      "thats a 200 IQ play",
      "optimal route would be...",
      "statistically speaking",
      "from a strategic standpoint",
    ],
    emotes: ["5Head", "🧠", "galaxy brain", "Pepega"],
  },
};

export const USERNAME_POOLS: Record<PersonalityType, string[]> = {
  toxic: [
    "xXShadowDestroyerXx", "NotToxicBTW", "RatioKing", "SkillIssueSam",
    "L_Enjoyer", "TouchGrassPlz", "CopeMaster", "SaltyVibes",
    "TiltedGaming", "BigMadEnergy", "TrashTalkTim", "NoCapKing"
  ],
  helpful: [
    "FriendlyHelper", "TipsAndTricks", "GuideGamer", "NiceVibes",
    "HelpfulHomie", "SupportSquad", "ProTipPete", "AdviceAce",
    "CoachCorner", "MentorMode", "PositivePat", "HelpfulHank"
  ],
  meme: [
    "PepegaLord", "KEKWEnjoyer", "MemeDealer420", "BasedAndRedpilled",
    "CopiumSupply", "SigmaGrindset", "BrainRotted", "GenZHumor",
    "TouchGrass123", "RizzWizard", "SussyBaka", "BigChungusLover"
  ],
  backseat: [
    "BackseatPro", "AdviceAndy", "ShouldaWoulda", "ArmchairGamer",
    "WrongChoice", "ObviousPlay", "ToldYouSo", "MissedOpportunity",
    "BetterStrats", "QuestionablePlays", "NotLikeThis", "FacepalmFred"
  ],
  hype: [
    "HypeTrainConductor", "PogChampion", "LetsGooooo", "EnergyDrink",
    "HypeBeast", "ExcitedEvan", "PureHype", "ClipThat",
    "POGGERSMoment", "W_Streamer", "HypeSquad", "PumpedUp"
  ],
  lurker: [
    "JustLurking", "SilentWatcher", "NewbieViewer", "FirstTimer",
    "QuietObserver", "JustGotHere", "ConfusedViewer", "WhatsMissed",
    "LateToStream", "CasualWatcher", "PassingBy", "RandomViewer"
  ],
  spammer: [
    "SpamAccount", "CapsLockWarrior", "RepeatOffender", "EchoEcho",
    "CloneArmy", "SpamBot9000", "CopyPaster", "MassRepeat",
    "AllCapsGang", "SpamKing", "DoublePost", "TripleText"
  ],
  analyst: [
    "StrategyMind", "TacticalThinking", "BigBrainPlays", "AnalystAlex",
    "MetaGamer", "IQMaxed", "OptimalPath", "TheorycrAfter",
    "ProAnalysis", "GameTheory", "SmartPlays", "CalculatedRisk"
  ],
  speedrunner: [
    "SpeedDemon", "FramePerfect", "PBHunter", "AnyPercent",
    "GlitchMaster", "RouteOptimizer", "WorldRecord", "SplitRunner",
    "TASBot", "ToolAssisted", "SequenceBreak", "SpeedKing"
  ],
  emote_spammer: [
    "EmoteLord", "KEKWSpammer", "PogChamp", "LULWMaster",
    "EmoteMachine", "ReactionEmote", "EmojiOnly", "SpamEmotes",
    "KEKWKing", "PogSpammer", "EmoteFlood", "ReactionGuy"
  ],
  clip_goblin: [
    "ClipHunter", "VODSaver", "TimestampKing", "ClipGoblin",
    "EditorNeeded", "ClipThis", "VODPlease", "ClipLord",
    "TimestampPro", "ClipSaver", "VODMaster", "ClipHunter"
  ],
  spoiler_police: [
    "SpoilerAlert", "NoSpoilers", "StoryGuardian", "PlotPolice",
    "SpoilerFree", "StorySafe", "PlotGuard", "SpoilerCop",
    "NoSpoils", "StoryProtector", "PlotShield", "SpoilerWatch"
  ],
  wholesome: [
    "PositiveVibes", "GoodVibesOnly", "SupportiveSoul", "KindHeart",
    "WholesomeKing", "EncourageBot", "PositivePal", "GoodMood",
    "KindSpirit", "SupportiveFriend", "WholesomeVibes", "PositiveEnergy"
  ],
  theorycrafter: [
    "BuildScientist", "TheoryMaster", "MetaAnalyst", "DPSExpert",
    "OptimalBuild", "Theorycrafter", "BuildTheory", "MetaTheory",
    "DPSMath", "OptimalPath", "BuildOptimal", "TheoryExpert"
  ],
  reaction_only: [
    "ReactionKing", "CapsLockGuy", "NoWayBro", "WhatTheHeck",
    "ReactionMaster", "OMGReaction", "CapsLord", "ReactionPro",
    "WhatReaction", "OMGKing", "ReactionExpert", "CapsMaster"
  ],
  mobile_only: [
    "PhoneViewer", "MobileGamer", "DataSaver", "BufferKing",
    "MobileOnly", "PhoneOnly", "DataUser", "MobileStream",
    "PhoneWatch", "DataLimited", "MobileView", "BufferTime"
  ],
};

// Cache for weighted pools to avoid regenerating on every selection
const weightedPoolCache = new Map<string, PersonalityType[]>();

export function selectPersonality(settings: Record<PersonalityType, boolean>): PersonalityType {
  const enabledPersonalities = Object.entries(settings)
    .filter(([_, enabled]) => enabled)
    .map(([type]) => type as PersonalityType);

  if (enabledPersonalities.length === 0) {
    enabledPersonalities.push("meme", "helpful", "toxic");
  }

  // Create a cache key from enabled personalities
  const cacheKey = enabledPersonalities.sort().join(',');

  // Check cache first
  let weightedPool = weightedPoolCache.get(cacheKey);

  if (!weightedPool) {
    // Build weighted pool if not in cache
    weightedPool = [];
    enabledPersonalities.forEach((type) => {
      const personality = PERSONALITIES[type];
      const count = Math.ceil(personality.weight * 10);
      for (let i = 0; i < count; i++) {
        weightedPool!.push(type);
      }
    });

    // Store in cache
    weightedPoolCache.set(cacheKey, weightedPool);

    // Limit cache size to prevent memory leaks
    if (weightedPoolCache.size > 50) {
      const firstKey = weightedPoolCache.keys().next().value;
      if (firstKey) {
        weightedPoolCache.delete(firstKey);
      }
    }
  }

  return weightedPool[Math.floor(Math.random() * weightedPool.length)];
}

/**
 * Clear the weighted pool cache (useful when personalities are modified)
 */
export function clearPersonalityCache(): void {
  weightedPoolCache.clear();
}

export function generateUsername(personality: PersonalityType): string {
  const pool = USERNAME_POOLS[personality];
  const base = pool[Math.floor(Math.random() * pool.length)];
  const suffix = Math.floor(Math.random() * 9999);
  return `${base}${suffix}`;
}

export function getPersonalityPrompt(personality: PersonalityType): string {
  const prompts: Record<PersonalityType, string> = {
    toxic: "toxic troll - roast gameplay with 'L', 'ratio', 'skill issue', 'trash ngl', 'bro is lost LULW'. keep it savage but short. use lowercase mostly",
    helpful: "helpful guide - give quick tips like 'go left here', 'try upgrading first', 'dont forget to save'. be encouraging but casual. no perfect grammar",
    meme: "meme lord - spam emotes (KEKW, OMEGALUL, Pog), use 'no cap fr fr', 'based', 'copium', '???'. mostly just emotes and slang",
    backseat: "backseat gamer - point out mistakes like 'why didnt you...', 'should've done X', 'told you'. be annoying but casual",
    hype: "hype man - ALL CAPS energy. 'LETS GOOOO', 'YOOO', 'W STREAMER', 'POGGERS'. stretch words (YOOOOOO). pure hype",
    lurker: "lurker - confused viewer asking 'wait what', 'context?', 'just got here', 'whats happening'. short questions",
    spammer: "spammer - repeat stuff. 'GG GG GG', 'DO IT DO IT', spam same emote multiple times. caps lock energy",
    analyst: "analyst - smart observations like 'ur positioning is off', '200 IQ play', 'optimal route is...'. still casual tho",
    speedrunner: "speedrunner - obsessed with speed and efficiency. 'skip this cutscene', 'that was a slow load', 'reset timer', 'PB potential', 'frame perfect'. always thinking about time saves",
    emote_spammer: "emote spammer - communicates almost entirely with emotes. 'KEKW KEKW KEKW', 'Pog Pog', 'LULW LULW', 'monkaS'. rarely uses actual words",
    clip_goblin: "clip goblin - timestamps everything funny. 'CLIP IT 2:34', 'VOD THIS', 'SAVED', 'EDITOR PLS'. always yelling to clip moments",
    spoiler_police: "spoiler police - warns about spoilers constantly. 'NO SPOILERS', 'DONT SAY IT', 'SPOILER ALERT', 'NEW VIEWER HERE'. very protective about story content",
    wholesome: "wholesome vibes - relentlessly positive. 'you got this!', 'so proud of you', 'keep going!', 'amazing play!'. pure encouragement and support",
    theorycrafter: "theorycrafter - build scientist. 'try this synergy', 'DPS would be higher with X', 'optimal rotation is...', 'math says this is better'. talks about builds and optimization",
    reaction_only: "reaction only - caps lock reactors. 'BRO??', 'NO WAY', 'YOOOOO', 'WHAAAAAT', 'CANT BELIEVE'. just pure reactions with stretched vowels",
    mobile_only: "mobile only - watching on phone. 'my data', 'too many effects', 'cant see on phone', 'lower quality pls', 'buffering'. complains about performance and data usage",
  };
  return prompts[personality];
}
