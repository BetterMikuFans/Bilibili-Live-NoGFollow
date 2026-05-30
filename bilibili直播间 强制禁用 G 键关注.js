// ==UserScript==
// @name         bilibili直播间 强制禁用 G 键关注
// @namespace    anti_g_forced_follow
// @version      0.6
// @description  try to take down follow-key
// @description:zh-CN 强制禁用G键关注直播间
// @author       None
// @match        *://*.live.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        none
// @license      GPL-3.0
// ==/UserScript==

(function(){
  'use strict';
  // 这里用的参数 e 是 KeyboardEvent 对象，包含键盘事件的信息
  function blockG(e){
    try{
      if(!e) return; // 如果事件对象不存在，则return
      const k = (e.key || '').toLowerCase(); // 尝试获取对象中的按键值
      const code = e.keyCode || e.which || 0; // 获取按键码（可能还兼容旧浏览器）
      const tag = (document.activeElement && document.activeElement.tagName) || ''; // 直接获取焦点tagName（甚至判空提高健壮性）
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA'; // 判断是否处于可编辑区域
      if(isEditable) return; // 如果在编辑区域，就return
      if(k === 'g' || code === 103 || code === 71){ // 如果按键为 'g' 或 'g'/'G' 的ASCII码 
        e.preventDefault(); // 直接阻止对象'e'的行为
        e.stopImmediatePropagation(); // 阻止后续同一事件的其他监听器执行（太稳健了）
      }
    }catch(err){console.error(err);} // 捕获异常并输出到控制台，不中断脚本
  }

  // 捕获阶段安装监听器，true 表示捕获阶段，早于目标阶段和冒泡阶段，确保抢先拦截（It just work）
  window.addEventListener('keyup', blockG, true);
  document.addEventListener('keyup', blockG, true);

  // 监控 DOM 变化并重装监听器（防止页面后续动态移除或覆盖监听器）（It just work）
  const mo = new MutationObserver(()=>{ // 创建 MutationObserver 实例，所以每当DOM发生变化，都会重装监听器
    window.addEventListener('keyup', blockG, true);
    document.addEventListener('keyup', blockG, true);
  });
  // 监听整个子树中所有子节点增删，并执行mo实例（有点暴力说实话）
  mo.observe(document.documentElement || document.body, {childList:true, subtree:true});

  // 可选(未测试)：劫持 addEventListener（取消注释后启用激进模式）
  /*
  const _add = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, fn, opt){
    // 如果类型是键盘弹起事件，且回调是函数类型，则尝试拦截
    if(type === 'keyup' && typeof fn === 'function'){
      try{
        const s = fn.toString(); // 使用方法返回函数的源码字符串，可以检测关键词
        // 如果回调源码里明显包含 follow/关注 等关键词，则阻止注册（激进策略）
        if(/follow|关注|followUser|doFollow|followAction/i.test(s)) {
          console.log('[blockG] blocked addEventListener keyup callback:', s.slice(0,200)); // 打log提示拦截了某个 keyup 回调，并打印回调源码前200字符
          return; // 直接返回，不调用原始方法，以阻止监听器被注册
        }
      }catch(e){} // 如果抛异常，则忽略错误继续执行
    }
    return _add.call(this, type, fn, opt); // 如果不需要拦截，则使用原始方法
  };
  */

})();