
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

const supabaseUrl = 'https://ghlnlicavpnpdioncvmp.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function buildQuery(niche: string, location: string) {
  return `"${niche}" "${location}" contact email phone site`;
}

async function searchDuckDuckGo(query: string, jobId: string) {
  // Update job status
  await supabase
    .from('search_jobs')
    .update({
      status: 'searching',
      current_step: 'Searching',
      status_message: `Running search for "${query}"...`,
      progress: 33
    })
    .eq('id', jobId);

  // In a real implementation, you would use the DuckDuckGo API here
  // For now, we'll simulate the search with a delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  const sampleResults = [
    {
      title: `${query} Result 1`,
      url: 'https://example1.com',
      snippet: `Contact information for businesses related to ${query}.`
    },
    {
      title: `${query} Result 2`,
      url: 'https://example2.com',
      snippet: `Find email and phone for ${query}.`
    }
    // In a real implementation, you would return actual search results
  ];

  return sampleResults;
}

async function extractBasicContactInfo(searchResults: any[], jobId: string, niche: string, location: string) {
  // Update job status
  await supabase
    .from('search_jobs')
    .update({
      status: 'extracting',
      current_step: 'Extracting',
      status_message: 'Extracting basic contact information...',
      progress: 66
    })
    .eq('id', jobId);

  // Simulate extraction delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  // In a real implementation, you would extract info from the search results
  // For now, we'll create some sample contacts
  const contacts = [];
  
  for (let i = 0; i < 10; i++) {
    contacts.push({
      name: `${niche} Business ${i+1}`,
      email: `contact@${niche.toLowerCase().replace(/\s+/g, '')}${i}.example.com`,
      phone: `+1${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000) + 1000}`,
      website: `https://www.${niche.toLowerCase().replace(/\s+/g, '')}${i}.com`,
      social_media: `facebook.com/${niche.toLowerCase().replace(/\s+/g, '')}${i}`,
      niche,
      location
    });
  }

  return contacts;
}

async function enrichContactsWithScraping(contacts: any[], jobId: string) {
  // Update job status
  await supabase
    .from('search_jobs')
    .update({
      status: 'enriching',
      current_step: 'Enriching',
      status_message: 'Scraping websites for additional contact details...',
      progress: 99
    })
    .eq('id', jobId);

  // Simulate website scraping delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  // In a real implementation, you would scrape each website
  // For now, we'll use the existing contacts
  return contacts;
}

async function saveContactsToDatabase(contacts: any[]) {
  const { data, error } = await supabase
    .from('contact_results')
    .insert(contacts);
    
  if (error) {
    console.error('Error saving contacts:', error);
    throw error;
  }
  
  return { success: true, count: contacts.length };
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

    // 1. Build search query
    const query = await buildQuery(niche, location);
    
    // 2. Search DuckDuckGo
    const searchResults = await searchDuckDuckGo(query, jobId);
    
    // 3. Extract basic contact info
    const contacts = await extractBasicContactInfo(searchResults, jobId, niche, location);
    
    // 4. Enrich contacts with website scraping
    const enrichedContacts = await enrichContactsWithScraping(contacts, jobId);
    
    // 5. Save to database
    const saveResult = await saveContactsToDatabase(enrichedContacts);
    
    // 6. Update job status to completed
    await supabase
      .from('search_jobs')
      .update({
        status: 'completed',
        current_step: 'Completed',
        status_message: `Found ${enrichedContacts.length} contacts`,
        progress: 100,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    return new Response(
      JSON.stringify({ success: true, contacts: enrichedContacts }),
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
