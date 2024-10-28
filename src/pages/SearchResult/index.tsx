import { Button, Card, Input, Link, Skeleton } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { index } from "../../../algoliaClient";
import { SearchResultCard } from "../../components/Common/Card";

type SearchResult = {
  objectID: string;
  img_url?: string[];
  title?: string;
  tags?: string[];
  author?: string;
  intro?: string;
  duration?: number;
};

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const query = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    const fetchAlgoliaResults = async () => {
      setIsLoading(true);
      const { hits } = await index.search(query);
      setSearchResults(hits);
      setIsLoading(false);
    };

    fetchAlgoliaResults();
  }, [query]);

  const handleContentClick = (id: string, type: "script" | "story") => {
    if (type === "script") navigate(`/script/${id}`);
    if (type === "story") navigate(`/story/${id}`);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const allTags = searchResults
    .flatMap((result) => result.tags || [])
    .filter((tag, index, self) => self.indexOf(tag) === index);
  return (
    <>
      <div className="mx-auto flex flex-col items-center align-middle">
        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full items-center justify-center"
        >
          <Input
            classNames={{
              base: " max-w-[848px] shadow-xl shadow-indigo-200/20",
              mainWrapper: "h-full",
              input: "text-small",
              inputWrapper: "h-full font-normal text-default-500 bg-white ",
            }}
            placeholder="Search for stories, author, and tags..."
            size="lg"
            startContent={<FiSearch size={18} />}
            type="search"
            radius="sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        <p className="mt-4 text-2xl font-bold">{query}</p>
        <p className="text-md mt-1 text-default-400">
          Search Results for "{query}"
        </p>
        <div className="mx-auto mt-2 flex flex-wrap">
          {allTags.map((tag, index) => (
            <Button
              as={Link}
              href={`/search?q=${tag}`}
              key={index}
              color="default"
              size="sm"
              radius="sm"
              className="mr-2 mt-1"
              variant="flat"
            >
              {tag}
            </Button>
          ))}
        </div>
        <section className="mt-8 grid w-full max-w-[848px] grid-cols-1 align-middle">
          {isLoading ? (
            <SearchResultSkeleton />
          ) : searchResults.length > 0 ? (
            searchResults.map((result) => {
              return (
                result && (
                  <SearchResultCard
                    key={result.objectID}
                    id={result.objectID}
                    image={result.img_url?.[0] || ""}
                    title={result.title || "Untitled"}
                    tags={result.tags || []}
                    author={result.author || "Unknown"}
                    onClick={() => handleContentClick(result.objectID, "story")}
                    intro={result.intro}
                    duration={result.duration}
                  />
                )
              );
            })
          ) : (
            <p>
              No results found. <br />
              Double-check your spelling or try different keywords
            </p>
          )}
        </section>
        <div className="h-32 w-full"></div>
      </div>
    </>
  );
};

export default SearchResultsPage;

const SearchResultSkeleton = () => {
  return (
    <Card
      className="mt-8 flex flex-row gap-4 p-4"
      radius="lg"
      shadow="sm"
      fullWidth={true}
    >
      <Skeleton className="rounded-lg">
        <div className="h-24 w-24 rounded-lg bg-default-300"></div>
      </Skeleton>
      <div className="mt-2 w-full space-y-3">
        <Skeleton className="w-3/5 rounded-lg">
          <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-4/5 rounded-lg">
          <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-2/5 rounded-lg">
          <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
    </Card>
  );
};
