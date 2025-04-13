
import { supabase } from "@/integrations/supabase/client";
import { ContactResult } from "@/types/contact";

export const contactFinderService = {
  async searchContacts(
    niche: string, 
    location: string, 
    onProgress: (step: string, status: string, completed: number, total: number) => void
  ): Promise<ContactResult[]> {
    try {
      // Create a new search job in the database
      const { data: job, error: jobError } = await supabase
        .from('search_jobs')
        .insert({
          niche,
          location,
          status: 'pending',
          current_step: 'Initializing',
          status_message: 'Starting search...',
          progress: 0
        })
        .select()
        .single();
      
      if (jobError || !job) {
        console.error("Failed to create search job:", jobError);
        throw new Error("Failed to create search job");
      }
      
      // Start the scraper function
      const { error: functionError } = await supabase.functions.invoke('contact-scraper', {
        body: { niche, location, jobId: job.id }
      });
      
      if (functionError) {
        console.error("Edge function error:", functionError);
        throw new Error("Failed to start scraper");
      }
      
      // Start polling for job status updates
      const intervalId = setInterval(async () => {
        const { data: updatedJob, error: fetchError } = await supabase
          .from('search_jobs')
          .select('*')
          .eq('id', job.id)
          .single();
        
        if (fetchError || !updatedJob) {
          console.error("Failed to fetch job status:", fetchError);
          return;
        }
        
        onProgress(
          updatedJob.current_step || '',
          updatedJob.status_message || '',
          updatedJob.progress || 0,
          100 // Total steps represented as percentage
        );
        
        if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
          clearInterval(intervalId);
        }
      }, 1000);
      
      // Wait for the job to complete (with timeout)
      let attempts = 0;
      const maxAttempts = 180; // 3 minutes timeout
      
      while (attempts < maxAttempts) {
        const { data: checkJob, error: checkError } = await supabase
          .from('search_jobs')
          .select('*')
          .eq('id', job.id)
          .single();
        
        if (checkError || !checkJob) {
          console.error("Failed to check job status:", checkError);
          break;
        }
        
        if (checkJob.status === 'completed') {
          // Fetch results from the database
          const { data: contacts, error: contactsError } = await supabase
            .from('contact_results')
            .select('*')
            .eq('niche', niche)
            .eq('location', location)
            .order('created_at', { ascending: false })
            .limit(100);
          
          clearInterval(intervalId);
          
          if (contactsError) {
            console.error("Failed to fetch contacts:", contactsError);
            throw new Error("Failed to fetch results");
          }
          
          return contacts || [];
        }
        
        if (checkJob.status === 'failed') {
          clearInterval(intervalId);
          throw new Error(checkJob.status_message || "Search job failed");
        }
        
        // Wait 1 second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
      
      clearInterval(intervalId);
      
      if (attempts >= maxAttempts) {
        throw new Error("Search job timed out");
      }
      
      return [];
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  },
  
  // Generate CSV download for the results
  generateCSV(contacts: ContactResult[]): string {
    const headers = ["Name", "Email", "Phone", "Website", "Social Media", "Niche", "Location"];
    
    const csvRows = [
      headers.join(','),
      ...contacts.map(contact => {
        return [
          contact.name || '',
          contact.email || '',
          contact.phone || '',
          contact.website || '',
          contact.socialMedia || '',
          contact.niche || '',
          contact.location || ''
        ].map(value => `"${(value+'').replace(/"/g, '""')}"`).join(',');
      })
    ];
    
    return csvRows.join('\n');
  }
};
