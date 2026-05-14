import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) throw new Error('NEWS_API_KEY is missing');

    
    let articleUrl: string;
    try {
      articleUrl = Buffer.from(params.id, 'base64').toString('utf-8');
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid article ID' },
        { status: 400 }
      );
    }

    
    const url = `https://newsapi.org/v2/everything?q=cricket&language=en&pageSize=100&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'Failed to fetch news');
    }


    const article = data.articles.find((item: any) => item.url === articleUrl);

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    const transformed = {
      id: params.id,
      title: article.title,
      category: mapCategory(article),
      excerpt: article.description || 'No description available',
      image_url: article.urlToImage || '/News.jpg',
      featured: false,
      tag: article.source.name,
      created_at: article.publishedAt,
      url: article.url,
    };

    return NextResponse.json({ success: true, data: transformed });
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