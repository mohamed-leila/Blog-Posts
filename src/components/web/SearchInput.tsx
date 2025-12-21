import { Loader2, Search } from "lucide-react";
import { Input } from "../ui/input";
import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

function SearchInput() {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const results = useQuery(
    api.posts.searchPosts,
    term?.length >= 2 ? { query: term, limit: 5 } : "skip"
  );
  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    setTerm(e.target.value);
    setOpen(true);
  }
  return (
    <div className=" relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full pl-8 bg-background"
          value={term}
          onChange={handleSearchInput}
        />
      </div>
      {open && term.length >= 2 && (
        <div className="absolute top-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 ">
          {results === undefined ? (
            <div className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              <span>loading...</span>
            </div>
          ) : results?.length === 0 ? (
            <span>No results</span>
          ) : (
            <div className="py-4">
              {results.map((result) => (
                <Link
                  className=" flex  flex-col items-center gap-2 text-sm hover:bg-accent hover:text-accent-foreground p-2 rounded-md "
                  href={`/blog/${result._id}`}
                  key={result._id}
                  onClick={() => {
                    setOpen(false);
                    setTerm("");
                  }}
                >
                  {result.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchInput;
