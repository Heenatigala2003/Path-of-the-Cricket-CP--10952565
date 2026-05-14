
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function LawsPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [year, setYear] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleSubscribe = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    alert(`Subscribed with: ${email}`);
    setEmail("");
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you. Your message has been sent.");
    setModalOpen(false);
    setFormData({ name: "", email: "", message: "" });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const lawsData = [
    {
      id: "law1",
      title: "Law 1: The Players",
      icon: "group",
      content: (
        <>
          <h4>Core Concepts</h4>
          <ul>
            <li>Teams: A match is played between two sides, each of 11 players.</li>
            <li>Nominations: Teams must nominate their players before the toss.</li>
            <li>Substitutes: Field substitutes are permitted for injured players, but they cannot bat, bowl, or keep wicket.</li>
          </ul>
        </>
      )
    },
    {
      id: "law21",
      title: "Law 21: The Result",
      icon: "flag",
      content: (
        <>
          <h4>Key Ways to Win</h4>
          <ul>
            <li>By Runs: If the team batting last scores more runs than the opponent.</li>
            <li>By an Innings: If the side batting first fails to reach the opponent's score in two innings (Test Cricket).</li>
            <li>Conceded Match: The captain of one side may concede the match to the opposition.</li>
          </ul>
        </>
      )
    },
    {
      id: "theory1",
      title: "Theory: Analyzing the Pitch",
      icon: "scatter_plot",
      content: (
        <>
          <h4>Strategic Pitch Assessment</h4>
          <ul>
            <li>Green Pitches: Favors seam bowlers due to lateral movement. Teams often elect to bowl first.</li>
            <li>Flat Pitches (Roads): Favors batsmen; often leads to high scores. Patience and shot selection are key.</li>
            <li>Dry/Cracking Pitches: Favors spin bowlers later in the game as the surface deteriorates.</li>
          </ul>
          <div className="theory-box">
            <h4>Expert Tip:</h4>
            <p>The decision at the toss should be heavily influenced by pitch condition, weather, and the relative strengths (batting vs. bowling) of both teams.</p>
          </div>
        </>
      )
    },
    {
      id: "theory2",
      title: "Theory: Effective Field Settings",
      icon: "gps_fixed",
      content: (
        <>
          <h4>Pressure vs. Protection</h4>
          <ul>
            <li>Attacking Field: Used when seeking wickets (e.g., slip cordons, short leg). Requires aggressive bowling.</li>
            <li>Defensive Field: Used to stem the flow of runs (e.g., long-on, deep square leg). Common in death overs.</li>
            <li>The Powerplay Trap: Using the restricted field to maximize wicket-taking opportunities by placing catchers strategically.</li>
          </ul>
          <div className="theory-box">
            <h4>Expert Tip:</h4>
            <p>A good captain constantly rotates fielders every 2-3 overs to keep the batsmen guessing and to counteract the shot they are preparing to play.</p>
          </div>
        </>
      )
    }
  ];

  return (
    <>
      <style jsx global>{`
        /* Global Variables */
        :root {
          --color-dark-primary: #000000;
          --color-dark-secondary: #1a1a1a;
          --color-accent-gold: #d1b042;
          --color-light-text: #e0e0e0;
          --color-white: #fff;
          --color-search-green: #53e51a;
          --spacing-large: 60px;
          --spacing-medium: 20px;
          --spacing-small: 10px;
          --radius-medium: 12px;
          --radius-small: 8px;
          --muted: #9aa4b2;
          --accent: #1fb26a;
          --panel: #0f1724;
          --glass: rgba(255, 255, 255, 0.03);
        }

        /* Global Styles */
        body {
          margin: 0;
          background: var(--color-dark-primary);
          font-family: 'Inter', sans-serif;
          color: var(--color-light-text);
          line-height: 1.6;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        * {
          box-sizing: border-box;
        }

        /* Container */
        .container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 var(--spacing-medium);
          min-height: 100vh;
        }
/* Page Header - Logo title ekata udin */
.page-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin: var(--spacing-medium) auto var(--spacing-large);
  position: relative;
  padding-bottom: 12px;
  width: fit-content;
}

.page-logo {
  margin-bottom: px;
  position: relative;
  z-index: 1;
}

/* Logo එක චුට්ටක් පහලට ගෙනෙනවා */
.page-header .page-logo {
  transform: translateY(100px); /* චුට්ටක් පහලට */
}

.page-title {
  text-align: center;
  position: relative;
  z-index: 4;
  background: rgba(0, 0, 0, 0.7); /* Background දෙන්න logo එකට පිටුපසින් */
  padding: 30px 40px 20px;
  border-radius: 15px;
  backdrop-filter: blur(1px);
  border: px solid rgba(34, 29, 11, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.page-title .main-title {
  font-weight: 900;
  font-size: 48px;
  color: #f1d36fff;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(65, 64, 64, 0.3);
}

.page-title .subtitle {
  font-size: 34px;
  color: var(--color-accent-gold);
  font-weight: 600;
  letter-spacing2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
        /* Page Header - Logo title ekata udin */
        .page-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: px;
          margin: var(--spacing-medium) auto var(--spacing-large);
          position: relative;
          padding-bottom: 2px;
          width: fit-content;
        }

        .page-logo {
          margin-bottom: 100px;
        }

        .page-title {
          text-align: center;
        }

        .page-title .main-title {
          font-weight: 700;
          font-size: 48px;
          color: rgb(234, 183, 15);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .page-title .subtitle {
          font-size: 24px;
          color: var(--color-accent-gold);
          font-weight: 600;
          letter-spacing: 1px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .page-header::after {
          content: "";
          position: absolute;
          bottom: 0;
          width: 100%;
          max-width: 450px;
          height: px;
          background: linear-gradient(90deg, transparent, var(--color-accent-gold), transparent);
        }

        @media (max-width: 600px) {
          .page-title .main-title {
            font-size: 28px;
          }
          .page-title .subtitle {
            font-size: 18px;
          }
          .page-header::after {
            max-width: 300px;
          }
        }

        /* Laws and Theories Section */
        .laws-section {
          background-color: var(--color-dark-secondary);
          padding: var(--spacing-large) var(--spacing-medium);
          border-radius: var(--radius-medium);
          margin-bottom: var(--spacing-large);
          box-shadow: 0 5px 20px rgba(33, 20, 20, 0.4);
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
          border: 1px solid rgba(119, 105, 105, 0.05);
        }

        .laws-intro {
          text-align: center;
          margin-bottom: var(--spacing-large);
          padding: 0 var(--spacing-medium);
        }

        .laws-intro h2 {
          font-size: 2rem;
          color: var(--color-white);
          margin-bottom: 15px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .laws-intro p {
          font-size: 1.1rem;
          color: var(--color-light-text);
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .law-heading {
          background: linear-gradient(90deg, #282828, #1a1a1a);
          color: var(--color-accent-gold);
          padding: var(--spacing-medium);
          margin: var(--spacing-medium) 0 var(--spacing-small) 0;
          border-radius: var(--radius-small);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 1.4rem;
          font-weight: 600;
          transition: all 0.3s ease;
          border-left: 5px solid var(--color-accent-gold);
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }

        .law-heading:hover {
          background: linear-gradient(90deg, #333333, #242424);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .law-content {
          background-color: rgba(18, 18, 18, 0.9);
          padding: 0 var(--spacing-medium);
          border-radius: 0 0 var(--radius-small) var(--radius-small);
          border-bottom: 2px solid var(--color-search-green);
          margin-bottom: var(--spacing-medium);
          max-height: 0;
          overflow: hidden;
          transition: all 0.4s ease-out;
          color: #d0d0d0;
          opacity: 0;
        }

        .law-content.open {
          max-height: 1000px;
          padding: var(--spacing-medium);
          opacity: 1;
          transition: all 0.6s ease-in;
        }

        .law-content h4 {
          color: var(--color-white);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 10px;
          margin-top: 0;
          margin-bottom: 20px;
          font-weight: 700;
          font-size: 1.3rem;
        }

        .law-content ul {
          list-style: none;
          padding: 0;
          margin: 0 0 20px 0;
        }

        .law-content ul li {
          margin-bottom: 12px;
          padding-left: 24px;
          position: relative;
          line-height: 1.6;
        }

        .law-content ul li::before {
          content: "▶";
          color: var(--color-search-green);
          font-weight: bold;
          display: inline-block;
          width: 1em;
          margin-left: -1em;
          position: absolute;
          left: 0;
          top: 0;
        }

        .law-icon {
          margin-right: 15px;
          font-size: 28px;
          color: var(--color-search-green);
          vertical-align: middle;
        }

        .theory-box {
          background: rgba(34, 34, 34, 0.8);
          padding: var(--spacing-medium);
          border-radius: var(--radius-small);
          margin-top: var(--spacing-medium);
          border-left: 4px solid var(--color-accent-gold);
          backdrop-filter: blur(10px);
        }

        .theory-box h4 {
          color: var(--color-accent-gold);
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 1.2rem;
        }

        .theory-box p {
          margin: 0;
          line-height: 1.6;
          color: #e0e0e0;
        }

        /* Modal */
        .modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.3s ease, visibility 0.3s;
          z-index: 2000;
          backdrop-filter: blur(5px);
        }

        .modal[aria-hidden="false"] {
          visibility: visible;
          opacity: 1;
        }

        .modal-content {
          background: #07101a;
          border-radius: 12px;
          padding: 30px;
          min-width: 320px;
          max-width: 520px;
          color: #e6eef6;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .modal-close {
          position: absolute;
          right: 15px;
          top: 15px;
          background: none;
          border: 0;
          color: var(--muted);
          font-size: 24px;
          cursor: pointer;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.3s;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .modal label {
          display: block;
          margin-top: 16px;
          font-size: 14px;
          color: var(--muted);
          font-weight: 500;
        }

        .modal input,
        .modal textarea {
          width: 100%;
          padding: 12px;
          margin-top: 8px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #e6eef6;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .modal input:focus,
        .modal textarea:focus {
          outline: none;
          border-color: var(--accent);
        }

        .modal .primary {
          margin-top: 20px;
          padding: 12px 24px;
          border-radius: 10px;
          background: var(--accent);
          border: 0;
          color: #042118;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          width: 100%;
          transition: all 0.3s;
        }

        .modal .primary:hover {
          background: #1ce47a;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(31, 178, 106, 0.3);
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 40px;
          margin-bottom: 60px;
        }

        .action-button {
          padding: 12px 30px;
          border-radius: 30px;
          background: linear-gradient(90deg, var(--color-accent-gold), #b89a35);
          color: #000;
          font-weight: 600;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(209, 176, 66, 0.3);
        }

        .action-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(209, 176, 66, 0.4);
        }

        .action-button.secondary {
          background: linear-gradient(90deg, var(--color-search-green), #3bc018);
          color: #000;
          box-shadow: 0 4px 15px rgba(83, 229, 26, 0.3);
        }

        .action-button.secondary:hover {
          box-shadow: 0 6px 20px rgba(83, 229, 26, 0.4);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .container {
            padding: 0 15px;
          }
          
          .laws-section {
            padding: 30px 20px;
          }
          
          .law-heading {
            font-size: 1.2rem;
            padding: 15px;
          }
          
          .action-buttons {
            flex-direction: column;
            align-items: center;
            gap: 15px;
          }
          
          .action-button {
            width: 100%;
            max-width: 300px;
          }
        }

        /* Material Icons */
        .material-icons {
          font-family: 'Material Icons';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-smoothing: antialiased;
        }

        /* Page Background Effects */
        .page-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          background: radial-gradient(circle at 20% 30%, rgba(85, 71, 25, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(83, 229, 26, 0.05) 0%, transparent 50%),
                    linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%);
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--color-accent-gold);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #ffd23dff;
        }
      `}</style>

      {/* Background Effect */}
      <div className="page-background"></div>

      {/* Main Content */}
      <main>
        <div className="container">
          <div className="page-header">
            <div className="page-logo">
              <Image
                src="/IMAGE55.png"
                alt="Cricket Academy Logo"
                width={140}
                height={140}
                style={{ 
                  borderRadius: "50%", 
                  objectFit: "cover",
                  border: "0px solid var(--color-accent-gold)",
                  boxShadow: "0 4px 0px rgba(209, 176, 66, 0.3)"
                }}
              />
            </div>
            <div className="page-title">
              <h1 className="main-title">PATH OF THE CRICKET</h1>
              <h2 className="subtitle">LAWS & STRATEGIC THEORIES</h2>
            </div>
          </div>

          <section className="laws-section">
            <div className="laws-intro">
              <h2>Master the Foundation of the Game</h2>
              <p>
                Understanding the Laws of Cricket (MCC) and the core Strategic 
                Theories is vital for player development and competitive success. 
                Explore the fundamental rules and winning concepts below.
              </p>
            </div>

            {/* Laws Accordion */}
            {lawsData.map((law) => (
              <div key={law.id}>
                <div 
                  className="law-heading" 
                  onClick={() => toggleSection(law.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleSection(law.id)}
                >
                  <div>
                    <span className="material-icons law-icon">{law.icon}</span>
                    {law.title}
                  </div>
                  <span className="material-icons">
                    {openSection === law.id ? "remove_circle" : "add_circle"}
                  </span>
                </div>
                <div className={`law-content ${openSection === law.id ? "open" : ""}`}>
                  {law.content}
                </div>
              </div>
            ))}
          </section>

          <div className="action-buttons">
            <button 
              className="action-button" 
              onClick={() => window.open('/coaching', '_blank')}
            >
              Explore Coaching
            </button>
            <button 
              className="action-button secondary"
              onClick={() => setModalOpen(true)}
            >
              Get in Touch
            </button>
          </div>
        </div>
      </main>

      {modalOpen && (
        <div 
          id="contactModal" 
          className="modal" 
          role="dialog" 
          aria-hidden="false"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal-content">
            <button 
              className="modal-close" 
              onClick={() => setModalOpen(false)} 
              aria-label="Close contact form"
            >
              ×
            </button>
            <h2 id="contactTitle" style={{ 
              marginTop: 0, 
              color: 'var(--color-accent-gold)',
              fontSize: '1.8rem'
            }}>
              Contact Us
            </h2>
            <p style={{ 
              color: 'var(--muted)', 
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              Have questions about cricket laws or strategies? Get in touch with our experts.
            </p>
            <form id="contactForm" onSubmit={handleContactSubmit}>
              <label htmlFor="name">Full Name</label>
              <input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Enter your full name"
                required 
              />
              <label htmlFor="email">Email Address</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email}
                onChange={handleFormChange}
                placeholder="Enter your email address"
                required 
              />
              <label htmlFor="message">Your Message</label>
              <textarea 
                id="message" 
                name="message" 
                rows={4} 
                value={formData.message}
                onChange={handleFormChange}
                placeholder="Tell us about your cricket queries or coaching needs..."
                required
              ></textarea>
              <button type="submit" className="primary">
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}

      <footer style={{
        background: 'rgba(10, 10, 10, 0.9)',
        padding: '30px 20px',
        marginTop: '60px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <Image
              src="/IMAGE55.png"
              alt="Cricket Academy Logo"
              width={50}
              height={50}
              style={{ 
                borderRadius: "50%", 
                objectFit: "cover",
                border: "2px solid var(--color-accent-gold)"
              }}
            />
            <h3 style={{
              color: 'var(--color-accent-gold)',
              margin: 0,
              fontSize: '1.2rem'
            }}>
              Cricket Mastery Academy
            </h3>
          </div>
          
          <p style={{
            color: 'var(--muted)',
            fontSize: '14px',
            maxWidth: '600px',
            margin: '0 auto 20px',
            lineHeight: '1.6'
          }}>
            Dedicated to teaching the laws, strategies, and artistry of cricket. 
            Empowering players and enthusiasts with deep knowledge of the game.
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <button 
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                background: 'transparent',
                border: '1px solid var(--color-accent-gold)',
                color: 'var(--color-accent-gold)',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--color-accent-gold)';
                e.currentTarget.style.color = '#000';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-accent-gold)';
              }}
              onClick={() => setModalOpen(true)}
            >
              Contact Us
            </button>
            
            <button 
              style={{
                padding: '8px 20px',
                borderRadius: '20px',
                background: 'transparent',
                border: '1px solid var(--color-search-green)',
                color: 'var(--color-search-green)',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--color-search-green)';
                e.currentTarget.style.color = '#000';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-search-green)';
              }}
              onClick={() => window.open('/coaching', '_blank')}
            >
              Explore Coaching
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <p style={{
              color: 'var(--muted)',
              fontSize: '12px',
              margin: 0
            }}>
              &copy; {year} Cricket Mastery Academy. All rights reserved.
            </p>
            <p style={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '11px',
              margin: 0
            }}>
              Understanding cricket is not just about playing, it's about mastering the game.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}