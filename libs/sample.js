/* sample.js */

/**
 * call router
 * - string of baseurl
 * - object of global _GLOBAL
 * - array of header functions
 * - array of footer functions
 */
window.route=new router(
  /* basepath of router */
  window.location.pathname.replace(/^\//,''),
  /* object of router global environment --> _GLOBAL */
  {
    test:function(){
      //_ROUTER.title('Title has been hijack by _GLOBAL.test()...');
      return '[ini dari _GLOBAL.test()]';
    }
  },
  /* array of executable headers */
  [
    function(){
      //_ROUTER.title('Titled by header')
    }
  ],
  /* array of executable footers */
  [
    function(get,routerObject,env){
      //_ROUTER.title('Titled by footer')
    }
  ]
);

/* push router
 * @array of 3 arguments
 *   --> argument 0 = string of path
 *   --> argument 1 = string of title
 *   --> argument 2 = function of callback statement
 */
route.routes.push([
'',
'Blank Judul',
/* r = object of $_GET  */
function(r){
    var query=encodeURIComponent('yang takkan pernah terlupakan selamanya dalam hidupku');
    var html='<pre id="test">Yang takkan '
      +'<a href="testing/test?test='
      +query+'">pernah</a> terlupakan dalam hidupku'
      +'<br /><a href="new/path">New Path</a>'
      +'<br />Other: '
      +'</pre>';
    if(r.test){
      html+='<pre>test: '+r.test+'</pre>';
    }
    document.body.innerHTML=html;
    window.route.anchor();
    try{
    }catch(e){alert('error: failed to write in document.body');}
  },
]);

route.routes.push([
'testing/test',
'Hanya Judul Saja',
function(r){
    var query=encodeURIComponent('yang selalu kunanti');
    var html='<pre>Yang takkan pernah terlupakan selamanya dalam hidupku <a href="'
      +route.baseurl+'?test='+query+'#testing=test">home</a>'
      +'<br /><a href="new/path">New Path</a>'
      +'</pre>';
    if(r.test){
      html+='<pre>test: '+r.test+'</pre>';
    }
    document.body.innerHTML=html;
    window.route.anchor();
    try{
    }catch(e){alert('error: failed to write in document.body');}
  },
]);


/**
 * adding route
 * ~ dynamic global environment
 * @global: (dynamic)
 *   --> _ROUTER = object of active router
 *   --> _GET    = object of query _GET of request URI
 *   --> _FUNC   = object of given functions
 *   --> _ENV    = object of given environments
 * @parameters:
 *   path              = string of path
 *   title             = string of title
 *   content           = string of content template
 *   content_selector  = string of content selector to put into
 *   functions         = object with function name as key
 *                       and string function content to eval
 *   environment       = object
 * @return: pushing to router.routes
 */
route.add(
  /* path */
  'new/path',
  /* title */
  'New Title Name',
  /* content */
  '<pre>New content <br />Isi content adalah: {{_ENV.content}}<br />'
    +'Dan <a href="{{_ROUTER.baseurl}}">Back to Home</a><br />'
    +'FUNC.test: {{_FUNC.test()}}<br />\n\n'
    +'TEST: {{_GLOBAL.test()}}'
    +'<br />'
    +'BORE: {{_ENV.bore()}}'
    +'</pre>',
  /* content selector */
  'body',
  /* functions */
  {
    test:'return \'this is function of test, you cannot defeat me.'
      +'<br /> this is "\'+_ENV.content+\'" environment.\';',
    footer:'return _ROUTER.title(\'Titled by footer path. \'+_this.version);'
  },
  /* environment */
  {
    content:'yang takkan pernah terpikirkan',
    bore:function(){
      return '[this is from _ENV.bore()]';
    },
  }
);

/* initialize */
route.init();
















/*
localStorage.length
localStorage.key()
localStorage.getItem()
localStorage.setItem()
localStorage.removeItem()
localStorage.clear()



*/


















