// ==UserScript==
// @name         bilibili直播间 强制禁用 G 键关注
// @namespace    anti_G_forced_follow
// @version      2.0.0
// @description  强制禁用G键关注直播间
// @author       Mifan-T
// @homepageURL  https://github.com/BetterMikuFans/Bilibili-Live-NoGFollow
// @match        *://*.live.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        GM_addStyle
// @supportURL   https://github.com/BetterMikuFans/Bilibili-Live-NoGFollow/issues
// @license      GPL-3.0
// ==/UserScript==

(function () {
  'use strict';

  // 主逻辑：定义监听器函数，并执行拦截
  // 这里用的参数 e 是 KeyboardEvent 对象，包含键盘事件的信息
  function blockG(e) {
    try {
      if (!e) return; // 如果事件对象不存在，则return
      const k = (e.key || '').toLowerCase(); // 获取对象中的按键值
      const code = e.keyCode || e.which || 0; // 获取按键码（兼容不同浏览器或版本）
      const tag = (document.activeElement && document.activeElement.tagName) || ''; // 获取焦点tagName
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BILI-COMMENTS'; // 判断是否处于可编辑区域
      if (isEditable) return; // 如果在编辑区域，就return（为了规范以及可复用性）
      if (k === 'g' || code === 103 || code === 71) { // 如果按键为 'g' 或 'g'/'G' 的ASCII码
        e.preventDefault(); // 直接阻止对象'e'的行为
        e.stopImmediatePropagation(); // 阻止后续同一事件的其他监听器执行

        // debug用 - 输出拦截成功日志
        // console.log('G 键拦截成功');

      }
    } catch (err) { console.error(err); } // 捕获异常并输出到控制台，不中断脚本
  }

  // 定义安装监听器函数
  function addBlockGListener() {
    window.addEventListener('keyup', blockG, true); // true 表示捕获阶段，早于目标阶段和冒泡阶段，确保抢先拦截
    document.addEventListener('keyup', blockG, true); // 在document上添加监听器，双保险
  }

  // ======= [安装监听器] =======
  addBlockGListener();

  // =========================== [防御性编程部分] ===========================
  // 可选：劫持 addEventListener（取消注释后启用激进模式）(╯‵□′)╯︵┻━┻

/*   const _add = EventTarget.prototype.addEventListener; // 暂存原始 addEventListener 方法
  EventTarget.prototype.addEventListener = function (type, fn, opt) {
    // 如果类型是键盘弹起事件，且回调是函数类型，则尝试拦截
    if (type === 'keyup' && typeof fn === 'function') {
      try {
        const fnStr = fn.toString(); // 使用方法返回函数的源码字符串，可以检测关键词
        // 如果回调源码里包含 "g" 字符串定义，则统统阻止注册！（正则匹配）
        if (/"g"|'g'/i.test(fnStr)) {
          console.log('%c[blockG] 激进模式拦截成功！', "color: #39c5bb")
          console.log(`%c[blockG] 拦截的监听器回调函数片段： %c${fnStr.slice(0, 200)}`, "color: #39c5bb", "color: #c5393a"); // 打log提示拦截了某个 keyup 回调，并打印回调源码前200字符
          return; // 直接返回，不调用原始方法，以阻止监听器被注册
        }
      } catch (e) { } // 如果抛异常，则忽略错误继续执行
    }
    return _add.call(this, type, fn, opt); // 如果不需要拦截，则使用原始方法
  }; */

  // =========================== [防御性编程结束] ===========================

  // debug用 - 输出tagName（用于开发定位名称）
  // document.addEventListener('focusin', e => { console.log(`tagName: ${(document.activeElement && document.activeElement.tagName) || ''}`); });

  // 次要逻辑：隐藏“G”相关元素
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
