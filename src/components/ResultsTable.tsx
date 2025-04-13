
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Filter, MoreHorizontal } from "lucide-react";
import { ContactResult } from "@/types/contact";

interface ResultsTableProps {
  results: ContactResult[];
  onDownload: () => void;
}

export function ResultsTable({ results, onDownload }: ResultsTableProps) {
  const [searchFilter, setSearchFilter] = useState("");

  const filteredResults = results.filter((result) => {
    const searchTerm = searchFilter.toLowerCase();
    return (
      result.name?.toLowerCase().includes(searchTerm) ||
      result.email?.toLowerCase().includes(searchTerm) ||
      result.phone?.toLowerCase().includes(searchTerm) ||
      result.website?.toLowerCase().includes(searchTerm) ||
      result.socialMedia?.toLowerCase().includes(searchTerm)
    );
  });

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Results</h2>
          <span className="text-sm text-muted-foreground">
            ({results.length} contacts found)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter results..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9 h-10 w-[200px] lg:w-[300px]"
            />
          </div>
          <Button onClick={onDownload} className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download CSV</span>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="hidden md:table-cell">Website</TableHead>
              <TableHead className="hidden lg:table-cell">Social Media</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.length > 0 ? (
              filteredResults.map((result, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{result.name || "N/A"}</TableCell>
                  <TableCell>{result.email || "N/A"}</TableCell>
                  <TableCell>{result.phone || "N/A"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {result.website ? (
                      <a
                        href={result.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {new URL(result.website).hostname}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{result.socialMedia || "N/A"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigator.clipboard.writeText(result.email || "")}
                        >
                          Copy Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigator.clipboard.writeText(result.phone || "")}
                        >
                          Copy Phone
                        </DropdownMenuItem>
                        {result.website && (
                          <DropdownMenuItem
                            onClick={() => window.open(result.website, "_blank")}
                          >
                            Visit Website
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No results found. Try a different filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
