import * as lunr from "lunr";

const documents = [
  { id: 1, title: "Foo", content: "Foo content" },
  { id: 2, title: "Bar", content: "Bar content" },
  { id: 3, title: "Baz", content: "Baz content" },
];

const idx = lunr(function (this: lunr.Builder) {
  this.field("title");
  this.field("content");
  this.ref("id");

  documents.forEach((doc) => {
    this.add(doc);
  });
});

// 執行搜尋
const results = idx.search("Fo*"); // 使用模糊搜尋
console.log(results);
