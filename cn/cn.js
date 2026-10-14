const menuButton=document.querySelector('.menu-toggle'),mobileNav=document.querySelector('#mobile-nav');
const setMenu=o=>{menuButton.setAttribute('aria-expanded',String(o));menuButton.setAttribute('aria-label',o?'关闭菜单':'打开菜单');mobileNav.hidden=!o;};
menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobileNav.hidden){setMenu(false);menuButton.focus();}});
document.querySelector('#year').textContent=new Date().getFullYear();
