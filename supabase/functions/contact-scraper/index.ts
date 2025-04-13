
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';
import { corsHeaders } from '../_shared/cors.ts';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts';

const supabaseUrl = 'https://ghlnlicavpnpdioncvmp.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// JavaScript implementation of the scraper functionality
async function executeJSScraper(niche: string, location: string, jobId: string) {
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
    
    // Simulate search using DuckDuckGo-like functionality
    const searchResults = await simulateSearch(niche, location);
    console.log(`Found ${searchResults.length} search results`);
    
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
    
    // Extract basic contact information
    const extractedContacts = extractBasicContactInfo(searchResults);
    console.log(`Extracted ${extractedContacts.length} basic contacts`);
    
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
    
    // Enrich contact information with website scraping
    const enrichedContacts = await enrichContactData(extractedContacts);
    console.log(`Enriched ${enrichedContacts.length} contacts`);
    
    // Add niche and location to each contact
    const contacts = enrichedContacts.map(contact => ({
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
    console.error('Error executing JS scraper:', error);
    
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

// Function to simulate search results
async function simulateSearch(niche: string, location: string) {
  // Build a search query similar to the Python version
  const query = `${niche} ${location} contact email phone site`;
  console.log(`Searching for: ${query}`);
  
  // In a real implementation, you would use a search API here
  // For now, we'll generate representative sample results
  const results = [];
  
  // Generate some sample results based on the niche and location
  // In a real app, this would be actual search results
  const websites = [
    `${niche.toLowerCase()}-${location.toLowerCase()}.com`,
    `www.${niche.toLowerCase()}in${location.toLowerCase()}.com`,
    `${location.toLowerCase()}-${niche.toLowerCase()}.org`,
    `best${niche.toLowerCase()}${location.toLowerCase()}.com`,
    `${niche.toLowerCase()}-services-${location.toLowerCase()}.com`
  ];
  
  for (let i = 0; i < websites.length; i++) {
    results.push({
      Title: `${capitalizeFirstLetter(niche)} Services in ${capitalizeFirstLetter(location)} - ${i + 1}`,
      URL: `https://${websites[i]}`,
      Snippet: `Contact the best ${niche.toLowerCase()} services in ${location}. Phone: +1234567890${i}. Email: contact@${websites[i]}.`
    });
    
    // Small delay to simulate search progress
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

// Extract basic contact info from search results
function extractBasicContactInfo(searchResults: any[]) {
  return searchResults.map(result => {
    const combinedText = `${result.Title}\n${result.Snippet}\n${result.URL}`;
    
    // Use regex similar to the Python version to extract contact details
    const emailMatch = combinedText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    const phoneMatch = combinedText.match(/\+?\d[\d\s\-\(\)]{7,}\d/);
    const websiteMatch = combinedText.match(/https?:\/\/[^\s]+/);
    const socialMatch = combinedText.match(/(facebook\.com|instagram\.com|twitter\.com|linkedin\.com)\/[^\s\)]+/);
    
    const contact = {
      name: null,
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null,
      website: websiteMatch ? websiteMatch[0] : null,
      socialMedia: socialMatch ? socialMatch[0] : null
    };
    
    // If no website was found but we have a URL, use that
    if (!contact.website && result.URL) {
      contact.website = result.URL;
    }
    
    return contact;
  });
}

// Enrich contact data with more details
async function enrichContactData(contacts: any[]) {
  const enrichedContacts = [];
  
  for (const contact of contacts) {
    if (!contact.website) {
      enrichedContacts.push(contact);
      continue;
    }
    
    try {
      // Attempt to scrape website for more info
      // In a real implementation, you would fetch and parse the website
      // Since this is a simulation, we'll generate representative data
      
      // Generate a name if one doesn't exist
      if (!contact.name) {
        const firstName = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma'][Math.floor(Math.random() * 6)];
        const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller'][Math.floor(Math.random() * 6)];
        contact.name = `${firstName} ${lastName}`;
      }
      
      enrichedContacts.push(contact);
      
      // Add a slight delay to simulate progressive scraping
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error scraping ${contact.website}:`, error);
      enrichedContacts.push(contact);
    }
  }
  
  return enrichedContacts;
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
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
    const executionPromise = executeJSScraper(niche, location, jobId);
    
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
