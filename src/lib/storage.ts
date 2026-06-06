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
  if (!localStorage.getItem('bas_content')) {
    const chapters = DEFAULT_CHAPTERS.reduce((acc, title, idx) => {
      acc[idx + 1] = {
        id: idx + 1,
        title,
        description: "",
        estimatedMinutes: 45,
        enabled: true,
        videos: [],
        resources: [],
        quizMode: 'manual',
        googleFormUrl: "",
        quiz: [],
        satsPossible: 165
      };
      return acc;
    }, {} as Record<number, any>);
    
    localStorage.setItem('bas_content', JSON.stringify({ chapters, announcements: [] }));
  }

  if (!localStorage.getItem('bas_users')) {
    localStorage.setItem('bas_users', JSON.stringify({}));
  }

  if (!localStorage.getItem('bas_admin_logs')) {
    localStorage.setItem('bas_admin_logs', JSON.stringify([]));
  }

  if (!localStorage.getItem('bas_content_versions')) {
    localStorage.setItem('bas_content_versions', JSON.stringify([]));
  }
};

export const getContent = () => {
  return JSON.parse(localStorage.getItem('bas_content') || '{"chapters":{},"announcements":[]}');
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

export const getUsers = () => JSON.parse(localStorage.getItem('bas_users') || "{}");
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
