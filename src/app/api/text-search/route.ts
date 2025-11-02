import { NextRequest, NextResponse } from 'next/server';

interface Source {
  title: string;
  url: string;
  snippet: string;
  credibility: number;
  relevanceReason: string;
}

// Prioritized domains for credibility scoring
const TIER_1_DOMAINS = ['wikipedia.org', 'dictionary.com', 'knowyourmeme.com', 'merriam-webster.com'];
const TIER_2_DOMAINS = ['archive.org', 'britannica.com', '.edu', '.gov'];
const TIER_3_DOMAINS = ['reddit.com', 'medium.com', 'forbes.com', 'theverge.com'];

function calculateCredibility(url: string, title: string, snippet: string): number {
  const lowerUrl = url.toLowerCase();
  
  // Tier 1: 5 stars
  if (TIER_1_DOMAINS.some(domain => lowerUrl.includes(domain))) {
    return 5;
  }
  
  // Tier 2: 4 stars
  if (TIER_2_DOMAINS.some(domain => lowerUrl.includes(domain))) {
    return 4;
  }
  
  // Tier 3: 3 stars
  if (TIER_3_DOMAINS.some(domain => lowerUrl.includes(domain))) {
    return 3;
  }
  
  // Default: 2 stars for other sources
  return 2;
}

function getRelevanceReason(url: string, searchType: string): string {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('wikipedia')) {
    return 'Comprehensive encyclopedia entry with historical context';
  }
  if (lowerUrl.includes('dictionary.com') || lowerUrl.includes('merriam-webster')) {
    return 'Authoritative dictionary definition';
  }
  if (lowerUrl.includes('knowyourmeme')) {
    return 'Complete cultural context and meme history';
  }
  if (lowerUrl.includes('urbandictionary')) {
    return 'User-generated slang definitions';
  }
  if (lowerUrl.includes('archive.org')) {
    return 'Historical archive of internet content';
  }
  if (lowerUrl.includes('.edu')) {
    return 'Academic source';
  }
  
  return searchType === 'slang' 
    ? 'Provides slang term definition' 
    : 'Relevant contextual information';
}

async function searchDuckDuckGo(query: string): Promise<Source[]> {
  try {
    // DuckDuckGo Instant Answer API (free, no API key needed)
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    );
    
    const data = await response.json();
    const sources: Source[] = [];
    
    // Add abstract if available
    if (data.AbstractURL && data.Abstract) {
      sources.push({
        title: data.Heading || 'DuckDuckGo Result',
        url: data.AbstractURL,
        snippet: data.Abstract,
        credibility: calculateCredibility(data.AbstractURL, data.Heading || '', data.Abstract),
        relevanceReason: getRelevanceReason(data.AbstractURL, 'main')
      });
    }
    
    // Add related topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, 3)) {
        if (topic.FirstURL && topic.Text) {
          sources.push({
            title: topic.Text.split(' - ')[0] || 'Related Topic',
            url: topic.FirstURL,
            snippet: topic.Text,
            credibility: calculateCredibility(topic.FirstURL, topic.Text, topic.Text),
            relevanceReason: getRelevanceReason(topic.FirstURL, 'related')
          });
        }
      }
    }
    
    return sources;
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    return [];
  }
}

// Fallback: Generate curated sources based on keywords
function generateCuratedSources(query: string, searchType: string): Source[] {
  const lowerQuery = query.toLowerCase();
  const sources: Source[] = [];
  
  // Extract key terms from query
  const slangTerms = ['lol', 'omg', 'brb', 'asl', 'thirst trap', 'fire', 'lit', 'fam', 'fr', 'ngl', 
                      'smh', 'tbh', 'idk', 'nvm', 'pwned', 'noob', 'git gud', 'bump'];
  
  const foundTerms = slangTerms.filter(term => lowerQuery.includes(term));
  
  // Generate Wikipedia sources for found terms
  foundTerms.forEach(term => {
    const wikiTitle = term.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
    sources.push({
      title: `${term.toUpperCase()} - Internet Slang`,
      url: `https://en.wikipedia.org/wiki/Internet_slang`,
      snippet: `Comprehensive information about "${term}" and other internet slang terms, their origins, and usage.`,
      credibility: 5,
      relevanceReason: 'Authoritative encyclopedia entry on internet slang'
    });
  });
  
  // Add Know Your Meme for cultural context
  if (foundTerms.length > 0) {
    sources.push({
      title: 'Internet Slang and Memes - Know Your Meme',
      url: 'https://knowyourmeme.com/memes/cultures/slang',
      snippet: 'Database of internet culture, memes, and slang terms with detailed histories and usage examples.',
      credibility: 5,
      relevanceReason: 'Complete cultural context and slang history'
    });
  }
  
  // Add Urban Dictionary
  sources.push({
    title: 'Urban Dictionary - Internet Slang Definitions',
    url: 'https://www.urbandictionary.com/',
    snippet: 'User-generated dictionary for slang words and phrases, including modern internet language.',
    credibility: 3,
    relevanceReason: 'User-generated slang definitions and examples'
  });
  
  // Add Dictionary.com for abbreviations
  sources.push({
    title: 'Internet Abbreviations - Dictionary.com',
    url: 'https://www.dictionary.com/e/acronyms/',
    snippet: 'Official dictionary resource for internet abbreviations, acronyms, and modern language.',
    credibility: 5,
    relevanceReason: 'Authoritative dictionary definitions'
  });
  
  return sources;
}

export async function POST(request: NextRequest) {
  try {
    const { query, searchType = 'main' } = await request.json();
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    // Try DuckDuckGo search first
    let sources = await searchDuckDuckGo(query);
    
    // If no results, use curated sources
    if (sources.length === 0) {
      sources = generateCuratedSources(query, searchType);
    }
    
    // Sort by credibility (highest first)
    sources.sort((a, b) => b.credibility - a.credibility);
    
    // Limit to top 5 sources
    sources = sources.slice(0, 5);
    
    return NextResponse.json({
      success: true,
      query,
      searchType,
      sources,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}