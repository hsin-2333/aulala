import { Button, Input, Link } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
//@ts-expect-error(123)
import lunr from "lunr";
import { FiSearch } from "react-icons/fi";
import { index } from "../../algoliaClient"; // Import Algolia index
import { SearchResultCard } from "../components/Card";
const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState<lunr.Index.Result[]>([]);

  const query = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    const fetchAlgoliaResults = async () => {
      const { hits } = await index.search(query);
      setSearchResults(hits);
    };

    fetchAlgoliaResults();
  }, [query]);

  const handleContentClick = (id: string, type: "script" | "story") => {
    if (type === "script") navigate(`/script/${id}`);
    if (type === "story") navigate(`/story/${id}`);
  };

  console.log("searchResults", searchResults);

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
      <div className="mx-auto flex flex-col align-middle ">
        <form onSubmit={handleSearchSubmit} className="flex justify-center  items-center ">
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
        <p className="font-bold text-2xl mt-4">{query}</p>
        <p className="text-default-400 text-md mt-1">Search Results for "{query}"</p>
        <div className="flex flex-wrap mt-2 mx-auto">
          {allTags.map((tag, index) => (
            <Button
              as={Link}
              href={`/search?q=${tag}`}
              key={index}
              color="default"
              size="sm"
              radius="sm"
              className="mt-1 mr-2"
              variant="flat"
            >
              {tag}
            </Button>
          ))}
        </div>
        <section className="grid grid-cols-1 align-middle mx-auto mt-8">
          {searchResults.length > 0 ? (
            searchResults.map((result) => {
              console.log("result", result);
              return (
                result && (
                  <SearchResultCard
                    key={result.objectID}
                    id={result.objectID}
                    image={result.img_url?.[0]}
                    title={result.title || "Untitled"}
                    tags={result.tags}
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
