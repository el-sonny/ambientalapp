var moment = require('moment');
var ejs = require('ejs');
ejs.filters.formatDate = function(date){
  moment.lang('es');
  return moment(date).format('MMMM Do YYYY');
}