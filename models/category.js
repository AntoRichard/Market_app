const mongoose = require('mongoose');

// category schema
let categorySchema = mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    slug:{
        type:String
    }
}); 
let page = module.exports = mongoose.model('Category',categorySchema);