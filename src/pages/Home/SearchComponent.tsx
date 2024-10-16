// import { useState, useMemo } from "react";
// import lunr from "lunr";
import { useState } from "react";
import { Configure, Highlight, Hits, InstantSearch, SearchBox } from "react-instantsearch-dom";
import { searchClient } from "../../../algoliaClient";
// import { Input } from "@nextui-org/react";
// import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
// import { FiSearch } from "react-icons/fi";

// interface Story {
//   id: string;
//   title?: string;
//   author?: string;
//   created_at?: { seconds: number; nanoseconds: number };
// }

// interface SearchComponentProps {
//   storyList: Story[];
//   scriptList: Story[];
//   onSearchResults: (results: lunr.Index.Result[]) => void;
// }

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

// const SearchComponent = () => {
//   const { isOpen, onOpen, onOpenChange } = useDisclosure();

//   return (
//     <>
//       <Input
//         classNames={{
//           base: "max-w-full sm:max-w-[10rem] h-10",
//           mainWrapper: "h-full",
//           input: "text-small",
//           inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
//         }}
//         placeholder="Search..."
//         size="sm"
//         startContent={<FiSearch size={18} />}
//         type="search"
//         onClick={onOpen}
//       />
//       <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl" className="h-[500px]">
//         <ModalContent>
//           {(onClose) => (
//             <>
//               <ModalHeader className="flex flex-col gap-1">Search</ModalHeader>
//               <ModalBody>
//                 <AlgoliaSearch />
//               </ModalBody>
//               <ModalFooter>
//                 <Button color="danger" variant="light" onPress={onClose}>
//                   Close
//                 </Button>
//               </ModalFooter>
//             </>
//           )}
//         </ModalContent>
//       </Modal>
//     </>
//   );
// };

// const SearchComponent = ({ storyList, scriptList, onSearchResults }: SearchComponentProps) => {
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [, setSearchClicked] = useState<boolean>(false);

//   const idx = useMemo(() => {
//     if (!storyList || !scriptList) return null;

//     return lunr(function (this: lunr.Builder) {
//       this.ref("id");
//       this.field("id");
//       this.field("title");
//       this.field("author");
//       this.field("summary");
//       this.field("tags");

//       storyList.forEach((story) => {
//         this.add(story);
//       });

//       scriptList.forEach((script) => {
//         this.add(script);
//       });
//     });
//   }, [storyList, scriptList]);

//   const handleSearch = () => {
//     setSearchClicked(true);
//     if (idx && searchTerm) {
//       const results = idx.search(searchTerm);
//       onSearchResults(results);
//     } else {
//       onSearchResults([]);
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       handleSearch();
//     }
//   };

//   const clearSearch = () => {
//     setSearchTerm("");
//     onSearchResults([]);
//     setSearchClicked(false);
//   };

//   return (
//     <div className="mb-4 relative">
//       <div className="flex gap-4 align-middle">
//         <input
//           type="text"
//           placeholder="Search title, summary, author, tags"
//           value={searchTerm}
//           onKeyDown={handleKeyDown}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         {searchTerm && (
//           <button
//             onClick={clearSearch}
//             className="w-1 h-1 border-none absolute right-44 top-2 bg-transparent text-gray-500 hover:text-gray-700"
//           >
//             ✖
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

export default SearchComponent;
