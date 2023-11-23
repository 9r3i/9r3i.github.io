/**
 * gaino
 * ~ 7th generation of my engine (golf/gamma)
 * ~ after: force (foxtrot), e-day (echo), dixie (delta)
 * authored by 9r3i
 * https://github.com/9r3i/giano.js
 * started at november 21st 2023
 * requires:
 *   - virtual.js - https://github.com/9r3i/virtual.js - v1.0.0
 */
;function gaino(v,c){
/* the version */
Object.defineProperty(this,'version',{
  value:'1.0.0',
  writable:false,
});
/* the virtual */
Object.defineProperty(this,'virtual',{
  value:v,
  writable:false,
});
/* the config */
this.config=c;
/* initialize as constructor */
this.init=function(){
  let app=this.virtual,
  cnf=this.config,
  _this=this;
  this.onReady(async function(n,b){
    if(!b){
      alert('Error: document.body is not loaded!');
      return;
    }
    /* gaino.load */
    if(cnf.hasOwnProperty('gaino')
      &&cnf.gaino.hasOwnProperty('load')
      &&Array.isArray(cnf.gaino.load)){
      for(let file of cnf.gaino.load){
        if(app.files.hasOwnProperty(file)){
          await app.load(file);
        }
      }
    }
    /* gaino.start */
    if(cnf.hasOwnProperty('gaino')
      &&cnf.gaino.hasOwnProperty('start')){
      let start=cnf.gaino.start;
      /* start as string */
      if(typeof start==='string'){
        return eval(start);
      }else if(typeof start==='object'&&start!==null){
        /* start as object -- function or class */
        if(start.hasOwnProperty('function')
          &&window.hasOwnProperty(start.function)
          &&typeof window[start.function]==='function'){
          let args=start.hasOwnProperty('args')?start.args:null;
          return window[start.function].call(_this,app,args);
        }else if(start.hasOwnProperty('class')
          &&window.hasOwnProperty(start.class)){
          let nap=new window[start.class](_this,app),
          args=start.hasOwnProperty('args')
            &&Array.isArray(start.args)?start.args:[];
          if(start.hasOwnProperty('method')
            &&nap.hasOwnProperty(start.method)
            &&typeof nap[start.method]==='function'){
            return nap[start.method].apply(nap,args);
          }
        }
      }
    }
  });
  /* self update for the app -- silently */
  app.update('gaino.js');
};
/* fetch method of stream -- with Promise */
this.fetch=function(url,cnf){
  let _this=this;
  return new Promise(resolve=>{
    return _this.stream(url,r=>{
      return resolve(r);
    },cnf);
  });
};
/* stream */
this.stream=function(url,cb,cnf){
  url=typeof url==='string'?url:this.toString(url);
  cb=typeof cb==='function'?cb:function(){};
  cnf=typeof cnf==='object'&&cnf!==null?cnf:{};
  /* config */
  let dt=cnf.hasOwnProperty('data')
        &&typeof cnf.data==='object'
        &&cnf.data!==null?cnf.data:{},
  hd=cnf.hasOwnProperty('headers')
        &&typeof cnf.headers==='object'
        &&cnf.headers!==null?hd:{},
  up=cnf.hasOwnProperty('upload')
        &&typeof cnf.upload==='function'
        ?cnf.upload:function(){},
  dl=cnf.hasOwnProperty('download')
        &&typeof cnf.download==='function'
        ?cnf.download:function(){},
  er=cnf.hasOwnProperty('error')
        &&typeof cnf.error==='function'
        ?cnf.error:cb,
  mts=['GET','POST','PUT','UPDATE','OPTIONS','HEAD','DELETE'],
  mtd=cnf.hasOwnProperty('method')
        &&typeof cnf.method==='string'
        &&mts.hasOwnProperty(cnf.method)
        ?cnf.method:'GET',
  head=cnf.hasOwnProperty('head')
        &&typeof cnf.head==='function'
        ?cnf.head:function(){},
  xhr=new XMLHttpRequest(),
  query=this.buildQuery(dt),
  qmark=url.match(/\?/)?'&':'?',
  uri=mtd=='GET'?url+qmark+query:url,
  temp=false;
  xhr.open(mtd,uri,true);
  hd['Content-type']='application/x-www-form-urlencoded';
  for(var i in hd){xhr.setRequestHeader(i,hd[i]);}
  xhr.upload.addEventListener('progress',up,false);
  xhr.addEventListener('progress',dl,false);
  xhr.onreadystatechange=function(e){
    let hds=xhr.getAllResponseHeaders(),
    err='[error:'+xhr.status+'] '+xhr.statusText;
    if(xhr.readyState==0x04&&xhr.status==0xc8){
      return cb(xhr.responseText?xhr.responseText:'',xhr,hds);
    }else if(xhr.readyState===xhr.HEADERS_RECEIVED){
      /* HEADERS_RECEIVED === 0x02 */
      return head(hds,xhr);
    }else if(xhr.readyState<0x04){
      return false;
    }return er(err+'\n\n'+hds,xhr,hds);
  };
  xhr.send(mtd=='GET'?null:query);
  return xhr;
};
/* buildQuery v2, build http query recusively */
this.buildQuery=function(data,key){
  var ret=[],dkey=null;
  for(var d in data){
    dkey=key?key+'['+encodeURIComponent(d)+']'
        :encodeURIComponent(d);
    if(typeof data[d]=='object'&&data[d]!==null){
      ret.push(this.buildQuery(data[d],dkey));
    }else{
      ret.push(dkey+"="+encodeURIComponent(data[d]));
    }
  }return ret.join("&");
};
/* parse json string */
this.parseJSON=function(t){
  let r=false;
  try{r=JSON.parse(t);}catch(e){r=false;}
  return r;
};
/* array of number --> to string */
this.toString=function(a){
  if(null===a){return (0x10faa9).toString(0x24);}
  if(typeof a===(0x4ea3aa4c3df5).toString(0x24)){
    return (0x4ea3aa4c3df5).toString(0x24);
  }
  if(typeof a===(0x55f57d43).toString(0x24)
    ||typeof a===(0x67e4c42c).toString(0x24)
    ||typeof a===(0x5ec2b639f).toString(0x24)
    ||typeof a===(0x1213796ebd7).toString(0x24)
    ||typeof a===(0x297e2079).toString(0x24)
    ||typeof a===(0x686136a5).toString(0x24)){
    return a.toString(0x24);
  }
  var r=String.raw({raw:[]});
  if(typeof a===(0x57a71a6d).toString(0x24)){
    for(var i in a){
      if(typeof a[i]===(0x57a71a6d).toString(0x24)){
        for(var o in a[i]){
          r+=String.fromCharCode(a[i][o]);
        }continue;
      }r+=this.toString(a[i]);
    }
  }return r;
};
/* on document.body ready */
this.onReady=function(cb,i){
  i=typeof i==='number'&&i%1===0?i:0;
  let _this=this,
  b=document.querySelector('body');
  if(i>=0x3e8||b){
    return typeof cb==='function'?cb(i,b):false;
  }i++;
  return setTimeout(()=>{
    return _this.onReady(cb,i);
  },1);
};
/* start initializing */
return this.init();
};

