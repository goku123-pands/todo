const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const mongoose=require("mongoose");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
var day="";
mongoose.connect("mongodb+srv://admin-shubh:test123@cluster0.gfq4a.mongodb.net/todolistDB",
{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const itemSchema = {
    
    name: String
};

const Item = mongoose.model("Item", itemSchema );

const item1 = new Item({
    name: "Welcome to your TODO list."
});

const item2 = new Item({
    name: "Hit + button to add new items."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});
const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List= mongoose.model("List", listSchema);


app.get("/",function(req,res){
    
    Item.find({}, function(err, result){

        if(result.length===0)
        {

            Item.insertMany(defaultItems, function(err){
                if(err)
                console.log("Invalid entry");
                else
                console.log("successful !!");
            });
            res.redirect("/");
        }
        else
        {
       
        var today=new Date();
        var options={weekday: "long", month: "long",  day: "numeric"};
        day=today.toLocaleDateString("en-US",options);
        res.render("list.ejs",{x: day,newList: result});
        }
    });

   
});

app.post("/", function(req,res){
    
   const itemName = req.body.newItem;
    const listName = req.body.button;

   const newItem= new Item({
       name: itemName
   });
   var today=new Date();
   var options={weekday: "long", month: "long",  day: "numeric"};
   day=today.toLocaleDateString("en-US",options);
   if(listName===day)
   {
       newItem.save();
        res.redirect("/");
       
   }
   else{
       List.findOne({name: listName}, function(err, result){
            result.items.push(newItem);
            result.save();
            res.redirect("/"+listName); 
       });
   }
 
});


app.post("/delete", function(req,res){
    const checkedItemID = req.body.checkbox;
    const listName= req.body.listName;
    
    var today=new Date();
    var options={weekday: "long", month: "long",  day: "numeric"};
    day=today.toLocaleDateString("en-US",options);
    if(listName===day)
    {
        Item.findByIdAndRemove(checkedItemID,function(err,docs){

            if(!err)
            {
                
                res.redirect("/");
            }
            else{
                console.log(err);
            }
        });
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemID}}}, function(err, result){
            if(!err)
            {
                res.redirect("/" + listName);
            }
            else console.log(err);
        });
    }
    
   
    
});

app.get("/:customListName", (req,res)=>{
    const customListName = req.params.customListName; 
   List.findOne({name: customListName}, function(err, result){
        if(!err)
        {
            if(!result)
            {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else
            {
                res.render("list.ejs", {x: result.name,newList: result.items});
            }
        }
   });

  
    
});


app.listen(process.env.PORT,()=>{
    console.log("i am listening");
});