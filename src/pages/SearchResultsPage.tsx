import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
//@ts-expect-error(123)
import lunr from "lunr";
import { SearchResultCard } from "../components/Card";
import { index } from "../../algoliaClient"; // Import Algolia index

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
  return (
    <div className="mx-auto flex flex-col align-middle">
      <h1>Search Results for "{query}"</h1>
      <section className="grid grid-cols-1 gap-6 align-middle mx-auto mt-5">
        {searchResults.map((result) => {
          return (
            result && (
              <SearchResultCard
                key={result.id}
                id={result.id}
                image={result.img_url?.[0]}
                title={result.title || "Untitled"}
                tags={result.tags}
                author={result.author || "Unknown"}
                onClick={() => handleContentClick(result.id, "story")}
                intro={result.intro}
                duration={result.duration}
              />
            )
          );
        })}
      </section>
      <div className="h-32 w-full"></div>
    </div>
  );
};

export default SearchResultsPage;
