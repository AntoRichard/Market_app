var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp'); 
var fs = require('fs-extra');
var resizeImg = require('resize-img');

// GET products model
var Product = require('../models/product');

// GET category model
var Category = require('../models/category');

// exports
// GET product index
router.get('/',(req,res)=>{
   var count;
   Product.count(function(err,c){
       count = c;
   })
   Product.find(function(err,product){
       res.render('product',{
            product:product,
            count:count
       });
   });
});

// GET add product
router.get('/add-product',(req,res)=>{
    let title = "";
    let desc = "";
    let price = "";
    Category.find(function(err,categories){
        res.render('add_product',{
            title:title,
            desc:desc,
            categories:categories,
            price:price
        });
    });
});



// POST add product
router.post('/add-product',(req,res)=>{

    var imageFile = typeof req.files.image !== 'undefined'?req.files.image.name : "";

    // req.checkBody('title','title must have some value').notEmpty();
    // req.checkBody('description','description must have some value').notEmpty();
    // req.checkBody('price','price must have some value').isDecimal();
    // req.checkBody('image','image must have some value').isImage(imageFile);
    
    let title = req.body.title;
    let slug = title.replace(/\s+/g,'-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let category = req.body.category;

    let errors = req.validationErrors();
    if(errors){
        Category.find(function(err,category){
            res.render('add_product',{
                errors:errors,
                title:title,
                desc:desc,
                category:category,
                price:price
            });
        });
    }else{
        // console.log("success");
        Product.findOne({slug:slug},(err,product)=>{
            if(product){
                req.flash('danger','Product  exist,choose another.');
                Category.find({},function(err,category){
                    res.render('add_product',{
                        title:title,
                        desc:desc,
                        category:category,
                        price:price
                    });
                });
                console.log('if');
            }else{
                console.log('else');
                var price2 = parseInt(price).toFixed(2);
                var product = new Product({
                    title:title,
                    slug:slug,
                    desc:desc,
                    price:price2,
                    category:category,
                    image:imageFile
                });
                product.save(function(err){
                    if(err) return console.log(err);
                     
                    mkdirp('public/product_images/'+product._id,function(err){
                        return console.log(err);
                    });

                    mkdirp('public/product_images/'+product._id+'/gallery',function(err){
                        return console.log(err);
                    });

                    mkdirp('public/product_images/'+product._id+'/gallery/thumbs',function(err){
                        return console.log(err);
                    });

                    if(imageFile!="")
                    {
                        var productImage = req.files.image;
                        var path = 'public/product_images/'+product._id+'/'+imageFile;

                        productImage.mv(path,function(err){
                            return console.log(err);
                        });
                    }
                    req.flash('success','product added');
                    res.redirect('/admin/product');
                })
            }
        });
    }
    
});


// GET edit page
router.get('/edit-product/:id',(req,res)=>{

    var errors;
    if(req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    Category.find(function(err,categories){
        Product.findById(req.params.id,function(err,p){ 
            if(err){
                return console.log(err);
                res.redirect('/product');
            }else{
                var galleryDir = 'public/product_images/'+p._id+'/gallery';
                var galleryImages = null;
                fs.readdir(galleryDir,function(err,files){
                     if(err){
                         console.log(err);
                     }else{
                         galleryImages = files;
    
                            res.render('edit_product',{
                                title:p.title,
                                errors:errors,
                                desc:p.desc,
                                categories:categories,
                                category:p.category.replace(/\s+/g,'-').toLowerCase,
                                price:parseFloat(p.price).toFixed(2),
                                image:p.image,
                                galleryImages:galleryImages,
                                id:p._id
                            });
                       
                     }
                });
            }
        })
    })
});

// POST edit product
router.post('/edit-product/:id',(req,res)=>{

    var imageFile = typeof req.files.image !== 'undefined'?req.files.image.name : "";

    // req.checkBody('title','title must have some value').notEmpty();
    // req.checkBody('description','description must have some value').notEmpty();
    // req.checkBody('price','price must have some value').isDecimal();
    // req.checkBody('image','image must have some value').isImage(imageFile);
    
    let title = req.body.title;
    let slug = title.replace(/\s+/g,'-').toLowerCase();
    let desc = req.body.desc;
    let price = req.body.price;
    let category = req.body.category;
    let pimage = req.body.pimage;
    let id = req.params.id;

    var errors = req.validationErrors();

    if(errors){
        req.session.errors = errors;
        res.redirect('/admin/product/edit-product/'+id);
    }else{
        Product.findOne({slug:slug, _id:{'$ne':id}},function(err,p){
            if(err)
                {
                 console.log(err);
                }
            if(p){
                res.flash('danger','Product title exist,choose amother.');
                res.redirect('/admin/product/edit-product/'+id);
            }else{
                Product.findById(id,function(err,p){
                    if(err) 
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price =  parseFloat(price).toFixed(2);
                    p.category = category;
                    if(imageFile != ""){
                        p.image = imageFile;
                    }
                    p.save(function(err){
                        if(err)  
                            console.log(err);
                        
                        if(imageFile != ""){
                            if(pimage != ""){
                                fs.remove('/public/product_images/'+id+'/'+pimage,function(err){
                                    if(err){
                                        console.log(err);
                                    }

                                }); 
                            }
                            var productImage = req.files.image;
                            var path = 'public/product_images/'+id+'/'+imageFile;

                            productImage.mv(path,function(err){
                             console.log(err);
                            });
                        }
                        // res.flash('Success','product edited');
                        res.redirect('/admin/product'); 
                    })
                })
            }
        })
    }
    
});

// POST product gallery
// router.get('/product-gallery/:id',(req,res)=>{
//     var productImage = req.files.file;
//     var id = req.params.id;
//     var path = 'public/product_images/'+id+'/gallery'+req.files.file.name;
//     var thumbsPath = 'public/product_images/'+id+'/gallery/thumbs/'+req.files.file.name;

//     productImage.mv(path,function(err){
//         if(err)
//             console.log(err);
//     })
// });

// GET delete page
router.get('/delete-product/:id',(req,res)=>{
    
    var id = req.params.id;
    var path =  '/public/product_images/'+id;
    fs.remove(path,function(err){
        if(err)
        {
            console.log(err);
        }else{
            Product.findByIdAndRemove(id,function(err){
                if(err){
                    console.log(err);
                }
            });
            // req.flash('success','Product removed');
            res.redirect('/admin/product');
        }
    })
});


// page reorder 
router.post('/reorder-pages"',(req,res)=>{
    console.log(req.body);
  var ids = req.body['id[]'];
  let count = 0;
  for(var i=0;i<ids.length;i++)
  {
       var id = ids[i];
       count++;
       Page.findById(id,(err,page)=>{
            page.sorting = count;
            page.save((err)=>{
                if(err) return console.log(err);
            })
       })
  }
});
module.exports = router;