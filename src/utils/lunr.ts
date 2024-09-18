import lunr from "lunr";

// 假設我們有一些文件
const documents = [
  { id: 1, title: "Foo", content: "Foo content" },
  { id: 2, title: "Bar", content: "Bar content" },
  { id: 3, title: "Baz", content: "Baz content" },
];

// 建立索引
const idx = lunr(function () {
  this.field("title");
  this.field("content");
  this.ref("id");

  documents.forEach(function (doc) {
    this.add(doc);
  }, this);
});

// 執行搜尋
const results = idx.search("Fo*"); // 使用模糊搜尋
console.log(results);
