"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


async function getCurrentUserRole() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.log('profiles role error:', error.message);
      return null;
    }
    return data?.role || null;
  } catch (error) {
    console.log('Error getting user role:', error);
    return null;
  }
}

const styles = {
  siteFooter: {
    background: 'linear-gradient(180deg, #061018 0%, #061521 100%)',
    padding: '30px 16px 30px',
    borderTop: '1px solid rgba(255, 255, 255, 0.02)',
    color: '#ffffffff',
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    textAlign: 'center',
  } as React.CSSProperties,

  footerTop: {
    maxWidth: '1100px',
    margin: '0 auto 40px auto',
    padding: '20px 0',
  } as React.CSSProperties,

  brand: {
    fontWeight: 1000,
    color: '#fffdfdff',
    textDecoration: 'none',
    fontSize: '22px',
    display: 'block',
    marginBottom: '55px',
  } as React.CSSProperties,

  small: {
    color: '#dbe2edff',
    fontSize: '10px',
    margin: '0 auto',
    maxWidth: '700px',
    lineHeight: '1.6',
  } as React.CSSProperties,

  partnersSection: {
    padding: '20px 0 30px',
    overflow: 'hidden',
    position: 'relative',
    background: '#07101a',
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    marginBottom: '40px',
  } as React.CSSProperties,

  partnersContainer: {
    display: 'flex',
    width: 'max-content',
    animation: 'scrollLeft 30s linear infinite',
    alignItems: 'center',
  } as React.CSSProperties,

  partnerLogoWrapper: {
    flexShrink: 0,
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '90px',
    width: '180px',
    background: 'rgba(14, 21, 33, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3), inset 0 0 2px rgba(255, 255, 255, 0.15)',
    margin: '0 20px',
    transition: 'border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
    overflow: 'hidden',
  } as React.CSSProperties,

  
  partnerLogoWrapperHover: {
    border: '1px solid #1fb26a', 
    background: '#727273ff',
    boxShadow: '0 0 20px rgba(31, 178, 106, 0.8), 0 4px 10px rgba(0, 0, 0, 0.6)',
  } as React.CSSProperties,

  partnerLogo: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
    opacity: 0.75,
    filter: 'brightness(1.1)',
    transition: 'opacity 0.3s ease, filter 0.3s ease, transform 0.3s ease',
  } as React.CSSProperties,

  partnerLogoHover: {
    opacity: 1,
    filter: 'brightness(1.2)',
    transform: 'scale(1.05)',
  } as React.CSSProperties,

  footerBottom: {
    maxWidth: '1100px',
    margin: '12px auto 0',
    padding: '12px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  } as React.CSSProperties,

  footerNav: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,

  footerNavLink: {
    color: '#d9e2f0ff',
    textDecoration: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'color 0.3s ease',
  } as React.CSSProperties,

  footerNavLinkHover: {
    color: '#ffffffff',
  } as React.CSSProperties,

  adminButton: {
    background: 'linear-gradient(135deg, #cafb06ff 0%, #090a01ff 100%)',
    color: '#ffffff',
    border: '1px solid rgba(255, 247, 0, 0.82)',
    padding: '4px 15px',
    borderRadius: '120px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
    outline: 'none',
  } as React.CSSProperties,

  adminButtonHover: {
    background: 'linear-gradient(135deg, #576391ff 0%, #d0e62aff 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
  } as React.CSSProperties,

  logoutButton: {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)',
    color: '#ffffff',
    border: '1px solid rgba(255, 107, 107, 0.82)',
    padding: '4px 12px',
    borderRadius: '120px',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.2)',
    outline: 'none',
  } as React.CSSProperties,

  logoutButtonHover: {
    background: 'linear-gradient(135deg, #c92a2a 0%, #ff6b6b 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(255, 107, 107, 0.3)',
  } as React.CSSProperties,

  footerSocial: {
    display: 'flex',
    gap: '40px',
    alignItems: 'center',
  } as React.CSSProperties,

  social: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    transition: 'opacity 0.3s ease',
  } as React.CSSProperties,

  socialHover: {
    opacity: 0.8,
  } as React.CSSProperties,

  socialIconImage: {
    width: '50px',
    height: '50px',
    filter: 'none',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  } as React.CSSProperties,

  socialIconImageHover: {
    transform: 'scale(1.1)',
  } as React.CSSProperties,

  copyright: {
    color: '#f1f7ffff',
    fontSize: '13px',
    letterSpacing: '0.5px',
  } as React.CSSProperties,

  modal: (isOpen: boolean): React.CSSProperties => ({
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.85)',
    visibility: isOpen ? 'visible' : 'hidden',
    opacity: isOpen ? 1 : 0,
    transition: 'opacity 0.25s ease, visibility 0.25s',
    zIndex: 1000,
  }),

  modalContent: {
    background: '#0e1521',
    borderRadius: '16px',
    padding: '35px',
    minWidth: '350px',
    maxWidth: '520px',
    color: '#8fa3b7ff',
    position: 'relative',
    boxShadow: '0 15px 40px rgba(0,0,0,0.7)',
  } as React.CSSProperties,

  modalClose: {
    position: 'absolute',
    right: '20px',
    top: '20px',
    background: 'none',
    border: '0',
    color: '#8792a2ff',
    fontSize: '28px',
    cursor: 'pointer',
    lineHeight: 1,
  } as React.CSSProperties,

  modalLabel: {
    display: 'block',
    marginTop: '15px',
    marginBottom: '5px',
    fontSize: '14px',
    color: '#c2cbd5',
    textAlign: 'left',
    fontWeight: '500',
  } as React.CSSProperties,

  modalInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #334155',
    background: '#1a222f',
    color: '#e6eef6',
    fontSize: '16px',
    outline: 'none',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
  } as React.CSSProperties,

  modalPrimaryButton: {
    marginTop: '25px',
    padding: '14px 14px',
    borderRadius: '10px',
    background: '#1fb26a',
    border: '0',
    color: '#042118',
    cursor: 'pointer',
    width: '100%',
    fontSize: '17px',
    fontWeight: 'bold',
    transition: 'background 0.3s ease, transform 0.1s ease',
  } as React.CSSProperties,
  
  modalPrimaryButtonHover: {
    background: '#179a57',
    transform: 'translateY(-1px)',
  } as React.CSSProperties,

  adminModalContent: {
    background: '#0e1521',
    borderRadius: '16px',
    padding: '40px',
    minWidth: '400px',
    maxWidth: '480px',
    color: '#163c61ff',
    position: 'relative',
    boxShadow: '0 15px 40px rgba(0,0,0,0.7)',
  } as React.CSSProperties,

  authTabs: {
    display: 'flex',
    marginBottom: '30px',
    borderBottom: '1px solid #334155',
  } as React.CSSProperties,

  authTab: (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px 0',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    color: isActive ? '#ffffff' : '#8792a2',
    borderBottom: isActive ? '2px solid #667eea' : 'none',
    transition: 'all 0.3s ease',
  }),

  adminModalPrimaryButton: {
    marginTop: '25px',
    padding: '14px 12px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #616e2cff 0%, #e1f014ff 100%)',
    border: '0',
    color: '#fffc3bff',
    cursor: 'pointer',
    width: '100%',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  adminModalPrimaryButtonHover: {
    background: 'linear-gradient(135deg, #00126cff 0%, #786887ff 100%)',
    transform: 'translateY(-2px)',
  } as React.CSSProperties,

  formError: {
    color: '#ff6b6b',
    fontSize: '14px',
    marginTop: '10px',
    textAlign: 'center',
    padding: '10px',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 107, 107, 0.3)',
  } as React.CSSProperties,

  formSuccess: {
    color: '#1fb26a',
    fontSize: '14px',
    marginTop: '10px',
    textAlign: 'center',
    padding: '10px',
    backgroundColor: 'rgba(31, 178, 106, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(31, 178, 106, 0.3)',
  } as React.CSSProperties,
};

const SocialIcon: React.FC<{ src: string; label: string; href: string }> = ({ src, label, href }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{ ...styles.social, ...(isHovered && styles.socialHover) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={src}
        alt={`${label} Icon`}
        style={{
          ...styles.socialIconImage,
          ...(isHovered && styles.socialIconImageHover)
        }}
      />
    </a>
  );
};

const Footer: React.FC = () => {
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isContactButtonHovered, setIsContactButtonHovered] = useState(false);
  const [isAdminAuthButtonHovered, setIsAdminAuthButtonHovered] = useState(false);
  const [hoveredLogoIndex, setHoveredLogoIndex] = useState<number | null>(null);
  const [hoveredNavLink, setHoveredNavLink] = useState<string | null>(null);
  const [isAdminButtonHovered, setIsAdminButtonHovered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [adminAuthEmail, setAdminAuthEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setIsLoggedIn(true);
        setAdminEmail(session.user.email || '');
        
        const userRole = await getCurrentUserRole();
        setUserRole(userRole);
 
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .maybeSingle();
          
        setAdminName(profile?.full_name || session.user.email || 'User');
      } else {
        setIsLoggedIn(false);
        setAdminEmail('');
        setAdminName('');
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
      setAdminEmail('');
      setAdminName('');
      setUserRole(null);
    }
  };

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    checkAuthStatus();
  
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await checkAuthStatus();
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setAdminEmail('');
        setAdminName('');
        setUserRole(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsAdminModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      alert('Please fill in all fields');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    
    alert('Thank you. Your message has been sent.');
    setIsModalOpen(false);
    
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsLoading(true);

    if (!adminAuthEmail || !adminPassword) {
      setAuthError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminAuthEmail,
        password: adminPassword,
      });

      if (error) {
        setAuthError(`Login failed: ${error.message}`);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const role = await getCurrentUserRole();
        
        if (role === 'admin' || role === 'superadmin') {
          setAuthSuccess('Login successful! Redirecting to admin ...');
          
          setAdminAuthEmail('');
          setAdminPassword('');
          
          setTimeout(() => {
            setIsAdminModalOpen(false);
            router.push('/admin');
          }, 1000);
        } else {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: data.user.email?.split('@')[0] || 'Admin',
              email: adminAuthEmail,
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            
            setAuthSuccess('Profile created! Redirecting to admin ...');
            
            setTimeout(() => {
              setIsAdminModalOpen(false);
              router.push('/admin');
            }, 1000);
          } catch (profileError) {
            console.error('Profile creation error:', profileError);
            setAuthSuccess('Login successful! Redirecting to admin ...');
            
            setTimeout(() => {
              setIsAdminModalOpen(false);
              router.push('/admin');
            }, 1000);
          }
        }
      }
      
    } catch (error: any) {
      setAuthError(`Login error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminRegister = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsLoading(true);

    if (!registerName || !adminAuthEmail || !adminPassword || !confirmPassword) {
      setAuthError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (adminPassword !== confirmPassword) {
      setAuthError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (adminPassword.length < 6) {
      setAuthError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminAuthEmail)) {
      setAuthError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminAuthEmail,
        password: adminPassword,
        options: {
          data: {
            full_name: registerName,
          },
        },
      });

      if (authError) {
        setAuthError(`Registration failed: ${authError.message}`);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setAuthError('Registration failed: No user created');
        setIsLoading(false);
        return;
      }

      const profileData = {
        id: authData.user.id,
        full_name: registerName,
        email: adminAuthEmail,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        await supabase
          .from('profiles')
          .insert(profileData)
          .select();
      }

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: adminAuthEmail,
        password: adminPassword,
      });

      if (loginError) {

        setAuthSuccess(`Registration successful for ${registerName}! You can now login.`);
        setAuthMode('login');
      } else {
        setAuthSuccess(`Registration successful! Welcome ${registerName}. Redirecting to admin ...`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsAdminModalOpen(false);
        router.push('/admin-panel');
      }
      
      setRegisterName('');
      setAdminPassword('');
      setConfirmPassword('');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setAuthError(`Registration error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      
      setIsLoggedIn(false);
      setAdminEmail('');
      setAdminName('');
      setUserRole(null);
      
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminPanelAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
  
      const role = await getCurrentUserRole();
      
      if (role === 'admin' || role === 'superadmin') {
        router.push('/admin');
      } else {
     
        alert('You need admin privileges to access the admin panel.');
        setIsAdminModalOpen(true);
      }
    } else {
   
      setIsAdminModalOpen(true);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setIsLoading(true);
      setAuthError('');
      setAuthSuccess('');
      
      const demoEmail = 'admin@cricketportal.com';
      const demoPassword = 'Admin@123';
      
  
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (error) {
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: {
            data: {
              full_name: 'Demo Admin',
            },
          },
        });

        if (signUpError) {
          setAuthError(`Failed to create demo account: ${signUpError.message}`);
          setIsLoading(false);
          return;
        }

        if (signUpData.user) {
        
          await supabase.from('profiles').upsert({
            id: signUpData.user.id,
            full_name: 'Demo Admin',
            email: demoEmail,
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });


          await supabase.auth.signInWithPassword({
            email: demoEmail,
            password: demoPassword,
          });

          setAuthSuccess('Demo account created and logged in! Redirecting...');
        }
      } else {
  
        setAuthSuccess('Demo login successful! Redirecting...');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsAdminModalOpen(false);
      router.push('/admin');
      
    } catch (error: any) {
      setAuthError(`Demo login error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const socialMediaData = [
    { label: 'YouTube', href: 'https://www.youtube.com/', src: '/ytub.png' },
    { label: 'Twitter/X', href: 'https://twitter.com/', src: '/Tw.png' },
    { label: 'Facebook', href: 'https://facebook.com/', src: '/Faceb.png' },
    { label: 'Instagram', href: 'https://instagram.com/', src: '/inster.png' },
  ];

  const partnerLogos = [
    { src: '/images (10).jpeg', alt: 'Partner 1' },
    { src: '/images (7).jpeg', alt: 'Partner 2' },
    { src: '/images (12).jpeg', alt: 'Partner 3' },
    { src: '/images9.jpeg', alt: 'Partner 4' },
    { src: '/images.png', alt: 'Partner 5' },
    { src: '/download (21).jpeg', alt: 'Partner 6' },
    { src: '/image10.jpeg', alt: 'Partner 7' },
    { src: '/image11.jpeg', alt: 'Partner 8' },
    { src: '/images (7).jpeg', alt: 'Partner 9' },
  ];

  const footerLinks = [
    { id: 1, label: 'Contact Us', action: 'modal' },
    { id: 2, label: 'Terms & Conditions', href: '/Terms&Conditions' },
    { id: 3, label: 'Privacy Policy', href: '/privecypolicy' },
  ];

  return (
    <>
      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        button {
          font-family: inherit;
        }
        
        textarea {
          font-family: inherit;
          resize: vertical;
        }
        
        .modal-content h2, .admin-modal-content h2 {
          color: #ffffff;
          margin: 0 0 30px 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .demo-credentials {
          margin-top: 15px;
          padding: 12px;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 8px;
          font-size: 12px;
          color: #8792a2;
          text-align: center;
          border: 1px solid rgba(102, 126, 234, 0.3);
        }
        
        .demo-credentials strong {
          color: #667eea;
        }
        
        .auto-create-note {
          margin-top: 10px;
          font-size: 11px;
          color: #8792a2;
          text-align: center;
          font-style: italic;
        }
        
        .admin-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .admin-name {
          color: #d0e62aff;
          font-size: 12px;
          white-space: nowrap;
        }
        
        .admin-role {
          color: #8792a2;
          font-size: 12px;
          white-space: nowrap;
        }
        
        .admin-status-badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .admin-status-admin {
          background: #1fb26a;
          color: #042118;
        }
        
        .admin-status-superadmin {
          background: #667eea;
          color: #ffffff;
        }
        
        .admin-status-user {
          background: #8792a2;
          color: #ffffff;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }
        
        .form-note {
          margin-top: 10px;
          padding: 8px;
          background: rgba(102, 126, 234, 0.05);
          border-radius: 6px;
          font-size: 12px;
          color: #8792a2;
          text-align: center;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .auth-status {
          margin-top: 15px;
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          text-align: center;
        }
        
        .auth-status.logged-in {
          background: rgba(31, 178, 106, 0.1);
          color: #1fb26a;
          border: 1px solid rgba(31, 178, 106, 0.3);
        }
        
        .auth-status.logged-out {
          background: rgba(255, 107, 107, 0.1);
          color: #ff6b6b;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }
      `}</style>

      <footer className="site-footer" style={styles.siteFooter}>
     
        <div style={styles.footerTop}>
          <p className="brand" style={styles.brand}>PATH OF THE CRICKET</p>
          
          <p className="small" style={styles.small}>
            Path of the Cricketer & Talent Portal is dedicated to nurturing future cricketing talent in Sri Lanka.
            Working closely with Sri Lanka Cricket, we provide resources, training, and opportunities for aspiring cricketers.
          </p>
        </div>

        <div style={styles.partnersSection}>
          <div style={styles.partnersContainer}>
            {[...partnerLogos, ...partnerLogos].map((partner, index) => (
              <div 
                key={index}
                role="img"
                aria-label={`Sponsor Logo: ${partner.alt}`}
                style={{ 
                  ...styles.partnerLogoWrapper,
                  ...(hoveredLogoIndex === index && styles.partnerLogoWrapperHover)
                }}
                onMouseEnter={() => setHoveredLogoIndex(index)}
                onMouseLeave={() => setHoveredLogoIndex(null)}
              >
                <img
                  src={partner.src}
                  alt={partner.alt}
                  style={{
                    ...styles.partnerLogo,
                    ...(hoveredLogoIndex === index && styles.partnerLogoHover)
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.png';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom" style={styles.footerBottom}>
          <div className="copyright" style={styles.copyright}>
            © {currentYear} Path of the Cricketer & Talent Portal. All rights reserved.
          </div>
          
          <nav className="footer-nav" aria-label="Footer Navigation" style={styles.footerNav}>
            {footerLinks.map((link) => (
              link.action === 'modal' ? (
                <a
                  key={link.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsModalOpen(true);
                  }}
                  style={{ 
                    ...styles.footerNavLink, 
                    ...(hoveredNavLink === link.label && styles.footerNavLinkHover) 
                  }}
                  onMouseEnter={() => setHoveredNavLink(link.label)}
                  onMouseLeave={() => setHoveredNavLink(null)}
                >
                  {link.label}
                </a>
              ) : (
                <a
                  key={link.id}
                  href={link.href}
                  style={{ 
                    ...styles.footerNavLink, 
                    ...(hoveredNavLink === link.label && styles.footerNavLinkHover) 
                  }}
                  onMouseEnter={() => setHoveredNavLink(link.label)}
                  onMouseLeave={() => setHoveredNavLink(null)}
                >
                  {link.label}
                </a>
              )
            ))}
            
            {isLoggedIn && userRole ? (
              <div className="admin-info">
                <span className="admin-name">
                  Welcome, {adminName}
                </span>
                <span className={`admin-status-badge admin-status-${userRole}`}>
                  {userRole}
                </span>
                {userRole === 'admin' || userRole === 'superadmin' ? (
                  <>
                    <button
                      onClick={() => router.push('/admin-panel')}
                      style={{ 
                        ...styles.adminButton, 
                        ...(isAdminButtonHovered && styles.adminButtonHover) 
                      }}
                      onMouseEnter={() => setIsAdminButtonHovered(true)}
                      onMouseLeave={() => setIsAdminButtonHovered(false)}
                      aria-label="Go to Admin Panel"
                    >
                      Admin Panel
                    </button>
                    <button
                      onClick={handleAdminLogout}
                      style={{ 
                        ...styles.logoutButton,
                        ...(isAdminButtonHovered && styles.logoutButtonHover) 
                      }}
                      onMouseEnter={() => setIsAdminButtonHovered(true)}
                      onMouseLeave={() => setIsAdminButtonHovered(false)}
                      aria-label="Logout"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAdminLogout}
                    style={{ 
                      ...styles.logoutButton,
                      ...(isAdminButtonHovered && styles.logoutButtonHover) 
                    }}
                    onMouseEnter={() => setIsAdminButtonHovered(true)}
                    onMouseLeave={() => setIsAdminButtonHovered(false)}
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleAdminPanelAccess}
                style={{ 
                  ...styles.adminButton, 
                  ...(isAdminButtonHovered && styles.adminButtonHover) 
                }}
                onMouseEnter={() => setIsAdminButtonHovered(true)}
                onMouseLeave={() => setIsAdminButtonHovered(false)}
                aria-label="Admin Login"
              >
                Admin Login
              </button>
            )}
          </nav>
          
          <div className="footer-social" style={styles.footerSocial}>
            {socialMediaData.map((social) => (
              <SocialIcon key={social.label} {...social} />
            ))}
          </div>
        </div>
      </footer>

      <div
        id="contactModal"
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isModalOpen}
        aria-labelledby="contactTitle"
        style={styles.modal(isModalOpen)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div className="modal-content" style={styles.modalContent}>
          <button
            className="modal-close"
            onClick={() => setIsModalOpen(false)}
            aria-label="Close contact form"
            style={styles.modalClose}
          >
            &times;
          </button>
          <h2 id="contactTitle">Contact Our Team</h2>
          <form onSubmit={handleContactSubmit}>
            <label htmlFor="name" style={styles.modalLabel}>Name</label>
            <input 
              id="name" 
              name="name" 
              required 
              style={styles.modalInput}
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            
            <label htmlFor="email" style={styles.modalLabel}>Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              style={styles.modalInput}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            
            <label htmlFor="message" style={styles.modalLabel}>Message</label>
            <textarea 
              id="message" 
              name="message" 
              rows={5} 
              required 
              style={{...styles.modalInput, minHeight: '120px'}}
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
            />
            
            <button 
              type="submit" 
              style={{ ...styles.modalPrimaryButton, ...(isContactButtonHovered && styles.modalPrimaryButtonHover) }}
              onMouseEnter={() => setIsContactButtonHovered(true)}
              onMouseLeave={() => setIsContactButtonHovered(false)}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      <div
        id="adminModal"
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isAdminModalOpen}
        aria-labelledby="adminAuthTitle"
        style={styles.modal(isAdminModalOpen)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsAdminModalOpen(false);
        }}
      >
        <div className="admin-modal-content" style={styles.adminModalContent}>
          <button
            className="modal-close"
            onClick={() => {
              setIsAdminModalOpen(false);
              setAuthError('');
              setAuthSuccess('');
            }}
            aria-label="Close admin authentication form"
            style={styles.modalClose}
          >
            &times;
          </button>
          
          <h2 id="adminAuthTitle">
            {authMode === 'login' ? 'Admin Login' : 'Admin Registration'}
          </h2>
          
          <div style={styles.authTabs}>
            <div 
              style={styles.authTab(authMode === 'login')}
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
                setAuthSuccess('');
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setAuthMode('login');
                  setAuthError('');
                  setAuthSuccess('');
                }
              }}
            >
              Login
            </div>
            <div 
              style={styles.authTab(authMode === 'register')}
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
                setAuthSuccess('');
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setAuthMode('register');
                  setAuthError('');
                  setAuthSuccess('');
                }
              }}
            >
              Register
            </div>
          </div>
          
          {isLoggedIn && (
            <div className="auth-status logged-in">
              ✓ Currently logged in as: {adminName} ({adminEmail})
            </div>
          )}
          
          <form onSubmit={authMode === 'login' ? handleAdminLogin : handleAdminRegister}>
            {authMode === 'register' && (
              <>
                <label htmlFor="registerName" style={styles.modalLabel}>Full Name</label>
                <input 
                  id="registerName" 
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Enter your full name"
                  required 
                  style={styles.modalInput} 
                />
              </>
            )}
            
            <label htmlFor="adminEmail" style={styles.modalLabel}>Email Address</label>
            <input 
              id="adminEmail" 
              type="email"
              value={adminAuthEmail}
              onChange={(e) => setAdminAuthEmail(e.target.value)}
              placeholder="your-email@example.com"
              required 
              style={styles.modalInput} 
            />
            
            <label htmlFor="adminPassword" style={styles.modalLabel}>Password</label>
            <input 
              id="adminPassword" 
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder={authMode === 'login' ? "Enter your password" : "Create a strong password (min. 6 chars)"}
              required 
              style={styles.modalInput} 
            />
            
            {authMode === 'register' && (
              <>
                <label htmlFor="confirmPassword" style={styles.modalLabel}>Confirm Password</label>
                <input 
                  id="confirmPassword" 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required 
                  style={styles.modalInput} 
                />
              </>
            )}
            
            {authError && <div style={styles.formError}>{authError}</div>}
            {authSuccess && <div style={styles.formSuccess}>{authSuccess}</div>}
            
            {authMode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <a 
                  href="#forgot-password" 
                  style={{ color: '#3f4a7aff', fontSize: '14px', textDecoration: 'none' }}
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset link will be sent to your email.');
                  }}
                >
                  Forgot Password?
                </a>
              </div>
            )}
            
            <button 
              type="submit" 
              style={{ ...styles.adminModalPrimaryButton, ...(isAdminAuthButtonHovered && styles.adminModalPrimaryButtonHover) }}
              onMouseEnter={() => setIsAdminAuthButtonHovered(true)}
              onMouseLeave={() => setIsAdminAuthButtonHovered(false)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Processing...
                </>
              ) : authMode === 'login' ? 'Login to Admin ' : 'Register & Login'}
            </button> 
            
            {authMode === 'login' && (
              <>
                <button 
                  type="button"
                  onClick={handleDemoLogin}
                  style={{ 
                    marginTop: '15px',
                    padding: '12px 12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: '0',
                    color: '#ffffff',
                    cursor: 'pointer',
                    width: '100%',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Use Demo Admin Account'}
                </button>
                
                <div className="demo-credentials">
                  <strong>Demo Admin Credentials:</strong><br />
                  Email: admin@cricketportal.com<br />
                  Password: Admin@123
                </div>
              </>
            )}
            
            {authMode === 'register' && (
              <div className="form-note">
                <strong>Note:</strong> Your account will be saved in Supabase database. After registration, you will be automatically logged in.
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default Footer;