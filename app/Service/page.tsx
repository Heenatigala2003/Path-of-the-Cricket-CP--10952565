"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  UserCheck, 
  CalendarDays, 
  Dumbbell, 
  Trophy, 
  Handshake,
  ArrowRight,
  ChevronRight
} from "lucide-react";

export default function ServicePage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const services = [
    {
      id: "selections",
      title: "TALENT SELECTIONS",
      icon: <UserCheck size={32} />,
      description: "A data-driven module for unbiased talent scouting and evaluation. Streamline trials, analyze metrics, and find the next generation of stars.",
      image: "/selections.jpg",
      buttonText: "View Platform",
      link: "/Selection",
      color: "from-green-500 to-emerald-600"
    },
    {
      id: "matches",
      title: "TRAINING & PRACTICES",
      icon: <CalendarDays size={32} />,
      description: "Comprehensive tools to schedule, manage, and track real-time statistics for leagues, tournaments, and individual matches. Live scoring integration included.",
      image: "/s2.jpg",
      buttonText: "Manage Events",
      link: "/Practices",
      color: "from-blue-500 to-cyan-600"
    },
    {
      id: "practices",
      title: "MATCHES & FIXTURES",
      icon: <Dumbbell size={32} />,
      description: "Personalized development plans, session tracking, and coach feedback loops. Monitor physical progress and technical skill refinement effectively.",
      image: "/s3.jpg",
      buttonText: "Start Training",
      link: "/Matches",
      color: "from-purple-500 to-pink-600"
    },
    {
      id: "ranking",
      title: "GLOBAL RANKING",
      icon: <Trophy size={32} />,
      description: "Objective and dynamic performance-based rankings for players and teams. Utilize weighted metrics for transparent and fair assessment.",
      image: "/s4.jpg",
      buttonText: "View Leaderboards",
      link: "/Ranking",
      color: "from-yellow-500 to-orange-600"
    },
    {
      id: "sponsors",
      title: "SPONSORSHIP PORTAL",
      icon: <Handshake size={32} />,
      description: "Connect players and teams with relevant corporate sponsors. Access exposure analytics and generate professional sponsorship proposals.",
      image: "/s5.jpg",
      buttonText: "Connect Brands",
      link: "/sponsor",
      color: "from-red-500 to-rose-600"
    }
  ];

  const handleCardClick = (serviceId: string) => {
    console.log(`Navigating to service: ${serviceId}`);
   
    alert(`Opening ${serviceId.toUpperCase()} service page`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
   
      <section className="relative py-20 md:py-28 px-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center space-y-6">
          
            <div className="relative w-40 h-40 mb-4">
              <Image
                src="/image55.png"
                alt="Cricket bat and ball icon"
                fill
                style={{ objectFit: "contain" }}
                className="rounded-full border-0 border-yellow-800 p-0"
                priority
              />
            </div>
            
        
            <h1 className="text-4xl md:text-4xl lg:text-4xl font-bold tracking-wide">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-300">
                PATH OF THE CRICKET
              </span>
            </h1>
            
         
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              The premier portal dedicated to digitizing talent management, 
              performance tracking, and career acceleration for professional cricketers.
            </p>
            
        
            <div className="w-14 h- bg-gradient-to-r from-yellow-800 to-transparent rounded-full" />
          </div>
        </div>
      </section>


      <section className="py-1 px-6">
        <div className="max-w-7xl mx-auto">
     
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                Our Professional Services
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Comprehensive solutions designed to elevate cricket talent management 
              to the next level
            </p>
          </div>

   
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
            {services.map((service) => (
              <div
                key={service.id}
                className={`group relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden 
                  border border-gray-800 hover:border-yellow-500/50 transition-all duration-500
                  hover:shadow-2xl hover:shadow-yellow-500/10 cursor-pointer
                  ${hoveredCard === service.id ? 'scale-105' : 'scale-100'}`}
                onMouseEnter={() => setHoveredCard(service.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleCardClick(service.id)}
              >
               
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 
                  group-hover:opacity-10 transition-opacity duration-500`} />

     
                <div className="relative z-10 p-6 flex flex-col items-center text-center h-full">
          
                  <div className="relative w-full h-40 mb-6 rounded-xl overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      style={{ objectFit: "cover" }}
                      className="group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                   
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 
                      w-14 h-14 bg-gray-900 rounded-xl border-2 border-yellow-500 
                      flex items-center justify-center group-hover:bg-yellow-500 
                      group-hover:text-black transition-all duration-300">
                      {service.icon}
                    </div>
                  </div>

          
                  <h3 className="text-xl font-bold text-white mt-8 mb-3 group-hover:text-yellow-400 transition-colors">
                    {service.title}
                  </h3>

         
                  <p className="text-gray-400 text-sm leading-relaxed flex-grow mb-6">
                    {service.description}
                  </p>

               
                  <Link
                    href={service.link}
                    className="w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="w-full py-3 px-4 bg-gradient-to-r from-yellow-600 to-yellow-700 
                      text-white font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-600 
                      transition-all duration-300 group/btn flex items-center justify-center gap-2
                      hover:shadow-lg hover:shadow-yellow-500/30">
                      {service.buttonText}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>

                <div className={`absolute inset-0 rounded-2xl border-2 border-transparent 
                  group-hover:border-yellow-400/30 transition-all duration-500 pointer-events-none`} />
              </div>
            ))}
          </div>


          <div className="text-center">
            <Link href="#services">
              <button className="group relative px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 
                text-white font-bold text-lg rounded-2xl hover:from-green-600 hover:to-emerald-700 
                transition-all duration-300 shadow-2xl shadow-green-500/20 hover:shadow-green-500/40
                overflow-hidden">
          
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                  bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
                
                <span className="relative flex items-center justify-center gap-3">
                  Explore All Talent Solutions
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      
      <section className="py-16 px-6 bg-gradient-to-r from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Players Scouted" },
              { value: "100+", label: "Matches Managed" },
              { value: "50+", label: "Sponsors Connected" },
              { value: "24/7", label: "Support Available" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-800">
            How Our Platform Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Register & Profile",
                description: "Create your digital profile with comprehensive cricket statistics"
              },
              {
                step: "02",
                title: "Showcase Talent",
                description: "Upload performance videos, match statistics, and achievements"
              },
              {
                step: "03",
                title: "Get Discovered",
                description: "Connect with scouts, teams, and sponsors worldwide"
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800 
                  hover:border-yellow-500/30 transition-all duration-300">
                  <div className="text-5xl font-bold text-yellow-400/20 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 
                    -translate-y-1/2 text-yellow-400">
                    <ChevronRight size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}