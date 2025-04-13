
import { ContactResult, SearchResult } from "@/types/contact";

// Simulate API calls that would connect to the Python backend
export const contactFinderService = {
  // Simulates the DuckDuckGo search
  async searchContacts(
    niche: string, 
    location: string, 
    onProgress: (step: string, status: string, completed: number, total: number) => void
  ): Promise<ContactResult[]> {
    // Step 1: Initial search
    onProgress("Searching", `Running search for "${niche}" in "${location}"...`, 1, 3);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate search results
    const results: SearchResult[] = generateMockSearchResults(niche, location);
    
    // Step 2: Extract basic contact info
    onProgress("Extracting", "Extracting basic contact information...", 2, 3);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Enrich with website scraping
    onProgress("Enriching", "Scraping websites for additional contact details...", 3, 3);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Return the final results
    return generateMockContacts(niche, location, 20);
  },
  
  // Generate CSV download for the results
  generateCSV(contacts: ContactResult[]): string {
    const headers = ["Name", "Email", "Phone", "Website", "Social Media"];
    
    const csvRows = [
      headers.join(','),
      ...contacts.map(contact => {
        return [
          contact.name || '',
          contact.email || '',
          contact.phone || '',
          contact.website || '',
          contact.socialMedia || ''
        ].map(value => `"${value.replace(/"/g, '""')}"`).join(',');
      })
    ];
    
    return csvRows.join('\n');
  }
};

// Helper functions to generate mock data
function generateMockSearchResults(niche: string, location: string): SearchResult[] {
  const results: SearchResult[] = [];
  const count = Math.floor(Math.random() * 10) + 10;
  
  for (let i = 0; i < count; i++) {
    results.push({
      title: `${niche} Business ${i + 1} in ${location}`,
      url: `https://example${i}.com`,
      snippet: `Contact ${niche} business in ${location}. Our services include...`
    });
  }
  
  return results;
}

function generateMockContacts(niche: string, location: string, count: number): ContactResult[] {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'example.com'];
  const socialPlatforms = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com'];
  const results: ContactResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const businessName = `${niche} ${i + 1}`;
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const socialPlatform = socialPlatforms[Math.floor(Math.random() * socialPlatforms.length)];
    
    results.push({
      name: `${businessName} ${location}`,
      email: `contact@${businessName.toLowerCase().replace(/\s+/g, '')}${i}.${domain}`,
      phone: `+1${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000) + 1000}`,
      website: `https://www.${businessName.toLowerCase().replace(/\s+/g, '')}.com`,
      socialMedia: `${socialPlatform}/${businessName.toLowerCase().replace(/\s+/g, '')}`
    });
  }
  
  return results;
}
