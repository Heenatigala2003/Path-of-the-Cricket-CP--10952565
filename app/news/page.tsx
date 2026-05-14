'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';


interface Article {
  id: string;                   
  title: string;
  category: string;
  excerpt: string;
  image_url: string;
  featured: boolean;
  tag?: string;
  created_at?: string;
}


interface Category {
  id: string;
  label: string;
}

export default function NewsPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Categories data
  const categories: Category[] = [
    { id: "all", label: "All" },
    { id: "match-report", label: "Match Reports" },
    { id: "opinion", label: "Opinion" },
    { id: "transfer", label: "Transfer News" },
    { id: "sri-lanka", label: "Sri Lanka" }
  ];

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = activeFilter === 'all' 
        ? '/api/news' 
        : `/api/news?category=${activeFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        const featured = data.data.find((article: Article) => article.featured);
        const regular = data.data.filter((article: Article) => !article.featured);
        
        setFeaturedArticle(featured || null);
        setArticles(regular);
      } else {
        throw new Error(data.error || 'Failed to fetch articles');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [activeFilter]);

  const filteredArticles = activeFilter === 'all' 
    ? articles 
    : articles.filter(article => article.category === activeFilter);
  
  const showFeaturedArticle = featuredArticle && 
    (activeFilter === 'all' || featuredArticle.category === activeFilter);

  return (
    <>
      <style jsx global>{`
        :root {
          --color-dark-primary: #000000;
          --color-accent-gold: #d1b042;
          --color-light-text: #e0e0e0;
          --color-white: #fff;
          --color-search-green: #53e51a;
          --primary-highlight: var(--color-accent-gold);
          --secondary-color: var(--color-search-green);
          --card-bg: #1e1e1e;
          --text-dark: #121212;
          --text-muted: #888;
          --spacing-medium: 20px;
          --radius-small: 8px;
          --radius-circle: 50%;
          --font-header: 'Oswald', sans-serif;
        }

        body {
          margin: 0;
          background: linear-gradient(180deg, #070707 0%, #000000 100%);
          font-family: 'Inter', sans-serif;
          color: var(--color-light-text);
          line-height: 1.6;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left-color: var(--color-accent-gold);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 50px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.3);
          border-radius: var(--radius-small);
          padding: 20px;
          text-align: center;
          margin: 50px auto;
          max-width: 500px;
        }

        .retry-btn {
          background: var(--color-accent-gold);
          color: var(--text-dark);
          border: none;
          padding: 10px 20px;
          border-radius: var(--radius-small);
          cursor: pointer;
          font-weight: bold;
          margin-top: 15px;
          transition: opacity 0.3s;
        }

        .retry-btn:hover {
          opacity: 0.9;
        }
      `}</style>
      
      <main className="min-h-screen">
        <div className="page-header">
          <div className="logo-wrapper">
            <div className="logo-container">
              <Image 
                src="/image55.png" 
                alt="Cricket bat and ball icon" 
                width={140}
                height={140}
                className="logo-image"
                priority
              />
            </div>
            <h1 className="title-text">PATH OF THE CRICKET</h1>
          </div>
        </div>

        <div className="hero-banner">
          <h1>CRICKET NEWS & ARTICLES</h1>
          <p>The latest updates, match reports, and in-depth opinion from around the globe.</p>
        </div>
        
        <div className="container">
          <section className="filters" id="article-filters">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-btn ${activeFilter === category.id ? 'active' : ''}`}
                data-filter={category.id}
                onClick={() => setActiveFilter(category.id)}
                disabled={loading}
              >
                {category.label}
              </button>
            ))}
          </section>
          
       
          {loading && (
            <div className="loading-spinner"></div>
          )}
          
        
          {error && !loading && (
            <div className="error-message">
              <p>Error loading articles: {error}</p>
              <button className="retry-btn" onClick={fetchArticles}>
                Try Again
              </button>
            </div>
          )}
         
          {!loading && !error && showFeaturedArticle && (
            <section className="featured-article" data-category={featuredArticle?.category}>
              <div 
                className="featured-image"
                style={{ backgroundImage: `url(${featuredArticle?.image_url || '/News.jpg'})` }}
              />
              <div className="featured-content">
                <span className="featured-tag">{featuredArticle?.tag || 'FEATURED'}</span>
                <h2>{featuredArticle?.title}</h2>
                <p>{featuredArticle?.excerpt}</p>
                <a href={`/news/${featuredArticle?.id}`} className="read-btn">Read Full Article →</a>
              </div>
            </section>
          )}
          
          {!loading && !error && (
            <section className="news-grid" id="news-grid">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <article key={article.id} className="article-card" data-category={article.category}>
                    <div 
                      className="card-img-top"
                      style={{ backgroundImage: `url(${article.image_url})` }}
                    />
                    <div className="card-body">
                      <span className="card-tag">
                        {article.category.replace('-', ' ').toUpperCase()}
                      </span>
                      <h3>{article.title}</h3>
                      <p>{article.excerpt}</p>

                      <a href={`/news/${article.id}`} className="read-more-link">
                        Read more
                      </a>
                    </div>
                  </article>
                ))
              ) : (
                <div className="no-articles">
                  <p>No articles found in this category.</p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
      
      {/* Component Styles */}
      <style jsx>{`
        .page-header {
          margin: 30px auto 10px;
          position: relative;
          padding: 80px 0 10px;
          width: 100%;
        }

        .logo-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

       .logo-container {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
 
}
        

        .logo-image {
          border-radius: var(--radius-circle);
          object-fit: cover;
        }

        .page-header .title-text {
          font-weight: 800;
          font-size: 48px;
          color: var(--color-accent-gold);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-shadow: 0 2px 3px rgba(209, 176, 66, 0.3);
          margin: 0;
          text-align: center;
        }

        .hero-banner {
          text-align: center;
          padding: 2px 10px 24px;
          color: var(--color-white);
          background: var(--card-bg);
          border-bottom: 2px solid var(--primary-highlight);
          margin-top: 10px;
        }

        .hero-banner h1 {
          font-family: var(--font-header);
          font-size: 3.8em;
          font-weight: 600;
          letter-spacing: 2px;
          margin-bottom: 15px;
          text-transform: uppercase;
          color: var(--secondary-color);
          text-shadow: 0 0 5px rgba(230, 243, 225, 0.5);
        }

        .hero-banner p {
          font-size: 1.3em;
          opacity: 0.9;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 var(--spacing-medium);
        }

        .filters {
          display: flex;
          justify-content: center;
          gap: 15px;
          padding: 25px 0;
          flex-wrap: wrap;
          border-bottom: 1px solid #333;
          margin-bottom: 35px;
        }

        .filter-btn {
          background-color: #333;
          color: var(--color-light-text);
          border: 2px solid #333;
          padding: 8px 18px;
          border-radius: 50px;
          cursor: pointer;
          transition: 0.3s;
          font-weight: 500;
          text-transform: uppercase;
          font-size: 0.9em;
        }

        .filter-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .filter-btn:hover:not(:disabled),
        .filter-btn.active:not(:disabled) {
          background-color: var(--primary-highlight);
          color: var(--text-dark);
          border-color: var(--primary-highlight);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(209, 176, 66, 0.3);
        }

        .featured-article {
          display: flex;
          background: var(--card-bg);
          border-radius: var(--radius-small);
          margin-bottom: 40px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
          transition: transform 0.3s;
        }

        .featured-article:hover {
          transform: scale(1.005);
        }

        .featured-image {
          flex: 1;
          min-height: 380px;
          background-size: cover;
          background-position: center;
          border-right: 5px solid var(--secondary-color);
        }

        .featured-content {
          flex: 1;
          padding: 35px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .featured-tag {
          background-color: var(--secondary-color);
          color: var(--text-dark);
          display: inline-block;
          padding: 5px 10px;
          border-radius: 3px;
          font-weight: 700;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .featured-content h2 {
          font-family: var(--font-header);
          font-size: 2.5em;
          color: var(--primary-highlight);
          margin-top: 0;
          margin-bottom: 15px;
          line-height: 1.2;
        }

        .featured-content p {
          margin-bottom: 20px;
          color: var(--text-muted);
          font-size: 1.1em;
          line-height: 1.6;
        }

        .read-btn {
          background-color: var(--primary-highlight);
          color: var(--text-dark);
          padding: 12px 25px;
          border-radius: 5px;
          font-weight: 700;
          text-align: center;
          width: fit-content;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          font-size: 1em;
        }

        .read-btn:hover {
          background-color: #ffd700;
          transform: translateX(5px);
        }

        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          padding-bottom: 40px;
        }

        .article-card {
          background: var(--card-bg);
          border-radius: var(--radius-small);
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          transition: transform 0.3s, box-shadow 0.3s;
          cursor: pointer;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .article-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        }

        .card-img-top {
          height: 200px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .card-body {
          padding: var(--spacing-medium);
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .card-tag {
          font-size: 0.8em;
          color: var(--secondary-color);
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 10px;
          display: block;
          letter-spacing: 0.5px;
        }

        .card-body h3 {
          font-family: var(--font-header);
          font-size: 1.3em;
          color: var(--color-white);
          margin: 0 0 12px;
          line-height: 1.3;
        }

        .card-body p {
          font-size: 0.95em;
          color: #ccc;
          margin-bottom: 15px;
          flex-grow: 1;
          line-height: 1.5;
        }

        .read-more-link {
          color: var(--primary-highlight);
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: color 0.3s;
        }

        .read-more-link:hover {
          color: #ffd700;
          text-decoration: underline;
        }

        .no-articles {
          grid-column: 1 / -1;
          text-align: center;
          padding: 50px;
          background: var(--card-bg);
          border-radius: var(--radius-small);
        }

        .no-articles p {
          font-size: 1.2em;
          color: var(--text-muted);
        }

        /* Responsive Styles */
        @media (max-width: 900px) {
          .featured-article {
            flex-direction: column;
          }

          .featured-image {
            min-height: 250px;
            border-right: none;
            border-bottom: 5px solid var(--secondary-color);
          }

          .featured-content h2 {
            font-size: 2em;
          }

          .featured-content {
            padding: 25px;
          }
        }

        @media (max-width: 768px) {
          .hero-banner h1 {
            font-size: 2.8em;
          }

          .hero-banner p {
            font-size: 1.1em;
          }

          .page-header .title-text {
            font-size: 32px;
          }

          .logo-image {
            width: 50px;
            height: 50px;
          }

          .filters {
            padding: 20px 0;
            margin-bottom: 25px;
          }

          .featured-content h2 {
            font-size: 1.8em;
          }

          .news-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
          }
        }

        @media (max-width: 480px) {
          .page-header .title-text {
            font-size: 26px;
          }
          
          .hero-banner h1 {
            font-size: 2.2em;
            letter-spacing: 2px;
          }

          .hero-banner {
            padding: 20px 15px 30px;
          }

          .filters {
            gap: 10px;
          }

          .filter-btn {
            padding: 6px 14px;
            font-size: 0.85em;
          }

          .featured-content {
            padding: 20px;
          }

          .featured-content h2 {
            font-size: 1.5em;
          }

          .card-img-top {
            height: 150px;
          }
        }
      `}</style>
    </>
  );
}