//23QR2013MD095
var casper = require('casper').create();

casper.start('http://app1.semarnat.gob.mx/consultatramite/inicio.php', function() {
    this.echo(this.getTitle());
    casper.evaluate(function(mia) {
	    document.querySelector('input[name="_idBitacora"]').value = mia;
	    document.querySelector('input[name="listadoarea2_r12_c8"]').click();
	}, '23QR2013MD095');

    //this.fill('form[name="Caja1"]', { '_idBitacora' : '23QR2013MD095' }, true);
});
casper.then(function(){
	this.echo(this.fetchText('.tit_menu'));

});


casper.run();