function showSubMenu(){
	var nowID = this.id.substring(4);
	document.querySelector("#sub"+nowID).classList.add("open");		
}
	
function hideSubMenu(){
	var nowID = this.id.substring(4);
	document.querySelector("#sub"+nowID).classList.remove("open");	
}

for(var i=1; i<=5; i++){
	document.querySelector("#menu"+i).addEventListener("mouseover", showSubMenu);
	document.querySelector("#menu"+i).addEventListener("mouseout", hideSubMenu);
}

