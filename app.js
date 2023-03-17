//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

//mongoose
const mongoose = require("mongoose");

async function Main() {
  await mongoose.connect(
    "mongodb+srv://melrain:wszy1989@cluster0.azcsaaz.mongodb.net/listDB"
  );
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
  name: "欢迎来到事件列表",
});

const item2 = new Item({
  name: "点击+号可以增加事件",
});

const item3 = new Item({
  name: "<<<<====按这个小格子可以删除",
});

const defaultList = [item1, item2, item3];

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
    Item.insertMany(defaultList)
      .then(() => {
        console.log("successfully added" + defaultList);
      })
      .catch((error) => {
        console.log(error);
      });
    res.redirect("/");
  } else {
    res.render("list", { listTitle: "Today", newListItems: items });
  }
});

//用户自定义列表:
//自定义一个model

const List = mongoose.model("list", {
  name: String,
  itemList: [itemSchema],
});

app.get("/:customName", (req, res) => {
  const customTitle = _.capitalize(req.params.customName);
  List.findOne({ name: customTitle })
    .then((result) => {
      if (result) {
        console.log("已存在，渲染已存在的列表");
        res.render("list.ejs", {
          listTitle: customTitle,
          newListItems: result.itemList,
        });
      } else {
        console.log("可以创建");
        const customList = new List({
          name: customTitle,
          itemList: defaultList,
        });
        customList.save();
        res.redirect("/" + customTitle);
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

//添加物品
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    async function refresh(){
      await newItem.save();
      res.redirect("/");
    }

    refresh();
    // newItem.save();
    // res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((result) => {
        console.log(result);
        result.itemList.push(newItem);
        async function refresh (){
          await result.save();
          res.redirect("/" + listName);
        }
        refresh();
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

//删除item
app.post("/delete", (req, res) => {
  const listName = req.body.list; //用input:hidden获得页面的Title
  console.log(listName);
  const _idDelete = req.body.checkbox;
  if (listName === "Today") {
    console.log(_idDelete);
    Item.findByIdAndRemove(_idDelete)
      .then(() => {
        console.log("successfuly deleted");
        res.redirect("/");
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    List.findOne({ name: listName })
      .then((result) => {
        console.log(_idDelete);
        console.log(result);
        result.itemList.pull({ _id: _idDelete });
        async function refresh (){
          await result.save();
          res.redirect("/" + listName);
        }
        refresh();
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
