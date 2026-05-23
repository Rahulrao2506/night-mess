'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  // Hide student navbar on login page AND all admin pages
  const isLoginPage = pathname === '/login';
  const isAdminPage = pathname?.startsWith('/admin');

  if (isLoginPage || isAdminPage) {
    return (
      <html lang="en">
        <body style={{ margin: 0, background: '#0a0a0a', fontFamily: 'sans-serif' }}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0a0a0a', fontFamily: 'sans-serif' }}>
        <nav style={{
          background: '#1a1a1a',
          borderBottom: '1px solid #2a2a2a',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <span
            onClick={() => router.push('/')}
            style={{ color: '#ff6b35', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}
          >
            🍽️ Night Mess
          </span>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {user?.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                style={navBtn('#ff6b35')}
              >
                Admin Panel
              </button>
            )}
            {user && (
              <button
                onClick={() => router.push('/orders')}
                style={navBtn('#333')}
              >
                My Orders
              </button>
            )}
            {user ? (
              <>
                <span style={{ color: '#888', fontSize: '13px' }}>
                  Hi, {user.name?.split(' ')[0]}
                </span>
                <button onClick={handleLogout} style={navBtn('#ff000088')}>
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/login')}
                style={navBtn('#ff6b35')}
              >
                Login
              </button>
            )}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

function navBtn(bg: string) {
  return {
    background: bg,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '500'
  } as const;
}