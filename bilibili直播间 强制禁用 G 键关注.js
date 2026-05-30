// ==UserScript==
// @name         bilibili直播间 强制禁用 G 键关注
// @namespace    fxx-kbilibili
// @version      0.5
// @description  try to take down follow-key
// @description:zh-CN 强制禁用G键关注直播间。由Copilot生成，如有能力请自行审查！
// @author       None
// @match        *://*.live.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        none
// @license      MIT
// ==/UserScript==

(function(){
  'use strict';
  function isEditableElement(el){
    if(!el) return false;
    const tag = el.tagName;
    if(!tag) return false;
    if(tag === 'INPUT' || tag === 'TEXTAREA') return true;
    if(el.isContentEditable) return true;
    return false;
  }
  function hasFollowWidget(){
    try{
      const a = document.querySelector('.not-yet-follow');
      const b = document.querySelector('.follow-key-prompt');
      const vis = el => el && el.offsetParent !== null;
      return (a && vis(a)) || (b && vis(b));
    }catch(e){ return false; }
  }
  function blockG(e){
    try{
      if(!e) return;
      const key = (e.key || '').toLowerCase();
      const code = e.keyCode || e.which || 0;
      if(!(key === 'g' || code === 71)) return;
      const active = document.activeElement;
      if(isEditableElement(active)) return;
      if(!hasFollowWidget()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }catch(err){}
  }
  window.addEventListener('keyup', blockG, true);
  document.addEventListener('keyup', blockG, true);
  const mo = new MutationObserver(()=> {
    window.addEventListener('keyup', blockG, true);
    document.addEventListener('keyup', blockG, true);
  });
  mo.observe(document.documentElement || document.body, {childList:true, subtree:true});