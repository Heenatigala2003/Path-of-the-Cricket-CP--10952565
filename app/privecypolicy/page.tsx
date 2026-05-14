import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Privacy Policy | Path of the Cricket',
  description: 'Read our privacy policy for Path of the Cricket website',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300">
     
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
         
            <div className="flex items-center">
              <Link href="/Terms&Conditions" className="flex items-center space-x-3">
                <div className="relative w-10 h-10">
                  <div className="relative w-10 h-10">
                    <Image 
                      src="/image55.png" 
                      alt="Path of the Cricket Logo"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-xl font-bold text-white">
                  Path of the <span className="text-yellow-500">Cricket</span>
                </span>
              </Link>
            </div>


            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <Link 
                  href="/" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Home
                </Link>
                <Link 
                  href="/Terms&Conditions" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Terms
                </Link>
                <Link 
                  href="/privacy-policy" 
                  className="text-yellow-500 px-3 py-2 rounded-md text-sm font-medium border border-yellow-500"
                >
                  Privacy
                </Link>
                <Link 
                  href="/contact" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>

   
            <div className="md:hidden">
              <button className="text-gray-300 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>


      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
  
          <div className="flex justify-center items-center mb-8">
            <div className="relative">
           
              <div className="relative w-48 h-48 mx-auto mb-">
                <div className="relative w-48 h-48">
                  <Image 
                    src="/image55.png" 
                    alt="Path of the Cricket"
                    width={160}
                    height={160}
                    className="rounded-full object-cover shadow-2xl border-0 border-yellow-500"
                    priority
                  />
                </div>
                
                
               
                <div className="absolute -inset-4 bg-yellow-500/10 blur-3xl rounded-full"></div>
              </div>
              
           
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-1">
                  <span className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    Path of the Cricket
                  </span>
                </h1>
                <div className="h- w-32 bg-gradient-to-r from-yellow-800 to-yellow-800 mx-auto rounded-full"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-8">
                  
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto mt-6 leading-relaxed">
                  Your privacy is important to us. Learn how we collect, use, and protect your personal information.
                </p>
              </div>
            </div>
          </div>

         
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Data Protection</h3>
              <p className="text-gray-400 text-sm">We use industry-standard security measures to protect your data</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Transparency</h3>
              <p className="text-gray-400 text-sm">Clear explanation of what data we collect and why</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Your Control</h3>
              <p className="text-gray-400 text-sm">You have control over your data and privacy settings</p>
            </div>
          </div>

          
          <div className="mt-12 animate-bounce">
            <div className="text-gray-500 text-sm mb-2">Scroll for Details</div>
            <svg className="w-6 h-6 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

    
        <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl"></div>
      </div>

      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-800">
       
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Privacy Policy
            </h2>
            <div className="inline-flex items-center space-x-4 text-gray-400">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <span>•</span>
              <span>Effective immediately</span>
            </div>
          </div>

       
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">1</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Introduction
              </h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              At <span className="text-yellow-500 font-medium">Path of the Cricket</span>, we are committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our website and services.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              By using <span className="text-yellow-500">Path of the Cricket</span>, you agree to the collection and use of information 
              in accordance with this policy.
            </p>
          </section>


          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">2</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Information We Collect
              </h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-lg font-medium text-white">Personal Information</h3>
              <p>We may collect personal information that you provide voluntarily, including:</p>
              <ul className="space-y-3 pl-5">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Name and email address when you create an account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Contact information when you reach out to us</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Preferences and settings for personalized experience</span>
                </li>
              </ul>
              
              <h3 className="text-lg font-medium text-white mt-6">Automatically Collected Information</h3>
              <p>When you visit our website, we automatically collect:</p>
              <ul className="space-y-3 pl-5">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>IP address and browser type</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Pages visited and time spent on pages</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Device information and operating system</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Cookies and similar tracking technologies</span>
                </li>
              </ul>
            </div>
          </section>

  
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">3</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                How We Use Your Information
              </h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>We use the information we collect for various purposes:</p>
              <ul className="space-y-3 pl-5">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>To provide, maintain, and improve our services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>To personalize your experience and content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>To communicate with you about updates and news</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>To analyze usage patterns and optimize performance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>To detect, prevent, and address technical issues</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>To comply with legal obligations</span>
                </li>
              </ul>
            </div>
          </section>

       
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">4</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Cookies and Tracking Technologies
              </h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                We use cookies and similar tracking technologies to track activity on our website 
                and hold certain information. Cookies are files with small amount of data which may 
                include an anonymous unique identifier.
              </p>
              <p>Types of cookies we use:</p>
              <ul className="space-y-3 pl-5">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Essential Cookies:</strong> Required for basic website functionality</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Performance Cookies:</strong> Help us understand how visitors interact</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Functional Cookies:</strong> Remember your preferences and settings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Analytics Cookies:</strong> Collect anonymous usage statistics</span>
                </li>
              </ul>
              <p className="mt-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                However, if you do not accept cookies, you may not be able to use some portions of our website.
              </p>
            </div>
          </section>

        
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">5</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Data Sharing and Disclosure
              </h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>We do not sell your personal information to third parties. We may share your information with:</p>
              <ul className="space-y-3 pl-5">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Service Providers:</strong> Trusted third parties who assist in operating our website</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Legal Requirements:</strong> When required by law or to protect our rights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Business Transfers:</strong> In connection with a merger or acquisition</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>With Your Consent:</strong> When you explicitly agree to share</span>
                </li>
              </ul>
            </div>
          </section>

  
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">6</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Data Security
              </h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                We implement appropriate technical and organizational security measures to protect 
                your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>
                While we strive to use commercially acceptable means to protect your personal information, 
                we cannot guarantee its absolute security. No method of transmission over the Internet or 
                method of electronic storage is 100% secure.
              </p>
            </div>
          </section>

   
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">7</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Your Data Protection Rights
              </h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="space-y-3 pl-5">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Access:</strong> Request copies of your personal data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Rectification:</strong> Request correction of inaccurate data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Erasure:</strong> Request deletion of your personal data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Restriction:</strong> Request restriction of processing your data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Objection:</strong> Object to our processing of your data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span><strong>Portability:</strong> Request transfer of your data to another organization</span>
                </li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us using the information below.
              </p>
            </div>
          </section>

    
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">8</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Children's Privacy
              </h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                Our website is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If you are a parent or guardian 
                and believe your child has provided us with personal information, please contact us.
              </p>
            </div>
          </section>

   
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">9</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Changes to This Privacy Policy
              </h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes. Changes 
                to this Privacy Policy are effective when they are posted on this page.
              </p>
            </div>
          </section>

      
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">10</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Contact Us
              </h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
                <div className="space-y-6">
                  <div className="flex items-center group">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Email</div>
                      <div className="text-white font-medium">pdtheenatigala@gmail.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center group">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Phone</div>
                      <div className="text-white font-medium">+94706302034</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start group">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-black mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Address</div>
                      <div className="text-white font-medium">123 Cricket Lane, Colombo, Sri Lanka</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        
          <div className="mt-12 pt-10 border-t border-gray-800 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              href="/" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Homepage
            </Link>
            
            <Link 
              href="/Terms&Conditions" 
              className="inline-flex items-center px-8 py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Terms & Conditions
            </Link>
          </div>
        </div>
      </div>


      <div className="fixed top-1/4 left-5 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-1/4 right-5 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
}