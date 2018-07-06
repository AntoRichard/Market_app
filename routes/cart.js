
var express = require('express');
var router = express.Router();
var Product = require('../models/product');

// exports
router.get('/add/:product',(req,res)=>{
    var slug = req.params.product;
    Product.findOne({slug:slug},function(err,p){
        if(err){
            console.log(err);
        }
            if(typeof req.session.cart == "undefined")
            {
                req.session.cart = [];
                req.session.cart.push({
                    title:slug,
                    quantity:1,
                    price:parseFloat(p.price).toFixed(2),
                    image:'/product_images/'+p._id+'/'+p.image
                }) 
            }else{
                var cart = req.session.cart;
                var newItem = true;
                for(var i=0;i<cart.length;i++)
                {
                    if(cart[i].title==slug){
                        cart[i].quantity++;
                        newItem=false;
                        break; 
                    }
                }
                if(newItem){
                    cart.push({
                        title:slug,
                        quantity:1,
                        price:parseFloat(p.price).toFixed(2),
                        image:'/product_images/'+p._id+'/'+p.image
                    }) 
                }
            }
            console.log(req.session.cart);
            res.redirect('back');
    });
});

// GET a page
// router.get('/:slug',(req,res)=>{

//     var slug = req.params.slug;

//     Page.findOne({slug:slug},function(err,page){
//         if(err){
//             console.log(err);
//         }
//         if(!page){
//             res.redirect('/');
//         }else{
//             res.render('index',{
//                 title:page.title,
//                 content:page.content
//             });
//         }
//     });
    
// });


module.exports = router;
