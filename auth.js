// Shared authentication logic for all NullSector pages
// Include this script in all HTML pages after Supabase client

const SUPABASE_URL = 'https://fshfvihunprbqlukbdpi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzaGZ2aWh1bnByYnFsdWtiZHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTQyOTYsImV4cCI6MjA4MTE5MDI5Nn0.jyyP3VJ2nqXmRqnC5O_CbqK_GZXMdBotdhT7Nufa5j0';

// Initialize Supabase client
const supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize auth UI
function initAuth() {
    if (!supabase) {
        console.warn('Supabase not loaded');
        return;
    }

    const authButton = document.getElementById('authButton');
    const userProfile = document.getElementById('userProfile');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const logoutButton = document.getElementById('logoutButton');

    if (!authButton || !userProfile) {
        console.warn('Auth elements not found in page');
        return;
    }

    // Check current session
    checkAuth();

    // Login button handler
    authButton.addEventListener('click', async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                scopes: 'identify guilds guilds.members.read',
                redirectTo: window.location.href
            }
        });
        if (error) {
            console.error('Login error:', error);
            alert('Failed to login with Discord. Please check the console for details.');
        }
    });

    // Logout button handler
    logoutButton?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        sessionStorage.clear();
        userProfile.style.display = 'none';
        authButton.style.display = 'block';
        location.reload();
    });

    // Handle OAuth callback
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            showUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
            authButton.style.display = 'block';
            userProfile.style.display = 'none';
        }
    });

    async function checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            showUserProfile(session.user);
            // Store for lab.html
            sessionStorage.setItem('user_id', session.user.id);
            sessionStorage.setItem('supabase_token', session.access_token);
        } else {
            authButton.style.display = 'block';
        }
    }

    function showUserProfile(user) {
        authButton.style.display = 'none';
        userProfile.style.display = 'flex';
        
        const avatarUrl = user.user_metadata.avatar_url || 'logo.svg';
        const username = user.user_metadata.full_name || 
                        user.user_metadata.custom_claims?.global_name ||
                        user.user_metadata.name || 
                        'User';
        
        userAvatar.src = avatarUrl;
        userAvatar.alt = username;
        userName.textContent = username;
        userName.title = username; // Tooltip on hover
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
