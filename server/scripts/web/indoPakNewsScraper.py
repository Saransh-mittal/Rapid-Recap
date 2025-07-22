# Standard library imports
import time
import random
import os
import logging
from urllib.parse import urljoin
import json
import asyncio
from datetime import datetime, timedelta
import re

# Third-party libraries
import requests
import feedparser
from fake_useragent import UserAgent
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from playwright_stealth import Stealth
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords

# nest_asyncio for running asyncio in environments like Jupyter/Colab
import nest_asyncio
nest_asyncio.apply()

# --- Configuration ---
LOG_FILE = 'geopolitical_scraper_log.txt'
CONCURRENT_SCRAPES = 6
RELEVANCE_THRESHOLD = 2
MAX_ARTICLES = 20

# --- Setup ---
SEMAPHORE = asyncio.Semaphore(CONCURRENT_SCRAPES)

def setup_environment():
    """Download NLTK data and configure logging."""
    for lib in ['punkt', 'stopwords']:
        try:
            nltk.data.find(f'tokenizers/{lib}' if lib == 'punkt' else f'corpora/{lib}')
        except LookupError:
            nltk.download(lib, quiet=True)

    if logging.getLogger('').hasHandlers():
        logging.getLogger('').handlers.clear()
    logging.basicConfig(filename=LOG_FILE, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(module)s - %(message)s')
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logging.getLogger('').addHandler(console_handler)

setup_environment()
ua = UserAgent()
stealth = Stealth()

# --- Keywords for Indo-Pak Geopolitical News with Scoring System ---
PRIMARY_KEYWORDS = {
    'india-pakistan': 4, 'indo-pak': 4, 'loc': 3, 'line of control': 4, 'ceasefire violation': 4,
    'kashmir conflict': 4, 'jammu and kashmir': 3, 'balakot': 4, 'pulwama': 4,
    'surgical strike': 4, 'cross-border firing': 3, 'infiltration': 3, 'militants': 2,
    'terror attack': 3, 'drone sighting': 3, 'uav': 2, 'indian army': 2, 'pakistan army': 2,
    'border dispute': 3, 'geopolitical tension': 3, 'sialkot': 2, 'rawalpindi': 2,
    'srinagar': 2, 'islamabad': 2, 'new delhi': 1, 'dgmo': 3, 'foreign ministry statement': 2,
    'diplomatic tension': 3, 'airspace violation': 4, 'defence minister': 2, 'national security advisor': 2,
}

SECONDARY_KEYWORDS = {
    'border security': 1, 'military exercise': 1, 'ceasefire': 2, 'peace talks': 2,
    'bilateral relations': 1, 'trade relations': 1, 'cricket diplomacy': 1, 'kargil': 2,
    'uri attack': 3, 'pathankot': 2, 'terrorist incident': 2, 'border skirmish': 2
}

ALL_KEYWORDS = {**PRIMARY_KEYWORDS, **SECONDARY_KEYWORDS}

def calculate_relevance_score(text_content):
    """Calculate relevance score based on keyword matches."""
    if not text_content:
        return 0
    text_lower = text_content.lower()
    score = 0
    for keyword, value in ALL_KEYWORDS.items():
        if keyword in text_lower:
            score += value
    return score

def extract_publish_date(entry):
    """Extract publish date from RSS entry."""
    try:
        if hasattr(entry, 'published_parsed') and entry.published_parsed:
            return datetime(*entry.published_parsed[:6])
        elif hasattr(entry, 'published') and entry.published:
            # Try to parse published string
            for fmt in ['%a, %d %b %Y %H:%M:%S %Z', '%Y-%m-%dT%H:%M:%S%z', '%Y-%m-%d %H:%M:%S']:
                try:
                    return datetime.strptime(entry.published.strip(), fmt)
                except:
                    continue
    except:
        pass
    return datetime.now() - timedelta(hours=random.randint(1, 24))

def is_relevant(text_content):
    """Check if content is relevant based on minimum threshold."""
    return calculate_relevance_score(text_content) >= RELEVANCE_THRESHOLD

# --- Indo-Pak News Sources and Selectors with Image Extraction ---
sources = [
    {
        'name': 'Al Jazeera',
        'rss': 'https://www.aljazeera.com/xml/rss/all.xml',
        'url': 'https://www.aljazeera.com/news/',
        'headline_selector': 'h3.gc__title a, .article-card__title a',
        'body_selector': 'main#main-content article p, .wysiwyg p',
        'img_selector': 'figure.article-featured-image img, .featured-media img',
        'dynamic': True
    },
    {
        'name': 'NDTV',
        'rss': 'https://feeds.feedburner.com/ndtvnews-latest',
        'url': 'https://www.ndtv.com/india-news',
        'headline_selector': 'div.news_Itm-hd a',
        'body_selector': 'div#ins_storybody p, .story__content p',
        'img_selector': 'div.ins_mainimage img, .story-featured-image img',
        'dynamic': True
    },
    {
        'name': 'Dawn',
        'rss': 'https://www.dawn.com/feeds/home',
        'url': 'https://www.dawn.com/pakistan',
        'headline_selector': 'article.story a.story__link',
        'body_selector': 'div.story__content p',
        'img_selector': 'figure.media--featured img, .story__featured-image img',
        'dynamic': False
    },
    {
        'name': 'The News International',
        'rss': 'https://www.thenews.com.pk/rss/1/1',
        'url': 'https://www.thenews.com.pk/latest-stories',
        'headline_selector': 'div.story-link-box h2 a',
        'body_selector': 'div.story-detail-text p',
        'img_selector': 'div.story-detail-left img.detail-pic, .featured-image img',
        'dynamic': False
    },
    {
        'name': 'BBC News - Asia',
        'rss': 'http://feeds.bbci.co.uk/news/world/asia/rss.xml',
        'url': 'https://www.bbc.com/news/world/asia',
        'headline_selector': 'a[data-testid="internal-link"]',
        'body_selector': 'main#main-content article p, article p[data-component="text-block"]',
        'img_selector': 'div[data-component="image-block"] img, .story-body__image img',
        'dynamic': True
    },
    {
        'name': 'The Hindu - National',
        'rss': 'https://www.thehindu.com/news/national/feeder/default.rss',
        'url': 'https://www.thehindu.com/news/national/',
        'headline_selector': 'h2.story-card75x1-heading a, h3.story-card-33-heading a, .story-card a.title',
        'body_selector': 'div[itemprop="articleBody"] p, div.articlebodycontent > p',
        'img_selector': 'picture.article-picture img, .lead-img img',
        'dynamic': True
    }
]

URL_EXCLUSION_PATTERNS = ['/videos/', '/gallery/', '/live-updates/', '/weather/']

# --- Scraping & Discovery Functions ---
def discover_links_from_rss(source_config):
    """Discover relevant Indo-Pak news links from RSS feeds."""
    discovered = []
    headers = {'User-Agent': ua.random}
    try:
        response = requests.get(source_config['rss'], headers=headers, timeout=20)
        response.raise_for_status()
        feed = feedparser.parse(response.content)

        for entry in feed.entries:
            content_to_check = f"{entry.get('title', '')} {BeautifulSoup(entry.get('summary', ''), 'html.parser').get_text(strip=True)}"
            link_url = entry.get('link', '')

            if is_relevant(content_to_check) and link_url and not any(pat in link_url for pat in URL_EXCLUSION_PATTERNS):
                discovered.append({
                    'url': link_url,
                    'source_name': source_config['name'],
                    'title': entry.get('title', ''),
                    'relevance_score': calculate_relevance_score(content_to_check),
                    'published_date': extract_publish_date(entry),
                    'summary': BeautifulSoup(entry.get('summary', ''), 'html.parser').get_text(strip=True)[:200]
                })
    except Exception as e:
        logging.warning(f"Could not process RSS for {source_config['name']}: {e}")
    return discovered

async def discover_links_from_html(context, source_config):
    """Discover relevant Indo-Pak news links from HTML pages."""
    discovered = []
    try:
        page = await context.new_page()
        await page.goto(source_config['url'], wait_until='domcontentloaded', timeout=45000)

        for link in await page.query_selector_all(source_config['headline_selector']):
            title_hint = await link.inner_text()
            if is_relevant(title_hint):
                href = await link.get_attribute('href')
                if href and not any(pat in href for pat in URL_EXCLUSION_PATTERNS):
                    discovered.append({
                        'url': urljoin(source_config['url'], href),
                        'source_name': source_config['name'],
                        'title': title_hint,
                        'relevance_score': calculate_relevance_score(title_hint),
                        'published_date': datetime.now() - timedelta(hours=random.randint(1, 12))
                    })
        await page.close()
    except Exception as e:
        logging.warning(f"Could not discover from HTML for {source_config['name']}: {e}")
    return discovered

async def block_unnecessary_resources(route):
    """Block unnecessary resources to speed up scraping."""
    if route.request.resource_type in ["stylesheet", "font", "media", "other"]:
        await route.abort()
    else:
        await route.continue_()

async def scrape_full_article_page(context, discovered_item, source_config):
    """Scrape the full content of an article page including images."""
    async with SEMAPHORE:
        page = None
        try:
            url = discovered_item['url']
            logging.info(f"Deep scraping: {url}")
            page = await context.new_page()
            await page.route("**/*", block_unnecessary_resources)
            await page.goto(url, wait_until='domcontentloaded', timeout=45000)

            # Extract body content
            body_text = await page.locator(source_config['body_selector']).all_inner_texts()
            body = ' '.join(body_text).strip()

            if len(body) < 300:
                logging.warning(f"Body too short ({len(body)} chars). Discarding: {url}")
                return None

            # Extract title
            title = await page.title()

            # Extract image URL with multiple fallback methods
            imgURL = ''

            # Method 1: Open Graph image
            og_image_element = await page.query_selector("meta[property='og:image']")
            if og_image_element:
                imgURL = await og_image_element.get_attribute('content')

            # Method 2: Twitter image fallback
            if not imgURL:
                twitter_image_element = await page.query_selector("meta[property='twitter:image']")
                if twitter_image_element:
                    imgURL = await twitter_image_element.get_attribute('content')

            # Method 3: Source-specific image selector fallback
            if not imgURL and source_config.get('img_selector'):
                img_element = await page.query_selector(source_config['img_selector'])
                if img_element:
                    imgURL = await img_element.get_attribute('src')
                    if imgURL and not imgURL.startswith('http'):
                        imgURL = urljoin(url, imgURL)

            # Calculate final relevance score including body content
            final_relevance_score = calculate_relevance_score(f"{title} {body}")

            return {
                'source': source_config['name'],
                'title': title,
                'url': url,
                'body': body,
                'imgURL': imgURL or '',
                'relevance_score': final_relevance_score,
                'published_date': discovered_item.get('published_date', datetime.now()),
                'summary': discovered_item.get('summary', '')
            }
        except Exception as e:
            logging.error(f"Failed to scrape full page {discovered_item['url']}: {type(e).__name__}")
            return None
        finally:
            if page:
                await page.close()

def calculate_article_quality_score(article):
    """Calculate overall quality score for ranking articles."""
    if not article:
        return 0

    # Relevance score (40% weight)
    relevance_score = min(article.get('relevance_score', 0) / 15, 1.0) * 0.4

    # Recency score (30% weight) - more recent articles get higher scores
    hours_ago = (datetime.now() - article.get('published_date', datetime.now())).total_seconds() / 3600
    recency_score = max(0, (24 - hours_ago) / 24) * 0.3

    # Content length score (20% weight)
    length_score = min(1.0, len(article.get('body', '')) / 2000) * 0.2

    # Source reliability (10% weight)
    reliable_sources = ['BBC News - Asia', 'The Hindu - National', 'Dawn', 'Al Jazeera']
    source_score = 0.1 if article.get('source') in reliable_sources else 0.05

    return relevance_score + recency_score + length_score + source_score

def filter_high_quality_geopolitical_content(article):
    """Add boost score based on important geopolitical terms."""
    # Combine title and body into a single string for searching
    combined_text = (article.get('body', '') + article.get('title', '')).lower()

    breaking_terms = ['breaking', 'urgent', 'developing', 'alert', 'escalation', 'tension rises']
    high_impact_terms = ['ceasefire violation', 'cross-border', 'surgical strike', 'terror attack', 'diplomatic crisis']

    boost_score = 0
    # Check for breaking news terms
    if any(term in combined_text for term in breaking_terms):
        boost_score += 0.1
    # Check for high-impact geopolitical terms
    if any(term in combined_text for term in high_impact_terms):
        boost_score += 0.15

    return boost_score

# --- Main Execution Logic ---
async def main():
    logging.info("--- Starting Indo-Pak News Scraper (Top 20 Articles) ---")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent=ua.random)
        await stealth.apply_stealth_async(context)

        # --- PHASE 1: DISCOVERY ---
        logging.info("--- Phase 1: Discovering relevant Indo-Pak URLs... ---")
        discovery_tasks = [asyncio.to_thread(discover_links_from_rss, s) for s in sources]
        discovery_tasks.extend([discover_links_from_html(context, s) for s in sources if s['dynamic']])

        all_discovered = []
        for sublist in await asyncio.gather(*discovery_tasks):
            all_discovered.extend(sublist)

        # Sort by relevance and recency
        all_discovered.sort(key=lambda x: (x.get('relevance_score', 0), x.get('published_date', datetime.min)), reverse=True)

        # Remove duplicates and limit candidates
        unique_links = {item['url']: item for item in all_discovered if item.get('url')}
        links_to_scrape = list(unique_links.values())[:MAX_ARTICLES * 2]

        logging.info(f"Discovered {len(unique_links)} unique Indo-Pak URLs, selected top {len(links_to_scrape)} for scraping.")

        if not links_to_scrape:
            await browser.close()
            return []

        # --- PHASE 2: DEEP SCRAPING ---
        logging.info(f"\n--- Phase 2: Deep scraping {len(links_to_scrape)} Indo-Pak articles... ---")
        source_map = {s['name']: s for s in sources}
        scraping_tasks = [scrape_full_article_page(context, link, source_map[link['source_name']]) for link in links_to_scrape]

        scraped_articles_raw = await asyncio.gather(*scraping_tasks)
        scraped_articles = [a for a in scraped_articles_raw if a]
        await browser.close()

    # --- PHASE 3: PROCESSING AND RANKING ---
    logging.info(f"\n--- Phase 3: Processing and ranking {len(scraped_articles)} successfully scraped Indo-Pak articles... ---")

    # Calculate quality scores and apply geopolitical-specific boosts
    for article in scraped_articles:
        base_score = calculate_article_quality_score(article)
        geopolitical_boost = filter_high_quality_geopolitical_content(article)
        article['quality_score'] = base_score + geopolitical_boost

    # Sort by quality score and take top articles
    scraped_articles.sort(key=lambda x: x.get('quality_score', 0), reverse=True)
    top_articles = scraped_articles[:MAX_ARTICLES]

    # Clean up internal fields for final output
    for article in top_articles:
        if 'relevance_score' in article:
            del article['relevance_score']
        if 'quality_score' in article:
            del article['quality_score']
        if 'published_date' in article:
            article['published'] = article.pop('published_date').isoformat()

    logging.info(f"Selected top {len(top_articles)} highest quality Indo-Pak articles.")
    return top_articles

if __name__ == '__main__':
    final_articles_list = asyncio.run(main())
    print(json.dumps(final_articles_list, indent=2, ensure_ascii=False))
