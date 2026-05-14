'use client';

import { useState, useRef, FormEvent, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  CheckCircle, Download, User, Mail, Key, MapPin, 
  Phone, FileText, Building, CreditCard, Banknote,
  Shield, Fingerprint, Upload, AlertCircle, Info
} from 'lucide-react';

// Sri Lanka Districts
const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

// Sri Lanka Banks
const SRI_LANKA_BANKS = [
  'Bank of Ceylon',
  'People\'s Bank',
  'Commercial Bank',
  'Hatton National Bank',
  'Sampath Bank',
  'National Savings Bank',
  'DFCC Bank',
  'Seylan Bank',
  'NDB Bank',
  'Pan Asia Bank',
  'Cargills Bank',
  'Amana Bank',
  'Sanasa Development Bank',
  'Union Bank',
  'HSBC Sri Lanka',
  'Standard Chartered Sri Lanka',
  'Citibank Sri Lanka',
  'MCB Bank Sri Lanka',
  'ICICI Bank Sri Lanka',
  'Habib Bank Sri Lanka'
];

// Account Types
const ACCOUNT_TYPES = ['Savings', 'Current', 'Salary'];

export default function SponsorshipApplication() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [faceAuthStatus, setFaceAuthStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [authMessage, setAuthMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [playerID, setPlayerID] = useState<string>('');
  const [isGeneratingID, setIsGeneratingID] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  
  const formRef = useRef<HTMLFormElement>(null);
  const gsCertificateRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate unique player ID
  const generatePlayerID = useCallback(() => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `POC-${year}-${randomNum}`;
  }, []);

  // Generate unique token
  const generateToken = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 12; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `TOKEN-${token}`;
  }, []);

  // Initialize on component mount
  useEffect(() => {
    mountedRef.current = true;
    abortControllerRef.current = new AbortController();

    const initializeApplication = async () => {
      try {
        setLoading(true);
        
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          if (mountedRef.current) router.push('/auth/login');
          return;
        }
        
        if (!mountedRef.current) return;
        setUser(session.user);
        
        // Generate player ID and token immediately
        const newPlayerID = generatePlayerID();
        const newToken = generateToken();
        
        setPlayerID(newPlayerID);
        setToken(newToken);
        
        // Try to get profile data with abort signal and maybeSingle
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('player_id, district')
          .eq('id', session.user.id)
          .maybeSingle()   // ✅ no error if profile missing
          .abortSignal(abortControllerRef.current.signal);
        
        if (profileError && profileError.name !== 'AbortError') {
          console.error('Profile fetch error:', profileError);
        }
        
        if (mountedRef.current && profile) {
          if (profile.player_id) setPlayerID(profile.player_id);
          if (profile.district) setSelectedDistrict(profile.district);
        }
        
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Profile fetch aborted');
          return;
        }
        console.error('Initialization error:', error);
        if (mountedRef.current) {
          setError('Failed to initialize application. Please refresh the page.');
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    
    initializeApplication();
    
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [router, generatePlayerID, generateToken]);

  // Face authentication simulation
  const startFaceAuthentication = async () => {
    if (faceAuthStatus === 'success') return;
    if (!mountedRef.current) return;
    
    setAuthMessage('Initializing face authentication...');
    setIsAuthenticating(true);
    setFaceAuthStatus('pending');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const isSuccess = Math.random() > 0.15;
      
      if (!mountedRef.current) return;
      
      if (isSuccess) {
        setFaceAuthStatus('success');
        setAuthMessage('✅ Face authentication successful! Your identity has been verified.');
      } else {
        setFaceAuthStatus('failed');
        setAuthMessage('❌ Face authentication failed. Please ensure good lighting and try again.');
      }
      
    } catch (error) {
      console.error('Face authentication error:', error);
      if (mountedRef.current) {
        setFaceAuthStatus('failed');
        setAuthMessage('❌ Authentication error. Please try again.');
      }
    } finally {
      if (mountedRef.current) setIsAuthenticating(false);
    }
  };

  // Generate new player ID
  const handleGenerateNewID = async () => {
    if (!user || !mountedRef.current) return;
    
    setIsGeneratingID(true);
    try {
      const newPlayerID = generatePlayerID();
      setPlayerID(newPlayerID);
      setSuccess(`✅ New Player ID generated: ${newPlayerID}`);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          player_id: newPlayerID,
          updated_at: new Date().toISOString()
        });
      
      if (updateError) console.error('Profile update error:', updateError);
      
    } catch (error) {
      console.error('Error generating new ID:', error);
      if (mountedRef.current) setError('Failed to generate new Player ID');
    } finally {
      if (mountedRef.current) setIsGeneratingID(false);
    }
  };

  // Generate new token
  const handleGenerateToken = () => {
    if (!mountedRef.current) return;
    const newToken = generateToken();
    setToken(newToken);
    setSuccess(`✅ New token generated: ${newToken}`);
  };

  // Upload file to Supabase Storage
  const uploadFile = async (file: File, bucket: string, userId: string) => {
    try {
      if (!file || file.size === 0) throw new Error('File is empty');
      if (file.size > 5 * 1024 * 1024) throw new Error('File size exceeds 5MB limit');
      if (file.type !== 'application/pdf') throw new Error('Only PDF files are allowed');
      
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const safeName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 50);
      const filePath = `${userId}/${safeName}_${timestamp}_${randomStr}.pdf`;
      
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf'
        });
      
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
      
      return {
        success: true,
        url: publicUrl,
        path: data.path,
        fileName: file.name
      };
      
    } catch (error: any) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed',
        url: '',
        path: '',
        fileName: ''
      };
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mountedRef.current) return;
    
    setError(null);
    setSuccess(null);
    
    if (!user) {
      setError('Please login to submit application');
      router.push('/auth/login');
      return;
    }

    if (!playerID) {
      setError('Player ID is required');
      return;
    }

    if (!token) {
      setError('Token is required');
      return;
    }

    if (!selectedDistrict) {
      setError('Please select your district');
      return;
    }

    if (faceAuthStatus !== 'success') {
      setError('Face authentication is required and must be successful');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const gsCertificateFile = gsCertificateRef.current?.files?.[0];
    
    if (formData.get('agreement') === 'disagree') {
      setError('You must agree to the Terms and Conditions');
      return;
    }

    if (!formData.get('notRobot')) {
      setError("Please confirm you're not a robot");
      return;
    }

    if (!gsCertificateFile) {
      setError('GS Certificate is required');
      return;
    }

    if (gsCertificateFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed for GS Certificate');
      return;
    }

    if (gsCertificateFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const bankName = formData.get('bankName') as string;
    const accountNumber = formData.get('accountNumber') as string;
    const accountType = formData.get('accountType') as string;
    const branchName = formData.get('branchName') as string;
    
    if (!bankName || !accountNumber || !accountType || !branchName) {
      setError('All bank details are required');
      return;
    }

    if (!/^\d+$/.test(accountNumber)) {
      setError('Account number must contain only numbers');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      setUploadProgress(20);
      const uploadResult = await uploadFile(gsCertificateFile, 'sponsorship-docs', user.id);
      if (!uploadResult.success) throw new Error(uploadResult.error || 'File upload failed');

      setUploadProgress(40);
      const applicationData = {
        user_id: user.id,
        email: user.email,
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
        address: formData.get('address') as string,
        contact_number: formData.get('contactNumber') as string,
        id_number: formData.get('idNumber') as string,
        player_id: playerID,
        token: token,
        district: selectedDistrict,
        division: formData.get('division') as string,
        bank_name: bankName,
        account_number: accountNumber,
        account_type: accountType,
        branch_name: branchName,
        account_holder_name: (formData.get('accountHolderName') as string) || `${formData.get('firstName')} ${formData.get('lastName')}`,
        gs_certificate_url: uploadResult.url,
        gs_certificate_path: uploadResult.path,
        face_auth_status: faceAuthStatus,
        agreement_accepted: formData.get('agreement') === 'agree',
        status: 'pending',
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      setUploadProgress(60);
      const { data, error: insertError } = await supabase
        .from('sponsorship_applications')
        .insert([applicationData])
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') throw new Error('You have already submitted an application. Please check your application status.');
        if (insertError.code === '42P01') throw new Error('Database table not configured. Please run the SQL script in Supabase.');
        throw new Error(`Database error: ${insertError.message}`);
      }

      setUploadProgress(70);
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          district: selectedDistrict,
          bank_name: bankName,
          account_number: accountNumber,
          account_type: accountType,
          branch_name: branchName,
          account_holder_name: applicationData.account_holder_name,
          updated_at: new Date().toISOString()
        });
      } catch (profileErr) {
        console.error('Profile update error:', profileErr);
      }

      setUploadProgress(100);
      setSuccess(`✅ Sponsorship Application Submitted Successfully!

Application ID: ${data.id.substring(0, 8).toUpperCase()}
Player ID: ${playerID}
Verification Token: ${token}
District: ${selectedDistrict}

All your information has been saved to your profile.
You will be redirected to your dashboard in 5 seconds.`);

      if (formRef.current) formRef.current.reset();
      setFaceAuthStatus('pending');
      setAuthMessage('');
      setSelectedDistrict('');
      setToken(generateToken());

      setTimeout(() => {
        if (mountedRef.current) router.push('/user-profile');
      }, 5000);

    } catch (error: any) {
      console.error('Submission error:', error);
      if (mountedRef.current) setError(`❌ ${error.message || 'Submission failed. Please try again.'}`);
    } finally {
      if (mountedRef.current) setIsSubmitting(false);
      setTimeout(() => { if (mountedRef.current) setUploadProgress(0); }, 1000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-white text-lg font-semibold">Loading Application...</h2>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="bg-gradient-to-r from-yellow-900 via-yellow-800 to-yellow-900 border-b border-yellow-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-2">
                      <span className="text-black font-bold"></span>
                    </div>
                    <span className="text-white text-xl font-bold">Path of the Cricket</span>
                  </div>
                </div>
              </div>
              <div className="text-yellow-300 text-sm">Sponsorship Application</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="bg-gray-800/50 border border-gray-900 rounded-xl p-8 max-w-md mx-4 text-center">
            <div className="text-yellow-500 mb-4"><Shield size={48} className="mx-auto" /></div>
            <h2 className="text-2xl font-bold text-white mb-3">Authentication Required</h2>
            <p className="text-gray-300 mb-6">Please login to access the sponsorship application form</p>
            <button onClick={() => router.push('/auth/login')} className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold rounded-lg transition-all">Go to Login Page</button>
          </div>
        </div>
      </div>
    );
  }

  // Main form (full JSX unchanged – same as your original)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-yellow-900 via-yellow-800 to-yellow-900 border-b border-yellow-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                    <span className="text-black font-bold text-lg"></span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Path of the Cricket</h1>
                    <p className="text-yellow-300 text-sm">Player Sponsorship Program</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-300">Logged in as</p>
                <p className="text-yellow-400 font-medium truncate max-w-[200px]">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* APPLICATION HEADER */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                SPONSORSHIP APPLICATION FORM
              </span>
            </h1>
            <p className="text-gray-300 text-lg mb-4">Complete all sections to apply for cricket sponsorship</p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                <User size={16} className="text-blue-400 mr-2" />
                <span className="text-sm">Player: <span className="text-yellow-400">{playerID}</span></span>
              </div>
              <div className="flex items-center bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                <Key size={16} className="text-green-400 mr-2" />
                <span className="text-sm">Token: <span className="text-green-400 font-mono">{token.substring(0, 8)}...</span></span>
              </div>
              <div className="flex items-center bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                <MapPin size={16} className="text-red-400 mr-2" />
                <span className="text-sm">District: <span className="text-blue-400">{selectedDistrict || 'Select'}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <main className="max-w-6xl mx-auto p-4 md:p-6 pt-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-5 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700 rounded-xl animate-pulse">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-green-300 mb-2">Application Submitted Successfully!</h3>
                <p className="text-sm font-medium text-green-200 whitespace-pre-line">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-5 bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-700 rounded-xl">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-red-300 mb-2">Submission Error</h3>
                <p className="text-sm font-medium text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Processing your application...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Uploading Document</span>
              <span>Saving to Database</span>
              <span>Sending Confirmation</span>
            </div>
          </div>
        )}

        {/* Application Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: PLAYER ACCOUNT DETAILS */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
            <div className="flex items-center mb-6 pb-4 border-b border-gray-700">
              <div className="h-10 w-10 bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                <User className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Player Account Details</h2>
                <p className="text-gray-400 text-sm">Your profile information from the system</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-400" />
                  Registered Email
                </label>
                <div className="p-3.5 bg-gray-700/50 border border-gray-600 rounded-lg">
                  <p className="text-white font-medium">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Your login email address</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Key className="h-4 w-4 mr-2 text-yellow-400" />
                  Player ID
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3.5 bg-gray-700/50 border border-gray-600 rounded-lg">
                    <p className="text-yellow-400 font-medium">{playerID}</p>
                    <p className="text-xs text-gray-400 mt-1">Your unique player identifier</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateNewID}
                    disabled={isGeneratingID}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center"
                    title="Generate new Player ID"
                  >
                    {isGeneratingID ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      'New ID'
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-400" />
                  Verification Token
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3.5 bg-gray-700/50 border border-gray-600 rounded-lg">
                    <p className="text-green-400 font-mono text-sm">{token}</p>
                    <p className="text-xs text-gray-400 mt-1">One-time application token</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateToken}
                    className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                    title="Generate new token"
                  >
                    New
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-red-400" />
                  Your District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  required
                  className="w-full p-3.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                >
                  <option value="" disabled>Select your district</option>
                  {SRI_LANKA_DISTRICTS.map((district) => (
                    <option key={district} value={district} className="bg-gray-800">
                      {district}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Where you are from</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300">
                    <span className="font-semibold">Note:</span> This information is retrieved from your player profile. 
                    Your Player ID and Token are used to track your application.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PERSONAL INFORMATION */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
            <div className="flex items-center mb-6 pb-4 border-b border-gray-700">
              <div className="h-10 w-10 bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                <User className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Personal Information</h2>
                <p className="text-gray-400 text-sm">Please fill your personal details</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">First Name <span className="text-red-400"></span></label>
                <input type="text" id="firstName" name="firstName" required className="w-full p-3.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Enter your first name" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">Last Name <span className="text-red-400"></span></label>
                <input type="text" id="lastName" name="lastName" required className="w-full p-3.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Enter your last name" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">Full Address <span className="text-red-400"></span></label>
                <input type="text" id="address" name="address" required className="w-full p-3.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Enter your complete residential address" />
              </div>
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-green-400" />
                  Contact Number <span className="text-red-400"></span>
                </label>
                <input type="tel" id="contactNumber" name="contactNumber" pattern="[0-9]{10}" maxLength={10} required className="w-full p-3.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" placeholder="07X XXX XXXX" />
                <p className="text-xs text-gray-400 mt-1">10-digit mobile number</p>
              </div>
              <div>
                <label htmlFor="idNumber" className="block text-sm font-medium text-gray-300 mb-2">National ID (NIC) <span className="text-red-400"></span></label>
                <input type="text" id="idNumber" name="idNumber" required className="w-full p-3.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Enter your NIC number" />
                <p className="text-xs text-gray-400 mt-1">Sri Lankan National Identity Card Number</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: BANK ACCOUNT DETAILS */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
            <div className="flex items-center mb-6 pb-4 border-b border-gray-700">
              <div className="h-10 w-10 bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                <Building className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Bank Account Details</h2>
                <p className="text-gray-400 text-sm">For sponsorship payments</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-blue-400" />
                  Bank Name <span className="text-red-400"></span>
                </label>
                <select id="bankName" name="bankName" required className="w-full p-3.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option value="" disabled>Select your bank</option>
                  {SRI_LANKA_BANKS.map((bank) => <option key={bank} value={bank}>{bank}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-green-400" />
                  Account Number <span className="text-red-400"></span>
                </label>
                <input type="text" id="accountNumber" name="accountNumber" pattern="[0-9]+" required className="w-full p-3.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" placeholder="Enter account number" />
                <p className="text-xs text-gray-400 mt-1">Numbers only, no spaces</p>
              </div>
              <div>
                <label htmlFor="accountType" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Banknote className="h-4 w-4 mr-2 text-yellow-400" />
                  Account Type <span className="text-red-400"></span>
                </label>
                <select id="accountType" name="accountType" required className="w-full p-3.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all">
                  <option value="" disabled>Select account type</option>
                  {ACCOUNT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="branchName" className="block text-sm font-medium text-gray-300 mb-2">Branch Name <span className="text-red-400"></span></label>
                <input type="text" id="branchName" name="branchName" required className="w-full p-3.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Enter branch name" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-300 mb-2">Account Holder Name (Optional)</label>
                <input type="text" id="accountHolderName" name="accountHolderName" className="w-full p-3.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Enter name as it appears in bank account (if different)" />
                <p className="text-xs text-gray-400 mt-1">Leave blank if same as your name above</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-green-300">
                    <span className="font-semibold">Important:</span> Please ensure all bank details are accurate. 
                    Sponsorship payments will be deposited to this account. These details will be saved to your profile.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: CRICKET DETAILS */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
            <div className="flex items-center mb-6 pb-4 border-b border-gray-700">
              <div className="h-10 w-10 bg-yellow-900/30 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-500 font-bold text-xl"></span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Cricket & Location Details</h2>
                <p className="text-gray-400 text-sm">Your cricket playing information</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Player ID</label>
                <div className="p-3.5 bg-gray-700/50 border border-gray-600 rounded-lg">
                  <p className="text-yellow-400 font-medium">{playerID}</p>
                  <p className="text-xs text-gray-400 mt-1">Your unique player identifier</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">District</label>
                <div className="p-3.5 bg-gray-700/50 border border-gray-600 rounded-lg">
                  <p className={selectedDistrict ? "text-white font-medium" : "text-gray-400"}>{selectedDistrict || "Not selected"}</p>
                  <p className="text-xs text-gray-400 mt-1">Selected in account details</p>
                </div>
              </div>
              <div>
                <label htmlFor="division" className="block text-sm font-medium text-gray-300 mb-2">Division <span className="text-red-400"></span></label>
                <input type="text" id="division" name="division" required className="w-full p-3.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all" placeholder="e.g., Colombo Central, Kandy City" />
                <p className="text-xs text-gray-400 mt-1">Your cricket playing division</p>
              </div>
            </div>
          </div>

          {/* SECTION 5: DOCUMENT UPLOAD */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
            <div className="flex items-center mb-6 pb-4 border-b border-gray-700">
              <div className="h-10 w-10 bg-emerald-900/30 rounded-lg flex items-center justify-center mr-3">
                <FileText className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Document Upload</h2>
                <p className="text-gray-400 text-sm">Required supporting documents</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">GS Certificate (PDF) <span className="text-red-400"></span></label>
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors bg-gray-800/30">
                <input ref={gsCertificateRef} type="file" id="gsCertificate" name="gsCertificate" accept=".pdf" required className="hidden" />
                <label htmlFor="gsCertificate" className="cursor-pointer block">
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-gray-700/50 rounded-full mb-4">
                      <Upload className="h-10 w-10 text-emerald-500" />
                    </div>
                    <p className="text-lg text-gray-300 font-medium mb-2">Upload GS Certificate</p>
                    <p className="text-gray-400 mb-4">Click or drag to select a PDF file</p>
                    {gsCertificateRef.current?.files?.[0] ? (
                      <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-700/30 rounded-lg max-w-md mx-auto">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-emerald-400 mr-2" />
                          <div className="text-left">
                            <p className="text-emerald-400 font-medium truncate">{gsCertificateRef.current.files[0].name}</p>
                            <p className="text-xs text-emerald-300">Size: {(gsCertificateRef.current.files[0].size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg max-w-md mx-auto">
                        <p className="text-gray-400">No file selected</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-center mb-2"><FileText className="h-4 w-4 text-blue-400 mr-2" /><p className="text-sm font-medium text-gray-300">Format</p></div>
                  <p className="text-gray-400 text-sm">PDF only (.pdf extension)</p>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-center mb-2"><Download className="h-4 w-4 text-green-400 mr-2" /><p className="text-sm font-medium text-gray-300">Size Limit</p></div>
                  <p className="text-gray-400 text-sm">Maximum 5MB file size</p>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-center mb-2"><AlertCircle className="h-4 w-4 text-red-400 mr-2" /><p className="text-sm font-medium text-gray-300">Required</p></div>
                  <p className="text-gray-400 text-sm">Mandatory for application</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: VERIFICATION & AGREEMENT */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
            <div className="flex items-center mb-6 pb-4 border-b border-gray-700">
              <div className="h-10 w-10 bg-yellow-900/30 rounded-lg flex items-center justify-center mr-3">
                <Fingerprint className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Verification & Agreement</h2>
                <p className="text-gray-400 text-sm">Final steps to complete your application</p>
              </div>
            </div>
            
            <div className="mb-6 p-5 bg-gray-800/30 border border-gray-700 rounded-xl">
              <p className="font-semibold text-gray-200 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-yellow-500 mr-2" />
                Terms and Conditions Agreement <span className="text-red-400 ml-1"></span>
              </p>
              <div className="space-y-3">
                <label className="flex items-center p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 cursor-pointer transition-colors">
                  <input type="radio" id="agree" name="agreement" value="agree" required defaultChecked className="h-5 w-5 text-yellow-500 bg-gray-700 border-gray-600 focus:ring-yellow-500 focus:ring-offset-gray-900" />
                  <div className="ml-3"><span className="text-gray-300 font-medium">I agree to the Terms and Conditions</span><p className="text-sm text-gray-400 mt-1">I have read and accept all terms of the sponsorship program</p></div>
                </label>
                <label className="flex items-center p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 cursor-pointer transition-colors">
                  <input type="radio" id="disagree" name="agreement" value="disagree" className="h-5 w-5 text-yellow-500 bg-gray-700 border-gray-600 focus:ring-yellow-500 focus:ring-offset-gray-900" />
                  <div className="ml-3"><span className="text-gray-300 font-medium">I disagree</span><p className="text-sm text-gray-400 mt-1">Application cannot be submitted if you disagree</p></div>
                </label>
              </div>
            </div>

            <div className="mb-6 p-5 bg-gray-800/30 border border-gray-700 rounded-xl">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" id="notRobot" name="notRobot" required className="h-5 w-5 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 focus:ring-offset-gray-900" />
                <div className="ml-3"><span className="text-gray-300 font-medium">I'm not a robot <span className="text-red-400"></span></span><p className="text-sm text-gray-400 mt-1">Required security verification</p></div>
              </label>
            </div>

            <div className="p-5 bg-gray-800/30 border border-gray-700 rounded-xl">
              <p className="font-semibold text-gray-200 mb-4 flex items-center">
                <Fingerprint className="h-5 w-5 text-yellow-500 mr-2" />
                Face Authentication <span className="text-red-400 ml-1"></span>
              </p>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <button
                  type="button"
                  onClick={startFaceAuthentication}
                  disabled={isAuthenticating || faceAuthStatus === 'success'}
                  className={`px-6 py-3.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 min-w-[220px] ${
                    faceAuthStatus === 'success'
                      ? 'bg-gradient-to-r from-green-700 to-emerald-800 text-white cursor-default'
                      : isAuthenticating
                      ? 'bg-gradient-to-r from-yellow-700 to-yellow-800 text-white cursor-wait'
                      : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {faceAuthStatus === 'success' ? (
                    <><CheckCircle size={20} /><span>Authenticated ✓</span></>
                  ) : isAuthenticating ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div><span>Authenticating...</span></>
                  ) : (
                    <><Fingerprint size={20} /><span>Start Face Authentication</span></>
                  )}
                </button>
                <div className="flex-1">
                  {authMessage && (
                    <div className={`p-3 rounded-lg ${
                      faceAuthStatus === 'success'
                        ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/30'
                        : faceAuthStatus === 'failed'
                        ? 'bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-700/30'
                        : 'bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border border-yellow-700/30'
                    }`}>
                      <p className={`font-medium ${
                        faceAuthStatus === 'success' ? 'text-green-400' : faceAuthStatus === 'failed' ? 'text-red-400' : 'text-yellow-400'
                      }`}>{authMessage}</p>
                    </div>
                  )}
                  {!authMessage && (
                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <p className="text-gray-300">Required for identity verification</p>
                      <p className="text-gray-400 text-sm mt-1">Ensures application authenticity and prevents fraud</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="sticky bottom-6 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-2xl z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Ready to Submit Application</h3>
                <div className="flex flex-wrap gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${playerID ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${playerID ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Player ID</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${token ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${token ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Token</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${selectedDistrict ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${selectedDistrict ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>District</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${faceAuthStatus === 'success' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${faceAuthStatus === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Face Auth</span>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || faceAuthStatus !== 'success' || !playerID || !token || !selectedDistrict}
                className={`px-8 py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 min-w-[250px] ${
                  isSubmitting || faceAuthStatus !== 'success' || !playerID || !token || !selectedDistrict
                    ? 'bg-gradient-to-r from-gray-700 to-gray-800 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 shadow-xl hover:shadow-2xl hover:shadow-emerald-900/30 transform hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Submitting Application...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle size={20} />
                    <span>Submit Sponsorship Application</span>
                  </span>
                )}
              </button>
            </div>
            <div className="mt-4 text-center text-sm text-gray-400">
              <p>By clicking submit, you confirm that all information provided is accurate and complete</p>
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="mt-10 p-6 bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-2xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold text-gray-300 mb-3 flex items-center"><Info className="h-4 w-4 mr-2 text-blue-400" /> Application Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Player ID:</span><span className="text-yellow-400 font-medium text-sm">{playerID}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Token:</span><span className="text-green-400 font-mono text-sm">{token}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">District:</span><span className="text-blue-400 text-sm">{selectedDistrict || 'Not selected'}</span></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-300 mb-3 flex items-center"><User className="h-4 w-4 mr-2 text-green-400" /> Contact Information</h4>
              <div className="space-y-2"><p className="text-gray-400 text-sm">Email: <span className="text-white">{user?.email}</span></p><p className="text-gray-500 text-xs mt-1">All communications will be sent to this email address</p></div>
            </div>
            <div>
              <h4 className="font-bold text-gray-300 mb-3 flex items-center"><AlertCircle className="h-4 w-4 mr-2 text-yellow-400" /> Need Help?</h4>
              <p className="text-gray-400 text-sm mb-3">If you encounter any issues with the application form, please contact our support team.</p>
              <div className="flex gap-2">
                <button onClick={() => router.push('/contact')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors flex-1">Contact Support</button>
                <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors">Print Form</button>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Path of the Cricket - Player Sponsorship Program. All rights reserved.</p>
            <p className="text-gray-500 text-xs mt-1">Your application data is encrypted and securely stored in our database</p>
          </div>
        </div>
      </main>
    </div>
  );
}