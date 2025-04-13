
import { useState } from "react";
import { Search, Database, Radar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchBar } from "@/components/SearchBar";
import { SearchStatus } from "@/components/SearchStatus";
import { ResultsTable } from "@/components/ResultsTable";
import { contactFinderService } from "@/services/contactFinderService";
import { ContactResult } from "@/types/contact";

const Index = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ContactResult[]>([]);
  const [searchStatus, setSearchStatus] = useState({
    step: "",
    status: "",
    completed: 0,
    total: 3
  });

  const handleSearch = async (niche: string, location: string) => {
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const results = await contactFinderService.searchContacts(
        niche, 
        location,
        (step, status, completed, total) => {
          setSearchStatus({
            step,
            status,
            completed,
            total
          });
        }
      );
      
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      // Add error handling with toast here
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadCSV = () => {
    if (searchResults.length === 0) return;
    
    const csv = contactFinderService.generateCSV(searchResults);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "contact_finder_results.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-3">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Contact Finder Deluxe</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">
              by Musiega Technologies
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-8 space-y-8">
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Step 1: Search
                </CardTitle>
                <CardDescription>
                  Find businesses by niche and location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-4 h-16">
                  <Search className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Step 2: Extract
                </CardTitle>
                <CardDescription>
                  Extract contact details automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-4 h-16">
                  <Database className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Step 3: Enrich
                </CardTitle>
                <CardDescription>
                  Enhance with additional information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-4 h-16">
                  <Radar className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Find Business Contacts</CardTitle>
              <CardDescription>
                Enter a business niche/type and location to find contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchBar onSearch={handleSearch} isLoading={isSearching} />
              
              {isSearching && (
                <div className="mt-6">
                  <SearchStatus 
                    currentStep={searchStatus.step}
                    totalSteps={searchStatus.total}
                    completedSteps={searchStatus.completed}
                    statusText={searchStatus.status}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          {searchResults.length > 0 && (
            <ResultsTable 
              results={searchResults} 
              onDownload={handleDownloadCSV} 
            />
          )}
        </section>
      </main>
      
      <footer className="border-t py-4">
        <div className="container flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} Musiega Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
