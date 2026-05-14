import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Path of the Cricket',
  description: 'Read our terms and conditions for using Path of the Cricket website',
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-0">
                <div className="relative w-10 h-10">
                  {/* Navbar logo - Small version */}
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

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <Link 
                  href="/" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Home
                </Link>
                <Link 
                  href="/matches" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Matches
                </Link>
                <Link 
                  href="/news" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  News
                </Link>
                <Link 
                  href="/stats" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Statistics
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
             
              <div className="relative w-48 h-48 mx-auto mb-8">
              
                <div className="relative w-48 h-48">
                  <Image 
                    src="/image55.png" 
                    alt="Path of the Cricket"
                    width={160}
                    height={160}
                    className="rounded-full object-cover  border-0 border-yellow-500"
                    priority
                  />
                </div>
                
                
                
             
                <div className="absolute -inset-4 bg-yellow-600/10 blur-3xl rounded-full"></div>
              </div>
              
          
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    Path of the Cricket
                  </span>
                </h1>
                <div className="h- w-32 bg-gradient-to-r from-yellow-900 to-yellow-900 mx-auto rounded-full"></div>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto mt-6 leading-relaxed">
                  Your ultimate destination for cricket scores, news, analysis, and statistics. 
                  Follow the journey of cricket from local grounds to international stadiums.
                </p>
              </div>
            </div>
          </div>

  
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="text-3xl font-bold text-yellow-500">500+</div>
              <div className="text-gray-400 text-sm mt-2">Live Matches</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="text-3xl font-bold text-yellow-500">10K+</div>
              <div className="text-gray-400 text-sm mt-2">News Articles</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="text-3xl font-bold text-yellow-500">50+</div>
              <div className="text-gray-400 text-sm mt-2">Tournaments</div>
            </div>
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <div className="text-3xl font-bold text-yellow-500">100+</div>
              <div className="text-gray-400 text-sm mt-2">Countries</div>
            </div>
          </div>

   
          <div className="mt-12 animate-bounce">
            <div className="text-gray-500 text-sm mb-2">Scroll for Terms</div>
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
              Terms and Conditions
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
              <span>Please read carefully</span>
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
              Welcome to <span className="text-yellow-500 font-medium">Path of the Cricket</span>. These Terms and Conditions govern your use of our website 
              and services. By accessing or using our website, you agree to be bound by these Terms.
            </p>
          </section>

      
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">2</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                User Accounts
              </h2>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>You must be at least 13 years old to create an account</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>You are responsible for maintaining the confidentiality of your account</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>You agree to provide accurate and complete information</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>We reserve the right to suspend or terminate accounts that violate these terms</span>
              </li>
            </ul>
          </section>

      
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">3</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Content and Intellectual Property
              </h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                All content on this website, including but not limited to text, graphics, logos, images, 
                match scores, and statistics, is the property of <span className="text-yellow-500">Path of the Cricket</span> or its content suppliers 
                and is protected by copyright laws.
              </p>
              <p className="leading-relaxed">
                You may not reproduce, distribute, or create derivative works without our express written 
                permission.
              </p>
            </div>
          </section>

  
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">4</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                User Conduct
              </h2>
            </div>
            <p className="text-gray-300 mb-4">
              You agree not to:
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Use the website for any unlawful purpose</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Post or transmit any harmful, threatening, or abusive content</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Attempt to gain unauthorized access to any part of the website</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Interfere with the proper working of the website</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Impersonate any person or entity</span>
              </li>
            </ul>
          </section>

          
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">5</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Limitation of Liability
              </h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                <span className="text-yellow-500">Path of the Cricket</span> and its affiliates will not be liable for any direct, indirect, incidental, 
                or consequential damages arising from your use of the website or any content therein.
              </p>
              <p className="leading-relaxed">
                While we strive to provide accurate cricket scores and information, we do not guarantee 
                the completeness or accuracy of the data.
              </p>
            </div>
          </section>

         
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">6</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Third-Party Links
              </h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the 
              content or practices of these websites. You access them at your own risk.
            </p>
          </section>

        
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">7</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Changes to Terms
              </h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. Continued use of the website 
              after changes constitutes acceptance of the new Terms.
            </p>
          </section>

        
          <section className="mb-10">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">8</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Governing Law
              </h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Sri Lanka.
            </p>
          </section>

       
          <section className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-black font-bold">9</span>
              </div>
              <h2 className="text-2xl font-semibold text-white">
                Contact Us
              </h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at:
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
                      <div className="text-white font-medium">support@pathofthecricket.com</div>
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
                      <div className="text-white font-medium">+94 11 234 5678</div>
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

          
          <div className="mt-12 pt-10 border-t border-gray-800 flex justify-center">
            <Link 
              href="/" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>

    
      <div className="fixed top-1/4 left-5 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-1/4 right-5 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
}