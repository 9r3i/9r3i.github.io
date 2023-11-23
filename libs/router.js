/* router.js
 , ~ router for browser
 , authored by 9r3i
 , https://github.com/9r3i
 , started at october 24th 2018 - version 1.0.0 --> using hash
 , continued at october 4th 2019 - version 2.0.0 --> using pathname
 , continued at october 10th 2019 - version 2.0.1 --> fix query parsing
 , continued at november 21st 2024 - version 2.0.2 --> fix comments
 , continued at november 22nd 2024 - version 2.1.0 --> fix method .replace to full eval all string inside the brackets
 , @replacement global letiables:
 ,   --> _GLOBAL = object of global environment
 ,   --> _ROUTER = object of loaded router
 ,   --> _GET    = object of global _GET query fro URI component
 ,   --> _FUNC   = object of current path callable functions
 ,   --> _ENV    = object of current path environment
 , @parameters:
 ,   path    = string of base path; default: /
 ,   globEnv = object of global environment put in window._GLOBAL
 ,   head    = array of router headers; executed in every loaded path header, before content
 ,   foot    = array of router footers; executed in every loaded path footer, after content and anchor
 */
;function router(path,globEnv,head,foot){
/* router version */
this.version='2.1.1';
/* router basepath -- window.location.pathname */
path=typeof path==='string'?path:'/';
path=path.substr(0,1)!='/'?'/'+path:path;
path+=path.substr(-1)!='/'?'/':'';
this.basepath=path;
/* router baseurl -- window.location.href */
this.baseurl=window.location.protocol
  +'//'+window.location.host
  +this.basepath;
/* set global environment */
window._GLOBAL=typeof globEnv==='object'&&globEnv!==null?globEnv:{};
/* prepare headers and footers */
this.headers=[];
this.footers=[];
head=Array.isArray(head)?head:[];
foot=Array.isArray(foot)?foot:[];
/* set header global execution */
for(let i=0;i<head.length;i++){
  if(typeof head[i]==='function'){
    this.headers.push(head[i]);
  }
}
/* set footer global execution */
for(let i=0;i<foot.length;i++){
  if(typeof foot[i]==='function'){
    this.footers.push(foot[i]);
  }
}
/* array of defined routes
 * add using .push()
 * per row contains: array of [path,title,call,env]
 *   path  = string of path
 *   title = string of title
 *   call  = function callback
 *   env   = object of environment, contains:
 *           - path    = string of path (must be the same as above)
 *           - title   = string of title (must be the same as above)
 *           - content = string of content template
 *           - select  = string of content selector to put into
 *           - func    = object of function
 *           - env     = object of environtments
 * recommended using method: add or addBunch
 */
this.routes=[];
/* add bunch of routes -- helper -- [need to be repaired --> not working]
 * ~ order rule is same as add method
 * @paramters:
 *   data      = array of routes to be added
 * @return: bool of success or failed
 */
this.__proto__.addBunch=function(data){
  if(!Array.isArray(data)){return false;}
  for(let i=0;i<data.length;i++){
    this.add.apply(this.add,data[i]);
  }return true;
};
/* add route -- helper
 * ~ add route properly
 * @parameters:
 *   path    = string of pathname; default: [blank]
 *   title   = string of title; default: [blank]
 *   content = string of content; default: [blank]
 *   select  = string of element selector; default: body
 *   funcs   = object of functions; default: {}
 *             --> function header will be executed before content, after _GLOBAL.headers
 *             --> function footer will be executed after content and anchor, before _GLOBAL.footers
 *   env     = object of environtments; default: {}
 * @return: bool of pushing route to this.routes
 */
this.__proto__.add=function(path,title,content,select,funcs,env){
  /* prepare path, title and content */
  path=typeof path==='string'?path:'';
  title=typeof title==='string'?title:'';
  content=typeof content==='string'?content:'';
  select=typeof select==='string'?select:'body';
  /* prepare functions and environment */
  funcs=typeof funcs==='object'&&funcs!==null?funcs:{};
  env==typeof env==='object'&&env!==null?env:{};
  /* prepare default output route to push */
  let output=[path,title];
  /* prepare callback environment, 
   * add path, title, functions, content, selector and enviroment
   */
  let newEnv={
    path:path,
    title:title,
    content:content,
    select:select,
    func:{},
    env:env,
  };
  /* parse func one by one */
  for(let i in funcs){
    try{
      newEnv.func[i]=eval('(function(_get,_this,_env){'+funcs[i]+'})');
    }catch(e){
      console.error('Invalid function "'+i+'".');
    }
  }
  /* push third argument as function (callback)
   * @parementers:
   *   _get  = object of query _GET
   *   _this = object of router
   *   _env  = object of environment
   */
  output.push(function(_get,_this,_env){
    /* prepare current _ROUTER, _GET, _ENV and _FUNC */
    window._ROUTER=_this;
    window._GET=_get;
    window._ENV=_env.env;
    window._FUNC=_env.func;
    /* execute global headers */
    if(Array.isArray(_this.headers)){
      for(let i=0;i<_this.headers.length;i++){
        if(typeof _this.headers[i]==='function'){
          _this.headers[i].call(_this.headers[i],_get,_this,_env);
        }
      }
    }
    /* check for header executable */
    if(_env.func.hasOwnProperty('header')
      &&typeof _env.func.header==='function'){
      _env.func.header(_get,_this,_env);
    }
    /* prepare content replacement */
    let newContent=_this.replace(_env.content);
    /* put content into selector element */
    let el=document.querySelector(_env.select);
    if(el){el.innerHTML=newContent;}
    /* replace all anchors */
    _this.anchor();
    /* check for footer executable */
    if(_env.func.hasOwnProperty('footer')
      &&typeof _env.func.footer==='function'){
      _env.func.footer(_get,_this,_env);
    }
    /* execute global footers */
    if(Array.isArray(_this.footers)){
      for(let i=0;i<_this.footers.length;i++){
        if(typeof _this.footers[i]==='function'){
          _this.footers[i].call(_this.footers[i],_get,_this,_env);
        }
      }
    }
  });
  /* push forth argument as object (environment) */
  output.push(newEnv);
  /* return the routes push */
  return this.routes.push(output);
};
/* anchor -- helper
 * ~ helper to convert all anchors to be callable but _blank targeted
 * @paramters: none
 * @return: always true
 */
this.__proto__.anchor=function(){
  /* get all anchors */
  let ans=document.querySelectorAll('a:not([target="_blank"])');
  /* parse them all */
  let _this=this;
  for(let i=0;i<ans.length;i++){
    ans[i].onclick=function(e){
      /* prevent default action */
      e.preventDefault();
      /* get href attribute */
      let href=this.getAttribute('href');
      if(typeof href!=='string'){return false;}
      /* check href baseurl */
      let baseLength=_this.baseurl.length;
      let isBaseURL=href.substr(0,baseLength)===_this.baseurl?true:false;
      if(href.match(/^https?:\/\//i)&&!isBaseURL){
        return _this.go(href,true);
      }
      /* check base url */
      href=isBaseURL?href.substr(baseLength):href;
      /* then go */
      return _this.go(href);
    };
  }return true;
};
/* initialize
 * ~ initialize for auto-generate route
 * @paramenters: none
 * @return: mixed of executed given call function
 */
this.__proto__.init=function(){
  /* prepare this object */
  let _this=this;
  /* using events.js */
  if(window.hasOwnProperty('WINDOW_EVENTS')){
    WINDOW_EVENTS.onpopstate.push(function(){
      return _this.change();
    });
    WINDOW_EVENTS.execAll();
  }else{
    /* normal statement */
    window.onpopstate=function(){
      return _this.change();
    };
  }
  /* prepare object default */
  let path=window.location.pathname.substr(this.basepath.length),
  fullpath=path+window.location.search+window.location.hash;
  /* go to current path */
  window.history.pushState({path,fullpath},path,fullpath);
  /* return the change */
  return this.change();
};
/* change statement
 * ~ execute change statements
 * @paramenters: none
 * @return: mixed of executed given call function
 */
this.__proto__.change=function(){
  /* prepare pathname */
  let path=window.location.pathname.substr(this.basepath.length);
  /* prepare fullpath */
  let fullpath=path+window.location.search+window.location.hash;
  /* execute full path */
  return this.exec(fullpath);
};
/* path assignment
 * ~ router redirect to pathname -- from basepath
 * @parameters:
 *   path  = string of path; default: [blank]
 *            --> could be included: location.search and location.hash
 *   blank = bool of using direct assign; default: false
 * @return: mixed of router change callback
 */
this.__proto__.go=function(path,blank){
  /* prepare blank assignment */
  blank=typeof blank==='boolean'?blank:false;
  /* assign direct location */
  if(blank){
    return window.location.assign(this.baseurl+path);
  }
  /* go to current path */
  window.history.pushState({
    path:path,
  },path,this.basepath+path);
  /* return the change */
  return this.change();
};
/* exec router statement
 * @paremeters:
 *   path = string of path; default: [blank]
 * @return: mixed of route callback
 */
this.__proto__.exec=function(path){
  /* prepare path */
  path=typeof path==='string'?path:'';
  let p=path.split('?')[0];
  /* set error as false */
  this.error(false);
  /* check route is exist */
  let r=this.route(p);
  if(typeof r!=='object'||r===null){
    let error='Not Found';
    this.title('404 '+error);
    return this.error(error,404);
  }
  /* check call function */
  if(!r.call||typeof r.call!=='function'){
    let error='Missing Function';
    this.title('400 '+error);
    return this.error(error,400);
  }
  /* print out the title */
  if(typeof r.title==='string'){
    this.title(r.title);
  }
  /* prepare query */
  let query=this.query(path.substr(p.length+1).split('#')[0]);
  /* execute call function */
  return r.call.call(r.call,query,this,r.env);
};
/* content replacement
 * ~ replace content using environment
 *   --> replace: {{_ENV.name}} --> window._ENV.name
 *                --> by evaluating environment string
 *   --> evaluating the string between {{ and }}
 * @parameters:
 *   c = string of content; default: [blank]
 * @return: string of replaced content
 */
this.__proto__.replace=function(c){
  c=typeof c==='string'?c:'';
  return c.replace(/\{\{[^\}]+(\}[^\}]+)*\}\}/ig,function(m){
    try{
      return eval(m);
    }catch(e){
      alert('[error:eval] '+e+'\n\n'+m);
    }
  });
};
/* title management
 * @parameters:
 *   s = string of title name
 * @return: always true
 */
this.__proto__.title=function(s){
  s=typeof s==='string'?s:'';
  let t=document.getElementsByTagName('title');
  if(t.length>0){
    for(let i=0;i<t.length;i++){
      t[i].innerText=s;
    }
  }else{
    t=document.createElement('title');
    document.head.appendChild(t);
    t.innerText=s;
  }return true;
};
/* get route
 * ~ find route using path
 * @parameters: 
 *   p = string of path
 * @return: object of route, contain: path, title and call function
 */
this.__proto__.route=function(p){
  let r=false;
  for(let i in this.routes){
    if(!Array.isArray(this.routes[i])
      ||this.routes[i].length<3){
      continue;
    }
    if(typeof this.routes[i][0]==='string'
      &&typeof this.routes[i][1]==='string'
      &&typeof this.routes[i][2]==='function'
      &&this.routes[i][0]===p){
      let env={};
      if(typeof this.routes[i][3]==='object'
        &&this.routes[i][3]!==null){
        env=this.routes[i][3]
      }
      r={
        path:this.routes[i][0],
        title:this.routes[i][1],
        call:this.routes[i][2],
        env:env
      };break;
    }
  }return r;
};
/* error statement
 * ~ print out error from string given
 * @parameters:
 *   s = string of error statement
 *       - set to false to remove printed statement
 *   c = integer of response code
 * @return: print out genetated error statement into document.body
 */
this.__proto__.error=function(s,c){
  let id='router-error-statement';
  let n=document.getElementById(id);
  if(n){n.parentElement.removeChild(n);}
  if(s===false){return false;}
  s=typeof s==='string'?s:'Unknown Error';
  c=c%1===0?c:200;
  n=document.createElement('div');
  n.id=id;
  let sp=document.createElement('div');
  let sd=document.createElement('div');
  n.style.margin='0px';
  n.style.padding='30px';
  n.style.textAlign='center';
  n.style.position='fixed';
  n.style.zIndex=99999;
  n.style.top='0px';
  n.style.bottom='0px';
  n.style.left='0px';
  n.style.right='0px';
  n.style.backgroundColor='#eed';
  n.style.cursor='default';
  sp.style.textAlign='center';
  sp.style.color='#555';
  sp.style.fontSize='32px';
  sp.style.fontFamily='consolas,monospace';
  sp.innerText='Error: '+c.toString()+' '+s;
  sd.style.marginTop='30px';
  sd.style.textAlign='center';
  sd.style.color='#999';
  sd.style.fontSize='11px';
  sd.style.fontFamily='consolas,monospace';
  sd.innerText='9r3i\\router.js';
  n.appendChild(sp);
  n.appendChild(sd);
  document.body.appendChild(n);
  return true;
};
/* parse query
 * ~ parse url query into readable object
 * @parameters:
 *   t = string of url query
 * @return: object of parsed query
 */
this.__proto__.query=function(t){
  if(typeof t!=='string'){return false;}
  let s=t.split('&');
  let r={},c={};
  for(let i=0;i<s.length;i++){
    if(!s[i]||s[i]==''){continue;}
    let p=s[i].split('=');
    let k=decodeURIComponent(p[0]);
    if(k.match(/\[(.*)?\]$/g)){
      let l=k.replace(/\[(.*)?\]$/g,'');
      let w=k.replace(/^.*\[(.*)?\]$/g,"$1");
      c[l]=c[l]?c[l]:0;
      if(w==''){w=c[l];c[l]+=1;}
      if(!r[l]){r[l]={};}
      r[l][w]=decodeURIComponent(p[1]);
      continue;
    }r[k]=p[1]?decodeURIComponent(p[1]):'';
  }return r;
};
/* temporary statement
 * @return: always false
 */
this.__proto__.temp=function(){
  return false;
};
};


