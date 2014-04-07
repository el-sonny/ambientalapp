var Spooky = require('spooky');

var spooky = new Spooky({
    child: {transport: 'http'},
    casper: {
        logLevel: 'debug',
        verbose: true,
        options: {
 			clientScripts : ['/home/sonny/dev/mayab/bower_components/jquery/dist/jquery.js'],
 		}
    }
}, function (err) {
    if (err) {
        e = new Error('Failed to initialize SpookyJS');
        e.details = err;
        throw e;
    }
    spooky.start('http://app1.semarnat.gob.mx/consultatramite/inicio.php');
    spooky.then(function (){
    	this.evaluate(function(mia) {
		    document.querySelector('input[name="_idBitacora"]').value = mia;
		    document.querySelector('input[name="listadoarea2_r12_c8"]').click();
		}, '23QR2013MD095');
    });
    spooky.then(function(){
        this.emit('loaded_mia', this.evaluate(function (){
            return document.documentElement.outerHTML;
        }));
    });
    spooky.run();
});
spooky.on('error', function (e, stack) {
    console.error(e);
    if(stack) console.log(stack);
});
spooky.on('console', function (line){console.log(line);});
spooky.on('loaded_mia', function (mia) {
    console.log(mia);
});