# Standard library imports FIRST

import time
import random
import os
import logging
from urllib.parse import urljoin
import json
import asyncio # Added for async operations
import requests
import feedparser

# Third-party libraries
from fake_useragent import UserAgent
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from playwright_stealth import stealth_async
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords

# THEN nest_asyncio
import nest_asyncio
nest_asyncio.apply() # Apply it immediately after all imports

# --- Configuration ---
LOG_FILE = 'scraper_log.txt'
MAX_RETRIES = 3
BASE_DELAY = 1

# --- Setup ---
# NLTK data download
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

# Setup logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(module)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
if not any(isinstance(h, logging.StreamHandler) for h in logging.getLogger('').handlers):
    logging.getLogger('').addHandler(console_handler)

ua = UserAgent()

keywords = [
    'india-pakistan', 'indo-pak', 'loc', 'line of control', 'ceasefire violation',
    'kashmir conflict', 'jammu and kashmir', 'balakot', 'pulwama',
    'surgical strike', 'cross-border firing', 'infiltration', 'militants',
    'terror attack', 'drone sighting', 'uav', 'indian army', 'pakistan army',
    'border dispute', 'geopolitical tension', 'sialkot', 'rawalpindi',
    'srinagar', 'islamabad', 'new delhi', 'dgmo', 'foreign ministry statement',
    'diplomatic tension', 'airspace violation', 'defence minister', 'national security advisor',
]
keywords = [k.lower() for k in keywords]

sources = [
    {
        'name': 'Al Jazeera',
        'rss': 'https://www.aljazeera.com/xml/rss/all.xml',
        'url': 'https://www.aljazeera.com/news/',
        'headline_selector': 'h3.gc__title a',
        'body_selector': 'main#main-content article p',
        'date_selector': 'div.date-simple span',
        'img_selector': 'figure.article-featured-image img',
        'dynamic': True
    },
    {
        'name': 'NDTV',
        'rss': 'https://feeds.feedburner.com/ndtvnews-latest',
        'url': 'https://www.ndtv.com/india-news',
        'headline_selector': 'div.news_Itm-hd a',
        'body_selector': 'div#ins_storybody p',
        'date_selector': 'span[itemprop="dateModified"]',
        'img_selector': 'div.ins_instory_dv_cont img#ins_storyimg',
        'dynamic': True
    },
    {
        'name': 'Dawn',
        'rss': 'https://www.dawn.com/feeds/home',
        'url': 'https://www.dawn.com/pakistan',
        'headline_selector': 'article.story a.story__link',
        'body_selector': 'div.story__content p',
        'date_selector': 'span.timestamp--time',
        'img_selector': 'figure.media--featured img',
        'dynamic': False
    },
    {
        'name': 'The News International',
        'rss': 'https://www.thenews.com.pk/rss/1/1',
        'url': 'https://www.thenews.com.pk/latest-stories',
        'headline_selector': 'div.story-link-box h2 a',
        'body_selector': 'div.story-detail-text p',
        'date_selector': 'div.detail-time',
        'img_selector': 'div.story-detail-left img.detail-pic',
        'dynamic': False
    },
    {
        'name': 'BBC News - South Asia',
        'rss': 'http://feeds.bbci.co.uk/news/world/asia/rss.xml',
        'url': 'https://www.bbc.com/news/world/asia/india',
        'headline_selector': 'a[data-testid="internal-link"]',
        'body_selector': 'main#main-content article p[data-component="text-block"]',
        'date_selector': 'time[data-testid="timestamp"]',
        'img_selector': 'div[data-component="image-block"] img',
        'dynamic': True
    },
    {
        'name': 'The Hindu - National',
        'rss': 'https://www.thehindu.com/news/national/feeder/default.rss',
        'url': 'https://www.thehindu.com/news/national/',
        'headline_selector': 'h2.story-card75x1-heading a, h3.story-card-33-heading a, div.element.story-card a.title',
        'body_selector': 'div[itemprop="articleBody"] p, div.articlebodycontent > p',
        'date_selector': 'span.blue-color.dateline, meta[name="publication_date"]',
        'img_selector': 'picture.article-picture img, meta[property="og:image"]',
        'dynamic': True
    }
]

# --- Helper Functions ---
def get_random_headers():
    return {
        'User-Agent': ua.random,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'DNT': '1',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.google.com/'
    }

def make_request(url, headers, proxies, attempt=1):
    try:
        time.sleep(random.uniform(BASE_DELAY * 0.5, BASE_DELAY * 1.5) * attempt)
        response = requests.get(url, headers=headers, proxies=None, timeout=20)
        response.raise_for_status()
        return response
    except requests.exceptions.HTTPError as e:
        logging.warning(f"HTTP error {e.response.status_code} for {url} (attempt {attempt}): {e}")
        if e.response.status_code in [403, 401, 429] and attempt >= MAX_RETRIES:
            logging.error(f"Access denied/rate limited for {url} after {MAX_RETRIES} attempts. Skipping.")
            return None
    except requests.exceptions.RequestException as e:
        logging.warning(f"Request failed for {url} (attempt {attempt}): {e}")
    if attempt < MAX_RETRIES:
        return make_request(url, headers, proxies, attempt + 1)
    logging.error(f"Failed to fetch {url} after {MAX_RETRIES} attempts.")
    return None

def extract_text_from_soup(soup_element, selector, default=''):
    try:
        element = soup_element.select_one(selector)
        return element.get_text(strip=True) if element else default
    except Exception: return default

def extract_attribute_from_soup(soup_element, selector, attribute, base_url_for_relative_path=None, default=''):
    try:
        element = soup_element.select_one(selector)
        if element and attribute in element.attrs:
            attr_value = element[attribute]
            if attribute in ['src', 'href', 'content'] and base_url_for_relative_path and \
               not attr_value.startswith(('http://', 'https://', '//', 'data:')):
                return urljoin(base_url_for_relative_path, attr_value)
            return attr_value
        return default
    except Exception: return default

def is_relevant(text_content):
    if not text_content: return False
    return any(keyword in text_content.lower() for keyword in keywords)

# --- Scraping Functions ---
def scrape_rss_feed(source_config):
    logging.info(f"Scraping RSS feed for {source_config['name']}")
    articles = []
    headers = get_random_headers()
    response = make_request(source_config['rss'], headers, None)
    if not response:
        logging.warning(f"Could not fetch RSS for {source_config['name']} from {source_config['rss']}")
        return articles

    feed = feedparser.parse(response.content)
    for entry in feed.entries:
        title = entry.get('title', '')
        article_url = entry.get('link', '')
        summary_html = entry.get('summary', entry.get('description', ''))
        summary_text = BeautifulSoup(summary_html, 'html.parser').get_text(strip=True)
        content_text = f"{title} {summary_text}"
        img_url_rss = ''

        if entry.get('media_content'):
            image_contents = [m for m in entry.media_content if m.get('medium') == 'image' and m.get('url')]
            if image_contents:
                best_image = None
                for m_img in image_contents:
                    if not any(keyword in m_img['url'].lower() for keyword in ['thumb', 'small', 'icon', 'logo', 'sprite', '?resize=', '&w=']):
                        best_image = m_img['url']
                        break
                    if any(keyword in m_img['url'].lower() for keyword in ['large', 'standard', 'original', '.jpg', '.jpeg', '.png', '.webp']):
                        best_image = m_img['url']
                        break
                if best_image:
                    img_url_rss = best_image
                else:
                    img_url_rss = image_contents[0]['url']
        if not img_url_rss and entry.get('media_thumbnail'):
            thumbnails = [t for t in entry.media_thumbnail if t.get('url')]
            if thumbnails:
                img_url_rss = thumbnails[0]['url']
        if not img_url_rss and entry.get('enclosures'):
            for enc in entry.enclosures:
                if enc.get('type', '').startswith('image/') and enc.get('href'):
                    img_url_rss = enc['href']
                    break
        if not img_url_rss:
            if source_config['name'] == 'NDTV' and 'storyimage' in entry and entry.storyimage:
                img_url_rss = entry.storyimage
            elif source_config['name'] == 'NDTV' and 'image_src' in entry and entry.image_src:
                 img_url_rss = entry.image_src
        if not img_url_rss and 'image' in entry and entry.image:
            if isinstance(entry.image, dict) and entry.image.get('href'):
                img_url_rss = entry.image.href
            elif isinstance(entry.image, str) and entry.image.startswith('http'):
                img_url_rss = entry.image
        if not img_url_rss and summary_html:
            summary_soup = BeautifulSoup(summary_html, 'html.parser')
            img_tag = summary_soup.find('img')
            if img_tag and img_tag.get('src'):
                src_val = img_tag['src']
                width = img_tag.get('width', '0')
                height = img_tag.get('height', '0')
                try:
                    if int(width.replace('px','')) > 50 and int(height.replace('px','')) > 50 : pass
                    elif 'width="1"' in str(img_tag).lower() or 'height="1"' in str(img_tag).lower():
                        src_val = ''
                except ValueError: pass
                if src_val and src_val.startswith('http') and len(src_val) > 20:
                    img_url_rss = urljoin(article_url, src_val)
        if not img_url_rss and entry.get('links'):
            for link_obj in entry.links:
                if link_obj.get('rel') == 'image_src' and link_obj.get('href'):
                    img_url_rss = link_obj.href
                    break
                if link_obj.get('type','').startswith('image/') and link_obj.get('href'):
                    img_url_rss = link_obj.href
                    break

        if is_relevant(content_text):
            articles.append({
                'source': source_config['name'], 'title': title, 'url': article_url,
                'published': entry.get('published', entry.get('updated', '')),
                'body': summary_text,
                'imgURL': img_url_rss if img_url_rss else '',
                'type': 'rss'
            })
            if not img_url_rss:
                 logging.debug(f"RSS: No image found for '{title[:50]}...' from {source_config['name']}")
    logging.info(f"Found {len(articles)} relevant articles from {source_config['name']} RSS.")
    return articles

async def scrape_html_page(article_url_from_listing, source_config, dynamic=False, listing_title_hint=""):
    logging.debug(f"Scraping article page: {article_url_from_listing} ({'dynamic' if dynamic else 'static'}) for {source_config['name']}")
    headers = get_random_headers()
    page_content_html = ""
    page_soup = None
    try:
        if dynamic:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'])
                context = await browser.new_context(
                    user_agent=headers['User-Agent'],
                    viewport={'width': random.randint(1280,1920), 'height': random.randint(720,1080)},
                    java_script_enabled=True,
                    ignore_https_errors=True,
                )
                await context.add_cookies([
                    {'name': 'CONSENT', 'value': 'YES+cb.20240101-01-p0.en+FX+600', 'domain': '.google.com', 'path': '/'},
                ])
                page = await context.new_page()
                await stealth_async(page)
                try:
                    await page.route("**/*.{png,jpg,jpeg,gif,webp,svg,css,woff,woff2,mp3,mp4,avi}", lambda route: route.abort() if route.request.resource_type not in ['document', 'script', 'xhr', 'fetch'] else route.continue_())
                    await page.goto(article_url_from_listing, wait_until='domcontentloaded', timeout=45000)
                    page_content_html = await page.content()
                except PlaywrightTimeoutError: logging.warning(f"Timeout loading {article_url_from_listing} with Playwright.")
                except Exception as e: logging.error(f"Playwright error on {article_url_from_listing}: {e}")
                finally: await browser.close()
        else:
            response = make_request(article_url_from_listing, headers, None)
            page_content_html = response.text if response else ""

        if not page_content_html:
            logging.warning(f"No content fetched for article: {article_url_from_listing}")
            return None

        page_soup = BeautifulSoup(page_content_html, 'html.parser')
        title = extract_text_from_soup(page_soup, source_config.get('article_title_selector', 'h1'))
        if not title: title = page_soup.title.string.strip() if page_soup.title and page_soup.title.string else listing_title_hint

        body_elements = page_soup.select(source_config['body_selector'])
        body = ' '.join(p.get_text(strip=True) for p in body_elements if p.get_text(strip=True))

        published_date_str = extract_text_from_soup(page_soup, source_config['date_selector'])
        if not published_date_str:
            meta_date_selectors = ['meta[property="article:published_time"]', 'meta[name="publication_date"]', 'meta[name="REVISED_DATE"]', 'meta[name="date"]', 'time[datetime]']
            for mds in meta_date_selectors:
                if mds == 'time[datetime]':
                    time_tag = page_soup.select_one(mds)
                    if time_tag and time_tag.get('datetime'):
                        published_date_str = time_tag['datetime']
                        break
                    elif time_tag:
                         published_date_str = time_tag.get_text(strip=True)
                         if published_date_str: break
                else:
                    published_date_str = extract_attribute_from_soup(page_soup, mds, 'content')
                    if published_date_str: break

        img_url = extract_attribute_from_soup(page_soup, 'meta[property="og:image"]', 'content', base_url_for_relative_path=article_url_from_listing)
        if not img_url: img_url = extract_attribute_from_soup(page_soup, 'meta[property="twitter:image"]', 'content', base_url_for_relative_path=article_url_from_listing)
        if not img_url: img_url = extract_attribute_from_soup(page_soup, source_config['img_selector'], 'src', base_url_for_relative_path=article_url_from_listing)
        if not img_url: img_url = extract_attribute_from_soup(page_soup, source_config['img_selector'], 'data-src', base_url_for_relative_path=article_url_from_listing)
        if not img_url:
            figure_img = page_soup.select_one('figure img, div.article-image img, div.featured-image img')
            if figure_img and figure_img.get('src'):
                 img_url = urljoin(article_url_from_listing, figure_img['src'])

        # Log details for HTML scraping success/failure
        logging.debug(f"HTML Scrape Details for {article_url_from_listing}: Title='{title}', Body length={len(body)}, ImgURL='{img_url}'")

        if title and body and is_relevant(title + " " + body):
            logging.info(f"Successfully scraped HTML for relevant article: {title[:60]} from {article_url_from_listing}")
            return {
                'source': source_config['name'], 'title': title, 'url': article_url_from_listing,
                'body': body, 'published': published_date_str if published_date_str else '',
                'imgURL': img_url if img_url else '', 'type': 'html_scrape'
            }
        logging.debug(f"Article {article_url_from_listing} (Title: '{title}') not relevant or missing sufficient body (len: {len(body)}).")
        return None
    except Exception as e:
        logging.error(f"Error scraping page {article_url_from_listing} for {source_config['name']}: {e}", exc_info=True)
        return None

async def scrape_site_html(source_config):
    logging.info(f"Scraping HTML for {source_config['name']} from {source_config['url']}")
    articles = []
    headers = get_random_headers()
    page_content_html = ""
    try:
        if source_config['dynamic']:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'])
                context = await browser.new_context(
                    user_agent=headers['User-Agent'],
                    viewport={'width': random.randint(1280,1920), 'height': random.randint(720,1080)},
                    java_script_enabled=True,
                    ignore_https_errors=True
                )
                page = await context.new_page()
                await stealth_async(page)
                try:
                    await page.goto(source_config['url'], wait_until='domcontentloaded', timeout=45000)
                    for _ in range(random.randint(1,2)):
                        await page.evaluate("window.scrollBy(0, window.innerHeight * 0.7);")
                        await asyncio.sleep(random.uniform(0.7, 1.8))
                    page_content_html = await page.content()
                except PlaywrightTimeoutError: logging.warning(f"Timeout on listing page {source_config['url']}")
                except Exception as e_pw: logging.error(f"Playwright error on listing page {source_config['url']}: {e_pw}")
                finally: await browser.close()
        else:
            response = make_request(source_config['url'], headers, None)
            page_content_html = response.text if response else ""

        if not page_content_html:
            logging.warning(f"No content from listing page: {source_config['url']}")
            return articles

        soup = BeautifulSoup(page_content_html, 'html.parser')
        headlines_elements = soup.select(source_config['headline_selector'])
        logging.info(f"Found {len(headlines_elements)} potential headlines on {source_config['name']} listing (Selector: {source_config['headline_selector']}).")

        processed_urls = set()
        max_headlines_to_process = 20 if source_config['dynamic'] else 15

        for h_element in headlines_elements[:max_headlines_to_process]:
            article_url_raw = None
            if h_element.name == 'a':
                article_url_raw = h_element.get('href')
            elif h_element.find('a'):
                 article_url_raw = h_element.find('a').get('href')

            if not article_url_raw: continue

            article_url = urljoin(source_config['url'], article_url_raw.strip())
            if article_url in processed_urls or not article_url.startswith('http'): continue
            processed_urls.add(article_url)

            listing_title = h_element.get_text(strip=True)
            if is_relevant(listing_title):
                logging.info(f"Relevant listing (HTML): '{listing_title[:60]}...'. Fetching: {article_url}")
                article_is_dynamic = source_config.get('article_dynamic', source_config['dynamic'])
                article_detail = await scrape_html_page(article_url, source_config, article_is_dynamic, listing_title_hint=listing_title)
                if article_detail: articles.append(article_detail)
                await asyncio.sleep(random.uniform(BASE_DELAY * 0.8, BASE_DELAY * 1.8))
            else:
                logging.debug(f"Skipping irrelevant HTML listing: '{listing_title[:60]}...' ({article_url})")

        logging.info(f"Collected {len(articles)} relevant articles via HTML from {source_config['name']}.")
    except Exception as e:
        logging.error(f"Error scraping site {source_config['name']}: {e}", exc_info=True)
    return articles

# --- Processing Functions ---
def merge_similar_articles(articles, similarity_threshold=0.75):
    if not articles or len(articles) < 2: return articles
    valid_articles = [a for a in articles if a.get('title') and a.get('body')]
    if not valid_articles or len(valid_articles) < 2: return articles

    texts = [f"{a['title']} {a.get('body','')}" for a in valid_articles]
    current_stopwords = stopwords.words('english') if stopwords.words('english') else 'english'
    try:
        vectorizer = TfidfVectorizer(stop_words=current_stopwords, max_df=0.9, min_df=1)
        tfidf_matrix = vectorizer.fit_transform(texts)
    except ValueError as e:
        if "empty vocabulary" in str(e).lower():
            logging.warning("TF-IDF ValueError: Empty vocabulary. Skipping merging.")
            return valid_articles
        logging.warning(f"TF-IDF ValueError: {e}. Skipping merging.")
        return valid_articles

    similarity_matrix = cosine_similarity(tfidf_matrix)
    groups, used_indices = [], set()
    for i in range(len(valid_articles)):
        if i not in used_indices:
            current_group_indices = [i]; used_indices.add(i)
            for j in range(i + 1, len(valid_articles)):
                if j not in used_indices and similarity_matrix[i][j] > similarity_threshold:
                    current_group_indices.append(j); used_indices.add(j)
            groups.append([valid_articles[k] for k in current_group_indices])

    merged_list = []
    for group in groups:
        if len(group) == 1:
            merged_list.append(group[0])
            continue

        logging.info(f"Merging {len(group)} similar articles. Lead: '{group[0]['title'][:50]}...'")
        lead_article = max(group, key=lambda x: len(x.get('body','')))
        all_sources = sorted(list(set(a['source'] for a in group)))
        all_img_urls = sorted(list(set(a.get('imgURL', '') for a in group if a.get('imgURL'))), key=len, reverse=True)
        valid_dates = sorted(list(set(a.get('published', '') for a in group if a.get('published', ''))), reverse=True)
        combined_body = lead_article.get('body', '')

        merged_list.append({
            'source': ', '.join(all_sources),
            'title': lead_article.get('title',''),
            'url': lead_article.get('url',''),
            'body': combined_body,
            'published': valid_dates[0] if valid_dates else lead_article.get('published',''),
            'imgURL': all_img_urls[0] if all_img_urls else '',
            'original_articles_count': len(group),
            'type': 'merged'
        })
    return merged_list

# --- Main Execution ---
async def fetch_and_merge_articles():
    logging.info("--- Starting News Scraper (Fetch & Merge Only) ---")
    all_collected_articles = []

    for source_config in sources:
        logging.info(f"--- Processing source: {source_config['name']} ---")
        rss_articles = scrape_rss_feed(source_config)
        all_collected_articles.extend(rss_articles)
        await asyncio.sleep(random.uniform(BASE_DELAY * 0.2, BASE_DELAY * 0.8))
        html_articles = await scrape_site_html(source_config)
        all_collected_articles.extend(html_articles)
        total_from_source = len(rss_articles) + (len(html_articles) if html_articles else 0)
        logging.info(f"Collected {total_from_source} potential articles from {source_config['name']}.")
        logging.info(f"--- Finished {source_config['name']}. Sleeping... ---")
        await asyncio.sleep(random.uniform(BASE_DELAY * 0.5, BASE_DELAY * 2))

    logging.info(f"--- Total collected before deduplication: {len(all_collected_articles)} ---")
    articles_by_url = {}
    for article in all_collected_articles:
        url = article.get('url')
        if not url:
            articles_by_url[f"no_url_{random.randint(10000,99999)}"] = article
            continue
        if url not in articles_by_url:
            articles_by_url[url] = article
        else:
            current_article = articles_by_url[url]
            new_has_img = bool(article.get('imgURL'))
            current_has_img = bool(current_article.get('imgURL'))
            if new_has_img and not current_has_img: articles_by_url[url] = article
            elif not new_has_img and current_has_img: pass
            elif len(article.get('body','')) > len(current_article.get('body','')): articles_by_url[url] = article

    unique_by_url = list(articles_by_url.values())
    logging.info(f"--- Articles after URL deduplication: {len(unique_by_url)} ---")
    merged_result = merge_similar_articles(unique_by_url, similarity_threshold=0.7)
    logging.info(f"--- Merged into {len(merged_result)} unique/semi-unique articles. ---")
    logging.info(f"--- Fetch & Merge complete. Returning {len(merged_result)} articles. ---")
    return merged_result

if __name__ == '__main__':
    final_articles_result = asyncio.run(fetch_and_merge_articles())
    print(json.dumps(final_articles_result, ensure_ascii=False))
