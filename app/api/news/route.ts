import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category'); 

  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) throw new Error('NEWS_API_KEY is missing');

    
    let query = 'cricket';
    if (category && category !== 'all') {
      
      const categoryMap: Record<string, string> = {
        'match-report': 'match report',
        'opinion': 'opinion',
        'transfer': 'transfer',
        'sri-lanka': 'sri lanka cricket',
      };
      query += ` ${categoryMap[category] || category}`;
    }

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'Failed to fetch news');
    }

   
    const filteredArticles = data.articles.filter((item: any) => {
      const text = `${item.title} ${item.description}`.toLowerCase();
     
      return (
        text.includes('cricket') ||
        text.includes('match') ||
        text.includes('test') ||
        text.includes('odi') ||
        text.includes('t20')
      );
    });

    const articles = filteredArticles.map((item: any, index: number) => ({
      id: index,
      title: item.title,
      category: mapCategory(item), 
      excerpt: item.description || 'No description available',
      image_url: item.urlToImage || '/News.jpg',
      featured: index === 0, 
      tag: item.source.name,
      created_at: item.publishedAt,
      url: item.url, 
    }));

    return NextResponse.json({ success: true, data: articles });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


function mapCategory(article: any): string {
  const text = `${article.title} ${article.description}`.toLowerCase();
  if (text.includes('match') || text.includes('report')) return 'match-report';
  if (text.includes('opinion') || text.includes('analysis')) return 'opinion';
  if (text.includes('transfer') || text.includes('sign')) return 'transfer';
  if (text.includes('sri lanka') || text.includes('lanka')) return 'sri-lanka';
  return 'match-report'; 
}