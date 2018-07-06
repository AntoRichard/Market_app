var express = require('express');
var router = express.Router();
var Category = require('../models/category');

// exports
// GET categories index
router.get('/',(req,res)=>{
    Category.find(function(err,categories){
        if(err) return console.log(err)
        res.render('category',{
            categories:categories
        })
    })
});

// GET categories page
router.get('/add-categories',(req,res)=>{
    let title = "";
    let slug = "";

    res.render('add_categories',{
        title:title,
        slug:slug
    });
});



// POST categories categories
router.post('/add-categories',(req,res)=>{

    req.checkBody('title','title must have some value').notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g,'-').toLowerCase();
    
    let errors = req.validationErrors();
    if(errors){
        res.render('add_categories',{
            errors:errors,
            title:title
        });
    }else{
        // console.log("success");
        Category.findOne({slug:slug},(err,category)=>{
            if(category){
                req.flash('danger','Category slug exist,choose another.');
                res.render('add_categories',{
                    title:title,
                    slug:slug
                });
                console.log('if');
            }else{
                console.log('else')
                var category = new Category({
                    title:title,
                    slug:slug
                });
                category.save(function(err){
                    if(err) return console.log(err);

                    
                    Category.find(function(err,categories){
                        if(err){
                            console.log(err);
                        }else{
                            req.app.locals.categories = categories ;
                        }
                    });

                    req.flash('success','category added');
                    res.redirect('/admin/categories');
                })
            }
        });
    }
    
});


// GET edit categories
router.get('/edit-categories/:id',(req,res)=>{
    Category.findById(req.params.id,(err,category)=>{
        if(err)
            return console.log(err);

    res.render('edit_category',{
        title:category.title,
        id:category._id
    });
    });
});

// POST edit categories
router.post('/edit-categories/:id',(req,res)=>{

    req.checkBody('title','title must have some value').notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g,'-').toLowerCase();
    let id = req.params.id;
    
    let errors = req.validationErrors();
    if(errors){
        res.render('edit_category',{
            errors:errors,
            title:title,
            id:id
        });
    }else{
        // console.log("success");
        Category.findOne({slug:slug,_id:{'$ne':id}},(err,category)=>{
            if(category){
                req.flash('danger','Page slug exist,choose another.');
                res.render('edit_category',{
                    title:title,
                    slug:slug
                });
                console.log('if');
            }else{
               Category.findById(id,(err,category)=>{
                   if(err) return console.log(err);

                category.title = title;
                category.slug = slug;

                category.save(function(err){
                    if(err) return console.log(err);

                    Category.find(function(err,categories){
                        if(err){
                            console.log(err);
                        }else{
                            req.app.locals.categories = categories ;
                        }
                    });

                    req.flash('success','page edited');
                    res.redirect('/admin/categories/');
                })
               });
            }
        });
    }
    
});

// GET delete categories
router.get('/delete-categories/:id',(req,res)=>{
    Category.findByIdAndRemove(req.params.id,function(err){
        if(err) return console.log(err);

        req.flash('success','page removed');
        res.redirect('/admin/categories/');
    });
});



module.exports = router;