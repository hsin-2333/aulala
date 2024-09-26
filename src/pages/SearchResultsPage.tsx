import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
//@ts-expect-error(123)
import lunr from "lunr";
import dbApi from "../utils/firebaseService";
import { AudioCard } from "../components/Card";

interface Story {
  id: string;
  title?: string;
  author?: string;
  created_at?: { seconds: number; nanoseconds: number };
}

const SearchResultsPage = () => {
  const location = useLocation();
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

  return (
    <div>
      <h1>Search Results for "{query}"</h1>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 2xl:grid-cols-4">
        {searchResults.map((result) => {
          const story = storyList.find((s) => s.id === result.ref);
          return (
            story && (
              <AudioCard
                key={story.id}
                id={story.id}
                //@ts-expect-error(123)
                image={story.img_url?.[0]}
                title={story.title || "Untitled"}
                //@ts-expect-error(123)
                tags={story.tags}
                author={story.author || "Unknown"}
              />
            )
          );
        })}
      </section>
    </div>
  );
};

export default SearchResultsPage;
