var express = require('express');
var router = express.Router();
var Page = require('../models/page');

// exports
// GET page index
router.get('/',(req,res)=>{
    Page.find({}).sort({sorting:1}).exec((err,pages)=>{
        res.render('pages',{
            pages:pages
        })
    })
});

// GET add page
router.get('/add-page',(req,res)=>{
    let title = "";
    let slug = "";
    let content = "";

    res.render('add_page',{
        title:title,
        slug:slug,
        content:content
    });
});



// POST add page
router.post('/add-page',(req,res)=>{

    req.checkBody('title','title must have some value').notEmpty();
    req.checkBody('content','content must have some value').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if(slug == "") slug =  title.replace(/\s+/g,'-').toLowerCase();
    let content = req.body.content;
    
    let errors = req.validationErrors();
    if(errors){
        res.render('add_page',{
            errors:errors,
            title:title,
            slug:slug,
            content:content
        });
    }else{
        // console.log("success");
        Page.findOne({slug:slug},(err,page)=>{
            if(page){
                req.flash('danger','Page slug exist,choose another.');
                res.render('add_page',{
                    title:title,
                    slug:slug,
                    content:content
                });
                console.log('if');
            }else{
                console.log('else')
                var page = new Page({
                    title:title,
                    slug:slug,
                    content:content,
                    sorting:100
                });
                page.save(function(err){
                    if(err) return console.log(err);
                    
                    
                    Page.find({}).sort({sorting:1}).exec((err,pages)=>{
                        if(err){
                            console.log(err);
                        }else{
                            req.app.locals.pages = pages;
                        }
                     });

                    req.flash('success','page added');
                    res.redirect('/admin/pages');
                })
            }
        });
    }
    
});


// GET edit page
router.get('/edit-page/:id',(req,res)=>{
    Page.findById(req.params.id,(err,page)=>{
        if(err)
            return console.log(err);

    res.render('edit_page',{
        title:page.title,
        slug:page.slug,
        content:page.content,
        id:page._id
    });
    });
});

// POST edit page
router.post('/edit-page/:id',(req,res)=>{

    req.checkBody('title','title must have some value').notEmpty();
    req.checkBody('content','content must have some value').notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g,'-').toLowerCase();
    if(slug == "") slug =  title.replace(/\s+/g,'-').toLowerCase();
    let content = req.body.content;
    let id = req.params.id;
    
    let errors = req.validationErrors();
    if(errors){
        res.render('edit_page',{
            errors:errors,
            title:title,
            slug:slug,
            content:content,
            id:id
        });
    }else{
        // console.log("success");
        Page.findOne({slug:slug,_id:{'$ne':id}},(err,page)=>{
            if(page){
                req.flash('danger','Page slug exist,choose another.');
                res.render('add_page',{
                    title:title,
                    slug:slug,
                    content:content
                });
                console.log('if');
            }else{
               Page.findById(id,(err,page)=>{
                   if(err) return console.log(err);

                page.title = title;
                page.slug = slug;
                page.content = content;
                page.save(function(err){
                    if(err) return console.log(err);

                    req.flash('success','page edited');
                    res.redirect('/admin/pages');
                })
               });
            }
        });
    }
    
});

// GET delete page
router.get('/delete-page/:id',(req,res)=>{
    Page.findByIdAndRemove(req.params.id,function(err){
        if(err) return console.log(err);

        Page.find({}).sort({sorting:1}).exec((err,pages)=>{
            if(err){
                console.log(err);
            }else{
                req.app.locals.pages = pages;
            }
         });

        req.flash('success','page removed');
        res.redirect('/admin/pages/');
    });
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