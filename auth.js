// Shared authentication logic for all NullSector pages
// Include this script in all HTML pages after Supabase client

const SUPABASE_URL = 'https://fshfvihunprbqlukbdpi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaGZ2aWh1bnByYnFsdWtiZHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTQyOTYsImV4cCI6MjA4MTE5MDI5Nn0.jyyP3VJ2nqXmRqnC5O_CbqK_GZXMdBotdhT7Nufa5j0';

// Detect production environment
const isProduction = window.location.hostname === 'nullnode.vercel.app';
const siteUrl = isProduction ? 'https://nullnode.vercel.app' : window.location.origin;

console.log('[Auth] Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('[Auth] Site URL:', siteUrl);

// Initialize Supabase client with correct site URL
const supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
    }
});

// Initialize auth UI
function initAuth() {
    console.log('[Auth] Initializing...');
    
    if (!supabase) {
        console.error('[Auth] Supabase not loaded!');
        return;
    }

    const authButton = document.getElementById('authButton');
    const userProfile = document.getElementById('userProfile');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const logoutButton = document.getElementById('logoutButton');

    if (!authButton || !userProfile || !userAvatar) {
        console.error('[Auth] Required auth elements not found in page');
        return;
    }

    console.log('[Auth] Elements found, checking session...');

    // Check current session immediately
    checkAuth();

    // Login button handler
    authButton.addEventListener('click', async () => {
        console.log('[Auth] Login button clicked');
        console.log('[Auth] Current page:', window.location.href);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                scopes: 'identify guilds guilds.members.read',
                redirectTo: window.location.href
            }
        });
        
        if (error) {
            console.error('[Auth] Login error:', error);
            alert('Failed to login: ' + error.message);
        } else {
            console.log('[Auth] OAuth initiated');
        }
    });

    // Logout button handler
    logoutButton?.addEventListener('click', async () => {
        console.log('[Auth] Logging out...');
        await supabase.auth.signOut();
        sessionStorage.clear();
        userProfile.style.display = 'none';
        authButton.style.display = 'block';
        location.reload();
    });

    // Handle OAuth callback
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('[Auth] Auth state changed:', event, session ? 'Session exists' : 'No session');
        
        if (event === 'SIGNED_IN' && session) {
            console.log('[Auth] User signed in:', session.user.email || session.user.id);
            showUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
            console.log('[Auth] User signed out');
            authButton.style.display = 'block';
            userProfile.style.display = 'none';
        } else if (event === 'TOKEN_REFRESHED') {
            console.log('[Auth] Token refreshed');
        }
    });

    async function checkAuth() {
        console.log('[Auth] Checking authentication...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('[Auth] Error getting session:', error);
            authButton.style.display = 'block';
            return;
        }
        
        if (session) {
            console.log('[Auth] Active session found for:', session.user.email || session.user.id);
            showUserProfile(session.user);
            // Store for lab.html
            sessionStorage.setItem('user_id', session.user.id);
            sessionStorage.setItem('supabase_token', session.access_token);
        } else {
            console.log('[Auth] No active session, showing login button');
            authButton.style.display = 'block';
        }
    }

    function showUserProfile(user) {
        console.log('[Auth] Showing user profile:', user.user_metadata);
        
        authButton.style.display = 'none';
        userProfile.style.display = 'flex';
        
        const avatarUrl = user.user_metadata.avatar_url || 'logo.svg';
        const username = user.user_metadata.full_name || 
                        user.user_metadata.custom_claims?.global_name ||
                        user.user_metadata.name || 
                        user.user_metadata.preferred_username ||
                        'User';
        
        console.log('[Auth] Avatar URL:', avatarUrl);
        console.log('[Auth] Username:', username);
        
        userAvatar.src = avatarUrl;
        userAvatar.alt = username;
        userAvatar.title = username; // Tooltip on hover
        
        if (userName) {
            userName.textContent = username;
            userName.title = username;
        }
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
