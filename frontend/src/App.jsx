import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

function App() {
  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eaeaea', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1a1a1a' }}>🚚 TransitOps Control Panel</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Fleet Logistics & Telemetry Engine</p>
        </div>
        
        <div>
          {/* Renders a clean sign-in button if user is anonymous */}
          <SignedOut>
            <SignInButton mode="modal">
              <button style={{ padding: '10px 20px', cursor: 'pointer', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', transition: 'background 0.2s' }}>
                Sign In to Platform
              </button>
            </SignInButton>
          </SignedOut>

          {/* Renders user profile management button if authenticated */}
          <SignedIn>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <UserButton showName afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </header>

      <main style={{ marginTop: '40px' }}>
        <SignedIn>
          <div style={{ padding: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>🟢 Terminal Securely Authenticated</h3>
            <p style={{ margin: 0 }}>The backend session token checker is online. Ready to pull live database logs.</p>
          </div>
        </SignedIn>
        
        <SignedOut>
          <div style={{ padding: '20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>🚫 Access Denied</h3>
            <p style={{ margin: 0 }}>Please click the Sign In button at the top right to verify your system authorization credentials.</p>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}

export default App;