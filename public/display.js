function checkParent(value){
	if(value == 'Подзадача') {
		document.getElementById('idParent1').hidden = false;
		document.getElementById('idParent2').hidden = false;
	}
	else {
		document.getElementById('idParent1').hidden = true;
		document.getElementById('idParent2').hidden = true;
	}
}