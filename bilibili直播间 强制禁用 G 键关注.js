// ==UserScript==
// @name         bilibili直播间 强制禁用 G 键关注
// @namespace    anti_G_forced_follow
// @version      1.0.0
// @description  强制禁用G键关注直播间
// @author       Mifan-T
// @match        *://*.live.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        GM_addStyle
// @license      GPL-3.0
// ==/UserScript==

(function () {
  'use strict';

  // 这里用的参数 e 是 KeyboardEvent 对象，包含键盘事件的信息
  function blockG(e) {
    try {
      if (!e) return; // 如果事件对象不存在，则return
      const k = (e.key || '').toLowerCase(); // 尝试获取对象中的按键值
      const code = e.keyCode || e.which || 0; // 获取按键码（可能还兼容旧浏览器）
      const tag = (document.activeElement && document.activeElement.tagName) || ''; // 直接获取焦点tagName（甚至判空提高健壮性）
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA'; // 判断是否处于可编辑区域
      if (isEditable) return; // 如果在编辑区域，就return
      if (k === 'g' || code === 103 || code === 71) { // 如果按键为 'g' 或 'g'/'G' 的ASCII码
        e.preventDefault(); // 直接阻止对象'e'的行为
        e.stopImmediatePropagation(); // 阻止后续同一事件的其他监听器执行（太稳健了）

        // debug用 - 输出拦截成功日志
        // console.log('G 键拦截成功');

      }
    } catch (err) { console.error(err); } // 捕获异常并输出到控制台，不中断脚本
  }

  // 捕获阶段安装监听器，true 表示捕获阶段，早于目标阶段和冒泡阶段，确保抢先拦截（在document上添加监听器，双保险）
  function addBlockGListener() {
    window.addEventListener('keyup', blockG, true);
    document.addEventListener('keyup', blockG, true);
  }

  // 移除监听器，防止重复注册
  function removeBlockGListener() {
    window.removeEventListener('keyup', blockG, true);
    document.removeEventListener('keyup', blockG, true);
  }

  // ======= [初次安装监听器] =======
  addBlockGListener();

  // =========================== [防御性编程部分] ===========================
  // 监控 DOM 变化并重装监听器（防止页面后续动态移除或覆盖监听器）（增强可靠性）
  let DOMCount = 0; // DOM计数
  const DOMMax = 300; // 设定DOM最大上限
  let lastLodeTime = Date.now(); // 储存上次安装监听器的时间（ms）
  const relodeMaxTime = 30000; // 设定最大重载时间（ms）

  // 创建 MutationObserver 实例，所以每当DOM发生变化，都会判断是否重装监听器
  const mo = new MutationObserver(() => {
    DOMCount++;

    // debug用 - DOM触发输出
    // console.log(`DOM计数: ${DOMCount} , 计时: ${Date.now() - lastLodeTime}`);

    if (DOMCount >= DOMMax || (Date.now() - lastLodeTime) >= relodeMaxTime) {
      removeBlockGListener();
      addBlockGListener();

      // debug用 - 输出重装日志
      // console.log(`%c[${new Date().toLocaleTimeString("it-IT")}] 已重装监听器`, "color: green;");

      // 重置变量
      DOMCount = 0;
      lastLodeTime = Date.now();
    }
  });
  // 监听整个子树中所有子节点增删，并执行mo实例（略显暴力）
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true, attributes: false, characterData: false });

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
  // =========================== [防御性编程结束] ===========================

  // 次要逻辑：隐藏“G”元素
  //参考&鸣谢：https://greasyfork.org/zh-CN/scripts/474444-bilibili-20-21%E5%B9%B4%E6%97%A7%E7%89%88
  let css = `
  .follow-key-prompt {display: none !important;}
  #popup-shortcut-box {display: none !important;}
  `
  // 调用 GM_addStyle，如果不支持 GM_addStyle ，则使用备用方案
  if (typeof GM_addStyle !== "undefined") {
    GM_addStyle(css);
  } else {
    let styleNode = document.createElement("style");
    styleNode.appendChild(document.createTextNode(css));
    (document.querySelector("head") || document.documentElement).appendChild(styleNode);
  }
})();