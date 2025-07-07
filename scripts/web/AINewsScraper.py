# Standard library imports
import time
import random
import os
import logging
from urllib.parse import urljoin
import json
import asyncio
from datetime import datetime, timedelta, timezone
import re

# Third-party libraries
import requests
import feedparser
from fake_useragent import UserAgent
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from playwright_stealth import Stealth
import nltk
from nltk.corpus import stopwords
from nltk.metrics.distance import jaccard_distance

# nest_asyncio for running asyncio in environments like Jupyter/Colab
import nest_asyncio
nest_asyncio.apply()

# --- Configuration ---
LOG_FILE = 'ai_news_scraper_log.txt'
CONCURRENT_SCRAPES = 5
RELEVANCE_THRESHOLD = 2
MAX_ARTICLES = 20
MAX_ARTICLE_AGE_DAYS = 3
DEDUPLICATION_TITLE_SIMILARITY_THRESHOLD = 0.8

# --- Setup ---
SEMAPHORE = asyncio.Semaphore(CONCURRENT_SCRAPES)

def setup_environment():
    """Download NLTK data and configure logging."""
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        print("Downloading NLTK 'stopwords' data...")
        nltk.download('stopwords', quiet=True)
        print("Download complete.")

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
stop_words = set(stopwords.words('english'))

# --- AI-focused Keywords with Enhanced Scoring System ---
PRIMARY_KEYWORDS = {
    'artificial intelligence': 4, 'ai': 3, 'machine learning': 4, 'ml': 3, 'large language model': 5,
    'llm': 4, 'generative ai': 5, 'neural network': 4, 'deep learning': 4, 'openai': 5, 'chatgpt': 5,
    'google deepmind': 5, 'gemini': 4, 'anthropic': 5, 'claude': 4, 'nvidia': 4, 'ai ethics': 4,
    'ai safety': 4, 'natural language processing': 4, 'nlp': 3, 'ai model': 3, 'ai chip': 4,
    'meta ai': 4, 'microsoft ai': 4, 'apple ai': 4, 'stable diffusion': 4, 'midjourney': 4,
    'ai regulation': 4, 'agi': 5, 'artificial general intelligence': 5, 'transformer model': 4,
    'gpt-4': 5, 'gpt-5': 5, 'claude 3': 4, 'llama': 4, 'sora': 5, 'groq': 4, 'gemma': 4
}

SECONDARY_KEYWORDS = {
    'data science': 2, 'computer vision': 2, 'robotics': 2, 'automation': 1, 'ai breakthrough': 3,
    'ai research': 3, 'ai startup': 2, 'ai investment': 2, 'ai application': 2, 'ai technology': 2,
    'machine intelligence': 2, 'ai assistant': 3, 'chatbot': 2, 'voice assistant': 2,
    'ai innovation': 2, 'ai development': 2, 'ai algorithm': 2, 'ai training': 2
}

ALL_KEYWORDS = {**PRIMARY_KEYWORDS, **SECONDARY_KEYWORDS}

def calculate_relevance_score(text_content):
    """Calculate relevance score based on keyword matches in the text."""
    if not text_content:
        return 0
    text_lower = text_content.lower()
    score = 0
    for keyword, value in ALL_KEYWORDS.items():
        if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower):
            score += value
    return score

def extract_publish_date(entry):
    """Extract publish date from RSS entry, making it timezone-aware."""
    now_aware = datetime.now(timezone.utc)
    for attr in ['published_parsed', 'updated_parsed']:
        if hasattr(entry, attr) and getattr(entry, attr):
            try:
                dt_naive = datetime(*getattr(entry, attr)[:6])
                return dt_naive.replace(tzinfo=timezone.utc)
            except (ValueError, TypeError):
                continue
    for date_str_attr in ['published', 'updated']:
         if hasattr(entry, date_str_attr):
            date_str = getattr(entry, date_str_attr)
            try:
                parsed_time = feedparser._parse_date(date_str)
                if parsed_time:
                    dt_naive = datetime(*parsed_time[:6])
                    return dt_naive.replace(tzinfo=timezone.utc)
            except Exception:
                continue
    return now_aware

# --- EXPANDED & CORRECTED NEWS SOURCES ---
sources = [
    {
        'name': 'TechCrunch AI',
        'rss': 'https://techcrunch.com/category/artificial-intelligence/feed/',
        'body_selector': 'div.entry-content', # <-- UPDATED: More specific and reliable selector
        'img_selector': 'article img, div.article-content img', # Keeping image selector broad
        'reliability': 0.9
    },
    {
        'name': 'VentureBeat AI',
        'rss': 'https://venturebeat.com/category/ai/feed/',
        'body_selector': 'div.article-content',
        'img_selector': 'div.article-media img, div.article-content img',
        'reliability': 0.9
    },
    {
        'name': 'Ars Technica AI',
        'rss': 'https://arstechnica.com/tag/ai/feed/',
        'body_selector': 'div[itemprop="articleBody"]',
        'img_selector': 'figure.intro-image img.responsive-image, div.embedded-image-strip img',
        'reliability': 0.95
    },
    {
        'name': 'MIT Technology Review',
        'rss': 'https://www.technologyreview.com/c/artificial-intelligence/feed/',
        'body_selector': 'div.body-content, main#content',
        'img_selector': 'figure.tr-image-and-credit__image-wrapper img, main#content img',
        'reliability': 1.0
    },
    {
        'name': 'WIRED AI',
        'rss': 'https://www.wired.com/feed/tag/ai/latest/rss',
        'body_selector': 'article > div.body__inner-container, div[data-testid="ArticlePageChunks"]', # <-- UPDATED: More robust selector
        'img_selector': 'div[class*="lede__image-wrap"] img, figure img',
        'reliability': 0.85
    },
    {
        'name': 'Hugging Face Blog',
        'rss': 'https://huggingface.co/blog/feed.xml',
        'body_selector': 'div.prose',
        'img_selector': 'header > img, div.prose img',
        'reliability': 1.0
    },
    { # <-- NEW
        'name': 'The Verge AI',
        'rss': 'https://www.theverge.com/rss/group/ai/index.xml',
        'body_selector': 'div.duet--article--article-body-component',
        'img_selector': 'picture > img, figure.duet--article--featured-image img',
        'reliability': 0.9
    },
    { # <-- NEW
        'name': 'NVIDIA Blog',
        'rss': 'https://blogs.nvidia.com/feed/',
        'body_selector': 'div.entry-content',
        'img_selector': 'div.entry-content img',
        'reliability': 1.0
    },
    { # <-- NEW
        'name': 'Google AI Blog',
        'rss': 'https://blog.google/technology/ai/rss/',
        'body_selector': 'div.article-body-container',
        'img_selector': 'div.article-hero-image img, div.article-body-container img',
        'reliability': 1.0
    }
]

URL_EXCLUSION_PATTERNS = ['/video/', '/gallery/', '/live-updates/', '/reviews/', '/deals/']

# --- Scraping & Discovery Functions ---
def discover_links_from_rss(source_config):
    """Discover relevant AI news links from RSS feeds, filtering by age."""
    discovered = []
    headers = {'User-Agent': ua.random}
    try:
        response = requests.get(source_config['rss'], headers=headers, timeout=20)
        response.raise_for_status()
        feed = feedparser.parse(response.content)
        time_threshold = datetime.now(timezone.utc) - timedelta(days=MAX_ARTICLE_AGE_DAYS)
        for entry in feed.entries:
            published_date = extract_publish_date(entry)
            if published_date < time_threshold:
                continue
            title = entry.get('title', '')
            summary_html = entry.get('summary', '')
            summary = BeautifulSoup(summary_html, 'html.parser').get_text(strip=True, separator=' ')
            content_to_check = f"{title} {summary}"
            link_url = entry.get('link', '')
            if link_url and not any(pat in link_url for pat in URL_EXCLUSION_PATTERNS):
                discovered.append({
                    'url': link_url,
                    'source_name': source_config['name'],
                    'title': title,
                    'relevance_score': calculate_relevance_score(content_to_check),
                    'published_date': published_date,
                    'summary': summary[:250] + '...' if len(summary) > 250 else summary
                })
    except requests.exceptions.RequestException as e:
        logging.warning(f"Could not fetch RSS for {source_config['name']}: {e}")
    except Exception as e:
        logging.warning(f"Could not process RSS for {source_config['name']}: {e}")
    return discovered

async def block_unnecessary_resources(route):
    """Block resources that are not needed for content extraction."""
    if route.request.resource_type in ["stylesheet", "font", "media", "image", "other"]:
        await route.abort()
    else:
        await route.continue_()

async def scrape_full_article_page(context, discovered_item, source_config):
    """Scrape the full content of an article page."""
    async with SEMAPHORE:
        page = None
        url = discovered_item['url']
        try:
            logging.info(f"Scraping: {url}")
            page = await context.new_page()
            await page.route("**/*", block_unnecessary_resources)
            await page.goto(url, wait_until='domcontentloaded', timeout=45000)

            # Explicitly wait for the selector to appear, helps with dynamic content
            try:
                await page.wait_for_selector(source_config['body_selector'], timeout=10000)
            except PlaywrightTimeoutError:
                logging.warning(f"Timed out waiting for body selector '{source_config['body_selector']}' at {url}. Skipping.")
                return None

            body_element = await page.query_selector(source_config['body_selector'])
            if not body_element:
                logging.warning(f"Body selector '{source_config['body_selector']}' still not found after wait for {url}. Skipping.")
                return None

            body_text = await body_element.inner_text()
            body = re.sub(r'\s+', ' ', body_text).strip()

            if len(body) < 250:
                logging.warning(f"Body too short ({len(body)} chars). Discarding: {url}")
                return None

            title = await page.title()
            imgURL = ''
            for selector in ["meta[property='og:image']", "meta[property='twitter:image']", source_config['img_selector']]:
                element = await page.query_selector(selector)
                if element:
                    attr = 'content' if selector.startswith('meta') else 'src'
                    imgURL_raw = await element.get_attribute(attr)
                    if imgURL_raw:
                        imgURL = urljoin(url, imgURL_raw.strip())
                        break

            final_relevance_score = calculate_relevance_score(f"{title} {body}")
            if final_relevance_score < RELEVANCE_THRESHOLD:
                logging.info(f"Article {url} failed final relevance check (score: {final_relevance_score}).")
                return None

            published_date = discovered_item.get('published_date', datetime.now(timezone.utc))
            if published_date.tzinfo is None:
                 published_date = published_date.replace(tzinfo=timezone.utc)

            return {
                'source': source_config['name'],
                'title': title,
                'url': url,
                'body': body,
                'imgURL': imgURL or '',
                'relevance_score': final_relevance_score,
                'published_date': published_date,
                'summary': discovered_item.get('summary', body[:250] + '...')
            }
        except PlaywrightTimeoutError:
            logging.error(f"Timeout while scraping page {url}")
            return None
        except Exception as e:
            logging.error(f"Failed to scrape full page {url}: {type(e).__name__}: {e}")
            return None
        finally:
            if page:
                await page.close()

# --- Processing & Ranking ---
def normalize_title(title):
    cleaned_title = re.sub(r'[^a-z0-9\s]', '', title.lower())
    tokens = cleaned_title.split()
    return set(token for token in tokens if token not in stop_words)

def is_duplicate_article(new_article, existing_articles, threshold):
    new_title_normalized = normalize_title(new_article['title'])
    if not new_title_normalized: return False
    for existing_article in existing_articles:
        existing_title_normalized = normalize_title(existing_article['title'])
        if not existing_title_normalized: continue
        similarity = 1 - jaccard_distance(new_title_normalized, existing_title_normalized)
        if similarity > threshold:
            logging.info(f"Duplicate detected. '{new_article['title']}' is similar to '{existing_article['title']}'")
            return True
    return False

def calculate_article_quality_score(article, source_config):
    if not article: return 0
    relevance_score = min(article.get('relevance_score', 0) / 25, 1.0) * 0.40
    now_aware = datetime.now(timezone.utc)
    published_date = article.get('published_date', now_aware)
    if published_date.tzinfo is None:
        published_date = published_date.replace(tzinfo=timezone.utc)
    hours_ago = (now_aware - published_date).total_seconds() / 3600
    recency_score = max(0, (72 - hours_ago) / 72) * 0.25
    length_score = min(1.0, len(article.get('body', '')) / 2000) * 0.15
    source_reliability_score = source_config.get('reliability', 0.5) * 0.20
    image_boost = 0.05 if article.get('imgURL') else 0
    boost_score = 0
    combined_text = (article.get('body', '') + article.get('title', '')).lower()
    if any(term in combined_text for term in ['launches', 'releases', 'announces', 'unveils', 'introduces']):
        if any(company in combined_text for company in ['openai', 'google', 'microsoft', 'meta', 'anthropic', 'nvidia', 'apple']):
            boost_score = 0.15
    return relevance_score + recency_score + length_score + source_reliability_score + image_boost + boost_score

# --- Main Execution Logic ---
async def main():
    logging.info("--- Starting AI News Scraper (AI-Focused Sources) ---")
    start_time = time.time()
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(user_agent=ua.random)
        await stealth.apply_stealth_async(context)
        logging.info("--- Phase 1: Discovering URLs from AI-specific RSS feeds... ---")
        discovery_tasks = [asyncio.to_thread(discover_links_from_rss, s) for s in sources]
        all_discovered = [item for sublist in await asyncio.gather(*discovery_tasks) for item in sublist]
        logging.info(f"Discovered {len(all_discovered)} recent articles within the last {MAX_ARTICLE_AGE_DAYS} days.")
        all_discovered.sort(key=lambda x: (x.get('relevance_score', 0), x.get('published_date', datetime.min)), reverse=True)
        unique_links = {item['url']: item for item in all_discovered}.values()
        links_to_scrape = list(unique_links)[:MAX_ARTICLES * 3]
        logging.info(f"Selected {len(links_to_scrape)} unique, most relevant articles for full scraping.")
        if not links_to_scrape:
            logging.info("No new articles found to scrape. Exiting.")
            await browser.close()
            return []
        logging.info(f"\n--- Phase 2: Deep scraping {len(links_to_scrape)} articles... ---")
        source_map = {s['name']: s for s in sources}
        scraping_tasks = [scrape_full_article_page(context, link, source_map[link['source_name']]) for link in links_to_scrape]
        scraped_articles_raw = await asyncio.gather(*scraping_tasks)
        await browser.close()
    scraped_articles_valid = [a for a in scraped_articles_raw if a]
    logging.info(f"\n--- Phase 3: Processing and ranking {len(scraped_articles_valid)} successfully scraped articles... ---")
    unique_articles = []
    scraped_articles_valid.sort(key=lambda x: x.get('published_date', datetime.min), reverse=True)
    for article in scraped_articles_valid:
        if not is_duplicate_article(article, unique_articles, DEDUPLICATION_TITLE_SIMILARITY_THRESHOLD):
            unique_articles.append(article)
    logging.info(f"Filtered down to {len(unique_articles)} articles after deduplication.")
    for article in unique_articles:
        source_config = source_map[article['source']]
        article['quality_score'] = calculate_article_quality_score(article, source_config)
    unique_articles.sort(key=lambda x: x.get('quality_score', 0), reverse=True)
    top_articles = unique_articles[:MAX_ARTICLES]
    for article in top_articles:
        article.pop('relevance_score', None)
        article.pop('quality_score', None)
        if 'published_date' in article:
            article['published'] = article.pop('published_date').isoformat()
    logging.info(f"--- Scraping complete in {time.time() - start_time:.2f} seconds. Final count: {len(top_articles)} articles. ---")
    return top_articles

if __name__ == '__main__':
    final_articles_list = asyncio.run(main())
    print(json.dumps(final_articles_list, indent=2, ensure_ascii=False))
