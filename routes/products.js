var express = require('express');
var router = express.Router();
var fs = require('fs-extra');

// GET product model
var Product = require('../models/product');

var Category = require('../models/category');
// exports
router.get('/',(req,res)=>{
    Product.find(function(err,products){
        if(err){
            console.log(err);
        }

        res.render('all_product',{
            title:'All products',
            products:products
        });
    });
});

// GET a page

router.get('/:category',(req,res)=>{
    var categorySlug = req.params.category;
    // console.log(categorySlug);
    Category.find({slug:categorySlug},function(err,c){
    
        Product.find({category:categorySlug},function(err,products){
            if(err){
                console.log(err);
            }

            res.render('cat_products',{
                title:c.title,
                products:products
            });
        });
    });
});

// product details
router.get('/:category/:product',function(req,res){
    var galleryImage = null;
    
    Product.findOne({slug:req.params.product},function(err,pro){
        if(err){
            console.log(err);
        }else{
            // console.log(req.params.id);
            // console.log(pro._id);
            // var GalleryDir = 'public/product_images/'+ pro._id+'/gallery';
            // console.log(GalleryDir);
            // fs.readdir(GalleryDir,function(err,files){
            //     if(err){
            //         console.log(err);
            //     }else{
                    // galleryImage = files; 
                    // console.log(pro.title);
                    res.render('prod',{
                    title:pro.title,
                    p:pro
                    
                    });
                // }
            // });
        }
    });
});

module.exports = router;


// <div class="col-xs-12">
// <ul class="gallery">
//       <%  galleryImage.forEach(function(img){ %>
//         <%   if(img!="thumbs"){%>
//                 <li>
//                     <a  data-fancybox="gallery" href="/product_images/<%=p.id%>/gallery/<%=image%>">
//                     <img src="/product_image/<%=p.id%>/gallery/thumbs/<%=image%>" alt="">
//                     </a>
//                 </li>
//             <%  } %>
//         <%}) %>
// </ul>
// </div>