"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../components/Header";

interface ServiceReport {
  id: string;
  first_name: string;
  last_name: string;
  district: string;
  problem_type: string;
  details: string;
  created_at: string;
  status: string;
}

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState<"about" | "contact" | "service-portal">("about");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [recentReports, setRecentReports] = useState<ServiceReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    district: "",
    problemType: "",
    details: ""
  });


  useEffect(() => {
    if (activeTab === "service-portal") {
      fetchRecentReports();
    }
  }, [activeTab]);

  const fetchRecentReports = async () => {
    setIsLoadingReports(true);
    try {
      const response = await fetch('/api/service-reports?limit=5');
      const result = await response.json();
      
      if (result.success) {
        setRecentReports(result.data || []);
      } else {
        console.error('Failed to fetch reports:', result.error);
        setRecentReports([]);
      }
    } catch (error) {
      console.error('Failed to fetch recent reports:', error);
      setRecentReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProblemTypeSelect = (type: string) => {
    setFormData({
      ...formData,
      problemType: type
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your first name' });
      return;
    }
    if (!formData.lastName.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your last name' });
      return;
    }
    if (!formData.district) {
      setSubmitStatus({ type: 'error', message: 'Please select your district' });
      return;
    }
    if (!formData.problemType) {
      setSubmitStatus({ type: 'error', message: 'Please select a problem type' });
      return;
    }
    if (!formData.details.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please describe the problem' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
     
      const response = await fetch('/api/service-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      console.log('📊 API Response:', result); 

      if (!result.success) {
        throw new Error(result.error || 'Failed to save report');
      }

      let reportId = 'N/A';
      if (result.reportId) {
        reportId = String(result.reportId);
      } else if (result.data?.id) {
        reportId = String(result.data.id);
      }

     
      const shortId = reportId.length > 8 ? reportId.substring(0, 8) : reportId;
      
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const message = `📣 *24/7 Service Report - Path of the Cricket*
      
*Report ID:* ${shortId}
*Name:* ${formData.firstName} ${formData.lastName}
*District:* ${formData.district}
*Problem Type:* ${formData.problemType}
*Details:* ${formData.details}

*Reported at:* ${timestamp}

✅ Report has been saved to database (ID: ${shortId})
Please acknowledge and update status.`;

      const encodedMessage = encodeURIComponent(message);
      const phoneNumber = "94706302034";
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
   
      setSubmitStatus({
        type: 'success',
        message: `✅ Report saved successfully! Database ID: ${shortId}`
      });
      
     
      fetchRecentReports();
      

      clearForm();
      
    
      setTimeout(() => {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }, 1500);

    } catch (error: any) {
      console.error('Submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: `❌ Failed to submit report: ${error.message || 'Please try again'}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      district: "",
      problemType: "",
      details: ""
    });
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white pt-20 pb-12">
       
        <div className="flex flex-col items-center justify-center gap-3 mb-10 mx-auto w-full px-4 pt-8 pb-4 relative">
          <div className="flex flex-col items-center justify-center gap-3 mb-4">
            <div className="relative w-24 h-24 md:w-28 md:h-28">
              <Image 
                src="/image55.png" 
                alt="Path of the Cricket Logo" 
                fill
               className="object-cover rounded-full"
                priority
                sizes="(max-width: 768px) 96px, 112px"
              />
            </div>
            <h1 className="font-bold text-4xl md:text-4xl uppercase tracking-wider text-center text-yellow-400">
              PATH OF THE CRICKET
            </h1>
          </div>
          <div className="h-1 w-48 bg-yellow-1000 rounded-full"></div>
          <p className="text-gray-300 text-sm md:text-base text-center mt-2 max-w-2xl">
            Sri Lanka's Premier Digital Cricket Talent & Performance Platform
          </p>
        </div>

        
        <div className="flex justify-center border-b border-gray-800 mb-10 bg-gray-900 py-2 px-4">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-4xl mx-auto">
            <button 
              onClick={() => setActiveTab("about")}
              className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-2 text-base md:text-lg font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === "about" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-400 hover:text-gray-300"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
              </svg>
              ABOUT US
            </button>
            
            <button 
              onClick={() => setActiveTab("contact")}
              className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-2 text-base md:text-lg font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === "contact" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-400 hover:text-gray-300"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
              </svg>
              CONTACT US
            </button>
            
            <button 
              onClick={() => setActiveTab("service-portal")}
              className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-2 text-base md:text-lg font-semibold uppercase tracking-wider transition-all duration-300 ${activeTab === "service-portal" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-400 hover:text-gray-300"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
              </svg>
              SERVICE PORTAL
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          
          {activeTab === "about" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
              <div className="lg:col-span-2 bg-gray-900 p-6 md:p-8 rounded-xl shadow-2xl">
                <h2 className="text-yellow-400 text-2xl md:text-3xl font-bold mb-6 pb-3 border-b border-gray-800">
                  Our Vision: Fueling Sri Lanka's Cricket Future 🇱🇰
                </h2>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  <strong className="text-white">Path of the Cricket (POC)</strong> is a dedicated digital talent and performance portal established 
                  to revolutionize how emerging cricketers in Sri Lanka are discovered, nurtured, and promoted. 
                  We bridge the gap between grassroots talent and professional leagues by providing a comprehensive, 
                  accessible platform for every registered player.
                </p>

                <h3 className="text-yellow-500 text-xl md:text-2xl font-bold mt-8 mb-4">
                  Core Mission:
                </h3>

                <ul className="space-y-4 mt-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-gray-100"><strong className="text-white">Talent Identification:</strong> Systematically track and rank players across all districts, focusing on raw skill and potential.</span>
                  </li>
                  
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
                    </svg>
                    <span className="text-gray-100"><strong className="text-white">Professional Portfolio:</strong> Give every player a dynamic, statistically-backed profile accessible to scouts and coaches worldwide.</span>
                  </li>
                  
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-gray-100"><strong className="text-white">Community & Infrastructure:</strong> Provide a centralized platform for ground and equipment maintenance reports to ensure high-quality training environments.</span>
                  </li>
                  
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-gray-100"><strong className="text-white">National Development:</strong> Align with Sri Lanka Cricket's vision to produce a continuous pipeline of world-class cricketers.</span>
                  </li>
                </ul>

                <p className="text-gray-300 mt-8 pt-4 border-t border-gray-800 leading-relaxed">
                  We believe that with the right technology and commitment, the future stars of Sri Lanka Cricket 
                  will emerge from every corner of the island. Join us on this journey!
                </p>
              </div>

            
              <div className="bg-gray-900 p-6 rounded-xl shadow-xl border-l-4 border-yellow-500">
                <h4 className="text-yellow-500 text-lg md:text-xl font-bold mb-4">
                  Official Sri Lanka Cricket Information
                </h4>
                
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  POC works in collaboration with the local cricket ecosystem. For official national details:
                </p>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-gray-300"><strong className="text-white">Website:</strong> <a href="https://srilankacricket.lk" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline transition">srilankacricket.lk</a></span>
                  </li>
                  
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-gray-300"><strong className="text-white">Headquarters:</strong> SLC Headquarters, Colombo 07.</span>
                  </li>
                  
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                    </svg>
                    <span className="text-gray-300"><strong className="text-white">Main Line:</strong> +94 11 268 1817</span>
                  </li>
                  
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                    </svg>
                    <span className="text-gray-300"><strong className="text-white">Email:</strong> info@srilankacricket.lk</span>
                  </li>
                  
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-gray-300"><strong className="text-white">Current Tournament:</strong> (Check official site)</span>
                  </li>
                </ul>

                <a 
                  href="https://srilankacricket.lk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-800 text-yellow-400 border border-yellow-500 rounded-lg font-semibold uppercase hover:bg-gray-700 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
                  </svg>
                  Go to SLC Official Site
                </a>
              </div>
            </div>
          )}

    
          {activeTab === "contact" && (
            <div className="animate-fadeIn">
              <h2 className="text-yellow-400 text-2xl md:text-3xl text-center mb-10 font-bold">
                Get in Touch with Our Team
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900 p-6 md:p-8 rounded-xl shadow-2xl border-t-4 border-yellow-500">
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-8 text-center">
                    General & Technical Contact
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4 pb-4 border-b border-gray-800">
                      <div className="text-green-400 text-2xl">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-yellow-400 font-bold text-lg">General Inquiries (Admin)</h4>
                        <p className="text-gray-400 mt-1">+94 11 555 5555 | Mon-Fri, 9am-5pm</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 pb-4 border-b border-gray-800">
                      <div className="text-green-400 text-2xl">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-yellow-400 font-bold text-lg">Technical Support (Web/App)</h4>
                        <p className="text-gray-400 mt-1">support@pathofcricket.lk | 24/7 Monitoring</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 pb-4 border-b border-gray-800">
                      <div className="text-green-400 text-2xl">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-yellow-400 font-bold text-lg">Partnership & Sponsorship</h4>
                        <p className="text-gray-400 mt-1">partnerships@pathofcricket.lk</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="text-green-400 text-2xl">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-yellow-400 font-bold text-lg">Emergency Service Portal Contact</h4>
                        <p className="text-gray-400 mt-1">+94 70 630 2034 (Via Service Portal Report)</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveTab("service-portal")}
                      className="flex items-center justify-center gap-2 w-full mt-6 px-4 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-600 transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                      </svg>
                      USE THE SERVICE PORTAL
                    </button>
                  </div>
                </div>

             
                <div className="bg-gray-900 p-6 md:p-8 rounded-xl shadow-2xl border-t-4 border-yellow-500">
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-8 text-center">
                    Headquarters Location
                  </h3>

                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-green-400 text-2xl">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-yellow-400 font-bold text-lg">POC Talent Center (Main Office)</h4>
                      <p className="text-gray-400 mt-1">15, Galle Road, Colombo 03, Sri Lanka</p>
                    </div>
                  </div>

                
                  <div className="h-64 bg-gray-800 rounded-lg border border-gray-700 flex flex-col items-center justify-center">
                    <svg className="w-16 h-16 text-gray-500 mb-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                    </svg>
                    <p className="text-gray-500 italic">Satellite Map Placeholder</p>
                  </div>

                  <p className="text-gray-400 text-sm text-center mt-4">
                    Note: This location is for administrative purposes only. Player appointments must be pre-scheduled.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "service-portal" && (
            <div className="animate-fadeIn">
              <div className="bg-gray-900 p-6 rounded-xl mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-yellow-500 text-black font-bold text-2xl flex items-center justify-center rounded-xl flex-shrink-0">
                    P✦C
                  </div>
                  <div>
                    <h2 className="text-white text-2xl font-bold">
                      24/7 Infrastructure Service Portal
                    </h2>
                    <p className="text-gray-400 text-sm md:text-base mt-2">
                      Report site issues quickly — data will be saved to Supabase database and WhatsApp will open automatically.
                    </p>
                  </div>
                </div>
              </div>

        
              {submitStatus && (
                <div className={`mb-6 p-4 rounded-lg ${submitStatus.type === 'success' ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'}`}>
                  <div className="flex items-center gap-3">
                    <svg className={`w-6 h-6 ${submitStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      {submitStatus.type === 'success' ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      )}
                    </svg>
                    <span className="text-white">{submitStatus.message}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
                <div className="lg:col-span-2 bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-800">
                  <h3 className="text-white text-xl font-bold mb-2">
                    Report a Problem
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Provide the details below. Data will be saved to our Supabase database.
                  </p>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2 font-medium">First name </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleFormChange}
                          placeholder="e.g. Dinithi"
                          className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:opacity-50"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-400 text-sm mb-2 font-medium">Last name </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleFormChange}
                          placeholder="e.g. Perera"
                          className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:opacity-50"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2 font-medium">District </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none transition disabled:opacity-50"
                        required
                        disabled={isSubmitting}
                      >
                       <option value="">Select District </option>
                      <option value="Colombo">Colombo</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Kalutara">Kalutara</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Matale">Matale</option>
                      <option value="Nuwara Eliya">Nuwara Eliya</option>
                      <option value="Galle">Galle</option>
                      <option value="Matara">Matara</option>
                      <option value="Hambantota">Hambantota</option>
                      <option value="Jaffna">Jaffna</option>
                      <option value="Kilinochchi">Kilinochchi</option>
                      <option value="Mannar">Mannar</option>
                      <option value="Vavuniya">Vavuniya</option>
                      <option value="Mullaitivu">Mullaitivu</option>
                      <option value="Batticaloa">Batticaloa</option>
                      <option value="Ampara">Ampara</option>
                      <option value="Trincomalee">Trincomalee</option>
                      <option value="Kurunegala">Kurunegala</option>
                      <option value="Puttalam">Puttalam</option>
                      <option value="Anuradhapura">Anuradhapura</option>
                      <option value="Polonnaruwa">Polonnaruwa</option>
                      <option value="Badulla">Badulla</option>
                      <option value="Monaragala">Monaragala</option>
                      <option value="Ratnapura">Ratnapura</option>
                      <option value="Kegalle">Kegalle</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2 font-medium">Problem type </label>
                      <div className="flex flex-wrap gap-2">
                        {["Ground maintenance", "Equipment issue", "Facility cleanliness", "Security concern", "Other"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleProblemTypeSelect(type)}
                            disabled={isSubmitting}
                            className={`px-4 py-2 rounded-full text-sm border transition-all ${formData.problemType === type ? 'bg-green-500 text-black border-green-500 font-semibold' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2 font-medium">On-site description </label>
                      <textarea
                        name="details"
                        value={formData.details}
                        onChange={handleFormChange}
                        placeholder="Describe the problem on site — location, severity, time observed..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-y disabled:opacity-50"
                        required
                        disabled={isSubmitting}
                      />
                      <p className="text-gray-500 text-xs mt-2">
                        Tip: include exact zone/stand/field and a short photo reference if available.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-lg transition-all duration-300 flex-shrink-0 ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-600 text-black hover:from-green-600 hover:to-green-700'}`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving to Database...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                            </svg>
                            Save to Database & Open WhatsApp
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={clearForm}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent text-gray-400 border border-gray-700 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                        </svg>
                        Clear Form
                      </button>
                      
                      <p className="text-gray-400 text-sm">
                        {isSubmitting 
                          ? "Saving your report to Supabase database..." 
                          : "Report will be saved to database and WhatsApp will open automatically"}
                      </p>
                    </div>
                  </div>
                </div>

              
                <div className="space-y-6">
                  <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-800">
                    <h3 className="text-white text-xl font-bold mb-4">
                      Supabase Database Status
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      All reports are saved to our secure Supabase database in real-time.
                    </p>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-green-500">
                          {isLoadingReports ? (
                            <svg className="animate-spin h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            recentReports.length
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">Recent reports</div>
                          <div className="text-gray-400 text-sm">Saved to Supabase</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-green-500">15m</div>
                        <div>
                          <div className="font-bold text-white">Avg response time</div>
                          <div className="text-gray-400 text-sm">After database save</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-bold text-lg">Recent reports from Supabase</h4>
                        <button 
                          onClick={fetchRecentReports}
                          disabled={isLoadingReports}
                          className="text-sm text-green-400 hover:text-green-300 disabled:opacity-50"
                        >
                          {isLoadingReports ? 'Loading...' : 'Refresh'}
                        </button>
                      </div>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {isLoadingReports ? (
                          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
                            <div className="text-gray-400">Loading reports...</div>
                          </div>
                        ) : recentReports.length > 0 ? (
                          recentReports.map((report, index) => (
                            <div key={report.id || index} className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-gray-300 text-sm">
                              <div className="font-medium flex justify-between items-start">
                                <span>{report.district} — {report.problem_type}</span>
                                <span className={`text-xs px-2 py-1 rounded ${report.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>
                                  {report.status}
                                </span>
                              </div>
                              <div className="text-gray-400 mt-1 truncate">
                                {report.details.length > 50 
                                  ? `${report.details.substring(0, 50)}...` 
                                  : report.details}
                              </div>
                              <div className="text-gray-500 text-xs mt-1 flex justify-between">
                                <span>{report.first_name} {report.last_name}</span>
                                <span>{new Date(report.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-gray-300 text-sm">
                            <div className="font-medium">No reports yet</div>
                            <div className="text-gray-400 mt-1">Be the first to submit a report</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-800">
                    <h3 className="text-white text-xl font-bold mb-4">
                      Support Contact
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      WhatsApp support line (for form submissions only):
                    </p>
                    <p className="text-white font-bold text-lg">+94 706 302 034</p>
                    <p className="text-gray-500 text-xs mt-2">
                      WhatsApp will open automatically after database save.
                    </p>
                    
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <p className="text-gray-300 text-sm">
                        <strong>Note:</strong> Your report is first saved to Supabase, then WhatsApp opens with a pre-filled message containing your report ID.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </>
  );
}