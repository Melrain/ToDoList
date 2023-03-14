//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

//mongoose
const mongoose = require("mongoose");

async function Main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/listDB");
  console.log("已启动数据库");
}

Main().catch((err) => {
  console.log(err);
});

const itemSchema = mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "welcome to the toDoList",
});

const item2 = new Item({
  name: "Hit the + button to add new item",
});

const item3 = new Item({
  name: "<--hit this to delete a item",
});

const itemsArray = [item1, item2, item3];

//mongoose

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", async function (req, res) {
  let items = await Item.find({});

  if (items.length === 0) {
    Item.insertMany(itemsArray)
      .then(() => {
        console.log("successfully added" + itemsArray);
      })
      .catch((error) => {
        console.log(error);
      });
    res.redirect("/");
  } else {
    res.render("list", { listTitle: "today", newListItems: items });
  }
});

//用户自定义列表:

  app.get("/:customList",(req,res)=>{
    const customList = req.params.customList;

  })

app.post("/", function (req, res) {
  const itemName = req.body.newItem;

  const newItem = new Item({
    name: itemName,
  });

  //保存在Item这个model里面，页面载入的list就是这个models
  newItem.save();

  res.redirect("/");
});

//删除item
app.post("/delete", (req, res) => {
  let _idDelete = req.body.checkbox;
  console.log(_idDelete);
  Item.findByIdAndRemove(_idDelete)
    .then(() => {
      console.log("successfuly deleted");
      res.redirect("/");
    })
    .catch((error) => {
      console.log(error);
    });
});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

// app.get("/about", function (req, res) {
//   res.render("about");
// });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
