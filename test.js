var length = 31;
var counter = 5;
var result
for (var i =0;i<length;i++){
	if(counter != 10){
		counter ++;
		if(i == length-1){
			console.log("arrrive on fin");
		}
	}
	else{
		
		console.log("arrive on 10!")
		counter = 0;
	}
}