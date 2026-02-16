"""
Forge Content Scraper - MongoDB Integration
Fetches articles from RSS feeds and saves to MongoDB for Forge pipeline processing
"""

import feedparser
import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
from typing import List, Dict, Optional
import random
import time
from collections import defaultdict
import sys
import json
import os
from pymongo import MongoClient
from bson import ObjectId
import hashlib
import certifi

# ============================================================================
# MONGODB CONNECTION
# ============================================================================

def get_mongodb_connection():
    """
    Connect to MongoDB using connection string from environment
    """
    # Get MongoDB URI from environment or use default
    mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/rapidrecap').strip()

    try:
        # Atlas TLS can fail on some hosts unless CA bundle is provided explicitly.
        client = MongoClient(mongo_uri, tls=True, tlsCAFile=certifi.where())
        db = client.get_database()
        return db
    except Exception as e:
        print(f"MongoDB connection error: {e}", file=sys.stderr)
        sys.exit(1)

# ============================================================================
# OPTIMIZED SOURCES
# ============================================================================

SOURCES = {
    "GK_CURRENT_AFFAIRS": {
        "category": "India & World",
        "sources": [
            # -- INDIAN SOURCES (80%) --
            {
                "name": "Press Information Bureau (PIB)",
                "type": "rss",
                "url": "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3",
                "subtype": "Government Schemes & Policy"
            },
            {
                "name": "The Hindu National",
                "type": "rss",
                "url": "https://www.thehindu.com/news/national/feeder/default.rss",
                "subtype": "National Affairs"
            },
            {
                "name": "Indian Express Explained",
                "type": "rss",
                "url": "https://indianexpress.com/section/explained/feed/",
                "subtype": "In-Depth Analysis"
            },
            {
                "name": "ISRO News",
                "type": "rss",
                "url": "https://www.isro.gov.in/rss.xml",
                "subtype": "Space & Science"
            },
            # -- GLOBAL SOURCES (20%) --
            {
                "name": "BBC News Science",
                "type": "rss",
                "url": "http://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
                "subtype": "World Basics"
            },
            {
                "name": "Smithsonian Smart News",
                "type": "rss",
                "url": "https://www.smithsonianmag.com/rss/smart-news/",
                "subtype": "History & Culture"
            }
        ]
    },

    "SCIENCE_TECH": {
        "category": "Science & Technology",
        "sources": [
            # -- INDIAN SOURCES --
            {
                "name": "Down To Earth Science",
                "type": "rss",
                "url": "https://www.downtoearth.org.in/rss/science-technology",
                "subtype": "Environment & Science"
            },
            {
                "name": "India Science Wire",
                "type": "rss",
                "url": "https://vigyanprasar.gov.in/isw/rss",
                "subtype": "Indian Research"
            },
            # -- GLOBAL SOURCES --
            {
                "name": "LiveScience",
                "type": "rss",
                "url": "https://www.livescience.com/feeds/all",
                "subtype": "Biology & Health"
            },
             {
                "name": "Phys.org",
                "type": "rss",
                "url": "https://phys.org/rss-feed/",
                "subtype": "Physics & Tech"
            },
            {
                "name": "Scientific American",
                "type": "rss",
                "url": "http://rss.sciam.com/ScientificAmerican-Global",
                "subtype": "Science in Daily Life"
            }
        ]
    },

    "TECH_INNOVATIONS": {
        "category": "Tech Innovations",
        "sources": [
            # -- INDIAN SOURCES --
            {
                "name": "Medianama",
                "type": "rss",
                "url": "https://www.medianama.com/feed/",
                "subtype": "Digital Policy & India"
            },
            {
                "name": "Inc42",
                "type": "rss",
                "url": "https://inc42.com/feed/",
                "subtype": "Startups & Innovation"
            },
            {
                "name": "The Hindu Sci-Tech",
                "type": "rss",
                "url": "https://www.thehindu.com/sci-tech/feeder/default.rss",
                "subtype": "Science & Tech"
            },
             # -- GLOBAL SOURCES --
            {
                "name": "Ars Technica",
                "type": "rss",
                "url": "http://feeds.arstechnica.com/arstechnica/index",
                "subtype": "Tech Behind Daily Life"
            }
        ]
    },

    "GEOGRAPHY_ENV": {
        "category": "Geography & Environment",
        "sources": [
             # -- INDIAN SOURCES --
            {
                "name": "Mongabay India",
                "type": "rss",
                "url": "https://india.mongabay.com/feed/",
                "subtype": "Nature & Conservation"
            },
            {
                "name": "The Hindu Environment",
                "type": "rss",
                "url": "https://www.thehindu.com/sci-tech/energy-and-environment/feeder/default.rss",
                "subtype": "Environment & Climate"
            },
            # -- GLOBAL SOURCES --
             {
                "name": "UN News Climate",
                "type": "rss",
                "url": "https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml",
                "subtype": "Climate & Policy"
            },
             {
                "name": "The Guardian Environment",
                "type": "rss",
                "url": "https://www.theguardian.com/environment/rss",
                "subtype": "Global Environment"
            }
        ]
    }
}

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
]

# ============================================================================
# CONTENT PROCESSOR
# ============================================================================

class ContentProcessor:
    @staticmethod
    def count_words(text: str) -> int:
        return len(text.split()) if text else 0

    @staticmethod
    def generate_summary(full_text: str, target_words: int = 200) -> str:
        """Generate a summary from full text"""
        if not full_text:
            return ""

        sentences = re.split(r'[.!?]+\s+', full_text)
        summary_parts = []
        word_count = 0

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            sentence_words = len(sentence.split())

            if word_count + sentence_words <= target_words:
                summary_parts.append(sentence)
                word_count += sentence_words
            else:
                if word_count >= target_words * 0.7:
                    break
                summary_parts.append(sentence)
                break

        summary = '. '.join(summary_parts)
        if summary and not summary.endswith('.'):
            summary += '.'

        return summary

    @staticmethod
    def extract_keywords(text: str, max_keywords: int = 5) -> List[str]:
        """Extract simple keywords from text"""
        # Remove common words
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                       'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
                       'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
                       'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'}

        # Clean and split text
        words = re.findall(r'\b[a-z]{4,}\b', text.lower())

        # Filter and count
        word_freq = defaultdict(int)
        for word in words:
            if word not in common_words:
                word_freq[word] += 1

        # Get top keywords
        keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, _ in keywords[:max_keywords]]

    @staticmethod
    def calculate_avg_read_time(text: str) -> int:
        """Calculate average reading time in minutes"""
        words = len(text.split())
        # Assuming 200 words per minute reading speed
        minutes = max(1, round(words / 200))
        return minutes

# ============================================================================
# CONTENT EXTRACTOR
# ============================================================================

class ContentExtractor:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': random.choice(USER_AGENTS)})
        self.processor = ContentProcessor()

    def extract_content(self, url: str) -> Dict:
        """Extract article content from URL"""
        try:
            # Try newspaper3k first
            try:
                from newspaper import Article
                article = Article(url)
                article.download()
                article.parse()

                if len(article.text) > 100:
                    full_text = article.text
                    summary = self.processor.generate_summary(full_text, target_words=200)

                    return {
                        "success": True,
                        "method": "newspaper3k",
                        "title": article.title,
                        "full_content": full_text,
                        "summary": summary,
                        "image": article.top_image or "",
                        "error": None
                    }
            except Exception:
                pass

            # Fallback: BeautifulSoup
            response = self.session.get(url, timeout=30, allow_redirects=True)

            if response.status_code == 422:
                return {"success": False, "method": "blocked", "error": "Blocked"}

            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')

            # Remove unwanted elements
            for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
                tag.decompose()

            # Extract title
            title = ""
            if soup.title:
                title = soup.title.string.strip() if soup.title.string else ""

            # Extract image
            image_url = ""
            og_image = soup.find('meta', property='og:image')
            if og_image and og_image.get('content'):
                image_url = og_image['content']

            # Extract paragraphs
            paragraphs = soup.find_all('p')
            text_parts = [p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 30]
            full_text = ' '.join(text_parts)

            if len(full_text) > 100:
                summary = self.processor.generate_summary(full_text, target_words=200)

                return {
                    "success": True,
                    "method": "beautifulsoup",
                    "title": title,
                    "full_content": full_text,
                    "summary": summary,
                    "image": image_url,
                    "error": None
                }

            return {"success": False, "method": "beautifulsoup", "error": "Insufficient content"}

        except Exception as e:
            return {"success": False, "method": "failed", "error": str(e)[:100]}

# ============================================================================
# MONGODB ARTICLE SAVER
# ============================================================================

class ArticleSaver:
    def __init__(self, db):
        self.db = db
        self.articles_collection = db['Articles']
        self.processor = ContentProcessor()

    def article_exists(self, title: str, url: str) -> bool:
        """Check if article already exists by title or URL"""
        existing = self.articles_collection.find_one({
            '$or': [
                {'title': title},
                {'url': url}
            ]
        })
        return existing is not None

    def save_article(self, article_data: Dict) -> Dict:
        """
        Save article to MongoDB with forgeStatus: 'pending'
        Returns: {success: bool, article_id: str, message: str}
        """
        try:
            # Check for duplicates
            if self.article_exists(article_data['title'], article_data['url']):
                return {
                    'success': False,
                    'reason': 'duplicate',
                    'message': f"Article already exists: {article_data['title']}"
                }

            # Extract keywords
            keywords = self.processor.extract_keywords(
                article_data['title'] + ' ' + article_data['mainText']
            )

            # Calculate read time
            avg_read_time = self.processor.calculate_avg_read_time(article_data['mainText'])

            # Prepare article document matching articleSchema
            article_doc = {
                'url': article_data['url'],
                'dateTime': article_data.get('dateTime', datetime.now().isoformat()),
                'author': article_data.get('author', 'Rapid Recap Team'),
                'hindiAuthor': '',
                'title': article_data['title'],
                'hindiTitle': '',
                'mainText': article_data['mainText'],
                'hindiMainText': [],
                'imgURL': [article_data.get('imgURL', '')] if article_data.get('imgURL') else [],
                'quiz': [],
                'userQuizStatus': [],
                'category': article_data.get('category', 'general'),
                'onBoardingArticleCategory': None,
                'relatedArticles': [],
                'avgReadTime': avg_read_time,
                'quizAttemptCnt': 0,
                'keywords': keywords,
                'description': article_data.get('description', ''),
                'contentVector': [],
                'vectorized': False,
                'articleDifficulty': 0.5,
                'specialCategory': None,
                'specialCategoryAdded': None,
                'inlineQuiz': [],

                # FORGE MODE FIELDS
                'forgeStatus': 'pending',  # Mark as pending for forge processing
                'forgeSeedData': {
                    'seedSource': article_data.get('source', 'RSS Feed'),
                    'seedDate': datetime.now(),
                    'seedBody': article_data['mainText']
                },
                'forgeArticleRef': None,

                'createdAt': datetime.now()
            }

            # Insert into MongoDB
            result = self.articles_collection.insert_one(article_doc)

            return {
                'success': True,
                'article_id': str(result.inserted_id),
                'message': f"Saved: {article_data['title']}"
            }

        except Exception as e:
            return {
                'success': False,
                'reason': 'error',
                'message': f"Error saving article: {str(e)}"
            }

# ============================================================================
# MAIN SCRAPER
# ============================================================================

class ForgeScraper:
    def __init__(self, db):
        self.db = db
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': random.choice(USER_AGENTS)})
        self.extractor = ContentExtractor()
        self.saver = ArticleSaver(db)
        self.processor = ContentProcessor()

        self.stats = {
            'sources_tested': 0,
            'articles_fetched': 0,
            'articles_saved': 0,
            'duplicates': 0,
            'errors': 0,
            'by_category': defaultdict(int)
        }

    def fetch_rss(self, url: str, max_articles: int = 5) -> List[Dict]:
        """Fetch articles from RSS feed."""
        try:
            # Feedparser can fail TLS verification when fetching URL directly in
            # some environments. Fetch the XML with requests first, then parse.
            response = self.session.get(url, timeout=20, allow_redirects=True)
            response.raise_for_status()

            feed = feedparser.parse(response.content)
            if not feed.entries:
                return []

            articles = []
            for entry in feed.entries[:max_articles]:
                articles.append({
                    "title": entry.get("title", ""),
                    "url": entry.get("link", ""),
                    "summary": entry.get("summary", entry.get("description", ""))
                })
            return articles
        except Exception as e:
            print(f"RSS fetch error ({url}): {e}", file=sys.stderr)
            return []

    def process_source(self, source: Dict, category: str) -> None:
        """Process a single RSS source"""
        self.stats['sources_tested'] += 1

        print(f"\n  🔍 {source['name']}", file=sys.stderr)

        # Fetch RSS articles
        raw_articles = self.fetch_rss(source["url"])

        if not raw_articles:
            print(f"    ❌ No articles fetched", file=sys.stderr)
            return

        self.stats['articles_fetched'] += len(raw_articles)
        print(f"    📥 Fetched {len(raw_articles)} articles", file=sys.stderr)

        # Process each article
        for i, article in enumerate(raw_articles, 1):
            print(f"    🔬 Article {i}/{len(raw_articles)}...", end=" ", file=sys.stderr)

            # Extract full content
            extraction = self.extractor.extract_content(article["url"])

            if not extraction["success"]:
                print(f"❌ Failed", file=sys.stderr)
                self.stats['errors'] += 1
                continue

            # Prepare article data for MongoDB
            article_data = {
                'title': extraction.get("title", article["title"]),
                'url': article["url"],
                'mainText': extraction["full_content"],
                'description': extraction.get("summary", article.get("summary", "")),
                'imgURL': extraction.get("image", ""),
                'author': source["name"],
                'category': category.lower().replace(" ", "-"),
                'source': source["name"],
                'dateTime': datetime.now().isoformat()
            }

            # Save to MongoDB
            save_result = self.saver.save_article(article_data)

            if save_result['success']:
                print(f"✅ Saved", file=sys.stderr)
                self.stats['articles_saved'] += 1
                self.stats['by_category'][category] += 1
            elif save_result['reason'] == 'duplicate':
                print(f"⏭️  Duplicate", file=sys.stderr)
                self.stats['duplicates'] += 1
            else:
                print(f"❌ Error", file=sys.stderr)
                self.stats['errors'] += 1

            time.sleep(1)  # Rate limiting

    def run(self, max_sources: int = None):
        """Run the scraper on all sources"""
        print("="*80, file=sys.stderr)
        print("🚀 FORGE CONTENT SCRAPER", file=sys.stderr)
        print("="*80, file=sys.stderr)
        print(f"Start time: {datetime.now().strftime('%H:%M:%S')}\n", file=sys.stderr)

        source_count = 0

        for category_key, category_data in SOURCES.items():
            category_name = category_data["category"]
            sources = category_data["sources"]

            print("\n" + "="*80, file=sys.stderr)
            print(f"📚 CATEGORY: {category_name}", file=sys.stderr)
            print("="*80, file=sys.stderr)

            for source in sources:
                if max_sources and source_count >= max_sources:
                    break

                self.process_source(source, category_name)
                source_count += 1
                time.sleep(2)  # Rate limiting between sources

            if max_sources and source_count >= max_sources:
                break

        self.print_summary()
        return self.stats

    def print_summary(self):
        """Print scraping summary"""
        print("\n" + "="*80, file=sys.stderr)
        print("📊 SCRAPING SUMMARY", file=sys.stderr)
        print("="*80, file=sys.stderr)

        print(f"\n🎯 OVERALL:", file=sys.stderr)
        print(f"   Sources tested: {self.stats['sources_tested']}", file=sys.stderr)
        print(f"   Articles fetched: {self.stats['articles_fetched']}", file=sys.stderr)
        print(f"   Articles saved: {self.stats['articles_saved']}", file=sys.stderr)
        print(f"   Duplicates skipped: {self.stats['duplicates']}", file=sys.stderr)
        print(f"   Errors: {self.stats['errors']}", file=sys.stderr)

        if self.stats['by_category']:
            print(f"\n📈 BY CATEGORY:", file=sys.stderr)
            for cat, count in sorted(self.stats['by_category'].items()):
                print(f"   {cat}: {count}", file=sys.stderr)

        print(f"\n⏰ Completed: {datetime.now().strftime('%H:%M:%S')}", file=sys.stderr)
        print("="*80, file=sys.stderr)

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

def main():
    """Main execution function"""
    # Get MongoDB connection
    db = get_mongodb_connection()

    # Create scraper instance
    scraper = ForgeScraper(db)

    # Get max sources from command line args (optional)
    max_sources = None
    if len(sys.argv) > 1:
        try:
            max_sources = int(sys.argv[1])
        except ValueError:
            pass

    # Run scraper
    stats = scraper.run(max_sources=max_sources)

    # Output results as JSON to stdout (for Node.js to read)
    print(json.dumps({
        'success': True,
        'stats': {
            'sources_tested': stats['sources_tested'],
            'articles_fetched': stats['articles_fetched'],
            'articles_saved': stats['articles_saved'],
            'duplicates': stats['duplicates'],
            'errors': stats['errors'],
            'by_category': dict(stats['by_category'])
        }
    }))

if __name__ == "__main__":
    main()
