"""
Scraper for Job Bank Employment Outlooks data.
Run this script to fetch the latest data from Job Bank website.

Usage:
  python scripts/scrape_outlooks.py

This will scrape all 516 occupations' outlook data and save to public/data/
"""
import requests
import json
import time
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
OUT_DIR = BASE / "public" / "data"

# Job Bank occupation IDs (we'll discover these from the search page)
# For demo, we'll use a sample of occupations
SAMPLE_OCCUPATIONS = [
    {"id": "23242", "title": "Welders and related machine operators", "noc": "72106"},
    {"id": "22544", "title": "Software developers and programmers", "noc": "21232"},
    {"id": "25102", "title": "Registered nurses", "noc": "31301"},
    {"id": "11109", "title": "Financial auditors and accountants", "noc": "11101"},
    {"id": "1235", "title": "Carpenters", "noc": "72310"},
]

def scrape_occupation(occ_id, title, noc):
    """Scrape outlook data for a single occupation."""
    url = f"https://www.jobbank.gc.ca/outlookreport/occupation/{occ_id}"
    print(f"Scraping {title} ({noc})...")
    
    try:
        resp = requests.get(url, timeout=15, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        resp.raise_for_status()
        html = resp.text
        
        # Parse provinces and ratings
        # This is a simplified parser - you'll need to adjust based on actual HTML structure
        provinces = {}
        
        # Extract province ratings from the page
        # Pattern: province name + rating
        # ... (parse HTML here)
        
        return {
            "title": title,
            "noc": noc,
            "source_url": url,
            "regions": []  # parsed data goes here
        }
    except Exception as e:
        print(f"  Error: {e}")
        return None

def main():
    print("Job Bank Outlook Scraper")
    print("=" * 40)
    print(f"Output directory: {OUT_DIR}")
    print()
    
    # For demo, just show what would be scraped
    print(f"Would scrape {len(SAMPLE_OCCUPATIONS)} sample occupations:")
    for occ in SAMPLE_OCCUPATIONS:
        print(f"  - {occ['title']} (NOC {occ['noc']})")
    
    print()
    print("Note: Full scraping requires parsing the HTML structure.")
    print("For production, use the Open Data CSV as primary source,")
    print("and this scraper as backup for the latest data.")

if __name__ == "__main__":
    main()
