  // setTimeout(function(){
  //     var old_delay = 300;
  //         for (var i=1;i<11; i++) {
              
  //             var random = getRandomInt(900, 1800);;
              
  //             old_delay += random;
  //             console.log("r:"+random+". old_delay:"+old_delay);

  //            (function(ind) {
  //            setTimeout(function(){
  //             coucou(achat_url+'&LISTING-LISTpg='+ind, ville, function(data){
  //                 console.log("Page Number:"+ind);    
                      
  //                 archive(data);                 
                  
  //             });
         

  //             }, old_delay * ((ind*10+1) + i));
  //            })(i);
  //         }
  //       }, 60000 );    

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


var time = new Date();
var stop = false;
console.log(time.toISOString())
 setTimeout(function(){
  var time = new Date();
  console.log(time.toISOString())
    var old_delay = 300;
    for (var i=1;i<11;i++) {
     console.log("in loop") ;
       var time = new Date();
       console.log(time.toISOString());

       (function(ind) {
         var random = getRandomInt(600, 900);
       setTimeout(function(){
        if (i == 5)
        {
          stop = true;
        }
        var time = new Date();
        console.log(time.toISOString())
        
        console.log("Page Number:"+ind);    
        console.log("Random:"+random);
        console.log("old_delay:"+old_delay);  
        console.log("wait time:"+ ( 800*ind + random + old_delay));
        old_delay = random;
        // console.log(list_id_announce);

        }, 800*ind + random + old_delay);
       })(i);
       console.log("here in check i:"+i +", with stop:"+stop)
       if( stop == true){

          break;
        }
        else{
          console.log(i);
        }
    }
}, 100 );    