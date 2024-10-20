import { useState } from "react";
import { Configure, Highlight, Hits, InstantSearch, SearchBox } from "react-instantsearch-dom";
import { searchClient } from "../../../algoliaClient";

interface HitType {
  title: string;
  author: string;
}
const Hit = ({ hit }: { hit: HitType }) => (
  <div>
    <div>
      <Highlight attribute="title" hit={hit} />
    </div>
    <div>
      <Highlight attribute="author" hit={hit} />
    </div>
  </div>
);

const SearchComponent = () => {
  const [query, setQuery] = useState("");

  return (
    <InstantSearch searchClient={searchClient} indexName="title">
      <SearchBox onChange={(event) => setQuery(event.currentTarget.value)} searchAsYouType={false} />
      {query && <Hits hitComponent={Hit} />}
      <Configure hitsPerPage={10} />
    </InstantSearch>
  );
};

export default SearchComponent;
