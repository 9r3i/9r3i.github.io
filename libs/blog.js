/**
 * gaino.blog
 * ~ one of gaino apps
 * authored by 9r3i
 * https://github.com/9r3i/giano.blog
 * started at november 21st 2023
 * requires:
 *   - virtual.js - https://github.com/9r3i/virtual.js - v1.0.0
 *   - gaino.js   - https://github.com/9r3i/gaino.js   - v1.0.0
 *   - router.js  - https://github.com/9r3i/router.js  - v2.0.2
 *   - parser.js  - https://github.com/9r3i/parser     - v1.2.6
 *   - 
 *   - 
 *   - github api (free) -- module
 *   - firebase (free)   -- module
 *   - api (self building) -- needs more time
 *   - ldb, kdb, sdb       -- cannot get into public
 *   - sse (server send event) -- needs a server
 *   - ws (websocket)          -- needs a vps
 */
;function blog(g,v){
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
/* the gaino */
Object.defineProperty(this,'gaino',{
  value:g,
  writable:false,
});
/* the config */
this.config=g.config.config;
/* initialize as constructor */
this.init=async function(a,b,c){
  let app=this.virtual;
  /* delete from virtual, 
   * so its gonna be loaded for new update */
  if(!this.config.blog.save){
    app.delete('blog.js');
  }
  /* put loader */
  this.loader('Loading... [blog:components]',20);
  /* initialize database */
  let driver=this.config.database.driver
    &&typeof window[this.config.database.driver]==='function'
    ?this.config.database.driver:'BlogDatabaseDriver';
  this.db=new window[driver](this.config.database);
  /* initialize router */
  this.route=new router(
    window.location.pathname
      .replace(/^\//,'')
      .replace(/[^\/]+$/,''),
    {}, // _GLOBAL
    [], // header
    []  // footer
  );
  /* initialize data */
  let rawData=await app.get(this.config.database.name),
  isUpdated=false,
  data=this.gaino.parseJSON(rawData);
  if(!data){
    this.loader('Loading... [request:data]',30);
    data=await this.requestData();
    app.put(this.config.database.name,JSON.stringify(data));
    isUpdated=true;
  }
  window._GLOBAL.data=data;
  /* globalize this object */
  window._BLOG=this;
  /* configuring theme */
  let theme=this.config.theme,
  themeURL=[
    theme.host,
    theme.namespace,
    '',
  ].join('/');
  /* load all theme template */
  let templates={},
  length=Object.keys(theme.templates).length
        +Object.keys(theme.files).length,
  percent=50,
  count=0,
  prefix='themes/'+theme.namespace+'/';
  for(let name in theme.templates){
    count++;
    this.loader('Loading... [template:'+name+']',50+(count/length*percent));
    let tempURL=themeURL+theme.templates[name],
    file=prefix+'templates/'+name,
    text=await app.get(file);
    if(!text||!theme.save){
      text=await this.gaino.fetch(tempURL);
      await app.put(file,text);
    }templates[name]=text;
  }
  /* put templates into global _GLOBAL */
  window._GLOBAL['templates']=templates;
  /* load all theme files */
  for(let file of theme.files){
    let fileURL=themeURL+file,
    vfile=prefix+'files/'+file,
    text=await app.get(vfile);
    if(!text||!theme.save){
      count++;
      this.loader('Loading... [file:'+file+']',50+(count/length*percent));
      text=await this.gaino.fetch(fileURL);
      await app.put(vfile,text);
    }
    if(text){
      if(file.match(/\.css$/)){
        await app.exec(text,'style',file);
      }else if(file.match(/\.js$/)){
        await app.exec(text,'script',file);
      }
    }
  }
  this.loader('Loading...',100);
  /* initialize this route */
  this.route.init();
  /* silent update for data */
  if(!isUpdated){
    data=await this.requestData();
    app.put(this.config.database.name,JSON.stringify(data));
    window._GLOBAL.data=data;
  }
  /* perform testing output */
  //this.test(...arguments);
};
/* request data */
this.requestData=async function(){
  let page=1,
  limit=100,
  data=[];
  for(let i=page;i<limit;i++){
    let tdata=await this.db.request(i);
    data=[...data,...tdata];
    if(tdata.length<30){
      break;
    }
  }return data;
};
/* testing code */
this.test=function(a,b,c){
  let parse=new parser,
  loaded=[],
  sc=document.querySelectorAll('script[id]');
  for(let i=0;i<sc.length;i++){
    loaded.push(sc[i].id);
  }
  document.body.innerHTML='<pre>'
    +'[loaded.files]\n'
    +parse.likeJSON(loaded)
    +'\n\n'
    +'[stored.files]\n'
    +parse.likeJSON(this.virtual.list(true))
    +'\n\n'
    +'[config]\n'
    +parse.likeJSON(this.config,3)
    +'\n\n'
    +'[args]\n'
    +parse.likeJSON({arguments},5)
    +'\n\n'
    +'[this]\n'
    +parse.likeJSON(this,5)
    +'\n\n'
    +'</pre>'
    +'';
};
/* loader */
this.loader=function(str,cent){
  str=typeof str==='string'?str:'Loading...';
  let span=document.querySelector('span'),
  progress=document.querySelector('progress');
  if(span&&progress){
    if(typeof cent==='number'&&cent!==NaN){
      progress.max=100;
      progress.value=cent;
      span.innerText=cent+'% '+str;
    }else{
      span.innerText=str;
    }return;
  }
  let img=this.loaderImage(),
  text=document.createTextNode(' '+str),
  pre=document.createElement('div');
  pre.style.padding='30px';
  pre.style.textAlign='center';
  pre.style.fontFamily='system-ui';
  pre.style.fontSize='16px';
  pre.style.color='#555';
  pre.appendChild(img);
  pre.appendChild(text);
  document.body.innerHTML='';
  document.body.appendChild(pre);
  return pre;
}
/* loader image */
this.loaderImage=function(){
  let img=new Image;
  img.src=this.loaderURL();
  return img;
};
/* loader url -- static */
this.loaderURL=function(){
  let url=this.virtual.get('loader.txt');
  return url?url:'';
};
};

/**
 * BlogDatabaseDriver
 * ~ blog database driver -- github api
 * authored by 9r3i
 * https://github.com/9r3i
 * started at november 22nd 2023
 * @usage: new BlogDatabaseDriver(config.database)
 * 
 * @[sample:config]
 {
    "database": {
      "driver": "BlogDatabaseDriver",
      "host": "localhost",
      "username": "9r3i",
      "password": "___GITHUB_PUBLIC_TOKEN___",
      "name": "gaino-blog-data",
      "expires": "Fri, Nov 22 2024"
    }
  }
 */
;function BlogDatabaseDriver(cnf){
/* the version */
Object.defineProperty(this,'version',{
  value:'1.0.0',
  writable:false,
});
/* default host */
Object.defineProperty(this,'host',{
  value:'https://api.github.com/repos',
  writable:false,
});
/* config */
this.config=cnf;
/* initialize -- as constructor */
this.init=function(){

};
/* request by id */
this.requestByID=async function(id,table){
  table=typeof table==='string'?table:'releases';
  let path=[
    this.host,
    this.config.username,
    this.config.name,
    table
  ];
  if(id){path.push(id);}
  let url=path.join('/'),
  opt={
    headers:{
      "Authorization": "Bearer "+this.config.password,
      "X-GitHub-Api-Version": "2022-11-28",
      "Accept": "application/vnd.github+json",
    }
  },
  res=await fetch(url,opt)
    .then(r=>r.json())
    .catch(e=>e.json());
  return res;
};
/* request by page */
this.request=async function(page,table){
  table=typeof table==='string'?table:'releases';
  let path=[
    this.host,
    this.config.username,
    this.config.name,
    table
  ];
  let url=path.join('/')+(page?'?page='+page:''),
  opt={
    headers:{
      "Authorization": "Bearer "+this.config.password,
      "X-GitHub-Api-Version": "2022-11-28",
      "Accept": "application/vnd.github+json",
    }
  },
  res=await fetch(url,opt)
    .then(r=>r.json())
    .catch(e=>e.json());
  return res;
};
/* initialize */
return this.init();
};

