/* start the theme */
new Plain;


/**
 * plain
 * basic caller
 */
;function Plain(){
this.version='1.0.0';
this.init=function(){

if(typeof _GLOBAL==='undefined'){
  return alert('Error: Requires gaino blog.');
}

/* set global site */
_GLOBAL.site={
  name:document.querySelector('title').textContent,
  description:document.querySelector('meta[name="description"]').content,
};

/* prepare global posts -- release method */
_GLOBAL.posts={};
if(_BLOG.db.config.host=='https://api.github.com/repos'){
  _GLOBAL.posts=(new PlainHelper).dataPosts(_GLOBAL.data);
}else{
  /* prepare global posts -- default */
  _GLOBAL.posts=_GLOBAL.data;
}
_GLOBAL.total=Object.keys(_GLOBAL.posts).length;

/* prepare tags */
_GLOBAL.tags=(new PlainHelper).tags(_GLOBAL.posts);

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
_BLOG.route.add(
  /* path */
  '',
  /* title */
  'Home',
  /* content */
  _GLOBAL.templates.main,
  /* content selector */
  'body',
  /* functions */
  {
    footer:_GLOBAL.templates.footer,
  },
  /* environment */
  new PlainTheme
);
};
return this.init();
}; /*===[end of plain]===*/


/**
 * plain theme
 * object _ENV
 */
;function PlainTheme(){
  this.version='1.0.0';
  return {
    detail:function(){
      if(_GET.hasOwnProperty('tag')){
        return 'Total: '+_ENV.tagCount()+' posts';
      }else if(_GET.hasOwnProperty('recent')){
        return 'Total: '+_GLOBAL.total+' posts';
      }else if(_GET.hasOwnProperty('search')){
        return 'Total: '+_ENV.searchCount()+' posts';
      }else if(_GET.hasOwnProperty('reload')){
        return '';
      }else if(!_GET.hasOwnProperty('id')){
        return 'Total: '+_GLOBAL.tags.total+' tags';
      }
      let post=_GLOBAL.posts[_GET.id]
        ?_GLOBAL.posts[_GET.id]:false;
      if(!post){
        return 'Error: Failed to patch post.detail.';
      }
      let tdate=new Date(post.time).toString().substr(0,21);
      return 'Published at '+tdate+'\n'
        +'Authored by <a href="'
        +post.authorURL+'" target="_blank">'
        +post.author+'</a>';
    },
    title:function(){
      let text='Error: Not Found.';
      if(_GET.hasOwnProperty('tag')){
        text='#'+_GET.tag;
        _BLOG.route.title(text);
      }else if(_GET.hasOwnProperty('recent')){
        text='Recent Posts';
      }else if(_GET.hasOwnProperty('search')){
        text='Search'+(_GET.search==''?'':': '+_GET.search);
      }else if(_GET.hasOwnProperty('reload')){
        return 'Reloading...';
      }else if(!_GET.hasOwnProperty('id')){
        text=_GLOBAL.site.description;
      }else{
        text=_GLOBAL.posts[_GET.id]
          ?_GLOBAL.posts[_GET.id].title
          :'Error: Post is not available.';
      }
      _BLOG.route.title(text);
      return text;
    },
    content:function(){
      if(_GET.hasOwnProperty('tag')){
        return _ENV.tag();
      }else if(_GET.hasOwnProperty('search')){
        return _ENV.search();
      }else if(_GET.hasOwnProperty('recent')){
        return _ENV.main();
      }else if(_GET.hasOwnProperty('reload')){
        return '<progress></progress>';
      }else if(!_GET.hasOwnProperty('id')){
        let helper=new PlainHelper,
        tagName=_BLOG.config.theme.mainTagName,
        content=_GLOBAL.mainPosts.hasOwnProperty(tagName)
          ?_GLOBAL.mainPosts[tagName].content:'';
        return '<pre>'+_GLOBAL.tags.html+'</pre>'
          +'<pre class="post-home-content">'
          +helper.contentLink(content)
          +'</pre>';
      }
      let post=_GLOBAL.posts[_GET.id]
        ?_GLOBAL.posts[_GET.id]:false;
      if(!post){
        return 'Error: Post is not available.\n\n'
          +'<a href="'+_BLOG.route.baseurl+'">'
          +'[Back Home]'
          +'</a>';
      }
      let helper=new PlainHelper,
      content=helper.contentLink(post.content,post.assets);
      return helper.contentFindTags(content);
    },
    search:function(){
      let tagName=_GET.hasOwnProperty('search')?_GET.search:'',
      res='<input class="search-input" type="text" '
        +'value="'+tagName+'" id="search-input" />\n\n',
      keys=Object.keys(_GLOBAL.posts).reverse();
      if(tagName==''){
        res+='<div id="search-result"></div>';
        return res;
      }
      res+='<div id="search-result">';
      for(let id of keys){
        let post=_GLOBAL.posts[id],
        akut=post.title.match(new RegExp(tagName,'ig')),
        akur=post.content.match(new RegExp(tagName,'ig'));
        if(akut||akur){
          res+='<pre class="post-each">'
            +'<a href="?id='+id+'">'
            +post.title+'</a></pre>';
        }
      }
      res+='</div>';
      return res;
    },
    searchCount:function(){
      let res=0,
      tagName=_GET.hasOwnProperty('search')?_GET.search:'',
      keys=Object.keys(_GLOBAL.posts).reverse();
      for(let id of keys){
        let post=_GLOBAL.posts[id],
        akut=post.title.match(new RegExp(tagName,'ig')),
        akur=post.content.match(new RegExp(tagName,'ig'));
        if(akut||akur){
          res++;
        }
      }
      return res;
    },
    tag:function(){
      let res='',
      tagName=_GET.hasOwnProperty('tag')?_GET.tag:'',
      keys=Object.keys(_GLOBAL.posts).reverse();
      for(let id of keys){
        let post=_GLOBAL.posts[id],
        akur=post.content.match(new RegExp('#'+tagName,'ig'));
        if(!akur){
          continue;
        }
        res+='<pre class="post-each">'
          +'<a href="?id='+id+'">'
          +post.title+'</a></pre>';
      }
      return res;
    },
    tagCount:function(){
      let res=0,
      tagName=_GET.hasOwnProperty('tag')?_GET.tag:'',
      keys=Object.keys(_GLOBAL.posts).reverse();
      for(let id of keys){
        let post=_GLOBAL.posts[id],
        akur=post.content.match(new RegExp('#'+tagName,'ig'));
        if(!akur){
          continue;
        }res++;
      }
      return res;
    },
    main:function(){
      let res='',
      page=_GET.hasOwnProperty('page')?parseInt(_GET.page):1,
      limit=10,
      count=0,
      start=0+((page-1)*limit),
      keys=Object.keys(_GLOBAL.posts).reverse();
      for(let i=start;i<keys.length;i++){
        let id=keys[i],
        post=_GLOBAL.posts[id];
        res+='<pre class="post-each">'
          +'<a href="?id='+id+'">'
          +post.title+'</a></pre>';
        count++;
        if(count>=limit){
          break;
        }
      }
      res+='\n\n<pre class="post-each">';
      if(page>1){
        res+='<a href="?page='+(page-1)+'">[Previous]</a>  ';
      }
      if(count>=limit){
        res+='<a href="?page='+(page+1)+'">[Next]</a>  ';
      }
      res+='</pre>';
      return res;
    },
    query:function(){
      let parse=new parser,
      url=location.pathname+location.search,
      parsed=parse.parseURL(url);
      return parse.likeJSON({url,parsed},5);
    },
    test:function(){
      let parse=new parser;
      return parse.likeJSON(...arguments);
    },
  }
};


/**
 * plain helper
 * requires: _GLOBAL and _BLOG object
 */
;function PlainHelper(){
this.version='1.0.0';
window._PlainHelper=this;

this.dataPosts=function(data){
let posts={};
for(let post of Object.values(data)){
  _GLOBAL.mainPosts=_GLOBAL.hasOwnProperty('mainPosts')
    ?_GLOBAL.mainPosts:{};
  let assets={};
  for(let asset of post.assets){
    assets[asset.name]={
      name:asset.name,
      type:asset.content_type,
      size:asset.size,
      time:asset.created_at,
      tag:post.tag_name,
      url:asset.browser_download_url,
      downloaded:asset.download_count,
      relfo:[
          'https://relfo.vercel.app',
          _BLOG.db.config.username,
          _BLOG.db.config.name,
          post.tag_name,
          asset.name,
        ].join('/'),
    };
  }
  posts[post.id]={
    id:post.id,
    title:post.name,
    content:post.body,
    time:post.created_at,
    draft:post.draft,
    tag:post.tag_name,
    author:post.author.login,
    authorID:post.author.id,
    authorPicture:post.author.avatar_url,
    authorURL:post.author.html_url,
    assets,
  };
  if(post.hasOwnProperty('tag_name')
    &&post.tag_name.match(/^\d+\.\d+\.\d+$/)){
    _GLOBAL.mainPosts[post.tag_name]=posts[post.id];
    delete posts[post.id];
  }
}
return posts;
};
this.tags=function(posts){
  let tags={},tagName='#islam',tagsByName=[],
  tagsHTML=document.createElement('div');
  tagsHTML.classList.add('tags-content');
  for(let i in posts){
    if(typeof posts[i].content!=='string'){continue;}
    let akur=posts[i].content.match(/#[a-z0-9_]+/ig);
    if(!akur){continue;}
    let postID=posts[i].id;
    for(let e=0;e<akur.length;e++){
      tagName=akur[e].toLowerCase();
      if(tagsByName.indexOf(tagName)<0){
        tagsByName.push(tagName);
      }
      if(!tags.hasOwnProperty(tagName)){
        tags[tagName]=[];
      }
      if(tags[tagName].indexOf(postID)>=0){continue;}
      tags[tagName].push(postID);
    }
  }
  tagsByName.sort();
  for(let e=0;e<tagsByName.length;e++){
    let i=tagsByName[e],
    an=document.createElement('a'),
    space=document.createTextNode(' ');
    an.classList.add('tag-count-'+this.tagClass(tags[i].length));
    an.classList.add('tags-each');
    an.href='?tag='+i.substr(1);
    an.title=i;
    an.dataset.content=i.substr(1)+'('+tags[i].length+')';
    tagsHTML.appendChild(an);
    tagsHTML.appendChild(space);
  }
  return {
    total:tagsByName.length,
    element:tagsHTML,
    html:tagsHTML.outerHTML,
  };
};
this.tagClass=function(count){
  count=count?parseInt(count):0;
  count=Math.max(count,0);
  let classes={
    'ultra-high':128,
    'very-high':64,
    'high':32,
    'moderate-high':16,
    'moderate':8,
    'moderate-low':4,
    'low':2,
    'very-low':1,
  },
  className='very-low';
  for(let i in classes){
    if(count>=classes[i]){className=i;break;}
  }return className;
};
this.contentFindTags=function(content){
  content=typeof content==='string'?content:'';
  return content.replace(/#[a-z0-9_]+/ig,function(m){
    return '<a href="?tag='+m.substr(1).toLowerCase()
      +'" title="'+m.toLowerCase()+'">'+m+'</a>';
  }).replace(/oleh:\s([^\r\n]+)/i,function(m){
    return 'Oleh: <a href="?search='+encodeURIComponent(m.substr(6))
      +'" title="'+m.substr(6)+'">'+m.substr(6)+'</a>';
  });
};
this.contentLink=function(content,assets){
  content=typeof content==='string'?content:'';
  let pl='',
  yptrn=/\[embed:https:\/\/youtu\.be\/([a-z0-9\-_]+)([^\]]*)\]/ig,
  yptrni=/\[embed:https:\/\/youtu\.be\/([a-z0-9\-_]+)([^\]]*)\]/i,
  gptrn=/\[embed:(https:\/\/github\.com\/[^:]+):([a-z0-9]+)\]/ig,
  gptrni=/\[embed:(https:\/\/github\.com\/[^:]+):([a-z0-9]+)\]/i,
  iptrn=/\[image:(https?:\/\/[^:]+):([a-z0-9]+)\]/ig,
  iptrni=/\[image:(https?:\/\/[^:]+):([a-z0-9]+)\]/i,
  ptrn=/\[(audio|video|image|frame):([^\]:]+)(:[^\]]+)?\]/ig,
  ptrni=/\[(audio|video|image|frame):([^\]:]+)(:[^\]]+)?\]/i,
  lptrn=/\[link:(https?:\/\/[^:]+):([^\]]+)\]/ig,
  lptrni=/\[link:(https?:\/\/[^:]+):([^\]]+)\]/i;
  return content.replace(ptrn,function(akur){
    let m=akur.match(ptrni);
    if(!m||!assets.hasOwnProperty(m[2])){
      return akur;
    }
    let asset=assets[m[2]],
    url=asset.url;
    if(m[1]=='image'){
      return '<a href="'+url+'" title="'+asset.name+'" target="_blank">'
        +'<img src="'+url+'" alt="'+asset.name
        +'" style="max-width:100%;" width="100%" />'
        +'</a>';
    }else if(m[1]=='audio'){
      return '<a href="'+url+'" title="'+asset.name
        +'" target="_blank">'
        +akur+'</a><br />'
        +'<audio controls width="100%" height="auto">'
        +'<source src="'+url+'" type="'+asset.type+'">'
        +'</audio>';
    }else if(m[1]=='video'){
      return '<a href="'+url+'" title="'+asset.name
        +'" target="_blank">'
        +akur+'</a><br />'
        +'<video controls width="auto" height="auto">'
        +'<source src="'+url+'" type="'+asset.type+'">'
        +'</video>';
    }else if(m[1]=='frame'){
      let height=m[3]?m[3].substr(1):'400px';
      return '<a href="'+url+'" target="_blank">'
        +asset.name+'</a>'
        +'<div id="'+asset.name+'">'
        +'<iframe style="height:'+height+';" src="'
        +(asset.relfo?asset.relfo:url)
        +'"></iframe> '
        +'<button onclick="_PlainHelper.fullscreen(this)" '
        +'data-frame="'+asset.name+'"a>Fullscreen</button>'
        +'</div>';
    }
    return '<a href="'+url+'" title="'+asset.name
      +'" target="_blank">'+akur+'</a>';
  }).replace(iptrn,function(m){
    let im=m.match(iptrni),
    ilink=m,
    ialt=m;
    if(im){
      ilink=im[1];
      ialt=im[2];
    }
    return '<a href="'+ilink+'" title="'+ialt+'" target="_blank">'
      +'<img src="'+ilink+'" alt="'
      +ialt+'" style="max-width:100%;" width="100%" />'
      +'</a>';
  }).replace(yptrn,function(m){
    let ym=m.match(yptrni),
    ylinke=m,
    ylink=m,
    ytext=m;
    if(ym){
      ylinke='https://www.youtube.com/embed/'+ym[1];
      ylink='https://youtu.be/'+ym[1];
      ytext='[embed:'+ylink+']';
    }
    let ww=window.innerWidth,
    cw=Math.min(720,ww),
    ih=Math.floor(cw/16*9);
    return '<a href="'+ylink+'" target="_blank">'+ytext+'</a>'
      +'<div id="'+ylink+'">'
      +'<iframe style="height:'+ih+'px" src="'
      +ylinke+'"></iframe> '
      +'<button onclick="_PlainHelper.fullscreen(this)" data-frame="'+ylink+'"a>Fullscreen</button>'
      +'</div>';
  }).replace(gptrn,function(m){
    let gm=m.match(gptrni),
    glink=m,
    gheight='400px';
    if(gm){
      glink=gm[1];
      gheight=gm[2];
    }
    let data=_PlainHelper.htmlBase(glink),
    url=_PlainHelper.htmlBlob(data);
    return '<a href="'+glink+'" target="_blank">'+m+'</a>'
      +'<div id="'+glink+'">'
      +'<iframe style="height:'+gheight+';" src="'
      +url+'"></iframe> '
      +'<button onclick="_PlainHelper.fullscreen(this)" data-frame="'+glink+'"a>Fullscreen</button>'
      +'</div>';
  }).replace(lptrn,function(m){
    let lm=m.match(lptrni),
    llink=m,
    ltitle=m;
    if(lm){
      llink=lm[1];
      ltitle=lm[2];
    }
    return '<a href="'+llink+'" title="'+ltitle
      +'" target="_blank">'+ltitle+'</a>';
  });
};
this.fullscreen=function(btn){
  let fr=document.getElementById(btn.dataset.frame);
  if(!fr){return false;}
  if(fr.classList.contains('frame-fullscreen')){
    btn.innerText='Fullscreen';
    fr.firstChild.style.height=fr.firstChild.dataset.height;
    fr.classList.remove('frame-fullscreen');
    document.exitFullscreen();
  }else{
    btn.innerText='Exit Fullscreen';
    fr.firstChild.dataset.height=fr.firstChild.style.height;
    fr.firstChild.style.height='';
    fr.firstChild.style.removeProperty('height');
    fr.classList.add('frame-fullscreen');
    fr.requestFullscreen();
  }
};
this.htmlBlob=function(data,type){
  type=typeof type==='string'?type:'text/html';
  let blob=new Blob([data],{type}),
  url=window.URL.createObjectURL(blob);
  /* window.URL.revokeObjectURL(url); */
  return url;
};
this.htmlBase=function(link){
  return '<!DOCTYPE html><html lang="en-US" dir="ltr"><head><meta http-equiv="content-type" content="text/html;charset=utf-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" /><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" /><title>9r3i\\github::embed</title></head><body style="margin:0px;padding:0px;"><script src="https://emgithub.com/embed-v2.js?target='
    +encodeURIComponent(link)
    +'&style=atom-one-dark&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showCopy=on"></script></body></html>';
};
};


