
import { User, Subscription, SessionLog, MvpPlan, HistoryItem, Citation, SalesLead } from '../types';

// This is a mock authentication service to simulate Firebase/Auth0
// It uses localStorage to persist a "session" and a mock "user database"

const MOCK_SESSION_KEY = 'mvp_gen_mock_user';
const MOCK_DB_KEY = 'mvp_gen_user_db';
const MOCK_SESSION_LOG_KEY = 'mvp_gen_session_log_db';
const MOCK_SALES_LEADS_KEY = 'mvp_gen_sales_leads_db';


// Helper to get all users from our mock DB
const getUsersFromDB = (): User[] => {
    const dbStr = localStorage.getItem(MOCK_DB_KEY);
    return dbStr ? JSON.parse(dbStr) : [];
};

// Helper to save all users to our mock DB
const saveUsersToDB = (users: User[]): void => {
    localStorage.setItem(MOCK_DB_KEY, JSON.stringify(users));
};

// --- DB Seeding ---
const initializeDB = () => {
    const users = getUsersFromDB();
    const superAdminEmail = 'minimumvaiableproduct@gmail.com';

    // Seed superadmin only if they don't exist
    if (!users.some(u => u.email === superAdminEmail)) {
        const superAdmin: User = {
            uid: `mock_superadmin_${Date.now()}`,
            email: superAdminEmail,
            firstName: 'Super',
            lastName: 'Admin',
            displayName: 'Super Admin',
            role: 'superadmin',
            status: 'active',
            isVerified: true,
            subscription: { plan: 'enterprise', status: 'active', usageCount: 0 },
            history: [],
        };
        users.push(superAdmin);
        saveUsersToDB(users);
    }
};


initializeDB(); // Run this on script load

const createMockUser = (email: string, firstName: string, lastName: string, role: User['role'] = 'user', isVerified: boolean = false): User => {
    return {
        uid: `mock_${Date.now()}_${Math.random()}`,
        email: email,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        role: role,
        status: 'active',
        isVerified: isVerified,
        subscription: {
            plan: 'free',
            status: 'active',
            usageCount: 0,
        },
        history: [],
    };
};

const logSessionEvent = (user: User, action: 'login' | 'logout'): void => {
    const logStr = localStorage.getItem(MOCK_SESSION_LOG_KEY);
    const logs: SessionLog[] = logStr ? JSON.parse(logStr) : [];
    const newLog: SessionLog = {
        id: `log_${Date.now()}`,
        userId: user.uid,
        userEmail: user.email,
        userRole: user.role,
        action,
        timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog); // Add to the beginning of the array
    localStorage.setItem(MOCK_SESSION_LOG_KEY, JSON.stringify(logs.slice(0, 100))); // Keep latest 100 logs
};

const loginUser = (user: User) => {
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
    logSessionEvent(user, 'login');
    window.dispatchEvent(new Event('storage'));
};

const loginWithProvider = (
    provider: 'google' | 'github',
    details: { email: string; fullName: string },
    roleOverride?: User['role']
): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!details.email || !details.fullName) {
                return reject(new Error('Email and Full Name are required for social login simulation.'));
            }

            if (roleOverride === 'superadmin') {
                return reject(new Error('Superadmin login is not allowed via social providers for security reasons.'));
            }

            const users = getUsersFromDB();
            let user = users.find(u => u.email === details.email);

            if (!user) {
                // First-time login with this provider, create a new user.
                const nameParts = details.fullName.split(' ');
                const firstName = nameParts[0] || provider;
                const lastName = nameParts.slice(1).join(' ') || 'User';
                
                user = createMockUser(details.email, firstName, lastName, 'user', true); // Social accounts are auto-verified
                users.push(user);
                saveUsersToDB(users);
            }

            // Apply session override if provided
            const sessionUser = { ...user, role: roleOverride || user.role };
            loginUser(sessionUser);
            resolve(sessionUser);

        }, 800);
    });
};

const loginWithEmail = (email: string, password?: string, roleOverride?: User['role']): Promise<User> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            // SUPERADMIN LOGIN CHECK
            if (roleOverride === 'superadmin') {
                if (email !== 'minimumvaiableproduct@gmail.com' || password !== 'Parul@2026') {
                    return reject(new Error('Invalid superadmin credentials. Please log in as a user or provide the correct superadmin details.'));
                }
            }

            const users = getUsersFromDB();
            const user = users.find(u => u.email === email);

            if (!user) {
                return reject(new Error('No account found with this email. Please sign up.'));
            }
            
            if (user.role === 'superadmin' && password !== 'Parul@2026' && roleOverride === 'superadmin') {
                 return reject(new Error('Incorrect password for superadmin.'));
            }

            if (!user.isVerified) {
                return reject(new Error('Email not verified. Please complete the verification step.'));
            }
            
            // Apply session override if provided
            const sessionUser = { ...user, role: roleOverride || user.role };
            loginUser(sessionUser);
            resolve(sessionUser);
        }, 1200);
    });
}

const signUpWithEmail = (firstName: string, lastName: string, email: string, password?: string): Promise<User> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === 'minimumvaiableproduct@gmail.com') {
                return reject(new Error('This email is reserved for the superadmin account.'));
            }
            const users = getUsersFromDB();
            if (users.some(u => u.email === email)) {
                return reject(new Error('An account with this email already exists. Please sign in.'));
            }
            
            const newUser = createMockUser(email, firstName, lastName, 'user', false); // Email accounts start as unverified
            users.push(newUser);
            saveUsersToDB(users);
            
            // Do NOT log in the user, they must verify first.
            resolve(newUser);
        }, 1500);
    });
}

const verifyUserAccount = (email: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsersFromDB();
            const userIndex = users.findIndex(u => u.email === email);
            if (userIndex === -1) {
                return reject(new Error("User account not found."));
            }
            users[userIndex].isVerified = true;
            saveUsersToDB(users);
            resolve(users[userIndex]);
        }, 700);
    });
};

const logout = (user: User): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            logSessionEvent(user, 'logout');
            localStorage.removeItem(MOCK_SESSION_KEY);
            window.dispatchEvent(new Event('storage'));
            resolve();
        }, 500);
    });
}

const onAuthStateChanged = (callback: (user: User | null) => void): (() => void) => {
    const handleStorageChange = () => {
        const userStr = localStorage.getItem(MOCK_SESSION_KEY);
        const user = userStr ? JSON.parse(userStr) : null;
        callback(user);
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
};

const updateUserAndSession = (uid: string, updates: Partial<User>): Promise<User> => {
    const users = getUsersFromDB();
    const userIndex = users.findIndex(u => u.uid === uid);
    if (userIndex === -1) {
        return Promise.reject(new Error("User not found"));
    }
    
    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    saveUsersToDB(users);

    const sessionUserStr = localStorage.getItem(MOCK_SESSION_KEY);
    if (sessionUserStr) {
        const sessionUser = JSON.parse(sessionUserStr) as User;
        if (sessionUser.uid === uid) {
            const newSessionUser = { ...updatedUser, role: sessionUser.role }; // Preserve session role override
            localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(newSessionUser));
            window.dispatchEvent(new Event('storage'));
        }
    }

    return Promise.resolve(updatedUser);
};


// --- Admin Functions ---
const getSessionLogs = (): Promise<SessionLog[]> => {
    const logStr = localStorage.getItem(MOCK_SESSION_LOG_KEY);
    const logs: SessionLog[] = logStr ? JSON.parse(logStr) : [];
    return Promise.resolve(logs);
};

const getUsers = (): Promise<User[]> => {
    return Promise.resolve(getUsersFromDB());
};

const updateUser = (uid: string, updates: Partial<User>): Promise<User> => {
    return new Promise((resolve, reject) => {
        // Prevent promotion to superadmin
        if (updates.role === 'superadmin') {
            const currentUser = getUsersFromDB().find(u => u.uid === uid);
            if (currentUser?.role !== 'superadmin') {
                return reject(new Error("Cannot promote a user to superadmin. This role is protected."));
            }
        }
        
        updateUserAndSession(uid, updates).then(resolve).catch(reject);
    });
};

const deleteUser = (uid: string, actor: User): Promise<void> => {
     return new Promise((resolve, reject) => {
        let users = getUsersFromDB();
        const userToDelete = users.find(u => u.uid === uid);

        if (!userToDelete) {
             return reject(new Error("User not found"));
        }
        
        if (actor.uid === userToDelete.uid) {
            return reject(new Error("You cannot delete your own account."));
        }
        if (userToDelete.role === 'superadmin') {
            return reject(new Error("The superadmin account cannot be deleted."));
        }

        if (actor.role === 'superadmin' || (actor.role === 'admin' && userToDelete.role === 'user')) {
             const initialLength = users.length;
            users = users.filter(u => u.uid !== uid);
    
            if (users.length === initialLength) {
                return reject(new Error("Deletion failed. User may have already been removed."));
            }
            saveUsersToDB(users);
    
            const sessionUserStr = localStorage.getItem(MOCK_SESSION_KEY);
            if (sessionUserStr) {
                const sessionUser = JSON.parse(sessionUserStr) as User;
                if (sessionUser.uid === uid) {
                    logout(sessionUser);
                }
            }
            
            resolve();
        } else {
             return reject(new Error(`Permission denied. A ${actor.role} cannot delete a ${userToDelete.role}.`));
        }
    });
};

const requestAdminAccess = (uid: string): Promise<User> => {
    return updateUser(uid, { status: 'pending_admin_approval' });
};

const acknowledgeAdminWelcome = (uid: string): Promise<User> => {
    return updateUser(uid, { isNewAdmin: false });
};

// --- Subscription and History ---
const incrementMvpUsage = (uid: string): Promise<User> => {
    const users = getUsersFromDB();
    const user = users.find(u => u.uid === uid);
    if (!user) {
        return Promise.reject(new Error("User not found"));
    }
    const newCount = user.subscription.usageCount + 1;
    const updatedSubscription = { ...user.subscription, usageCount: newCount };
    return updateUserAndSession(uid, { subscription: updatedSubscription });
};

const updateUserSubscription = (uid: string, newPlan: Subscription['plan']): Promise<User> => {
    const users = getUsersFromDB();
    const user = users.find(u => u.uid === uid);
    if (!user) {
        return Promise.reject(new Error("User not found"));
    }
    const updatedSubscription = { ...user.subscription, plan: newPlan, status: 'active' as 'active' };
    return updateUserAndSession(uid, { subscription: updatedSubscription });
};

const addHistoryItem = (uid: string, plan: MvpPlan, citations: Record<string, Citation[]>): Promise<User> => {
    const users = getUsersFromDB();
    const user = users.find(u => u.uid === uid);
    if (!user) {
        return Promise.reject(new Error("User not found"));
    }
    const newHistoryItem: HistoryItem = {
        id: `hist_${Date.now()}`,
        idea: plan.idea,
        plan,
        citations,
        createdAt: new Date().toISOString(),
        isFavorite: false,
    };
    const updatedHistory = [newHistoryItem, ...(user.history || [])];
    return updateUserAndSession(uid, { history: updatedHistory });
};

const deleteHistoryItem = (uid: string, itemId: string): Promise<User> => {
    const users = getUsersFromDB();
    const user = users.find(u => u.uid === uid);
    if (!user) {
        return Promise.reject(new Error("User not found"));
    }
    const updatedHistory = (user.history || []).filter(item => item.id !== itemId);
    return updateUserAndSession(uid, { history: updatedHistory });
};

const toggleFavoriteHistoryItem = (uid: string, itemId: string): Promise<User> => {
    const users = getUsersFromDB();
    const user = users.find(u => u.uid === uid);
    if (!user) {
        return Promise.reject(new Error("User not found"));
    }
    const updatedHistory = (user.history || []).map(item => {
        if (item.id === itemId) {
            return { ...item, isFavorite: !item.isFavorite };
        }
        return item;
    });
    return updateUserAndSession(uid, { history: updatedHistory });
};

const contactSalesRequest = (user: User, details: { companyName: string; teamSize: string; message: string; }): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const leadsStr = localStorage.getItem(MOCK_SALES_LEADS_KEY);
            const leads: SalesLead[] = leadsStr ? JSON.parse(leadsStr) : [];
            const newLead: SalesLead = {
                id: `lead_${Date.now()}`,
                userId: user.uid,
                userName: `${user.firstName} ${user.lastName}`,
                companyName: details.companyName,
                teamSize: details.teamSize,
                message: details.message,
                createdAt: new Date().toISOString(),
            };
            leads.unshift(newLead);
            localStorage.setItem(MOCK_SALES_LEADS_KEY, JSON.stringify(leads));
            resolve();
        }, 1500);
    });
};


export const authService = {
    loginWithProvider,
    loginWithEmail,
    signUpWithEmail,
    verifyUserAccount,
    logout,
    onAuthStateChanged,
    getUsers,
    updateUser,
    deleteUser,
    requestAdminAccess,
    acknowledgeAdminWelcome,
    incrementMvpUsage,
    updateUserSubscription,
    addHistoryItem,
    getSessionLogs,
    deleteHistoryItem,
    toggleFavoriteHistoryItem,
    contactSalesRequest,
};