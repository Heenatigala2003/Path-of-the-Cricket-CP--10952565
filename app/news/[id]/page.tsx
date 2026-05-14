'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface Article {
  id: number;              
  title: string;
  category: string;
  excerpt: string;
  image_url: string;
  featured: boolean;
  tag?: string;
  created_at: string;
  url?: string;             
}

export default function ArticlePage() {
  const params = useParams();
  const id = params.id as string; 
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/news/${id}`);
        const data = await response.json();

        if (data.success) {
          setArticle(data.data);
        } else {
          throw new Error(data.error || 'Article not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
    
          <a href="/news" className="retry-btn">Back to News</a>
        </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --color-dark-primary: #000000;
          --color-accent-gold: #d1b042;
          --color-light-text: #e0e0e0;
          --color-white: #fff;
          --card-bg: #1e1e1e;
          --text-dark: #121212;
          --text-muted: #888;
        }

        body {
          margin: 0;
          background: linear-gradient(180deg, #070707 0%, #000000 100%);
          font-family: 'Inter', sans-serif;
          color: var(--color-light-text);
          line-height: 1.6;
        }

        .loading-spinner {
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left-color: var(--color-accent-gold);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.3);
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          max-width: 500px;
        }

        .retry-btn {
          background: var(--color-accent-gold);
          color: var(--text-dark);
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 15px;
          text-decoration: none;
          display: inline-block;
        }
      `}</style>

      <main className="min-h-screen">
        {/* Header */}
        <div className="page-header">
          <div className="logo-wrapper">
            <div className="logo-container">
              <Image 
                src="/image55.png" 
                alt="Cricket bat and ball icon" 
                width={100}
                height={100}
                className="logo-image"
              />
            </div>
            <h1 className="title-text">PATH OF THE CRICKET</h1>
          </div>
        </div>

        <div className="container">
          <a href="/news" className="back-link">← Back to News</a>

          <article className="article-detail">
            <div className="article-header">
              <span className="article-category">{article.category.replace('-', ' ')}</span>
              <h1 className="article-title">{article.title}</h1>
              <div className="article-meta">
                <time dateTime={article.created_at}>
                  {new Date(article.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </div>

            <div 
              className="article-hero-image"
              style={{ backgroundImage: `url(${article.image_url})` }}
            />

            <div className="article-content">
              <p className="article-excerpt">{article.excerpt}</p>

              
              <div className="article-body">
                <p>This is where the full article content would go. You can expand this section to include the complete article text, images, videos, etc.</p>
                <p>For now, this is a placeholder for the full article content that would be stored in your database.</p>
              </div>
            </div>
          </article>
        </div>
      </main>

      <style jsx>{`
        .page-header {
          padding: 30px 0;
          text-align: center;
        }

        .logo-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 10px;
        }

        .logo-image {
          border-radius: 50%;
          object-fit: cover;
        }

        .title-text {
          font-weight: 800;
          font-size: 36px;
          color: var(--color-accent-gold);
          text-transform: uppercase;
          margin: 0;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .back-link {
          display: inline-block;
          color: var(--color-accent-gold);
          text-decoration: none;
          margin-bottom: 30px;
          font-weight: 500;
          transition: color 0.3s;
        }

        .back-link:hover {
          color: #ffd700;
          text-decoration: underline;
        }

        .article-detail {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        }

        .article-header {
          padding: 40px 40px 20px;
        }

        .article-category {
          display: inline-block;
          background: #53e51a;
          color: var(--text-dark);
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.9em;
          margin-bottom: 15px;
        }

        .article-title {
          font-family: 'Oswald', sans-serif;
          font-size: 2.5em;
          color: var(--color-white);
          margin: 0 0 15px;
          line-height: 1.2;
        }

        .article-meta {
          color: var(--text-muted);
          font-size: 0.9em;
        }

        .article-hero-image {
          height: 400px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .article-content {
          padding: 40px;
        }

        .article-excerpt {
          font-size: 1.2em;
          color: var(--color-light-text);
          line-height: 1.8;
          margin-bottom: 30px;
          font-weight: 500;
        }

        .article-body {
          font-size: 1.1em;
          color: #ccc;
          line-height: 1.8;
        }

        .article-body p {
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .article-header {
            padding: 30px 20px 15px;
          }

          .article-title {
            font-size: 2em;
          }

          .article-hero-image {
            height: 250px;
          }

          .article-content {
            padding: 30px 20px;
          }

          .title-text {
            font-size: 28px;
          }
        }

        @media (max-width: 480px) {
          .article-title {
            font-size: 1.7em;
          }

          .article-hero-image {
            height: 200px;
          }

          .article-excerpt {
            font-size: 1.1em;
          }

          .title-text {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
}