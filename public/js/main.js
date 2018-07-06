$(function(){

    if($('textarea#ta').length){
        CKEDITOR.replace('ta');
    }
    $('a.comformDelete').on('click',function(){
        if(!confirm('confirm delete')){
            return false;
        }
    })

});