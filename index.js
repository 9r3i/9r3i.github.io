/* error message -- for development only */
window.addEventListener('error',function(e){
  let errorText=[
    e.message,
    'URL: ' + e.filename,
    'Line: ' + e.lineno + ', Column: ' + e.colno,
    'Stack: ' + (e.error && e.error.stack || '(no stack trace)')
  ].join('\n');
  alert(errorText);
  console.error(errorText);
});//*/
/* GLOBALS VARIABLES */
const GLOBALS={
  // host:'http://127.0.0.1:9301/', // host of admin request (mia host)
  host:'https://raw.githubusercontent.com/9r3i/mia/master/public/',
  // host:'https://rawfo.vercel.app/9r3i/mia/master/public/',
  welcome:3, // post id for welcome page
  fakeloader:false, // using fake loader in every start
  haltstart:false, // do halt at start
  /* blog elements */
  main:null,
  title:null,
  path:null,
  nav:null,
  content:null,
  footer:null,
};
/* anonymous async function */
(async function(){
  /* execute the boot script */
  let host=[
    'http://127.0.0.1:9301/', // --> 0
    'http://127.0.0.1:9301/files/', // --> 1
    'https://raw.githubusercontent.com/9r3i/mia/master/public/files/', // --> 2
    'https://rawfo.vercel.app/9r3i/mia/master/public/files/',
  ],
  bname='boot.js',
  bhost=host[2]+'js/boot.js',
  btag=document.getElementById(bname),
  bscript=await fetch(bhost).then(r=>r.text());
  if(!bscript||!bscript.match(/function\sboot/)){
    alert('Error: Failed to load boot.js');
    return;
  }btag.textContent=bscript;
  /* load files */
  let app=new boot(host[2]),
  files=[
    'css/consola.css',
    'css/segoeuil.css',
    'css/mia.css',
    'css/mblog.css',
    'css/atom-one-light.css',
    'js/mia.js',
    'js/parser.js',
    'js/boot.js',
    'js/idb.js',
    'js/highlight.min.js',
    'js/mblog.js',
  ],
  progress=document.querySelector('.progress'),
  span=document.querySelector('span'),
  loaded=await app.bulk(files,e=>{
    if(e.total&&e.total>0){
      progress.setAttribute('max',e.total);
      progress.setAttribute('value',e.loaded);
      span.innerText=Math.floor(e.loaded/e.total*100)
        +'% Loading...';
    }else{
      span.innerText=Math.floor(e.loaded/1024)+'KB - Loading...';
    }
  });
  span.innerText='Completed -- '+(typeof loaded);
  return new mblog;
})();
