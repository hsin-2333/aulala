import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
//@ts-expect-error(123)
import lunr from "lunr";
import dbApi from "../utils/firebaseService";
import { SearchResultCard } from "../components/Card";

interface Story {
  id: string;
  title?: string;
  author?: string;
  created_at?: { seconds: number; nanoseconds: number };
}

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState<lunr.Index.Result[]>([]);
  const [storyList, setStoryList] = useState<Story[]>([]);
  const [scriptList, setScriptList] = useState<Story[]>([]);

  const query = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    const fetchData = async () => {
      const stories = await dbApi.queryCollection("stories", {}, 100);
      const scripts = await dbApi.queryCollection("scripts", {}, 100);
      setStoryList(stories);
      setScriptList(scripts);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (storyList.length > 0 && scriptList.length > 0) {
      const idx = lunr(function (this: lunr.Builder) {
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

      const results = idx.search(query);
      setSearchResults(results);
    }
  }, [storyList, scriptList, query]);

  const handleContentClick = (id: string, type: "script" | "story") => {
    if (type === "script") navigate(`/script/${id}`);
    if (type === "story") navigate(`/story/${id}`);
  };

  return (
    <div className="mx-auto flex flex-col align-middle">
      <h1>Search Results for "{query}"</h1>
      <section className="grid grid-cols-1 gap-6 align-middle mx-auto mt-5">
        {searchResults.map((result) => {
          const story = storyList.find((s) => s.id === result.ref);
          return (
            story && (
              <SearchResultCard
                key={story.id}
                id={story.id}
                //@ts-expect-error(123)
                image={story.img_url?.[0]}
                title={story.title || "Untitled"}
                //@ts-expect-error(123)
                tags={story.tags}
                author={story.author || "Unknown"}
                onClick={() => handleContentClick(story.id, "story")}
              />
            )
          );
        })}
      </section>
    </div>
  );
};

export default SearchResultsPage;
