const mongoose = require('mongoose');

// pages schema
let pageSchema = mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    slug:{
        type:String
    },
    content:{
        type:String,
        require:true
    },
    sorting:{
        type:String,
        require:true
    }
}); 
let page = module.exports = mongoose.model('Page',pageSchema);