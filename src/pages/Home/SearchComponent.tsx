import { useState, useMemo } from "react";
//@ts-expect-error(123)
import lunr from "lunr";

interface Story {
  id: string;
  title?: string;
  author?: string;
  created_at?: { seconds: number; nanoseconds: number };
}

interface SearchComponentProps {
  storyList: Story[];
  scriptList: Story[];
  onSearchResults: (results: lunr.Index.Result[]) => void;
}

const SearchComponent = ({ storyList, scriptList, onSearchResults }: SearchComponentProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [, setSearchClicked] = useState<boolean>(false);

  const idx = useMemo(() => {
    if (!storyList || !scriptList) return null;

    return lunr(function (this: lunr.Builder) {
      this.ref("id");
      this.field("id");
      this.field("title");
      this.field("author");
      this.field("summary");
      this.field("tags");

      storyList.forEach((story) => {
        this.add(story);
      });

      scriptList.forEach((script) => {
        this.add(script);
      });
    });
  }, [storyList, scriptList]);

  const handleSearch = () => {
    setSearchClicked(true);
    if (idx && searchTerm) {
      const results = idx.search(searchTerm);
      onSearchResults(results);
    } else {
      onSearchResults([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearchResults([]);
    setSearchClicked(false);
  };

  return (
    <div className="mb-4 relative">
      <div className="flex gap-4 align-middle">
        <input
          type="text"
          placeholder="Search title, summary, author, tags"
          value={searchTerm}
          onKeyDown={handleKeyDown}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="w-1 h-1 border-none absolute right-44 top-2 bg-transparent text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
