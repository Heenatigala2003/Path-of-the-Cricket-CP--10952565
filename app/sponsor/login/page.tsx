
'use client';

import { useState, useRef, FormEvent, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';   
const SPONSOR_TIERS = [
  { id: 'platinum', name: 'Platinum Sponsor', min: 10000, color: 'from-gray-300 to-gray-500' },
  { id: 'gold', name: 'Gold Sponsor', min: 5000, color: 'from-yellow-400 to-yellow-600' },
  { id: 'silver', name: 'Silver Sponsor', min: 2500, color: 'from-gray-400 to-gray-600' },
  { id: 'bronze', name: 'Bronze Sponsor', min: 1000, color: 'from-amber-700 to-amber-900' },
  { id: 'community', name: 'Community Sponsor', min: 500, color: 'from-green-500 to-green-700' }
];

export default function SponsorshipApplication() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    business_type: '',
    sponsorship_tier: 'gold',
    proposed_investment: '5000',
    message: '',
    agree_terms: false
  });


  useEffect(() => {
    mountedRef.current = true;
    abortControllerRef.current = new AbortController();

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

 
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mountedRef.current) return;
    
    setError('');
    setIsSubmitting(true);


    if (!formData.agree_terms) {
      setError('🚫 You must agree to the Terms and Conditions to proceed.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.company_name || !formData.contact_email || !formData.proposed_investment) {
      setError('🚫 Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    const selectedTier = SPONSOR_TIERS.find(t => t.id === formData.sponsorship_tier);
    const investmentAmount = parseFloat(formData.proposed_investment);
    
    if (investmentAmount < (selectedTier?.min || 0)) {
      setError(`🚫 Investment amount must be at least $${selectedTier?.min.toLocaleString()} for ${selectedTier?.name}`);
      setIsSubmitting(false);
      return;
    }

  
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      
      const response = await fetch('/api/sponsor/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submitted_at: new Date().toISOString(),
          status: 'pending'
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      // Option 2: You could also insert directly into Supabase if you prefer (uncomment below)
      /*
      const { error: dbError } = await supabase
        .from('sponsor_applications')
        .insert([{
          company_name: formData.company_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone,
          website_url: formData.website_url,
          business_type: formData.business_type,
          sponsorship_tier: formData.sponsorship_tier,
          proposed_investment: parseFloat(formData.proposed_investment),
          message: formData.message,
          agree_terms: formData.agree_terms,
          status: 'pending',
          submitted_at: new Date().toISOString()
        }]);

      if (dbError) throw dbError;
      */

      if (!mountedRef.current) return;
      

      router.push(`/sponsor/apply/success?tier=${formData.sponsorship_tier}&amount=${formData.proposed_investment}`);
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Submission aborted');
        return;
      }
      if (mountedRef.current) {
        setError(err.message || 'Failed to submit application');
      }
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">

      <header className="bg-black/80 backdrop-blur-sm py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center">
      
          <div className="mb-4 flex items-center justify-center">
            <div className="relative w-0 h-0 md:w-24 md:h-24">
              <div className="w-full h-full bg-gradient-to-br rounded-full flex items-center justify-center ">
                <div className="text-2xl font-bold text-black"></div>
              </div>
            </div>
          </div>
          
    
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                PATH OF THE CRICKET
              </span>
            </h1>
            <p className="text-gray-200 text-lg md:text-xl">
              Become a Sponsor
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-2 md:p-6">
       
        <button
          onClick={() => router.back()}
          className="flex items-center gap-6 text-gray-00 hover:text-white mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Sponsorship
        </button>

        <form 
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 md:p-8 border border-gray-700"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-3 animate-pulse">
              <AlertCircle className="text-red-400 flex-shrink-0" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

      
          <section className="mb-8">
            <h2 className="text-xl font-bold text-yellow-400 border-b-2 border-yellow-500/50 pb-2 mb-6 flex items-center">
              <span className="mr-2"></span>
              Company Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="company_name" className="block font-semibold text-gray-200">
                  Company Name 
                </label>
                <input
                  type="text"
                  id="company_name"
                  required
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="business_type" className="block font-semibold text-gray-200">
                  Business Type
                </label>
                <input
                  type="text"
                  id="business_type"
                  value={formData.business_type}
                  onChange={(e) => handleInputChange('business_type', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="e.g., Sports Brand, Tech Company"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact_email" className="block font-semibold text-gray-200">
                  Contact Email 
                </label>
                <input
                  type="email"
                  id="contact_email"
                  required
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact_phone" className="block font-semibold text-gray-200">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label htmlFor="website_url" className="block font-semibold text-gray-200">
                  Website URL
                </label>
                <input
                  type="url"
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </section>

  
          <section className="mb-8">
            <h2 className="text-xl font-bold text-yellow-400 border-b-2 border-yellow-500/50 pb-2 mb-6 flex items-center">
              <span className="mr-2"></span>
              Sponsorship Tier
            </h2>
            
            <div className="space-y-2">
              <label className="block font-semibold text-gray-200 mb-4">
                Select Your Sponsorship Level 
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {SPONSOR_TIERS.map(tier => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      handleInputChange('sponsorship_tier', tier.id);
                      handleInputChange('proposed_investment', tier.min.toString());
                    }}
                    className={`p-4 rounded-lg border-2 text-center transition-all transform hover:scale-105 ${
                      formData.sponsorship_tier === tier.id
                        ? `border-yellow-500 bg-gradient-to-br ${tier.color} text-white shadow-lg scale-105`
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-bold text-lg">{tier.name.split(' ')[0]}</div>
                    <div className="text-sm mt-2 font-medium">From</div>
                    <div className="text-xl font-bold mt-1">${tier.min.toLocaleString()}</div>
                    <div className="text-xs mt-2 opacity-80">{tier.name}</div>
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-gray-400 mt-4">
                Selected: <span className="text-yellow-400 font-semibold">
                  {SPONSOR_TIERS.find(t => t.id === formData.sponsorship_tier)?.name}
                </span>
              </p>
            </div>
          </section>

         
          <section className="mb-8">
            <h2 className="text-xl font-bold text-yellow-400 border-b-2 border-yellow-500/50 pb-2 mb-6 flex items-center">
              <span className="mr-2"></span>
              Investment Details
            </h2>
            
            <div className="space-y-2">
              <label htmlFor="proposed_investment" className="block font-semibold text-gray-200">
                Proposed Investment Amount (USDT) 
                <span className="text-sm text-gray-400 ml-2">
                  Minimum: ${SPONSOR_TIERS.find(t => t.id === formData.sponsorship_tier)?.min.toLocaleString()}
                </span>
              </label>
              
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">$</span>
                <input
                  type="number"
                  id="proposed_investment"
                  required
                  min={SPONSOR_TIERS.find(t => t.id === formData.sponsorship_tier)?.min}
                  value={formData.proposed_investment}
                  onChange={(e) => handleInputChange('proposed_investment', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md pl-12 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-lg"
                  placeholder="Enter amount"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">USDT</span>
              </div>
              
              <p className="text-sm text-gray-400 mt-2">
                Current value in USD: ${(parseFloat(formData.proposed_investment) || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-yellow-400 border-b-2 border-yellow-500/50 pb-2 mb-6 flex items-center">
              <span className="mr-2">📝</span>
              Additional Information
            </h2>
            
            <div className="space-y-2">
              <label htmlFor="message" className="block font-semibold text-gray-200">
                Tell us about your company and sponsorship goals
              </label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                placeholder="Why do you want to sponsor Path of the Cricket? What are your expectations? How can we work together?"
              />
            </div>
          </section>

       
          <section className="mb-8">
            <h2 className="text-xl font-bold text-yellow-400 border-b-2 border-yellow-500/50 pb-2 mb-6 flex items-center">
              <span className="mr-2">✅</span>
              Agreement
            </h2>
            
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="agree_terms"
                  checked={formData.agree_terms}
                  onChange={(e) => handleInputChange('agree_terms', e.target.checked)}
                  className="h-5 w-5 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
                />
                <span className="ml-3 text-gray-300">
                  I agree to the <a href="/terms" className="text-yellow-400 hover:text-yellow-300 underline">Terms and Conditions</a> and understand that this is a sponsorship application. I confirm that all provided information is accurate.
                </span>
              </label>
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting || !formData.agree_terms}
            className={`w-full py-4 px-6 rounded-md text-white font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
              isSubmitting || !formData.agree_terms
                ? 'bg-gray-700 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-lg hover:shadow-orange-900/50 transform hover:scale-[1.02]'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle size={24} />
                Submit Sponsorship Application
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-gray-500 text-sm space-y-2">
          <p>All sponsorship applications are reviewed within 3-5 business days.</p>
          <p>© {new Date().getFullYear()} Path of the Cricket. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}