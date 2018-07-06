const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session'); 
const ExpressValidator = require('express-validator');
// const Page = require('./models/page');
const fileupload = require('express-fileupload');

const config = require('./config/database');
let path = require('path');
const PORT = 3000;

// Connecting to Database
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',()=>{
    console.log("connected to database");
});
// initilise app
let app = express();

// setup view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');


// GET page model
 var Page = require('./models/page');

//  get all pages to pass to header.ejs
    Page.find({}).sort({sorting:1}).exec(function(err,pages){
        if(err){
            console.log(err);
        }else{
            app.locals.pages = pages;
        }
    });

 // GET page model
 var Category = require('./models/category');

 //  get all Category to pass to header.ejs
    Category.find(function(err,categories){
         if(err){
             console.log(err);
         }else{
             app.locals.categories = categories ;
         }
     });



// express fileupload 
app.use(fileupload());


// Body-Parser middleware 
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Session middleware
app.use(session({
    secret:'keyboard cat',
    resave:true,
    aveUninitialized:true
    // cookie:{secure:true}
}));



// express-validator middleware
app.use(ExpressValidator({
    errorFormatter:function(param,msg,value){
        var nameSpace = param.split('.'),
        root = nameSpace.shift(),
        formparam = root;
        while(nameSpace.length){
            formparam+='['+nameSpace.shift()+']';
        }
        return{
            param:formparam,
            msg:msg,
            value:value
        };
    },
    customValidators:{
        isImage:function(value,filename){
            var extension = (path.extname(filename)).toLowerCase();
            switch(extension)
            {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                default:
                    return false;
            }
        }
    }
}));
// Connect flash

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

 // express middleware
app.get('*',function(req,res,next){
    res.locals.cart = req.session.cart;
    next();
})

// setup public folder
app.use(express.static(path.join(__dirname,'public')));

// setup local variables
app.locals.errors = null;

// set routes
var cart = require('./routes/cart.js');
var pages = require('./routes/pages.js');
var products = require('./routes/products.js');
var adminPages = require('./routes/adminpages.js');
var adminProduct = require('./routes/product.js');
var adminCategories = require('./routes/category.js');



app.use('/',pages);
app.use('/cart',cart);
app.use('/products',products);
app.use('/admin/pages',adminPages);
app.use('/admin/categories',adminCategories);
app.use('/admin/products',adminProduct);




// Server running in port:3000
app.listen(PORT || process.env.PORT,()=>{
    console.log("Server is running in PORT:"+PORT);
});