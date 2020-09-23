var express      = require("express"),
app              = express(),
expressSanitizer = require("express-sanitizer"),
methodOverride   = require("method-override"),
mongoose         = require("mongoose"),
bodyParser       = require("body-parser"),
port             = 3000;

//App config
mongoose.connect("mongodb://localhost/restful_blog_app");
mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


//Mongoose/Model Config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create ({
//     title: "Test Blog",
//     image: "https://images.unsplash.com/photo-1497993950456-cdb57afd1cf1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80",
//     body: "Hello this is a blog Post"
// });

//RESTful routes
app.get("/", function(req, res){
    res.redirect("/blogs");
});

//Index route
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("Error");
        }else {
            res.render("index", {blogs: blogs});
        }
    });
});

//New Route
app.get("/blogs/new", function(req, res){
    res.render("new");
});
//Create Route
app.post("/blogs", function(req, res){
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        }else {
            //then, redirect to the index
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else {
            res.render("show", {blog: foundBlog});
        }
    })
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else {
            res.render("edit", {blog: foundBlog});
        }
    });
});
//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedblog){
       if(err){
           res.redirect("/blogs");
       }else {
           res.redirect("/blogs/" + req.param.id);
       }
   });
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
    //destroy blog
    Blog.findOneAndRemove({_id : new mongoose.mongo.ObjectID(req.params.id)}, function(err){
        //redirect somewheres
        if(err){
            res.redirect("/blogs");
        }else {
            res.redirect("/blogs");

        }
    });
    
});


app.listen(port, () => console.log(`App listening on port ${port}!`));