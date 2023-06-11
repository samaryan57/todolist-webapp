import express from "express"
import bodyParser from "body-parser"
import path from "node:path"
import mongoose from "mongoose"
import _ from "lodash"

const app = express();
const __dirname = path.resolve();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

const asyncMiddleWare = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

app.use((err, req, res, next) => {
    console.log("An error has occured.");
    console.log(err);
    next();
});

// MongoDB Atlas database access key: ejl8tC5g96WtWlyW
mongoose.connect("mongodb+srv://aryansam17:ejl8tC5g96WtWlyW@cluster0.osg5efj.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const defaultItems = [(new Item({name: "Welcome to your To Do List!"})), 
(new Item({name: "Hit the + button to add a new item."})), 
(new Item({name: "<-- Hit this to delete an item."}))];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", asyncMiddleWare(async (req, res, next) => {
    let day = "Today";

    let items = await Item.find({});
    
    if (items.length === 0) {
        await Item.insertMany(defaultItems);
        items = await Item.find({});
    }

    res.render("list", {
        listTitle: day,
        newListItems: items
    });
}));

app.post("/", asyncMiddleWare(async (req, res, next) => {
    const itemName = req.body.newItem;
    const listTitle = req.body.list;
    const newItem = new Item({
        name: itemName
    });

    if (listTitle === "Today") {
        await newItem.save();
        res.redirect("/");
    } else {
        const currentList = await List.findOne({name: listTitle});
        currentList.items.push(newItem);
        await currentList.save();
        res.redirect("/" + listTitle);
    }
}));

app.post("/delete", asyncMiddleWare(async (req, res, next) => {
    const itemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        await Item.deleteOne({_id: itemId});
        res.redirect("/");
    } else {
        await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}});
        res.redirect("/" + listName);
    }  
}));

app.get("/:customListName", asyncMiddleWare(async (req, res, next) => {
    const customListName = _.capitalize(req.params.customListName);
    const currentList = await List.findOne({name: customListName});
    if (!currentList) {
        const list = new List({
            name: customListName,
            items: defaultItems
        });
        await list.save();
        res.render("list", {
            listTitle: customListName,
            newListItems: list.items
        });
    } else {
        res.render("list", {
            listTitle: customListName,
            newListItems: currentList.items
        });
    }
}));

app.get("/about", (req, res) => {
    res.render("about");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000");
});
