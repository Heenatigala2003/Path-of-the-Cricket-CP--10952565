"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  getIndividualChampions,
  getTeamAchievements,
  getKeyAchievement,
  subscribeToNewsletter,
  submitContactForm,
  getSubscriberCount,
  subscribeToChampions,
  subscribeToTeamAchievements,
  subscribeToKeyAchievement,
  type IndividualChampion,
  type TeamAchievement,
  type KeyAchievement,
  type ContactMessage
} from "../../services/achievementsService";

export default function AchievementsPage() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  
  const [champions, setChampions] = useState<IndividualChampion[]>([]);
  const [teamAchievements, setTeamAchievements] = useState<TeamAchievement[]>([]);
  const [keyAchievement, setKeyAchievement] = useState<KeyAchievement | null>(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchInitial = async () => {
      try {
        setLoading(true);
        const [champs, teams, key, count] = await Promise.all([
          getIndividualChampions(),
          getTeamAchievements(),
          getKeyAchievement(),
          getSubscriberCount()
        ]);
        if (!mounted) return;
        setChampions(champs);
        setTeamAchievements(teams);
        setKeyAchievement(key);
        setSubscriberCount(count);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchInitial();

    const championsSub = subscribeToChampions((updated) => {
      if (mounted) setChampions(updated);
    });
    const teamsSub = subscribeToTeamAchievements((updated) => {
      if (mounted) setTeamAchievements(updated);
    });
    const keySub = subscribeToKeyAchievement((updated) => {
      if (mounted) setKeyAchievement(updated);
    });

    return () => {
      mounted = false;
      championsSub.unsubscribe();
      teamsSub.unsubscribe();
      keySub.unsubscribe();
    };
  }, []);

  const handleSubscribe = async () => {
    const result = await subscribeToNewsletter(email);
    if (result.success) {
      setIsSubscribed(true);
      setEmail("");
      const count = await getSubscriberCount();
      setSubscriberCount(count);
    }
    alert(result.message);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitContactForm(contactForm);
    if (result.success) {
      setContactForm({ name: "", email: "", message: "" });
      setIsModalOpen(false);
    }
    alert(result.message);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const formatKeyAchievement = (text: string, highlight: string) => {
    const highlights = highlight.split(',');
    let formattedText = text;
    highlights.forEach((hl) => {
      const trimmedHl = hl.trim();
      formattedText = formattedText.replace(
        trimmedHl, 
        `<span class="achievement-highlight">${trimmedHl}</span>`
      );
    });
    return formattedText;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading achievements...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(180deg, #071017 0%, #071620 100%);
          }
          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-left-color: #d1b042;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          p {
            color: #e0e0e0;
            font-size: 1.2rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        /* ==================== GLOBAL STYLES & VARIABLES ==================== */
        :root {
          --color-dark-primary: #000000;
          --color-dark-secondary: #1a1a1a;
          --color-accent-gold: #d1b042;
          --color-accent-yellow: #ffd700;
          --color-light-text: #e0e0e0;
          --color-white: #fff;
          --color-blue-dark-bg: #000000;
          --color-blue-mid-bg: #000000;
          --color-search-green: #53e51a;

          --spacing-large: 60px;
          --spacing-medium: 20px;
          --spacing-small: 10px;

          --radius-large: 80px;
          --radius-medium: 12px;
          --radius-small: 8px;
          --radius-circle: 50%;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          height: 100%;
          margin: 0;
          font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto,
            "Helvetica Neue", Arial;
          color: #e6eef6;
          background: linear-gradient(180deg, #071017 0%, #071620 100%);
        }

        .main-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 45px;
        }

        .hero-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin: 40px 0 60px;
          gap: 10px;
        }

        .hero-logo {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 12px;
          box-shadow: 0 4px 20px rgba(14, 12, 1, 0.3);
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--color-accent-yellow);
          text-shadow: 0 2px 1px rgba(208, 178, 5, 0.79);
          margin: 0;
          position: relative;
        }

        .hero-title::after {
          content: "";
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent, 
            var(--color-accent-yellow), 
            transparent
          );
        }

        .subscriber-badge {
          background: rgba(75, 65, 4, 0.1);
          border: 1px solid var(--color-accent-gold);
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 0.9rem;
          color: var(--color-accent-yellow);
          margin-top: 10px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .subscriber-badge .material-icons {
          font-size: 18px;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: var(--spacing-medium) auto var(--spacing-large);
          position: relative;
          padding-bottom: 20px;
          width: fit-content;
        }

        .page-header .title-text {
          font-weight: 700;
          font-size: 36px;
          color: var(--color-accent-gold);
          letter-spacing: 9px;
          text-transform: uppercase;
        }

        .page-header::after {
          content: "";
          position: absolute;
          bottom: 0;
          width: 100%;
          max-width: 450px;
          height: 2px;
          background: var(--color-accent-gold);
        }

        .achievements-section {
          background-color: var(--color-dark-secondary);
          padding: var(--spacing-large) 10px;
          border-radius: var(--radius-medium);
          margin-bottom: var(--spacing-large);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
        }

        .section-subtitle {
          text-align: center;
          color: var(--color-accent-gold);
          font-size: 2.2rem;
          font-weight: 600;
          margin-bottom: var(--spacing-medium);
        }

        .champions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-large);
          padding: var(--spacing-medium);
          max-width: 1100px;
          margin: var(--spacing-large) auto;
        }

        .champion-card {
          background: linear-gradient(145deg, #101010, #202020);
          border-radius: var(--radius-medium);
          overflow: hidden;
          text-align: center;
          padding-bottom: var(--spacing-medium);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-top: 3px solid var(--color-accent-gold);
        }

        .champion-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(209, 176, 66, 0.2);
        }

        .champion-image {
          width: 100%;
          height: 220px;
          object-fit: cover;
          object-position: center top;
          margin-bottom: var(--spacing-medium);
          background-color: #333;
        }

        .champion-role {
          color: var(--color-search-green);
          font-size: 0.9rem;
          font-weight: 500;
          margin-top: -5px;
        }

        .champion-name {
          font-size: 1.8rem;
          color: var(--color-white);
          margin: var(--spacing-small) 0;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .stats-list {
          list-style: none;
          padding: 0 var(--spacing-medium);
          margin: var(--spacing-medium) 0 0;
          text-align: left;
        }

        .stats-list li {
          background-color: #282828;
          padding: var(--spacing-small);
          border-radius: var(--radius-small);
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          align-items: center;
        }

        .stats-list .stat-value {
          color: var(--color-accent-gold);
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .stats-list .material-icons {
          margin-right: 5px;
          font-size: 18px;
          color: var(--color-search-green);
        }

        .team-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--spacing-medium);
          padding: var(--spacing-medium);
          max-width: 1200px;
          margin: var(--spacing-large) auto;
        }

        .team-card {
          background-color: #0d0d0d;
          border-radius: var(--radius-medium);
          padding: var(--spacing-medium);
          flex: 1 1 280px;
          min-height: 150px;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
          border: 1px solid #333;
          transition: all 0.3s ease;
        }

        .team-card:hover {
          transform: scale(1.03);
          background-color: #1a1a1a;
        }

        .team-card .material-icons {
          font-size: 40px;
          color: var(--color-accent-gold);
          margin-bottom: var(--spacing-small);
          text-shadow: 0 0 5px rgba(209, 176, 66, 0.5);
        }

        .team-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--color-white);
          margin: 0 0 5px;
        }

        .team-year {
          font-size: 0.9rem;
          color: var(--color-search-green);
          font-weight: 500;
        }

        .key-achievements {
          background-color: #0d0d0d;
          padding: var(--spacing-large) var(--spacing-medium);
          text-align: center;
          margin-top: var(--spacing-medium);
          border-radius: var(--radius-medium);
          box-shadow: inset 0 0 15px rgba(209, 176, 66, 0.1);
        }

        .achievement-icon {
          font-size: 40px;
          color: var(--color-accent-gold);
          margin-bottom: var(--spacing-small);
        }

        .achievement-text {
          font-size: 1.1rem;
          color: var(--color-light-text);
          max-width: 900px;
          margin: 0 auto;
        }

        .achievement-highlight {
          color: var(--color-accent-yellow);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .newsletter-section {
          background: linear-gradient(135deg, rgba(209, 176, 66, 0.1), rgba(83, 229, 26, 0.05));
          border-radius: var(--radius-medium);
          padding: var(--spacing-large);
          margin-top: var(--spacing-large);
          text-align: center;
          border: 1px solid rgba(209, 176, 66, 0.2);
        }

        .newsletter-title {
          color: var(--color-accent-yellow);
          font-size: 1.5rem;
          margin-bottom: var(--spacing-medium);
        }

        .newsletter-form {
          display: flex;
          gap: var(--spacing-small);
          max-width: 500px;
          margin: 0 auto;
        }

        .newsletter-input {
          flex: 1;
          padding: 12px 16px;
          border-radius: var(--radius-small);
          border: 1px solid rgba(209, 176, 66, 0.3);
          background: rgba(0, 0, 0, 0.5);
          color: var(--color-white);
          font-size: 1rem;
        }

        .newsletter-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, var(--color-accent-gold), var(--color-accent-yellow));
          color: var(--color-dark-primary);
          border: none;
          border-radius: var(--radius-small);
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .newsletter-button:hover {
          transform: translateY(-2px);
        }

        .newsletter-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .contact-button {
          background: linear-gradient(135deg, var(--color-accent-gold), var(--color-accent-yellow));
          color: var(--color-dark-primary);
          border: none;
          border-radius: 50px;
          padding: 10px 24px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 15px;
          transition: transform 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .contact-button:hover {
          transform: translateY(-2px);
        }

        .modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.3s ease, visibility 0.3s;
          z-index: 1000;
        }

        .modal[aria-hidden="false"] {
          visibility: visible;
          opacity: 1;
        }

        .modal-content {
          background: linear-gradient(135deg, #07101a, #0a1829);
          border-radius: var(--radius-medium);
          padding: 30px;
          min-width: 320px;
          max-width: 520px;
          width: 90%;
          color: #e6eef6;
          position: relative;
          border: 1px solid rgba(209, 176, 66, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .modal-close {
          position: absolute;
          right: 15px;
          top: 15px;
          background: none;
          border: 0;
          color: var(--color-accent-gold);
          font-size: 24px;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }

        .modal-close:hover {
          background: rgba(209, 176, 66, 0.1);
        }

        .modal h2 {
          color: var(--color-accent-yellow);
          margin-bottom: var(--spacing-medium);
          text-align: center;
        }

        .modal label {
          display: block;
          margin-top: 15px;
          font-size: 14px;
          color: var(--color-light-text);
          font-weight: 500;
        }

        .modal input,
        .modal textarea {
          width: 100%;
          padding: 12px;
          margin-top: 6px;
          border-radius: var(--radius-small);
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-white);
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .modal input:focus,
        .modal textarea:focus {
          outline: none;
          border-color: var(--color-accent-gold);
        }

        .modal .submit-button {
          margin-top: 20px;
          padding: 12px 24px;
          width: 100%;
          border-radius: var(--radius-small);
          background: linear-gradient(135deg, var(--color-accent-gold), var(--color-accent-yellow));
          border: none;
          color: var(--color-dark-primary);
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .modal .submit-button:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .main-container { padding: 20px; }
          .hero-title { font-size: 2.5rem; }
          .hero-logo { width: 100px; height: 100px; }
          .champions-grid { grid-template-columns: 1fr; gap: 30px; }
          .team-grid { padding: var(--spacing-small); gap: var(--spacing-small); }
          .achievements-section { padding: var(--spacing-medium) 15px; }
          .newsletter-form { flex-direction: column; }
          .page-header .title-text { font-size: 28px; letter-spacing: 5px; }
          .page-header::after { max-width: 300px; }
        }

        @media (max-width: 480px) {
          .hero-title { font-size: 2rem; }
          .page-header .title-text { font-size: 24px; letter-spacing: 3px; }
        }
      `}</style>

      <main className="main-container">
        <div className="hero-section">
          <Image
            src="/image55.png"
            alt="Cricket bat and ball icon"
            width={120}
            height={120}
            className="hero-logo"
          />
          <h1 className="hero-title">PATH OF THE CRICKET</h1>
          <div className="subscriber-badge">
            <span className="material-icons">people</span>
            {subscriberCount} Subscribers
          </div>
        </div>

        <section className="achievements-section">
          <div className="container">
            <h2 className="page-header">
              <span className="material-icons"></span>
              <span className="title-text">HALL OF FAME</span>
            </h2>
            <p className="section-subtitle">Individual Legends Who Paved the Way</p>

            <div className="champions-grid">
              {champions.map((champion) => (
                <div key={champion.id} className="champion-card">
                  <Image
                    src={champion.image_url || "/playerB1.jpg"}
                    alt={champion.name}
                    className="champion-image"
                    width={300}
                    height={220}
                    style={{ objectFit: "cover", objectPosition: "center top" }}
                  />
                  <h3 className="champion-name">{champion.name}</h3>
                  <p className="champion-role">{champion.role}</p>
                  <ul className="stats-list">
                    {champion.career_runs && (
                      <li>Career Runs: <span className="stat-value">{champion.career_runs}</span></li>
                    )}
                    {champion.player_of_the_year && (
                      <li>
                        <span className="material-icons">star</span>Player of the Year: 
                        <span className="stat-value">{champion.player_of_the_year}</span>
                      </li>
                    )}
                    {champion.highest_score && (
                      <li>Highest Score: <span className="stat-value">{champion.highest_score}</span></li>
                    )}
                    {champion.career_wickets && (
                      <li>Career Wickets: <span className="stat-value">{champion.career_wickets}</span></li>
                    )}
                    {champion.best_bowling_figure && (
                      <li>
                        <span className="material-icons">star</span>Best Bowling Figure: 
                        <span className="stat-value">{champion.best_bowling_figure}</span>
                      </li>
                    )}
                    {champion.hat_tricks && (
                      <li>Hat-tricks: <span className="stat-value">{champion.hat_tricks}</span></li>
                    )}
                    {champion.career_runs_wickets && (
                      <li>Career Runs / Wickets: <span className="stat-value">{champion.career_runs_wickets}</span></li>
                    )}
                    {champion.tournament_mvp && (
                      <li>
                        <span className="material-icons">star</span>Tournament MVP: 
                        <span className="stat-value">{champion.tournament_mvp}</span>
                      </li>
                    )}
                    {champion.fastest_century && (
                      <li>Fastest Century: <span className="stat-value">{champion.fastest_century}</span></li>
                    )}
                  </ul>
                </div>
              ))}
            </div>

            <hr style={{
              border: 0,
              height: "1px",
              backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0), var(--color-accent-gold), rgba(255, 255, 255, 0))",
              margin: "40px auto",
              width: "80%",
            }} />

            <h3 className="page-header">
              <span className="material-icons">verified</span>
              <span className="title-text">TEAM CHAMPIONS</span>
            </h3>
            <p className="section-subtitle">Our Teams' Triumphs and Titles</p>

            <div className="team-grid">
              {teamAchievements.map((achievement) => (
                <div key={achievement.id} className="team-card">
                  <span className="material-icons">{achievement.icon}</span>
                  <h4 className="team-title">{achievement.title}</h4>
                  <p className="team-year">{achievement.year}</p>
                </div>
              ))}
            </div>

            {keyAchievement && (
              <div className="key-achievements">
                <span className="material-icons achievement-icon">trophy</span>
                <p 
                  className="achievement-text"
                  dangerouslySetInnerHTML={{
                    __html: formatKeyAchievement(keyAchievement.text, keyAchievement.highlight)
                  }}
                />
              </div>
            )}

            <div className="newsletter-section">
              <h3 className="newsletter-title">Stay Updated with Our Achievements</h3>
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribed}
                />
                <button 
                  className="newsletter-button" 
                  onClick={handleSubscribe}
                  disabled={isSubscribed}
                >
                  {isSubscribed ? "Subscribed!" : "Subscribe"}
                </button>
              </div>
              <p style={{ marginTop: "10px", fontSize: "0.9rem", color: "#aaa" }}>
                Join {subscriberCount} subscribers who receive updates about our achievements
              </p>
              <button 
                className="contact-button"
                onClick={() => setIsModalOpen(true)}
              >
                <span className="material-icons">email</span> Contact Us
              </button>
            </div>
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div className="modal" role="dialog" aria-hidden="false" aria-labelledby="contactTitle">
          <div className="modal-content">
            <button className="modal-close" aria-label="Close contact form" onClick={() => setIsModalOpen(false)}>
              ×
            </button>
            <h2 id="contactTitle">Contact Us</h2>
            <form onSubmit={handleContactSubmit}>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" value={contactForm.name} onChange={handleContactChange} required />
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={contactForm.email} onChange={handleContactChange} required />
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={4} value={contactForm.message} onChange={handleContactChange} required />
              <button type="submit" className="submit-button">Send Message</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}