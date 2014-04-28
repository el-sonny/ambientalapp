module.exports = {
	wget : function(file,cb){	
		var fname = file.url.split('/');
		fname = fname[fname.length -1];
		console.log('downloading '+fname);
		var util = require('util'),
		    exec = require('child_process').exec,
		    child,

		child = exec('wget -O '+file.dir+fname +' '+ url,
		  function (error, stdout, stderr) {
		    // console.log('stdout: ' + stdout);
		    // console.log('stderr: ' + stderr);
		    if (error !== null) {
		      console.log('exec error: ' + error);
		      cb(error,url);
		    }
		});
		child.on('exit',function(){
			console.log('downloaded: '+fname);
			cb(null,file.dir+fname);
		})
	},
}