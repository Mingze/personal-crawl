//fonction for check if the logement has been added and if the price is the same.
function check_id_loge(id,price,list_announce){
    var found = false;
    var list_id = [];
    Object.keys(list_announce).forEach(function (key){
        var idDoc = key;
        
      
        var table = Object.keys(list_announce[key]);
        for (var i=0; i<table.length; i++){

            var id_his = table[i];
            // console.log(id_his +" VS "+id)
            if( id_his == id )
            {   
                // console.log("matched!")
                if(price == list_announce[key][id_his]){
                    console.log("logement déjà crawled, price no change")
                }
                else if(price < list_announce[key][id_his]){
                    console.log("logement déjà crawled, price baissé!!! Old price:"+list_announce[key][id_his]+",new price:"+price)
                }
                else{
                    console.log("logement déjà crawled, price monté. Old price:"+list_announce[key][id_his]+",new price:"+price);
                }
                found = true;
                break;
            } 
            else {
                found = false
                // console.log("")
            }
        }
    });

    if(found == false){
        console.log("new logement");
    }

    // console.log(list_id)
}
module.exports.check_id_loge = check_id_loge;