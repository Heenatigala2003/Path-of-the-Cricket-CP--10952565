'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function IntroductionPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with: ${email}`);
      setEmail('');
    }
  };

  return (
    <>
     
      <style jsx global>{`
        :root {
          --color-dark-primary: #000000;
          --color-dark-secondary: #000000;
          --color-accent-gold: #FFD700;
          --color-light-text: #e0e0e0;
          --color-white: #fff;
          --color-search-green: #53e51a;
          --primary-highlight: #FFD700;
          --secondary-color: #53e51a;
          --text-dark: #121212;
          --card-bg-light: #1e1e1e;
          --font-header: 'Oswald', sans-serif;
          --spacing-large: 40px;
          --spacing-medium: 20px;
          --spacing-small: 10px;
          --radius-large: 80px;
          --radius-medium: 20px;
          --radius-small: 8px;
          --radius-circle: 50%;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: linear-gradient(180deg, #070707 0%, #000000 100%);
          font-family: 'Inter', sans-serif;
          color: var(--color-light-text);
          line-height: 1.6;
          min-height: 100vh;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        .container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 var(--spacing-medium);
        }

      
        .main-container {
          min-height: 100vh;
          background: linear-gradient(180deg, #070707 0%, #000000 100%);
          color: var(--color-light-text);
        }

        
        .hero-section {
          padding: 20px 20px 40px;
          text-align: center;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease, transform 0.8s ease;
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .hero-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

       
        .page-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 25px;
          margin: 0 auto 20px;
          position: relative;
          padding: 60px 0;
          width: 100%;
          max-width: 600px;
        }

        .logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
        }

        .page-header img {
          width: 140px;
          height: 140px;
          border-radius: var(--radius-circle);
          object-fit: contain;
          display: block;
          margin: 10 auto;
        }

        .title-text {
          font-weight: 900;
          font-size: 48px;
          color: rgb(207, 178, 10);
          letter-spacing: 1px;
          text-transform: uppercase;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
          font-family: var(--font-header);
          text-align: center;
          display: block;
          width: 100%;
          line-height: 1;
        }

        .page-header::after {
          content: "";
          position: absolute;
          bottom: ;
          left: 50%;
          transform: translateX(-50%);
          width: 10px;
          height: 0px;
          background: linear-gradient(90deg, transparent, #191604ff, transparent);
        }

        .hero-banner {
          text-align: center;
          padding: 0px;
          color: var(--color-white);
          margin: 10px auto;
          max-width: 900px;
        }

        .hero-banner h1 {
          font-family: var(--font-header);
          font-size: 2.2em;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
          text-transform: uppercase;
          color: #d2b305;
          line-height: 1.2;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .hero-subtitle {
          font-size: 1.3em;
          opacity: 0.9;
          max-width: 700px;
          margin:  auto;
          line-height: 1.6;
          color: #e0e0e0;
          padding: 0 20px;
        }

        /* Stats Container */
        .stats-container {
          display: flex;
          justify-content: center;
          gap: 25px;
          margin-top: 30px;
          flex-wrap: wrap;
          padding: 0 20px;
        }

        .stat-item {
          text-align: center;
          padding: 15px 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 215, 0, 0.2);
          min-width: 130px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 215, 0, 0.5);
          box-shadow: 0 5px 15px rgba(255, 215, 0, 0.2);
        }

        .stat-number {
          display: block;
          font-size: 2.2em;
          font-weight: 800;
          color: #FFD700;
          margin-bottom: 5px;
          font-family: var(--font-header);
        }

        .stat-label {
          font-size: 0.9em;
          color: var(--color-light-text);
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Quick Navigation */
        .quick-nav {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin: 30px 0 50px;
          flex-wrap: wrap;
          padding: 0 20px;
        }

        .nav-link {
          color: var(--color-light-text);
          text-decoration: none;
          font-weight: 600;
          padding: 12px 28px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
          border: 2px solid transparent;
          font-size: 0.95em;
          letter-spacing: 0.5px;
        }

        .nav-link:hover {
          color: #FFD700;
          border-color: rgba(255, 215, 0, 0.3);
          background: rgba(255, 215, 0, 0.05);
          transform: translateY(-2px);
        }

   
        .section {
          margin-bottom: 70px;
        }

        .section-title {
          font-family: var(--font-header);
          font-size: 2.4em;
          color: var(--color-white);
          margin-bottom: 35px;
          text-align: center;
          position: relative;
          padding-bottom: 20px;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 4px;
          background: linear-gradient(90deg, transparent, var(--secondary-color), transparent);
        }

      
        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
          gap: 35px;
          margin: 40px 0;
        }

        .report-card {
          background: linear-gradient(145deg, #1e1e1e, #252525);
          border-radius: 18px;
          padding: 35px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .report-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #FFD700, var(--secondary-color));
        }

        .report-card:hover {
          transform: translateY(-8px);
          border-color: #FFD700;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
        }

        .card-icon {
          font-size: 2.8em;
          margin-bottom: 25px;
          opacity: 0.9;
          color: #FFD700;
        }

        .report-card h3 {
          color: var(--color-white);
          font-size: 1.5em;
          margin-bottom: 18px;
          font-family: var(--font-header);
          line-height: 1.3;
        }

        .report-card p {
          color: var(--color-light-text);
          opacity: 0.85;
          line-height: 1.7;
          margin-bottom: 25px;
          font-size: 1.05em;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 25px;
          padding-top: 25px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .read-link {
          color: #FFD700;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s ease;
          font-size: 1.05em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .read-link:hover {
          color: #fff;
          transform: translateX(5px);
        }

        .read-time {
          font-size: 0.9em;
          color: var(--color-light-text);
          opacity: 0.7;
          background: rgba(255, 255, 255, 0.05);
          padding: 6px 12px;
          border-radius: 20px;
        }

        
        .divider {
          position: relative;
          margin: 70px 0;
          text-align: center;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
        }

        .divider-text {
          background: var(--card-bg-light);
          padding: 0 25px;
          color: #FFD700;
          font-family: var(--font-header);
          font-size: 1.4em;
          position: relative;
          z-index: 1;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

   
        .advanced-reports {
          display: flex;
          flex-direction: column;
          gap: 25px;
          margin: 35px 0;
        }

        .theory-card {
          background: linear-gradient(145deg, #1e1e1e, #252525);
          border-radius: 15px;
          padding: 30px;
          border-left: 5px solid var(--secondary-color);
          transition: all 0.4s ease;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .theory-card:hover {
          transform: translateX(8px);
          background: rgba(255, 255, 255, 0.03);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .theory-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .theory-tag {
          padding: 8px 18px;
          border-radius: 6px;
          font-size: 0.85em;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .theory-tag.strategy {
          background: rgba(83, 229, 26, 0.15);
          color: var(--color-search-green);
          border: 1px solid rgba(83, 229, 26, 0.3);
        }

        .theory-tag.analytics {
          background: rgba(255, 215, 0, 0.15);
          color: #FFD700;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .theory-tag.physics {
          background: rgba(66, 135, 209, 0.15);
          color: #4287d1;
          border: 1px solid rgba(66, 135, 209, 0.3);
        }

        .difficulty {
          font-size: 0.85em;
          color: #FFD700;
          padding: 6px 14px;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 20px;
          font-weight: 600;
        }

        .theory-content h3 {
          color: var(--color-white);
          font-size: 1.4em;
          margin-bottom: 15px;
          font-family: var(--font-header);
        }

        .theory-content p {
          color: var(--color-light-text);
          opacity: 0.85;
          line-height: 1.7;
          font-size: 1.05em;
        }

        .theory-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 25px;
          padding-top: 25px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .view-btn {
          background: linear-gradient(135deg, var(--secondary-color), #40c400);
          color: var(--text-dark);
          padding: 12px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          font-size: 1em;
          display: inline-block;
          letter-spacing: 0.5px;
        }

        .view-btn:hover {
          background: linear-gradient(135deg, #40c400, #53e51a);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(83, 229, 26, 0.3);
        }

        .theory-meta {
          display: flex;
          gap: 20px;
          font-size: 0.9em;
          color: var(--color-light-text);
          opacity: 0.8;
        }

        .theory-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }

    
        .view-all-container {
          text-align: center;
          margin: 45px 0;
        }

        .view-all-btn {
          display: inline-block;
          color: #FFD700;
          text-decoration: none;
          font-weight: 700;
          padding: 14px 35px;
          border: 2px solid #FFD700;
          border-radius: 30px;
          transition: all 0.3s ease;
          font-size: 1.05em;
          letter-spacing: 1px;
          background: rgba(255, 215, 0, 0.05);
        }

        .view-all-btn:hover {
          background: #FFD700;
          color: var(--text-dark);
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(255, 215, 0, 0.2);
        }

        
        .subscribe-section {
          background: linear-gradient(135deg, rgba(83, 229, 26, 0.1), rgba(255, 215, 0, 0.1));
          border-radius: 25px;
          padding: 55px;
          margin: 70px 0;
          text-align: center;
          border: 1px solid rgba(83, 229, 26, 0.2);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .subscribe-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 30% 30%, rgba(255, 215, 0, 0.05), transparent 70%);
          z-index: -1;
        }

        .subscribe-title {
          font-family: var(--font-header);
          font-size: 2.2em;
          color: #FFD700;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .subscribe-text {
          color: var(--color-light-text);
          opacity: 0.9;
          max-width: 650px;
          margin: 0 auto 35px;
          line-height: 1.7;
          font-size: 1.15em;
        }

        .subscribe-form {
          max-width: 500px;
          margin: 0 auto;
        }

        .form-group {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .email-input {
          flex: 1;
          padding: 16px 22px;
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-white);
          font-size: 1em;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
        }

        .email-input:focus {
          outline: none;
          border-color: #FFD700;
          background: rgba(255, 255, 255, 0.08);
        }

        .subscribe-btn {
          padding: 16px 35px;
          background: linear-gradient(135deg, #FFD700, #ffed4e);
          color: var(--text-dark);
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          font-size: 1em;
          letter-spacing: 0.5px;
        }

        .subscribe-btn:hover {
          background: linear-gradient(135deg, #ffed4e, #FFD700);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
        }

        .privacy-note {
          font-size: 0.9em;
          color: var(--color-light-text);
          opacity: 0.7;
          margin-top: 15px;
        }

        .footer-note {
          text-align: center;
          padding: 45px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 50px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 20px 20px 0 0;
        }

        .footer-note p {
          color: var(--color-light-text);
          opacity: 0.85;
          margin-bottom: 12px;
          font-size: 1.1em;
        }

        .small-note {
          font-size: 0.95em;
          opacity: 0.6;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

     
        @media (max-width: 1024px) {
          .hero-banner h1 {
            font-size: 2.8em;
          }
          
          .reports-grid {
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 25px;
          }
          
          .title-text {
            font-size: 32px;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 15px 15px 30px;
          }

          .hero-banner h1 {
            font-size: 2.2em;
          }

          .hero-subtitle {
            font-size: 1.15em;
          }

          .stats-container {
            gap: 15px;
          }

          .stat-item {
            padding: 12px 18px;
            min-width: 110px;
          }

          .stat-number {
            font-size: 1.9em;
          }

          .quick-nav {
            gap: 10px;
            margin: 25px 0 40px;
          }

          .nav-link {
            padding: 10px 22px;
            font-size: 0.9em;
          }

          .reports-grid {
            grid-template-columns: 1fr;
            gap: 25px;
          }

          .report-card {
            padding: 30px;
          }

          .theory-card {
            padding: 25px;
          }

          .theory-footer {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .theory-meta {
            justify-content: flex-start;
            width: 100%;
          }

          .form-group {
            flex-direction: column;
          }

          .subscribe-section {
            padding: 35px 25px;
            margin: 50px 0;
          }

          .subscribe-title {
            font-size: 1.9em;
          }
          
          .title-text {
            font-size: 28px;
            line-height: 1.1;
          }
          
          .section-title {
            font-size: 2em;
          }
          
          .page-header img {
            width: 70px;
            height: 70px;
          }
        }

        @media (max-width: 480px) {
          .hero-banner h1 {
            font-size: 1.9em;
          }

          .hero-subtitle {
            font-size: 1em;
            padding: 0 15px;
          }

          .title-text {
            font-size: 24px;
            line-height: 1.1;
          }

          .section-title {
            font-size: 1.7em;
          }

          .stat-item {
            min-width: 90px;
            padding: 10px 15px;
          }

          .stat-number {
            font-size: 1.7em;
          }

          .card-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .view-all-btn {
            padding: 12px 28px;
            font-size: 1em;
          }
          
          .view-btn {
            padding: 10px 22px;
            font-size: 0.95em;
          }
          
          .page-header {
            gap: 10px;
            padding: 10px 0;
          }
          
          .page-header img {
            width: 60px;
            height: 60px;
          }
          
          .logo-container {
            gap: 10px;
          }
        }
      `}</style>

     
      <div className="main-container">
   
        <header className={`hero-section ${isVisible ? 'visible' : ''}`}>
   
          <div className="page-header">
            <div className="logo-container">
              <Image 
                src="/image55.png" 
                alt="Cricket bat and ball icon" 
                width={80}
                height={80}
                priority
                style={{ objectFit: 'contain' }}
              />
              <h1 className="title-text">PATH OF THE CRICKET</h1>
            </div>
          </div>

          <div className="hero-banner">
            <h1>INTRODUCTION & THEORIES REPORTS</h1>
            <p className="hero-subtitle">Deep dives into the strategy, physics, and history that define the beautiful game.</p>
          </div>

      
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">6+</span>
              <span className="stat-label">Reports</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100+</span>
              <span className="stat-label">Years Data</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Matches</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Analysis</span>
            </div>
          </div>
        </header>

        <nav className="quick-nav">
          <a href="#foundations" className="nav-link">Foundations</a>
          <a href="#advanced" className="nav-link">Advanced Theories</a>
          <Link href="/reports" className="nav-link">All Reports</Link>
          <a href="#subscribe" className="nav-link">Subscribe</a>
        </nav>

        <main className="container">

          <section id="foundations" className="section">
            <h2 className="section-title">Foundational Introductions</h2>
            
            <div className="reports-grid">
              <div className="report-card">
                <div className="card-icon">⚾</div>
                <h3>The Physics of Pitch Dynamics</h3>
                <p>Understanding how wear, moisture, and composition affect swing and spin.</p>
                <div className="card-footer">
                  <Link href="/reports/pitch-dynamics" className="read-link">
                    Read Theory →
                  </Link>
                  <span className="read-time">15 min read</span>
                </div>
              </div>

              <div className="report-card">
                <div className="card-icon">🌀</div>
                <h3>The Core Debate: Spin vs. Swing</h3>
                <p>A comprehensive report on the aerodynamic theories and biomechanics of bowling.</p>
                <div className="card-footer">
                  <Link href="/reports/spin-swing" className="read-link">
                    Read Theory →
                  </Link>
                  <span className="read-time">20 min read</span>
                </div>
              </div>

          
              <div className="report-card">
                <div className="card-icon">📜</div>
                <h3>Cricket&apos;s Strategic Evolution</h3>
                <p>Tracing the development of field settings and batting techniques over a century.</p>
                <div className="card-footer">
                  <Link href="/reports/strategy-evolution" className="read-link">
                    Read Theory →
                  </Link>
                  <span className="read-time">25 min read</span>
                </div>
              </div>
            </div>

            <div className="view-all-container">
              <Link href="/reports#foundational" className="view-all-btn">
                View All Foundational Reports →
              </Link>
            </div>
          </section>

          <div className="divider">
            <span className="divider-text">Advanced Insights</span>
          </div>

         
          <section id="advanced" className="section">
            <h2 className="section-title">Advanced Theoretical Reports</h2>
            
            <div className="advanced-reports">
            
              <div className="theory-card">
                <div className="theory-header">
                  <span className="theory-tag strategy">STRATEGY</span>
                  <span className="difficulty">Advanced</span>
                </div>
                <div className="theory-content">
                  <h3>The Mathematics Behind the DLS Method</h3>
                  <p>An in-depth explanation of the Duckworth-Lewis-Stern calculation system.</p>
                </div>
                <div className="theory-footer">
                  <Link href="/reports/dls-method" className="view-btn">
                    View Report
                  </Link>
                  <div className="theory-meta">
                    <span>📊 Complex</span>
                    <span>⏱️ 30 min</span>
                  </div>
                </div>
              </div>

             
              <div className="theory-card">
                <div className="theory-header">
                  <span className="theory-tag analytics">ANALYTICS</span>
                  <span className="difficulty">Advanced</span>
                </div>
                <div className="theory-content">
                  <h3>Optimizing T20: Advanced Batting Metrics</h3>
                  <p>Examining strike rate, powerplay conversion, and risk assessment.</p>
                </div>
                <div className="theory-footer">
                  <Link href="/reports/t20-metrics" className="view-btn">
                    View Report
                  </Link>
                  <div className="theory-meta">
                    <span>📈 Data-heavy</span>
                    <span>⏱️ 25 min</span>
                  </div>
                </div>
              </div>

          
              <div className="theory-card">
                <div className="theory-header">
                  <span className="theory-tag physics">PHYSICS</span>
                  <span className="difficulty">Advanced</span>
                </div>
                <div className="theory-content">
                  <h3>The Science of Reverse Swing</h3>
                  <p>Why a worn ball misbehaves: the theory of seam and surface differential.</p>
                </div>
                <div className="theory-footer">
                  <Link href="/reports/reverse-swing" className="view-btn">
                    View Report
                  </Link>
                  <div className="theory-meta">
                    <span>🔬 Scientific</span>
                    <span>⏱️ 20 min</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="view-all-container">
              <Link href="/reports#advanced" className="view-all-btn">
                Explore All Advanced Theories →
              </Link>
            </div>
          </section>

          <section id="subscribe" className="subscribe-section">
            <div className="subscribe-content">
              <h2 className="subscribe-title">Stay Updated with Latest Research</h2>
              <p className="subscribe-text">
                Get weekly updates on new reports, analysis, and insights delivered to your inbox.
              </p>
              
              <form className="subscribe-form" onSubmit={handleSubscribe}>
                <div className="form-group">
                  <input 
                    type="email" 
                    placeholder="Enter your email address"
                    className="email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="subscribe-btn">
                    Subscribe
                  </button>
                </div>
                <p className="privacy-note">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </form>
            </div>
          </section>

          <div className="footer-note">
            <p>© 2025 The Path of Cricket. Theories for the modern game.</p>
            <p className="small-note">
              Working together with Sri Lanka Cricket to advance the sport through data and analysis.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}