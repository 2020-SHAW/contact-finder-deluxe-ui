
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = 'https://ghlnlicavpnpdioncvmp.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Python code execution via Deno subprocess
async function executePythonScraper(niche: string, location: string, jobId: string) {
  try {
    // Update job status to searching
    await supabase
      .from('search_jobs')
      .update({
        status: 'searching',
        current_step: 'Search Phase',
        status_message: `Searching for "${niche}" in "${location}"...`,
        progress: 25
      })
      .eq('id', jobId);
    
    // Import required Python modules using pip
    const pipInstallCmd = new Deno.Command("pip", {
      args: ["install", "pandas", "requests", "bs4", "duckduckgo_search"],
      stdout: "piped",
      stderr: "piped",
    });
    
    const pipResult = await pipInstallCmd.output();
    console.log("pip install output:", new TextDecoder().decode(pipResult.stdout));
    console.error("pip install errors:", new TextDecoder().decode(pipResult.stderr));
    
    // Create a temporary Python file with the scraper code
    const pythonCode = `
import csv
import pandas as pd
import re
import time
import random
import requests
import json
import sys
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS

def build_query(niche, location):
    return f'"{niche}" "{location}" contact email phone site'

def search_duckduckgo(query):
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=50):  # Reduced for demo
                results.append({
                    'Title': r.get('title', ''),
                    'URL': r.get('href', ''),
                    'Snippet': r.get('body', '')
                })
                time.sleep(0.2)  # Reduced for demo
    except Exception as e:
        print(f"Search Error: {e}", file=sys.stderr)
    return results

def extract_basic_contact_info(text):
    email_match = re.findall(r'[\\w\\.-]+@[\\w\\.-]+\\.\\w+', text)
    phone_match = re.findall(r'\\+?\\d[\\d\\s\\-\\(\\)]{7,}\\d', text)
    website_match = re.findall(r'https?://[^\\s]+', text)
    socials = re.findall(r'(facebook\\.com|instagram\\.com|twitter\\.com|linkedin\\.com)/[^\\s\\)]+', text)

    return {
        "email": email_match[0] if email_match else None,
        "phone": phone_match[0] if phone_match else None,
        "website": website_match[0] if website_match else None,
        "socialMedia": socials[0] if socials else None
    }

def extract_contacts(raw_results):
    extracted = []
    for record in raw_results:
        combined_text = f"{record.get('Title', '')}\\n{record.get('Snippet', '')}\\n{record.get('URL', '')}"
        contact_info = extract_basic_contact_info(combined_text)
        
        if not contact_info["website"] and record.get("URL", ""):
            contact_info["website"] = record["URL"]
            
        extracted.append(contact_info)
    return extracted

def scrape_website(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code != 200:
            return [], [], [], []

        soup = BeautifulSoup(response.text, 'html.parser')
        text = soup.get_text(separator='\\n')

        emails = re.findall(r'[\\w\\.-]+@[\\w\\.-]+\\.\\w+', text)
        phones = re.findall(r'\\+?\\d[\\d\\s\\-\\(\\)]{7,}\\d', text)
        social_links = re.findall(r'(facebook\\.com|instagram\\.com|twitter\\.com|linkedin\\.com)/[^\\s\\)]+', text)
        names = re.findall(r'\\b[A-Z][a-z]+\\s[A-Z][a-z]+\\b', text)

        return names, emails, phones, social_links
    except Exception as e:
        print(f"Error scraping {url}: {e}", file=sys.stderr)
        return [], [], [], []

def enrich_contacts(contacts):
    enriched = []
    for i, contact in enumerate(contacts):
        if not contact["website"]:
            continue
            
        names, emails, phones, social_links = scrape_website(contact["website"])
        
        # If we found names, create a contact for each name
        if names:
            for name in names:
                new_contact = contact.copy()
                new_contact["name"] = name
                if emails and not new_contact["email"]:
                    new_contact["email"] = emails[0]
                if phones and not new_contact["phone"]:
                    new_contact["phone"] = phones[0]
                if social_links and not new_contact["socialMedia"]:
                    new_contact["socialMedia"] = social_links[0]
                enriched.append(new_contact)
        else:
            # No names found, just add the contact as is
            enriched.append(contact)
            
    return enriched

def main():
    niche = sys.argv[1]
    location = sys.argv[2]
    
    # Step 1: Search
    query = build_query(niche, location)
    print(f"Running search: {query}")
    raw_results = search_duckduckgo(query)
    
    # Step 2: Extract basic info
    print("Extracting basic contact info...")
    contacts = extract_contacts(raw_results)
    
    # Step 3: Enrich with website scraping
    print("Enriching contacts with website data...")
    enriched_contacts = enrich_contacts(contacts)
    
    # Output JSON results
    result = {
        "contacts": enriched_contacts,
        "niche": niche,
        "location": location
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()
`;

    // Write Python code to a temporary file
    await Deno.writeTextFile("/tmp/scraper.py", pythonCode);
    
    // Update job status to extraction phase
    await supabase
      .from('search_jobs')
      .update({
        status: 'extracting',
        current_step: 'Extraction Phase',
        status_message: 'Extracting contact information...',
        progress: 50
      })
      .eq('id', jobId);
    
    // Run the Python script
    const cmd = new Deno.Command("python3", {
      args: ["/tmp/scraper.py", niche, location],
      stdout: "piped",
      stderr: "piped",
    });
    
    const { stdout, stderr } = await cmd.output();
    const output = new TextDecoder().decode(stdout);
    const errors = new TextDecoder().decode(stderr);
    
    console.log("Python script output:", output);
    
    if (errors) {
      console.error("Python script errors:", errors);
      throw new Error(`Python script execution failed: ${errors}`);
    }
    
    // Update job status to enrichment phase
    await supabase
      .from('search_jobs')
      .update({
        status: 'enriching',
        current_step: 'Enrichment Phase',
        status_message: 'Enriching contact details...',
        progress: 75
      })
      .eq('id', jobId);
    
    // Parse the JSON output from the Python script
    let results;
    try {
      results = JSON.parse(output);
    } catch (error) {
      console.error("Failed to parse Python output:", error);
      throw new Error("Failed to parse Python output");
    }
    
    // Add niche and location to each contact
    const contacts = results.contacts.map(contact => ({
      ...contact,
      niche,
      location
    }));
    
    // Save contacts to the database
    if (contacts.length > 0) {
      const { error } = await supabase
        .from('contact_results')
        .insert(contacts);
      
      if (error) {
        console.error("Failed to save contacts:", error);
        throw new Error(`Failed to save contacts: ${error.message}`);
      }
    }
    
    // Update job status to completed
    await supabase
      .from('search_jobs')
      .update({
        status: 'completed',
        current_step: 'Completed',
        status_message: `Found ${contacts.length} contacts`,
        progress: 100,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
    
    return { success: true, count: contacts.length };
  } catch (error) {
    console.error('Error executing Python scraper:', error);
    
    // Update job status to failed
    await supabase
      .from('search_jobs')
      .update({
        status: 'failed',
        status_message: `Error: ${error.message}`,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
    
    throw error;
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { niche, location, jobId } = await req.json();
    
    if (!niche || !location || !jobId) {
      return new Response(
        JSON.stringify({ error: 'Niche, location, and jobId are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Start the execution in the background
    // Since Python execution might take a while, we start it and return immediately
    const executionPromise = executePythonScraper(niche, location, jobId);
    
    // Use waitUntil to continue execution in the background even after response is sent
    if (typeof EdgeRuntime !== 'undefined') {
      (EdgeRuntime as any).waitUntil(executionPromise);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Scraper started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
