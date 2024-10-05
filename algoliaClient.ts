import algoliasearch from "algoliasearch/lite";

const searchClient = algoliasearch("2NF2Y4R6FO", "68a9eb9be6c7506bf7cc4b4097502d65");
const index = searchClient.initIndex("title");

export { searchClient, index };
