
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (niche: string, location: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (niche && location) {
      onSearch(niche, location);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Enter niche or business type..."
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="h-12"
            required
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Enter location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-12"
            required
          />
        </div>
        <Button
          type="submit"
          className="h-12 px-6"
          disabled={isLoading || !niche || !location}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              <span>Searching...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <span>Find Contacts</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}
