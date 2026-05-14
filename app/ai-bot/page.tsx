'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export default function AIChatPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI guide for the Path of Cricket Talent Portal. I can help you find information on tryouts, training programs, and talent requirements. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "When are the next tryouts?",
    "What training programs do you offer?",
    "What are the eligibility requirements?",
    "How can I join as a coach?",
    "Tell me about talent scouting",
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      const botResponse: Message = {
        id: messages.length + 2, 
        text: data.reply,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Failed to get bot response:', error);
    
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    } else {
      alert('Please enter a valid email address.');
    }
  };


  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert('Please fill all required fields.');
      return;
    }
    alert(`Thank you ${contactForm.name}! Your message has been sent. We'll respond within 24 hours.`);
    setIsContactModalOpen(false);
    setContactForm({ name: '', email: '', message: '' });
  };


  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

 
  const currentYear = new Date().getFullYear();

  return (
    <div className="ai-chat-page">
      
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-inner">
            <a href="/" className="logo-container">
              <img 
                src="/image55.png" 
                alt="Path of Cricket Logo" 
                className="logo-img"
              />
              <span className="logo-text">PATH OF CRICKET</span>
            </a>

            <button 
              className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-logo">
            <img 
              src="/image55.png" 
              alt="Path of Cricket Logo" 
              className="hero-logo-img"
            />
          </div>
          
          <h1 className="hero-title">PATH OF CRICKET</h1>
          
          <div className="title-divider">
            <div className="divider-line"></div>
            <h2 className="hero-subtitle">AI TALENT ASSISTANT</h2>
            <div className="divider-line"></div>
          </div>
          
          <p className="hero-description">
            Your intelligent guide to cricket talent pathways, tryouts, and professional training programs
          </p>
        </div>
      </section>

      <div className="chatbot-container">
        <div className="chatbot-grid">
          <div className="side-panel">
            <div className="info-card">
              <div className="info-card-title">
                <svg className="info-card-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm1.65-2.65L11.5 12.2V9h1v2.79l1.85 1.85-.7.71z"/>
                </svg>
                <span>What I Can Help With</span>
              </div>
              <ul className="info-list">
                <li><div className="info-dot"></div> Tryout Schedules</li>
                <li><div className="info-dot"></div> Training Programs</li>
                <li><div className="info-dot"></div> Eligibility Requirements</li>
                <li><div className="info-dot"></div> Coach Recruitment</li>
                <li><div className="info-dot"></div> Fee Structure</li>
                <li><div className="info-dot"></div> Talent Scouting</li>
              </ul>
            </div>

            <div className="info-card">
              <h3 className="info-card-title">Quick Stats</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">250+</div>
                  <div className="stat-label">Active Players</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">15</div>
                  <div className="stat-label">Coaches</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">8</div>
                  <div className="stat-label">Training Centers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">4</div>
                  <div className="stat-label">National Scouts</div>
                </div>
              </div>
            </div>
          </div>

          <div className="main-chat-container">
            <div className="chat-header">
              <div className="chat-header-content">
                <div className="bot-avatar">
                  <div className="bot-avatar-ping"></div>
                  <div className="bot-avatar-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8zM16 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                </div>
                <div className="bot-info">
                  <h3>Talent Bot</h3>
                  <div className="bot-status">
                    <div className="status-dot"></div>
                    <span className="status-text">Online - Your Cricket Path Guide</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="messages-area">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message-container ${message.sender}`}
                >
                  <div className={`message ${message.sender}`}>
                    <div className="message-header">
                      <svg className="message-icon" viewBox="0 0 24 24" fill="currentColor">
                        {message.sender === 'bot' ? (
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8zM16 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        ) : (
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        )}
                      </svg>
                      <span className="message-sender">
                        {message.sender === 'bot' ? 'Talent Bot' : 'You'}
                      </span>
                      <span className="message-time">
                       
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                    <div className="message-content">
                      {message.text}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message-container">
                  <div className="loading-message">
                    <div className="loading-dots">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                    <span className="loading-text">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
            {!isLoading && messages.length <= 3 && (
              <div className="suggestions-area">
                <p className="suggestions-title">Try asking:</p>
                <div className="suggestions-grid">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="suggestion-button"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="input-area">
              <div className="input-container">
                <input
                  type="text"
                  className="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about tryouts, training, or cricket pathways..."
                  disabled={isLoading}
                />
                <button
                  className="send-button"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                >
                  <svg className="send-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                  <span>Send</span>
                </button>
              </div>
              <p className="input-hint">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="sponsors-section">
        <div className="sponsors-container">
          <h3 className="sponsors-title">Official Partners & Sponsors</h3>
          <div className="sponsors-track">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="sponsor-item">
                <div className="sponsor-content">
                  <div className="sponsor-name">Partner {i}</div>
                  <div className="sponsor-label">Cricket Equipment</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo-container">
                <img src="/image55.png" alt="Path of Cricket" className="footer-logo" />
                <span className="footer-brand-name">PATH OF CRICKET</span>
              </div>
              <p className="footer-description">
                Nurturing cricket talent across Sri Lanka with professional coaching, scouting, and career pathways.
              </p>
              <div className="footer-contact">
                <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span>support@pathofcricket.lk</span>
              </div>
              <div className="footer-contact">
                <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <span>+94 706302034</span>
              </div>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li className="footer-link-item">
                  <a href="#" className="footer-link">
                    About Us
                    <svg className="footer-link-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                </li>
                <li className="footer-link-item">
                  <a href="#" className="footer-link">
                    Tryouts
                    <svg className="footer-link-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                </li>
                <li className="footer-link-item">
                  <a href="#" className="footer-link">
                    Training Programs
                    <svg className="footer-link-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                </li>
                <li className="footer-link-item">
                  <a href="#" className="footer-link">
                    Coaches
                    <svg className="footer-link-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                </li>
                <li className="footer-link-item">
                  <a href="#" className="footer-link">
                    Contact
                    <svg className="footer-link-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Resources</h4>
              <ul className="footer-links">
                <li className="footer-link-item">
                  <a href="#" className="footer-link">Blog</a>
                </li>
                <li className="footer-link-item">
                  <a href="#" className="footer-link">FAQ</a>
                </li>
                <li className="footer-link-item">
                  <a href="#" className="footer-link">Player Portal</a>
                </li>
                <li className="footer-link-item">
                  <a href="#" className="footer-link">Coach Application</a>
                </li>
                <li className="footer-link-item">
                  <a href="#" className="footer-link">Scouting Network</a>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Stay Updated</h4>
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="newsletter-button">
                  Subscribe
                </button>
              </form>
              {isSubscribed && (
                <p className="newsletter-success">Thanks for subscribing!</p>
              )}
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Facebook">
                  <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="copyright">
            <div className="copyright-line">© {currentYear} Path of Cricket Talent Portal. All rights reserved.</div>
            <div className="copyright-line">Designed for Sri Lankan Cricket Excellence</div>
          </div>
        </div>
      </footer>

      {isContactModalOpen && (
        <div className="modal-overlay" onClick={() => setIsContactModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Contact Us</h3>
              <button className="modal-close" onClick={() => setIsContactModalOpen(false)}>
                <svg className="modal-close-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-textarea"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                  />
                </div>
                <button type="submit" className="submit-button">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .ai-chat-page {
          min-height: 100vh;
          background-color: #000000;
          color: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        /* Navigation Styles */
        .navbar {
          width: 100%;
          background-color: #000000;
          color: #ffffff;
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid rgba(209, 176, 66, 0.3);
          backdrop-filter: blur(10px);
        }
        
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 0;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
        }
        
        .logo-img {
          width: 56px;
          height: 56px;
          object-fit: contain;
        }
        
        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: #d1b042;
          display: none;
        }
        
        @media (min-width: 768px) {
          .logo-text {
            display: block;
          }
        }
        
        .nav-links {
          display: flex;
          gap: 32px;
          align-items: center;
        }
        
        .nav-link {
          color: #e0e0e0;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.875rem;
          transition: color 0.3s;
          position: relative;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .nav-link:hover {
          color: #d1b042;
        }
        
        .nav-link.active {
          color: #d1b042;
        }
        
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #d1b042;
        }
        
        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }
        
        .mobile-menu-btn span {
          width: 24px;
          height: 2px;
          background-color: #ffffff;
          transition: all 0.3s;
        }
        
        .mobile-menu-btn.active span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-btn.active span:nth-child(2) {
          opacity: 0;
        }
        
        .mobile-menu-btn.active span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }
        
        @media (max-width: 767px) {
          .mobile-menu-btn {
            display: flex;
          }
          
          .nav-links {
            position: fixed;
            top: 86px;
            right: -100%;
            width: 220px;
            background-color: rgba(0, 0, 0, 0.98);
            flex-direction: column;
            padding: 20px;
            gap: 0;
            transition: right 0.4s ease-in-out;
            border-left: 1px solid rgba(209, 176, 66, 0.3);
            border-bottom: 1px solid rgba(209, 176, 66, 0.3);
            border-radius: 0 0 0 12px;
          }
          
          .nav-links.active {
            right: 0;
          }
          
          .nav-link {
            padding: 12px 0;
            width: 100%;
            display: block;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .nav-link:last-child {
            border-bottom: none;
          }
        }

        /* Hero Section */
        .hero-section {
          padding: 40px 20px 60px;
          text-align: center;
        }
        
        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .hero-logo {
          width: 160px;
          height: 160px;
          margin: 0 auto 30px;
          position: relative;
        }
        
        .hero-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;    
          border-radius: 50%;        
          filter: drop-shadow(0 4px 20px rgba(209, 176, 66, 0.3));
        }
        
        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          color: #d1b042;
          margin-bottom: 16px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
        }
        
        .title-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: 24px 0;
        }
        
        .divider-line {
          height: 2px;
          width: 80px;
          background: linear-gradient(90deg, transparent, #d1b042, transparent);
        }
        
        .hero-subtitle {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 20px;
        }
        
        @media (max-width: 768px) {
          .hero-subtitle {
            font-size: 1.5rem;
          }
        }
        
        .hero-description {
          font-size: 1.125rem;
          color: #e0e0e0;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Chatbot Container */
        .chatbot-container {
          max-width: 1200px;
          margin: 0 auto 60px;
          padding: 0 20px;
        }
        
        .chatbot-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        
        @media (min-width: 1024px) {
          .chatbot-grid {
            grid-template-columns: 1fr 2fr;
          }
        }

        /* Side Panel */
        .side-panel {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .info-card {
          background: linear-gradient(135deg, rgba(30, 30, 30, 0.8), rgba(18, 18, 18, 0.8));
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(51, 51, 51, 0.5);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        
        .info-card-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #d1b042;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 20px;
        }
        
        .info-card-icon {
          width: 24px;
          height: 24px;
        }
        
        .info-list {
          list-style: none;
        }
        
        .info-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #e0e0e0;
          padding: 8px 0;
          border-bottom: 1px solid rgba(51, 51, 51, 0.3);
        }
        
        .info-list li:last-child {
          border-bottom: none;
        }
        
        .info-dot {
          width: 8px;
          height: 8px;
          background-color: #d1b042;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        
        .stat-item {
          background: rgba(30, 30, 30, 0.7);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          border: 1px solid rgba(51, 51, 51, 0.3);
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #d1b042;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: #a0a0a0;
        }

        /* Main Chat Container */
        .main-chat-container {
          background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(18, 18, 18, 0.9));
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(51, 51, 51, 0.5);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
        }
        
        .chat-header {
          background: linear-gradient(90deg, rgba(209, 176, 66, 0.2), rgba(18, 18, 18, 0.8), rgba(209, 176, 66, 0.2));
          padding: 24px;
          border-bottom: 1px solid rgba(209, 176, 66, 0.3);
        }
        
        .chat-header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .bot-avatar {
          position: relative;
        }
        
        .bot-avatar-ping {
          position: absolute;
          top: 0;
          left: 0;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #d1b042, #ffd700);
          border-radius: 50%;
          animation: ping 1.5s infinite;
        }
        
        .bot-avatar-icon {
          position: relative;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #d1b042, #ffd700);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }
        
        .bot-avatar-icon svg {
          width: 24px;
          height: 24px;
          color: #000000;
        }
        
        .bot-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
        }
        
        .bot-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-dot {
          width: 10px;
          height: 10px;
          background-color: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        .status-text {
          color: #d1b042;
          font-size: 0.875rem;
        }

        /* Messages Area */
        .messages-area {
          height: 500px;
          overflow-y: auto;
          padding: 24px;
          background: linear-gradient(to bottom, rgba(30, 30, 30, 0.3), rgba(0, 0, 0, 0.3));
        }
        
        .message-container {
          margin-bottom: 20px;
          animation: fadeIn 0.3s ease-out;
        }
        
        .message-container.user {
          display: flex;
          justify-content: flex-end;
        }
        
        .message {
          max-width: 85%;
          padding: 16px 20px;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.5;
          position: relative;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .message.bot {
          background: linear-gradient(135deg, rgba(51, 51, 51, 0.9), rgba(30, 30, 30, 0.9));
          color: #e0e0e0;
          border: 1px solid rgba(51, 51, 51, 0.5);
          border-bottom-left-radius: 4px;
        }
        
        .message.user {
          background: linear-gradient(135deg, #d1b042, #c19b3c);
          color: #000000;
          font-weight: 500;
          border-bottom-right-radius: 4px;
        }
        
        .message-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .message-icon {
          width: 16px;
          height: 16px;
        }
        
        .message-sender {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .message-time {
          font-size: 0.75rem;
          opacity: 0.7;
        }
        
        .message-content {
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .loading-message {
          background: linear-gradient(135deg, rgba(51, 51, 51, 0.9), rgba(30, 30, 30, 0.9));
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          padding: 16px 20px;
          max-width: 85%;
          border: 1px solid rgba(51, 51, 51, 0.5);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .loading-dots {
          display: flex;
          gap: 4px;
        }
        
        .loading-dot {
          width: 8px;
          height: 8px;
          background-color: #d1b042;
          border-radius: 50%;
        }
        
        .loading-dot:nth-child(1) {
          animation: bounce 1.4s infinite;
        }
        
        .loading-dot:nth-child(2) {
          animation: bounce 1.4s infinite 0.2s;
        }
        
        .loading-dot:nth-child(3) {
          animation: bounce 1.4s infinite 0.4s;
        }
        
        .loading-text {
          color: #e0e0e0;
          font-size: 0.875rem;
        }

        /* Suggestions Area */
        .suggestions-area {
          padding: 20px 24px;
          border-top: 1px solid rgba(51, 51, 51, 0.5);
          background: rgba(0, 0, 0, 0.3);
        }
        
        .suggestions-title {
          color: #a0a0a0;
          font-size: 0.875rem;
          margin-bottom: 12px;
        }
        
        .suggestions-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .suggestion-button {
          background: linear-gradient(135deg, rgba(51, 51, 51, 0.9), rgba(30, 30, 30, 0.9));
          color: #e0e0e0;
          border: 1px solid rgba(51, 51, 51, 0.5);
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          font-family: inherit;
        }
        
        .suggestion-button:hover {
          background: linear-gradient(135deg, rgba(51, 51, 51, 1), rgba(40, 40, 40, 1));
          border-color: rgba(209, 176, 66, 0.5);
          transform: translateY(-2px);
        }

        /* Input Area */
        .input-area {
          padding: 20px 24px;
          border-top: 1px solid rgba(51, 51, 51, 0.5);
          background: rgba(0, 0, 0, 0.5);
        }
        
        .input-container {
          display: flex;
          gap: 12px;
        }
        
        .chat-input {
          flex: 1;
          background: linear-gradient(135deg, rgba(51, 51, 51, 0.8), rgba(30, 30, 30, 0.8));
          border: 1px solid rgba(51, 51, 51, 0.5);
          border-radius: 12px;
          padding: 16px 20px;
          color: #ffffff;
          font-size: 1rem;
          transition: all 0.3s;
          font-family: inherit;
          outline: none;
        }
        
        .chat-input:focus {
          border-color: rgba(209, 176, 66, 0.5);
          box-shadow: 0 0 0 2px rgba(209, 176, 66, 0.2);
        }
        
        .chat-input::placeholder {
          color: #888888;
        }
        
        .send-button {
          background: linear-gradient(135deg, #d1b042, #c19b3c);
          color: #000000;
          border: none;
          border-radius: 12px;
          padding: 0 24px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 80px;
          font-family: inherit;
        }
        
        .send-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #e6c158, #d1b042);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(209, 176, 66, 0.3);
        }
        
        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .send-icon {
          width: 20px;
          height: 20px;
        }
        
        .input-hint {
          text-align: center;
          color: #888888;
          font-size: 0.75rem;
          margin-top: 8px;
        }

        .sponsors-section {
          padding: 40px 20px;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(30, 30, 30, 0.8));
          border-top: 1px solid rgba(209, 176, 66, 0.2);
          border-bottom: 1px solid rgba(209, 176, 66, 0.2);
        }
        
        .sponsors-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .sponsors-title {
          text-align: center;
          color: #d1b042;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 30px;
        }
        
        .sponsors-track {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding: 20px 0;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .sponsors-track::-webkit-scrollbar {
          display: none;
        }
        
        .sponsor-item {
          flex-shrink: 0;
          width: 180px;
          height: 100px;
          background: linear-gradient(135deg, rgba(51, 51, 51, 0.7), rgba(30, 30, 30, 0.7));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(51, 51, 51, 0.5);
          transition: all 0.3s;
        }
        
        .sponsor-item:hover {
          border-color: rgba(209, 176, 66, 0.5);
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
        }
        
        .sponsor-content {
          text-align: center;
          padding: 16px;
        }
        
        .sponsor-name {
          color: #d1b042;
          font-weight: 700;
          font-size: 1.125rem;
          margin-bottom: 4px;
        }
        
        .sponsor-label {
          color: #a0a0a0;
          font-size: 0.75rem;
        }

        .footer {
          background: linear-gradient(to bottom, rgba(30, 30, 30, 0.9), rgba(0, 0, 0, 0.9));
          padding: 60px 20px 30px;
          border-top: 1px solid rgba(209, 176, 66, 0.2);
        }
        
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        
        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .footer-logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .footer-logo {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }
        
        .footer-brand-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #d1b042;
        }
        
        .footer-description {
          color: #a0a0a0;
          font-size: 0.875rem;
          line-height: 1.6;
        }
        
        .footer-contact {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #a0a0a0;
          font-size: 0.875rem;
        }
        
        .footer-contact-icon {
          width: 16px;
          height: 16px;
        }
        
        .footer-section h4 {
          color: #ffffff;
          font-size: 1.125rem;
          font-weight: 700;
          margin-bottom: 20px;
        }
        
        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .footer-link-item {
          margin-bottom: 12px;
        }
        
        .footer-link {
          color: #a0a0a0;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .footer-link:hover {
          color: #d1b042;
        }
        
        .footer-link-icon {
          width: 12px;
          height: 12px;
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .footer-link:hover .footer-link-icon {
          opacity: 1;
        }
        
        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .newsletter-input {
          background: rgba(51, 51, 51, 0.7);
          border: 1px solid rgba(51, 51, 51, 0.5);
          border-radius: 8px;
          padding: 12px 16px;
          color: #ffffff;
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
        }
        
        .newsletter-input:focus {
          border-color: rgba(209, 176, 66, 0.5);
        }
        
        .newsletter-button {
          background: linear-gradient(135deg, #d1b042, #c19b3c);
          color: #000000;
          border: none;
          border-radius: 8px;
          padding: 12px 16px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s;
          font-family: inherit;
        }
        
        .newsletter-button:hover {
          background: linear-gradient(135deg, #e6c158, #d1b042);
        }
        
        .newsletter-success {
          color: #10b981;
          font-size: 0.875rem;
          text-align: center;
        }
        
        .social-links {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        
        .social-link {
          width: 40px;
          height: 40px;
          background: rgba(51, 51, 51, 0.7);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          text-decoration: none;
        }
        
        .social-link:hover {
          background: #d1b042;
          transform: translateY(-4px);
        }
        
        .social-icon {
          width: 20px;
          height: 20px;
          color: #ffffff;
        }
        
        .social-link:hover .social-icon {
          color: #000000;
        }
        
        /* Copyright */
        .copyright {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid rgba(51, 51, 51, 0.5);
          color: #888888;
          font-size: 0.875rem;
        }
        
        .copyright-line {
          margin-bottom: 4px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }
        
        .modal {
          background: linear-gradient(135deg, rgba(30, 30, 30, 0.95), rgba(18, 18, 18, 0.95));
          border-radius: 16px;
          width: 100%;
          max-width: 480px;
          border: 1px solid rgba(209, 176, 66, 0.3);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
          overflow: hidden;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid rgba(51, 51, 51, 0.5);
        }
        
        .modal-title {
          color: #d1b042;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .modal-close {
          background: none;
          border: none;
          color: #a0a0a0;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s;
        }
        
        .modal-close:hover {
          color: #ffffff;
        }
        
        .modal-close-icon {
          width: 24px;
          height: 24px;
        }
        
        .modal-body {
          padding: 24px;
        }
        
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-group label {
          display: block;
          color: #a0a0a0;
          font-size: 0.875rem;
          margin-bottom: 8px;
        }
        
        .form-input {
          width: 100%;
          background: rgba(51, 51, 51, 0.7);
          border: 1px solid rgba(51, 51, 51, 0.5);
          border-radius: 8px;
          padding: 12px 16px;
          color: #ffffff;
          font-size: 0.875rem;
          font-family: inherit;
          outline: none;
          border: 1px solid rgba(51, 51, 51, 0.5);
        }
        
        .form-input:focus {
          border-color: rgba(209, 176, 66, 0.5);
        }
        
        .form-textarea {
          width: 100%;
          background: rgba(51, 51, 51, 0.7);
          border: 1px solid rgba(51, 51, 51, 0.5);
          border-radius: 8px;
          padding: 12px 16px;
          color: #ffffff;
          font-size: 0.875rem;
          min-height: 120px;
          resize: vertical;
          font-family: inherit;
          outline: none;
          border: 1px solid rgba(51, 51, 51, 0.5);
        }
        
        .form-textarea:focus {
          border-color: rgba(209, 176, 66, 0.5);
        }
        
        .submit-button {
          background: linear-gradient(135deg, #d1b042, #c19b3c);
          color: #000000;
          border: none;
          border-radius: 8px;
          padding: 14px 20px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          font-family: inherit;
        }
        
        .submit-button:hover {
          background: linear-gradient(135deg, #e6c158, #d1b042);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(209, 176, 66, 0.3);
        }

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
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .messages-area::-webkit-scrollbar {
          width: 8px;
        }
        
        .messages-area::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        
        .messages-area::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #d1b042, #c19b3c);
          border-radius: 4px;
        }
        
        .messages-area::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #e6c158, #d1b042);
        }
      `}</style>
    </div>
  );
}