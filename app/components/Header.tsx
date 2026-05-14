"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "HOME" },
    { href: "/Service", label: "SERVICE" },
    { href: "/portfolio", label: "PORTFOLIO" },
    { href: "/about-us", label: "ABOUT US" },
    { href: "/user-profile", label: "USER PROFILE" },
    { 
      href: "https://www.google.com/search?q=sri+lanka+cricket+schedule&sca_esv=8ab2282fee241d3c&sxsrf=AE3TifMki75lOf7jTHSXZJHdGzrxklp7yA%3A1765428571895&ei=W016abSqNvHH4-EPlMnc4QY&oq=srilaka+cricket&gs_lp=Egxnd3Mtd2l6LXNlcnAiD3NyaWxha2EgY3JpY2tldCoCCAgyChAAGLADGNYEGEcyChAAGLADGNYEGEcyChAAGLADGNYEGEcyChAAGLADGNYEGEcyChAAGLADGNYEGEcyChAAGLADGNYEGEcyChAAGLADGNYEGEcyDRAAGIAEGLADGEMYigUyDRAAGIAEGLADGEMYigUyDRAAGIAEGLADGEMYigUyDRAAGIAEGLADGEMYigUyDRAAGIAEGLADGEMYigUyEBAuGLADGNYEGEcYyAPYAQEyExAuGIAEGLADGEMYyAMYigXYAQEyExAuGIAEGLADGEMYyAMYigXYAQEyExAuGIAEGLADGEMYyAMYigXYAQEyExAuGIAEGLADGEMYyAMYigXYAQEyExAuGIAEGLADGEMYyAMYigXYAQEyExAuGIAEGLADGEMYyAMYigXYAQEyExAuGIAEGLADGEMYyAMYigXYAQFIvdQBUABYAHABeAGQAQCYAQCgAQCqAQC4AQHIAQCYAgGgAgiYAwDiAwUSATEgQIgGAZAGFLoGBggBEAEYCJIHATGgBwCyBwC4BwDCBwMyLTHIBwaACAA&sclient=gws-wiz-serp", 
      label: "SRI LANKA CRICKET",
      external: true 
    },
  ];

  const mobileNavItems = [
    { href: "/", label: "Home" },
    { href: "/Introdution", label: "Introduction" },
    { href: "/laws", label: "Laws" },
    { href: "/theories", label: "Theories" },
    { href: "/gallery", label: "Gallery" },
    { href: "/achievements", label: "Achievements" },
    { href: "/news", label: "News" },
    { href: "/AIchat", label: "AI Chatbot" },
  ];

  const linkClasses = (href: string) =>
    `hover:text-yellow-400 transition relative ${
      pathname === href ? "active-link text-yellow-400" : ""
    }`;

  const mobileLinkClasses = (href: string) =>
    `block hover:text-yellow-400 ${
      pathname === href ? "text-yellow-400 font-bold" : ""
    }`;

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-gray-900 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-white text-1xl tracking-wide flex items-center gap-4"
        >
          <div className="relative w-12 h-12">
            <Image
              src="/image55.png"
              alt="Path of the Cricketer Logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          Path of the Cricket
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-10 text-white font-bold">
          {navItems.map((item) => {
            // External links
            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-yellow-400 transition"
                >
                  {item.label}
                </a>
              );
            }
            
            // Internal links
            return (
              <Link key={item.href} href={item.href} className={linkClasses(item.href)}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-gray-800 text-white px-6 pb-6 space-y-4 shadow-lg">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={mobileLinkClasses(item.href)}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <style jsx global>{`
        .active-link::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 3px;
          bottom: -8px;
          left: 0;
          background-color: #facc15;
          border-radius: 2px;
        }
      `}</style>
    </header>
  );
}