// bas_content seed data
const DEFAULT_CHAPTERS = [
  "Introduction to Money & Bitcoin",
  "How Bitcoin Works — The Basics",
  "Bitcoin Wallets & Keys",
  "Making Bitcoin Transactions",
  "Bitcoin Security & Self-Custody",
  "The Lightning Network",
  "Bitcoin in Africa — Use Cases",
  "Bitcoin & the Economy",
  "Bitcoin Mining & Energy",
  "The Future of Bitcoin"
];

export const initStorage = () => {
  const CHAPTER_SEEDS: Record<number, any> = {
    1: {
      id: 1,
      title: "Introduction to Money & Bitcoin",
      description: "Understand the evolutionary history of human money, from barter and commodity money to gold standards, modern centralized fiat, and how the sovereign scarcity of Bitcoin solves digital double-spending.",
      estimatedMinutes: 30,
      satsPossible: 2,
      enabled: true,
      quizMode: 'manual',
      googleFormUrl: "",
      videos: [
        { id: "v1_1", title: "The History of Money — Why Scarce Media Wins", youtubeUrl: "https://www.youtube.com/watch?v=IP0y984Z_V8", duration: "14:15" },
        { id: "v1_2", title: "What is Bitcoin? — Digital Gold for the Future", youtubeUrl: "https://www.youtube.com/watch?v=41JCp5tYci0", duration: "05:40" }
      ],
      resources: [
        { id: "r1_1", title: "The Bitcoin Standard — Chapters 1-3 Summary", description: "A classic summary describing primitive money like Rai stones, gold reserves, and fiat inflation.", type: "pdf", url: "https://saifedean.com/thebitcoinstandard" },
        { id: "r1_2", title: "The Original Bitcoin Whitepaper by Satoshi", description: "The original 9-page absolute classic whitepaper explaining cryptographic electronic cash.", type: "link", url: "https://bitcoin.org/bitcoin.pdf" }
      ],
      quiz: [
        { id: "q1_1", question: "What primary problem does Bitcoin solve that previous digital currencies could not?", options: { A: "Slower transaction speeds", B: "The double-spending problem", C: "Energy grid stability", D: "Smart contracts execution" }, correct: "B" },
        { id: "q1_2", question: "What is the absolute maximum supply limit of Bitcoins that will ever exist?", options: { A: "100 Million", B: "21 Million", C: "No limit (infinitely inflates)", D: "2.1 Billion" }, correct: "B" },
        { id: "q1_3", question: "Who published the Bitcoin Whitepaper in October 2008?", options: { A: "Satoshi Nakamoto", B: "Hal Finney", C: "Vitalik Buterin", D: "Nick Szabo" }, correct: "A" }
      ]
    },
    2: {
      id: 2,
      title: "How Bitcoin Works — The Basics",
      description: "Explore the mechanics of transactions, blockchain databases, and miner verification. Learn how peer-to-peer miners secure the public ledger using proof-of-work without trusting central institutions.",
      estimatedMinutes: 40,
      satsPossible: 2,
      enabled: true,
      quizMode: 'manual',
      googleFormUrl: "",
      videos: [
        { id: "v2_1", title: "But how does Bitcoin actually work? (Visualized)", youtubeUrl: "https://www.youtube.com/watch?v=bBC-nXj3Ng4", duration: "25:30" }
      ],
      resources: [
        { id: "r2_1", title: "3Blue1Brown — Cryptocurrency Mechanics", description: "An incredible mathematical animation that builds digital signatures, private ledger hashes, and mining step-by-step.", type: "link", url: "https://www.youtube.com/watch?v=bBC-nXj3Ng4" }
      ],
      quiz: [
        { id: "q2_1", question: "What computer memory mechanism links sequential bundles of transactions into an unalterable history?", options: { A: "A local memory card", B: "Cryptographic hash chain linking (Blockchain)", C: "An excel spreadsheet auto-sync", D: "Federal Reserve mainframes" }, correct: "B" },
        { id: "q2_2", question: "What cryptographic hash algorithm does Bitcoin use to secure mining?", options: { A: "MD5", B: "SHA-256", C: "Blowfish-12", D: "RSA-2048" }, correct: "B" }
      ]
    },
    3: {
      id: 3,
      title: "Bitcoin Wallets & Keys",
      description: "Demystify private keys, public keys, and seed phrases. Learn how to securely generate and protect your digital gold vault using private offline keys and standard seed words.",
      estimatedMinutes: 35,
      satsPossible: 2,
      enabled: true,
      quizMode: 'manual',
      googleFormUrl: "",
      videos: [
        { id: "v3_1", title: "How Bitcoin Wallets, Keys & BIP39 Seeds Work", youtubeUrl: "https://www.youtube.com/watch?v=IP0y984Z_V8", duration: "12:10" }
      ],
      resources: [
        { id: "r3_1", title: "Choose Your Own Bitcoin Wallet", description: "The official guide detailing hot wallets, hardware vaults, self-custody checklists, and safety tips.", type: "link", url: "https://bitcoin.org/en/choose-your-wallet" }
      ],
      quiz: [
        { id: "q3_1", question: "What crucial asset must you NEVER share with anyone to prevent total loss of your Bitcoin funds?", options: { A: "Your Public receiving address", B: "Your Seed Phrase / Private Key", C: "Your Wallet's nickname", D: "Your transaction block height" }, correct: "B" },
        { id: "q3_2", question: "If your phone breaks, how can you restore access to all your funds in another wallet software?", options: { A: "By emailing Apple/Google customer support", B: "By entering your 12-to-24 word recovery seed phrase", C: "By showing your official government ID to a Bitcoin office", D: "Funds are permanently lost when hardware fails" }, correct: "B" }
      ]
    },
    4: {
      id: 4,
      title: "Making Bitcoin Transactions",
      description: "Understand transaction structures, miner incentives, TxIDs, mempools, and transaction fees. Learn how to send, track, and verify on-chain ledger operations.",
      estimatedMinutes: 45,
      satsPossible: 2,
      enabled: true,
      quizMode: 'manual',
      googleFormUrl: "",
      videos: [
        { id: "v4_1", title: "Bitcoin Transactions and the Mempool Explained", youtubeUrl: "https://www.youtube.com/watch?v=bBC-nXj3Ng4", duration: "08:15" }
      ],
      resources: [
        { id: "r4_1", title: "Mempool.space Explorer Guide", description: "Visualize the queue of unconfirmed transactions, see fees in real-time, and check how blocks settle.", type: "link", url: "https://mempool.space" }
      ],
      quiz: [
        { id: "q4_1", question: "Where do unconfirmed Bitcoin transactions sit while they wait for miners to pull them into a block?", options: { A: "The physical server vault", B: "The Mempool (Memory Pool)", C: "An off-grid battery pack", D: "The bank clearing queue" }, correct: "B" },
        { id: "q4_2", question: "What is sat/vB in a transaction reference?", options: { A: "Satoshi per virtual Byte (fee density value)", B: "Satoshis per volumetric Battery", C: "Salary per verified Broker", D: "Satoshi speed value" }, correct: "A" }
      ]
    },
    5: {
      id: 5,
      title: "Bitcoin Security & Self-Custody",
      description: "Learn high-grade security practices, from hardware wallets to multi-layered seed storage. Deep dive into the self-sovereignty mindset where you are your own central bank.",
      estimatedMinutes: 50,
      satsPossible: 2,
      enabled: true,
      quizMode: 'manual',
      googleFormUrl: "",
      videos: [
        { id: "v5_1", title: "Security Best Practices for Cold Storage & Self-Custody", youtubeUrl: "https://www.youtube.com/watch?v=IP0y984Z_V8", duration: "16:40" }
      ],
      resources: [
        { id: "r5_1", title: "Glacier Protocol: Sovereign Self-Custody Guide", description: "Ultra-high-security offline key generation protocols designed for long-term safe-keeping.", type: "pdf", url: "https://glacierprotocol.org/" }
      ],
      quiz: [
        { id: "q5_1", question: "What represents the safest option for storing significant long-term Bitcoin savings?", options: { A: "A local desktop browser extension", B: "A dedicated hardware wallet (Cold Storage)", C: "Leaving it on a centralized exchange account", D: "In a physical bank vault on paper" }, correct: "B" }
      ]
    },
    6: {
      id: 6,
      title: "The Lightning Network",
      description: "Speed up transactions to millisecond scaling with sub-penny fees! Understand micropayment routing channels, payment invoices, and off-chain scaling innovations.",
      estimatedMinutes: 45,
      satsPossible: 2,
      enabled: true,
      quizMode: 'manual',
      googleFormUrl: "",
      videos: [
        { id: "v6_1", title: "The Lightning Network Explained Simply", youtubeUrl: "https://www.youtube.com/watch?v=vVj448m7_pA", duration: "11:30" }
      ],
      resources: [
        { id: "r6_1", title: "Lightning Network Whitepaper Summary", description: "The original modular architecture proposing instant, high-volume micropayment channels off-chain.", type: "link", url: "https://lightning.network" }
      ],
      quiz: [
        { id: "q6_1", question: "How does the Lightning Network achieve near-instant speed and fractions of a sat in fees?", options: { A: "By using faster credit card wires", B: "By opening off-chain multi-signature payment channels", C: "By mining faster block heights every 10 seconds", D: "By converting sats into centralized dollars" }, correct: "B" },
        { id: "q6_2", question: "What is the smallest divisible fraction of a Bitcoin recorded in standard client wallets?", options: { A: "A BitCent", B: "A Satoshi", C: "A Nakamoto", D: "A Micro-Milli" }, correct: "B" }
      ]
    },
    7: {
      id: 7,
      title: "Bitcoin in Africa — Use Cases",
      description: "Discover real-world empowerment in countries like Nigeria, Kenya, Ghana, and Zimbabwe. See how inflation hedge, remittance cost-saving, and borderless trade build local financial resilience.",
      estimatedMinutes: 35,
      satsPossible: 2,
      enabled: true,
      quizMode: 'manual',
      googleFormUrl: "",
      videos: [
        { id: "v7_1", title: "Bitcoin in Africa: Remittance, Freedom & Real Inflation Shielding", youtubeUrl: "https://www.youtube.com/watch?v=41JCp5tYci0", duration: "15:20" }
      ],
      resources: [
        { id: "r7_1", title: "Human Rights Foundation: Financial Freedom Reports", description: "Global impact studies demonstrating how inflation-oppressed regions thrive on open decentralized networks.", type: "link", url: "https://hrf.org" }
      ],
      quiz: [
        { id: "q7_1", question: "What major issues in cross-border trade does Bitcoin Lightning solve for entrepreneurs in Africa?", options: { A: "High wire transfer fees and currency exchange controls", B: "Import licensing limits", C: "Physical border checks", D: "Electricity transmission speed" }, correct: "A" }
      ]
    },
    8: {
      id: 8,
      title: "Bitcoin & the Economy",
      description: "Understand the economic shift from credit-fueled inflationary models to hard-money deflationary ones. See how price signals behave on sound digital reserves.",
      estimatedMinutes: 45,
      satsPossible: 2,
      enabled: true,
      quizMode: 'manual',
      googleFormUrl: "",
      videos: [
        { id: "v8_1", title: "Austrian Economics vs Keynesian Inflationary Theory", youtubeUrl: "https://www.youtube.com/watch?v=IP0y984Z_V8", duration: "18:30" }
      ],
      resources: [
        { id: "r8_1", title: "Fiat Standards Summary", description: "The study of fiat central banking systems and debt-cycle leverage bubbles.", type: "link", url: "https://saifedean.com" }
      ],
      quiz: [
        { id: "q8_1", question: "According to Austrian Economics, what represents the natural result of technological productivity under hard money?", options: { A: "High consumer inflation", B: "Gradual falling prices of goods (sound price deflation)", C: "An increase in interest rates", D: "Central banking interventions" }, correct: "B" }
      ]
    },
    9: {
      id: 9,
      title: "Bitcoin Mining & Energy",
      description: "Deconstruct the energy debate. Learn how miners utilize wasted energy, power remote grids, and transform global energy economics using computational competition.",
      estimatedMinutes: 40,
      satsPossible: 2,
      enabled: true,
      quizMode: 'manual',
      googleFormUrl: "",
      videos: [
        { id: "v9_1", title: "The Truth About Cryptographic Mining and Green Energy Optimization", youtubeUrl: "https://www.youtube.com/watch?v=bBC-nXj3Ng4", duration: "14:10" }
      ],
      resources: [
        { id: "r9_1", title: "Sovereign Stranded Energy Captures", description: "How mining companies partner with hydro-power and bio-gas generators to stabilize rural power plants.", type: "pdf", url: "https://bitcoinmagazine.com" }
      ],
      quiz: [
        { id: "q9_1", question: "How does Bitcoin mining incentivize the development of green renewable energy resources?", options: { A: "By miners receiving government tax grants by law", B: "By monetizing stranded/wasted off-grid surplus power locally", C: "By mining coins without high computing chips", D: "By paying miners in oil credits" }, correct: "B" }
      ]
    },
    10: {
      id: 10,
      title: "The Future of Bitcoin",
      description: "Look ahead at smart contracts, decentralized privacy upgrades (Taproot/Schnorr), and global game theory as nation-states adopt Bitcoin into strategic treasury reserves.",
      estimatedMinutes: 50,
      satsPossible: 2,
      enabled: true,
      quizMode: 'manual',
      googleFormUrl: "",
      videos: [
        { id: "v10_1", title: "Bitcoin Nation-State Adoption Game Theory", youtubeUrl: "https://www.youtube.com/watch?v=41JCp5tYci0", duration: "20:00" }
      ],
      resources: [
        { id: "r10_1", title: "The Sovereign Individual Study", description: "Classic predictions concerning cryptography, sovereignty, and portable capital assets.", type: "link", url: "https://wikipedia.org/wiki/The_Sovereign_Individual" }
      ],
      quiz: [
        { id: "q10_1", question: "What upgrade in 2021 improved Bitcoin's script capabilities and transaction size privacy?", options: { A: "SegWit", B: "Taproot Upgrade", C: "Block Enlargement Act", D: "Lightning channel expansion" }, correct: "B" }
      ]
    }
  };

  const existingContentStr = localStorage.getItem('bas_content');
  let deservesSeeding = !existingContentStr;

  if (existingContentStr) {
    try {
      const parsed = JSON.parse(existingContentStr);
      const chapters = parsed.chapters || {};
      if (!chapters[1] || !chapters[1].videos || chapters[1].videos.length === 0) {
        deservesSeeding = true;
      } else {
        // Automatically force all existing chapters to be 2 sats reward
        let contentModified = false;
        Object.keys(chapters).forEach((cid) => {
          if (chapters[cid].satsPossible !== 2) {
            chapters[cid].satsPossible = 2;
            contentModified = true;
          }
        });
        if (contentModified) {
          localStorage.setItem('bas_content', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      deservesSeeding = true;
    }
  }

  if (deservesSeeding) {
    const chapters: Record<number, any> = {};
    for (let idx = 0; idx < DEFAULT_CHAPTERS.length; idx++) {
      const id = idx + 1;
      const seed = CHAPTER_SEEDS[id];
      if (seed) {
        chapters[id] = seed;
      } else {
        chapters[id] = {
          id,
          title: DEFAULT_CHAPTERS[idx],
          description: "Learn essential fundamentals and local impact strategies.",
          estimatedMinutes: 45,
          enabled: true,
          videos: [
            { id: `v${id}_1`, title: "Chapter Overview Lecture", youtubeUrl: "https://www.youtube.com/watch?v=41JCp5tYci0", duration: "10:00" }
          ],
          resources: [
            { id: `r${id}_1`, title: "Satoshi Library Material", description: "Essential open-source materials detailing current sovereign trends.", type: "link", url: "https://bitcoin.org" }
          ],
          quizMode: 'manual',
          googleFormUrl: "",
          quiz: [
            { id: `q${id}_1`, question: "What serves as the primary utility of decentralized digital proof-of-work money?", options: { A: "Trustless currency ownership without third-parties", B: "Central government stabilization", C: "E-mail message encryption", D: "Credit card clearing speed" }, correct: "A" }
          ],
          satsPossible: 2
        };
      }
    }
    localStorage.setItem('bas_content', JSON.stringify({ chapters, announcements: [] }));
  }

  const users = JSON.parse(localStorage.getItem('bas_users') || '{}');
  
  // Seed default admin accounts to prevent "user not found" and to enable immediate bypass of onboarding
  if (!users["admin@bitcoinafricastory.com"]) {
    users["admin@bitcoinafricastory.com"] = {
      name: "BAS Administrator",
      email: "admin@bitcoinafricastory.com",
      password: "BAS_Admin_2024",
      joinedDate: new Date().toISOString(),
      onboardingComplete: true,
      role: "admin",
      progress: {},
      totalSats: 1000,
      satsLog: [],
      xp: 500,
      xpLog: [],
      level: "Acanthor",
      badges: [],
      streak: 5,
      lastActiveDate: new Date().toISOString(),
    };
  } else {
    users["admin@bitcoinafricastory.com"].onboardingComplete = true;
    users["admin@bitcoinafricastory.com"].role = "admin";
  }

  if (!users["smartdestinyonyekachi@gmail.com"]) {
    users["smartdestinyonyekachi@gmail.com"] = {
      name: "Destiny Admin",
      email: "smartdestinyonyekachi@gmail.com",
      password: "BASadmin",
      joinedDate: new Date().toISOString(),
      onboardingComplete: true,
      role: "admin",
      progress: {},
      totalSats: 0,
      satsLog: [],
      xp: 1200,
      xpLog: [],
      level: "Bitcoin Veteran",
      badges: [],
      streak: 12,
      lastActiveDate: new Date().toISOString(),
    };
  } else {
    users["smartdestinyonyekachi@gmail.com"].onboardingComplete = true;
    users["smartdestinyonyekachi@gmail.com"].role = "admin";
  }

  // Seed initial cohort of other students from around Africa so that the Leaderboard, Instructor Dashboard, and Admin Panel are fully populated and interactive
  const defaultStudents = [
    {
      name: "Chidi Benson",
      email: "chidi.b@bitcoinafricastory.com",
      password: "studentpassword",
      country: "Nigeria",
      joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      onboardingComplete: true,
      role: "student",
      progress: {
        "1": { status: "completed", quizScore: 3, quizPassed: true },
        "2": { status: "completed", quizScore: 2, quizPassed: true },
        "3": { status: "completed", quizScore: 3, quizPassed: true },
        "4": { status: "completed", quizScore: 2, quizPassed: true },
        "5": { status: "completed", quizScore: 3, quizPassed: true },
        "6": { status: "completed", quizScore: 3, quizPassed: true },
        "7": { status: "completed", quizScore: 3, quizPassed: true },
        "8": { status: "completed", quizScore: 2, quizPassed: true },
      },
      totalSats: 16,
      satsLog: [],
      xp: 880,
      xpLog: [],
      level: "Lightning Pioneer",
      badges: ["first_step", "knowledge_seeker", "african_pioneer", "sats_stacker"],
      streak: 6,
      lastActiveDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      name: "Kofi Mensah",
      email: "kofi.m@bitcoinafricastory.com",
      password: "studentpassword",
      country: "Ghana",
      joinedDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      onboardingComplete: true,
      role: "student",
      progress: {
        "1": { status: "completed", quizScore: 3, quizPassed: true },
        "2": { status: "completed", quizScore: 3, quizPassed: true },
        "3": { status: "completed", quizScore: 3, quizPassed: true },
        "4": { status: "completed", quizScore: 3, quizPassed: true },
        "5": { status: "completed", quizScore: 3, quizPassed: true },
        "6": { status: "completed", quizScore: 3, quizPassed: true },
        "7": { status: "completed", quizScore: 3, quizPassed: true },
        "8": { status: "completed", quizScore: 3, quizPassed: true },
        "9": { status: "completed", quizScore: 3, quizPassed: true },
        "10": { status: "completed", quizScore: 3, quizPassed: true },
      },
      totalSats: 20,
      xp: 1450,
      xpLog: [],
      level: "Satoshi Scholar",
      badges: ["first_step", "knowledge_seeker", "diplomat", "quiz_master", "consistent", "african_pioneer", "sats_stacker", "fast_learner"],
      streak: 15,
      lastActiveDate: new Date().toISOString(),
    },
    {
      name: "Amina Diop",
      email: "amina.d@bitcoinafricastory.com",
      password: "studentpassword",
      country: "Senegal",
      joinedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      onboardingComplete: true,
      role: "student",
      progress: {
        "1": { status: "completed", quizScore: 3, quizPassed: true },
        "2": { status: "completed", quizScore: 2, quizPassed: true },
        "3": { status: "completed", quizScore: 3, quizPassed: true },
        "4": { status: "completed", quizScore: 3, quizPassed: true },
      },
      totalSats: 8,
      xp: 450,
      xpLog: [],
      level: "Bitcoin Cadet",
      badges: ["first_step", "african_pioneer"],
      streak: 3,
      lastActiveDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      name: "Zanele Dlamini",
      email: "zanele.d@bitcoinafricastory.com",
      password: "studentpassword",
      country: "South Africa",
      joinedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      onboardingComplete: true,
      role: "student",
      progress: {
        "1": { status: "completed", quizScore: 3, quizPassed: true },
        "2": { status: "completed", quizScore: 3, quizPassed: true },
        "3": { status: "completed", quizScore: 2, quizPassed: true },
        "4": { status: "completed", quizScore: 3, quizPassed: true },
        "5": { status: "completed", quizScore: 3, quizPassed: true },
        "6": { status: "completed", quizScore: 2, quizPassed: true },
        "7": { status: "completed", quizScore: 3, quizPassed: true },
        "8": { status: "completed", quizScore: 3, quizPassed: true },
        "9": { status: "completed", quizScore: 3, quizPassed: true },
      },
      totalSats: 18,
      xp: 1120,
      xpLog: [],
      level: "Sovereign Node",
      badges: ["first_step", "knowledge_seeker", "african_pioneer", "sats_stacker", "consistent"],
      streak: 8,
      lastActiveDate: new Date().toISOString(),
    },
    {
      name: "Emmanuel Kiprop",
      email: "emma.k@bitcoinafricastory.com",
      password: "studentpassword",
      country: "Kenya",
      joinedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      onboardingComplete: true,
      role: "student",
      progress: {
        "1": { status: "completed", quizScore: 3, quizPassed: true },
        "2": { status: "completed", quizScore: 2, quizPassed: true },
        "3": { status: "completed", quizScore: 3, quizPassed: true },
        "4": { status: "completed", quizScore: 2, quizPassed: true },
        "5": { status: "completed", quizScore: 3, quizPassed: true },
        "6": { status: "completed", quizScore: 3, quizPassed: true },
        "7": { status: "completed", quizScore: 3, quizPassed: true },
      },
      totalSats: 14,
      xp: 810,
      xpLog: [],
      level: "Lightning Pioneer",
      badges: ["first_step", "knowledge_seeker", "african_pioneer", "sats_stacker"],
      streak: 5,
      lastActiveDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      name: "Fatoumata Diallo",
      email: "fatou.d@bitcoinafricastory.com",
      password: "studentpassword",
      country: "Mali",
      joinedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      onboardingComplete: true,
      role: "student",
      progress: {
        "1": { status: "completed", quizScore: 3, quizPassed: true },
        "2": { status: "completed", quizScore: 3, quizPassed: true },
        "3": { status: "completed", quizScore: 3, quizPassed: true },
        "4": { status: "completed", quizScore: 3, quizPassed: true },
        "5": { status: "completed", quizScore: 3, quizPassed: true },
        "6": { status: "completed", quizScore: 3, quizPassed: true },
        "7": { status: "completed", quizScore: 3, quizPassed: true },
        "8": { status: "completed", quizScore: 3, quizPassed: true },
        "9": { status: "completed", quizScore: 3, quizPassed: true },
        "10": { status: "completed", quizScore: 3, quizPassed: true },
      },
      totalSats: 20,
      xp: 1390,
      xpLog: [],
      level: "Satoshi Scholar",
      badges: ["first_step", "knowledge_seeker", "diplomat", "quiz_master", "african_pioneer", "sats_stacker", "consistent"],
      streak: 14,
      lastActiveDate: new Date().toISOString(),
    },
    {
      name: "Tinashe Moyo",
      email: "tinashe.m@bitcoinafricastory.com",
      password: "studentpassword",
      country: "Zimbabwe",
      joinedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      onboardingComplete: true,
      role: "student",
      progress: {
        "1": { status: "completed", quizScore: 3, quizPassed: true },
        "2": { status: "completed", quizScore: 3, quizPassed: true },
        "3": { status: "completed", quizScore: 3, quizPassed: true },
        "4": { status: "completed", quizScore: 2, quizPassed: true },
        "5": { status: "completed", quizScore: 3, quizPassed: true },
        "6": { status: "completed", quizScore: 2, quizPassed: true },
      },
      totalSats: 12,
      xp: 680,
      xpLog: [],
      level: "Hal Finney Disciple",
      badges: ["first_step", "knowledge_seeker", "african_pioneer"],
      streak: 4,
      lastActiveDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      name: "Angelique Umutoni",
      email: "angelique.u@bitcoinafricastory.com",
      password: "studentpassword",
      country: "Rwanda",
      joinedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      onboardingComplete: true,
      role: "student",
      progress: {
        "1": { status: "completed", quizScore: 3, quizPassed: true },
        "2": { status: "completed", quizScore: 3, quizPassed: true },
        "3": { status: "completed", quizScore: 3, quizPassed: true },
        "4": { status: "completed", quizScore: 2, quizPassed: true },
        "5": { status: "completed", quizScore: 3, quizPassed: true },
      },
      totalSats: 10,
      xp: 560,
      xpLog: [],
      level: "Node Runner",
      badges: ["first_step", "knowledge_seeker", "african_pioneer"],
      streak: 3,
      lastActiveDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  defaultStudents.forEach(st => {
    if (!users[st.email]) {
      users[st.email] = st;
    }
  });

  // Dynamically normalize active users totalSats values to fit the 2 sats per chapter rule
  Object.keys(users).forEach((email) => {
    const u = users[email];
    if (u && u.progress) {
      const completedCount = Object.values(u.progress).filter((p: any) => p.status === 'completed' || p.quizPassed).length;
      u.totalSats = completedCount * 2;
    }
  });

  localStorage.setItem('bas_users', JSON.stringify(users));

  if (!localStorage.getItem('bas_admin_logs')) {
    localStorage.setItem('bas_admin_logs', JSON.stringify([]));
  }

  if (!localStorage.getItem('bas_content_versions')) {
    localStorage.setItem('bas_content_versions', JSON.stringify([]));
  }
};

export const getContent = () => {
  const content = JSON.parse(localStorage.getItem('bas_content') || '{"chapters":{},"announcements":[]}');
  if (!content.courses || content.courses.length === 0) {
    content.courses = [
      {
        id: 'course-lightning',
        title: 'Lightning Node Operator',
        description: 'Learn how to set up, secure, and manage your own Lightning node. Route payments and earn routing fees.',
        longDescription: 'Operating a Lightning Node is the pinnacle of supporting the Bitcoin network\'s scaling layer. This specialty program teaches students the theory and practice of liquidity optimization, security, channel backup, and routing policies to maximize efficiency and earn routing fees.',
        icon: 'Server',
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        tags: ['Advanced', 'Infrastructure'],
        duration: '4 Weeks',
        tag: 'Advanced',
        estimatedMinutes: 240,
        outcomes: [
          "Assemble and configure dedicated node hardware or virtual private servers (VPS).",
          "Manage channel liquidity (inbound, outbound, routing metrics) using advanced tools.",
          "Set up dynamic fee schedules and routing algorithms to optimize node profitability.",
          "Configure automated backups and static channel backups (SCB) for bulletproof recovery."
        ],
        syllabus: [
          { title: "Node Setup & Hardware Choices", duration: "60 mins", desc: "Raspberry Pi setups vs virtual private servers, operating system choice, and chain synchronization." },
          { title: "Lightning Softwares & Configurations", duration: "60 mins", desc: "Comparing node software client configurations and terminal shell setups." },
          { title: "Liquidity Management", duration: "60 mins", desc: "Inbound and outbound liquidity, managing channel exhaustion, peer balancing, and loop mechanics." },
          { title: "Routing Policies & Earnings", duration: "60 mins", desc: "Setting node routing fees, evaluating peer connectivity, and analyzing payment trails." },
          { title: "Backups and Security Protocols", duration: "60 mins", desc: "Static Channel Backups (SCB), watchtower client creation, and emergency protocols." }
        ]
      },
      {
        id: 'course-markets',
        title: 'Bitcoin in Emerging Markets',
        description: 'Deep dive into how Bitcoin is being adopted for cross-border payments and inflation hedging across the global south.',
        longDescription: 'Emerging economies face the highest hurdles in banking access, hyperinflation, and remittance friction. This course analyzes how grass-roots communities across Africa, Latin America, and Southeast Asia utilize Bitcoin daily to protect capital and bypass archaic banking walls.',
        icon: 'Globe2',
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10',
        tags: ['Economics', 'Intermediate'],
        duration: '3 Weeks',
        tag: 'Intermediate',
        estimatedMinutes: 180,
        outcomes: [
          "Analyze fiat currency failures, capital controls, and hyperinflation history in developing countries.",
          "Design low-friction, circular-economy Bitcoin adoption protocols for local merchants and circular communities.",
          "Understand cross-border trade mechanics, liquidity pathways, and mobile money integration.",
          "Identify legal and regulatory landscapes affecting community groups and P2P desks."
        ],
        syllabus: [
          { title: "Hyperinflation & Currency Collapse", duration: "45 mins", desc: "Monetary failure history and how residents safeguard local purchasing power using hard digital assets." },
          { title: "Remittance Corridors & Fees", duration: "45 mins", desc: "Bypassing high-fee remittance agency networks using automated Lightning rails." },
          { title: "Micro-payments & Circular Economies", duration: "45 mins", desc: "Community-driven circular economies (like Bitcoin Ekasi) and local merchant onboarding." },
          { title: "Financial Inclusion & Mobile Partnerships", duration: "45 mins", desc: "Interacting with local ecosystems and linking Bitcoin to mobile money systems (M-Pesa, Wave)." }
        ]
      },
      {
        id: 'course-script',
        title: 'Mastering Bitcoin Script',
        description: 'Explore the technical foundations of Bitcoin. Learn about UTXOs, sighhashes, and basic smart contracts.',
        longDescription: 'Unlock the code driving the Bitcoin protocol. This course explores the stack-based language Bitcoin Script, covering everything from simple single-key transactions to multi-signature contracts, relative time-locks, and taproot smart contracts.',
        icon: 'BookOpen',
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
        tags: ['Developer', 'Advanced'],
        duration: '6 Weeks',
        tag: 'Advanced',
        estimatedMinutes: 300,
        outcomes: [
          "Read and write raw Bitcoin Script opcodes, interpreting how they execute on the virtual stack.",
          "Construct custom multi-signature locks to enforce organizational custody rules.",
          "Implement absolute and relative time-locks to delay and sequence outputs.",
          "Leverage Schnorr signatures, MAST, and Taproot trees to optimize performance and privacy."
        ],
        syllabus: [
          { title: "OpCodes and Stack Fundamentals", duration: "75 mins", desc: "Forth-like stack mechanics, arithmetic opcodes, and cryptography check verbs." },
          { title: "Multi-Signature Contracts & P2SH", duration: "75 mins", desc: "Implementing multi-key authorization, redeem scripts, and the pay-to-script-hash standard." },
          { title: "Time-Locks and Payment Channels", duration: "75 mins", desc: "Absolute time-locks, relative time-locks, and hashed timelock contracts (HTLC)." },
          { title: "Taproot & Masters of Script", duration: "75 mins", desc: "Schnorr signatures, MAST, Pay-to-Taproot (P2TR), and contract privacy." }
        ]
      }
    ];
    localStorage.setItem('bas_content', JSON.stringify(content));
  }
  return content;
};

export const saveCourse = (course: any) => {
  const content = getContent();
  if (!content.courses) {
    content.courses = [];
  }
  const idx = content.courses.findIndex((c: any) => c.id === course.id);
  if (idx > -1) {
    content.courses[idx] = course;
  } else {
    content.courses.push(course);
  }
  localStorage.setItem('bas_content', JSON.stringify(content));
  window.dispatchEvent(new CustomEvent('bas_content_updated'));
};

export const deleteCourse = (courseId: string) => {
  const content = getContent();
  if (content.courses) {
    content.courses = content.courses.filter((c: any) => c.id !== courseId);
    localStorage.setItem('bas_content', JSON.stringify(content));
    window.dispatchEvent(new CustomEvent('bas_content_updated'));
  }
};

export const saveDiplomaChapter = (chapter: any) => {
  const content = getContent();
  if (!content.chapters) {
    content.chapters = {};
  }
  content.chapters[chapter.id] = chapter;
  localStorage.setItem('bas_content', JSON.stringify(content));
  window.dispatchEvent(new CustomEvent('bas_content_updated'));
};

export const deleteDiplomaChapter = (chapterId: string | number) => {
  const content = getContent();
  if (content.chapters) {
    delete content.chapters[chapterId];
    localStorage.setItem('bas_content', JSON.stringify(content));
    window.dispatchEvent(new CustomEvent('bas_content_updated'));
  }
};

export const getAdminLogs = () => {
  return JSON.parse(localStorage.getItem('bas_admin_logs') || '[]');
};

export const addAdminLog = (adminEmail: string, action: string, details: string) => {
  const logs = getAdminLogs();
  logs.unshift({ id: Date.now().toString(), date: new Date().toISOString(), adminEmail, action, details });
  localStorage.setItem('bas_admin_logs', JSON.stringify(logs.slice(0, 500))); // keep latest 500
};

export const getContentVersions = () => {
  return JSON.parse(localStorage.getItem('bas_content_versions') || '[]');
};

export const saveContentVersion = (name: string, adminEmail: string) => {
  const versions = getContentVersions();
  const currentContent = getContent();
  versions.unshift({
    id: Date.now().toString(),
    date: new Date().toISOString(),
    name,
    createdBy: adminEmail,
    content: currentContent
  });
  localStorage.setItem('bas_content_versions', JSON.stringify(versions));
  addAdminLog(adminEmail, 'Created Version', `Named: ${name}`);
};

export const restoreContentVersion = (versionId: string, adminEmail: string) => {
  const versions = getContentVersions();
  const target = versions.find((v: any) => v.id === versionId);
  if (target) {
    localStorage.setItem('bas_content', JSON.stringify(target.content));
    addAdminLog(adminEmail, 'Restored Version', `Restored from: ${target.name}`);
  }
};

export const getChapterWiki = (chapterId: string) => {
  const wikis = JSON.parse(localStorage.getItem('bas_chapter_wikis') || '{}');
  return wikis[chapterId] || [];
};

export const addChapterWikiPost = (chapterId: string, post: any) => {
  const wikis = JSON.parse(localStorage.getItem('bas_chapter_wikis') || '{}');
  if (!wikis[chapterId]) wikis[chapterId] = [];
  wikis[chapterId].push({
    ...post,
    id: Date.now().toString() + Math.random().toString(),
    createdAt: new Date().toISOString()
  });
  localStorage.setItem('bas_chapter_wikis', JSON.stringify(wikis));
  return wikis[chapterId];
};

export const getAnnouncements = () => {
  const content = getContent();
  return content.announcements || [];
};

export const getUsers = () => {
  const users = JSON.parse(localStorage.getItem('bas_users') || "{}");
  // Calculate totalSats dynamically for all roles based on completed chapters to prevent hardcoded issues
  Object.keys(users).forEach((email) => {
    const u = users[email];
    if (u && u.progress) {
      const completedCount = Object.values(u.progress).filter((p: any) => p.status === 'completed' || p.quizPassed).length;
      u.totalSats = completedCount * 2;
    }
  });
  return users;
};
export const saveUsers = (users: any) => localStorage.setItem('bas_users', JSON.stringify(users));

export const getCurrentUser = () => {
  const email = localStorage.getItem('bas_currentUser');
  if (!email) return null;
  
  const users = getUsers();
  const dbUser = users[email];
  
  if (email === "admin@bitcoinafricastory.com" || email === "smartdestinyonyekachi@gmail.com") {
     return { ...(dbUser || {}), email, role: "admin", name: dbUser?.name || "Admin" };
  }
  
  return dbUser || null;
};

export const setCurrentUser = (email: string | null) => {
  if (email) {
    localStorage.setItem('bas_currentUser', email);
  } else {
    localStorage.removeItem('bas_currentUser');
  }
};

export const registerUser = (data: any) => {
  const users = getUsers();
  if (users[data.email]) {
    throw new Error("User with this email already exists.");
  }
  
  users[data.email] = {
    ...data,
    joinedDate: new Date().toISOString(),
    onboardingComplete: false,
    progress: {},
    totalSats: 0,
    satsLog: [],
    xp: 0,
    xpLog: [],
    level: "Seedling",
    badges: [],
    streak: 0,
    lastActiveDate: new Date().toISOString(),
  };
  
  saveUsers(users);
  setCurrentUser(data.email);
  return users[data.email];
};

export const updateUser = (email: string, updates: any) => {
  const users = getUsers();
  if (!users[email]) throw new Error("User not found");
  users[email] = { ...users[email], ...updates };
  saveUsers(users);
  return users[email];
};
export const loginUser = (email: string, password: string) => {
  if (email === "admin@bitcoinafricastory.com" && password === "BAS_Admin_2024") {
     setCurrentUser(email);
     return { email, role: "admin" };
  }
  
  if (email === "smartdestinyonyekachi@gmail.com" && password === "BASadmin") {
     setCurrentUser(email);
     return { email, role: "admin", name: "Destiny Admin" };
  }

  const users = getUsers();
  const user = users[email];
  if (!user || user.password !== password) {
    // Also allow normal login if admin registered normally
    if (email === "smartdestinyonyekachi@gmail.com" && password === "BASadmin") {
       setCurrentUser(email);
       return { email, role: "admin", name: "Destiny Admin" };
    }
    throw new Error("Invalid email or password");
  }
  setCurrentUser(email);
  return user;
};

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'alert';
  actionUrl?: string;
}

export const getNotifications = (email: string): AppNotification[] => {
  const key = `bas_notifications_${email}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    const initial: AppNotification[] = [
      {
        id: 'initial_wel_1',
        title: 'Welcome to Bitcoin Diploma! 🎓',
        message: 'Start your learning journey. Complete lessons and quizzes to earn satoshis!',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'success',
        actionUrl: '/courses'
      }
    ];
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

export const addNotification = (
  email: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'alert' = 'info',
  actionUrl?: string
): AppNotification => {
  const notifications = getNotifications(email);
  const newNotif: AppNotification = {
    id: Math.random().toString(36).substring(2, 11),
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    type,
    actionUrl
  };
  const updated = [newNotif, ...notifications];
  localStorage.setItem(`bas_notifications_${email}`, JSON.stringify(updated));
  
  // Custom event for real-time React component listening
  window.dispatchEvent(new CustomEvent('bas_notification_added', { detail: { email, notification: newNotif } }));
  return newNotif;
};

export const markNotificationAsRead = (email: string, id: string) => {
  const notifications = getNotifications(email);
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem(`bas_notifications_${email}`, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('bas_notifications_updated', { detail: { email } }));
};

export const clearAllNotifications = (email: string) => {
  localStorage.setItem(`bas_notifications_${email}`, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('bas_notifications_updated', { detail: { email } }));
};

