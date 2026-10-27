/* VOIDWARE ASTRA V2.0 — Astra Strike companion (2026-10-27)
 * Self-contained, no remote network calls. Press U to show/hide.
 * Interface and browser-side HUD/control tools are functional.
 * This is NOT a working aimbot, wallhack, anti-cheat bypass, or skin unlocker.
 * Original Clutcher VOIDWARE remains at repository root.
 */
(() => {
"use strict";
if(!/(\.|^)astrastrike\.fun$/i.test(location.hostname)){
  console.warn("[VOIDWARE ASTRA] Open astrastrike.fun first."); return;
}
try { window.VOIDWARE_ASTRA?.destroy(); } catch(_) {}
const KEY="voidware.astra.v1.settings"; // reuse v1 settings to preserve all binds
const defaults={
 menuHotkey:"KeyU", quickHotkey:"KeyJ", hudHotkey:"KeyH",
 activeTab:"Home", accent:"#a967ff", showReticle:false,
 reticleColor:"#9f63ff", reticleSize:8, reticleGap:5,
 reticleThickness:2, reticleDot:true, hideNativeReticle:false,
 hideKillfeed:false, hideRadar:false, hideDamageFx:false,
 dimScope:false, largeHud:false, minimalUi:false,
 brightness:1, sensitivity:1.6, volume:.7,
 fps:"auto", scale:"auto", shadows:"off", aa:"on",
 gfxMeter:"on", reactionBest:null
};
let cfg=Object.assign({},defaults);
try {
  let saved=JSON.parse(localStorage.getItem(KEY)||"{}");
  if(saved&&typeof saved==="object") Object.keys(defaults).forEach(k=>{
    if(Object.prototype.hasOwnProperty.call(saved,k) &&
       typeof saved[k]===typeof defaults[k])cfg[k]=saved[k];
  });
}catch(_){}
const root=document.createElement("div");
root.id="voidware-astra-root";
root.style.cssText="position:fixed;inset:0;z-index:2147483000;pointer-events:none;";
const shadow=root.attachShadow({mode:"open"});
const css=document.createElement("style");
css.textContent=[
":host{all:initial;color:#ece5ff;font-family:Inter,Segoe UI,Arial,sans-serif}",
"*{box-sizing:border-box}",
"#panel{position:fixed;top:8%;left:50%;transform:translateX(-50%);width:min(970px,94vw);max-height:80vh;display:flex;flex-direction:column;background:rgba(19,13,34,.97);border:1px solid #62468b;border-radius:14px;box-shadow:0 20px 70px #000c;pointer-events:auto;overflow:hidden}",
"#panel.hidden{display:none}",
"header{padding:15px 20px;border-bottom:1px solid #3b3153;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(90deg,#2e154d,#120d25)}",
"header strong{font-size:21px;letter-spacing:2px;color:#ead7ff}",
"header small{display:block;color:#b6a3d4;font-size:11px;margin-top:4px}",
"button,input,select{font:inherit}",
"button{cursor:pointer;background:#35264c;border:1px solid #6b4b95;color:#f5eaff;border-radius:6px;padding:7px 10px;font-size:12px}",
"button:hover{background:#6842a1}",
"button.primary{background:#7544b5;border-color:#b78afb}",
"button:disabled{opacity:.42;cursor:not-allowed}",
"#tabs{display:flex;gap:2px;flex-wrap:wrap;padding:7px 12px;background:#150f26}",
"#tabs button{border:0;border-radius:5px;background:transparent;padding:8px 12px}",
"#tabs button.active{background:#62409b;color:#fff}",
"#main{padding:15px;overflow:auto;min-height:220px}",
".lead{font-size:13px;color:#bcaad7;margin:0 0 14px;line-height:1.5}",
".grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}",
".card{background:#251b37;border:1px solid #42345c;border-radius:9px;padding:12px;min-height:115px}",
".card h3{font-size:13px;margin:0 0 10px;color:#d5afff}",
".card p{font-size:11px;color:#ada0c3;line-height:1.5;margin:8px 0 0}",
".field{display:flex;align-items:center;gap:7px;font-size:12px;margin:8px 0}",
".field span{flex:1}",
"input[type=range]{width:100%;accent-color:#a477f3}",
"input[type=color]{width:34px;height:26px;padding:0;border:0;background:none}",
"input[type=text],select{max-width:120px;background:#140f20;color:#fff;border:1px solid #69518c;padding:5px;border-radius:4px}",
".val{font-size:11px;color:#bcaadd;margin-left:4px}",
"footer{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:10px 16px;border-top:1px solid #413355;color:#ad9cc2;font-size:11px}",
".warning{color:#ffce82}",
".ok{color:#81ddba}",
"#reticle{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;display:none}",
".rr{position:absolute;display:block;background:var(--rc)}",
".rr.left,.rr.right{width:var(--rs);height:var(--rt);top:calc(var(--rt) / -2)}",
".rr.left{right:var(--rg)}.rr.right{left:var(--rg)}",
".rr.top,.rr.bottom{height:var(--rs);width:var(--rt);left:calc(var(--rt) / -2)}",
".rr.top{bottom:var(--rg)}.rr.bottom{top:var(--rg)}",
"#reticle i{position:absolute;left:-2px;top:-2px;width:4px;height:4px;border-radius:50%;background:var(--rc)}",
"#toast{position:fixed;bottom:8%;left:50%;transform:translateX(-50%);display:none;background:#22153de8;color:#fff;border:1px solid #7554af;border-radius:9px;padding:9px 13px;font-size:12px}",
"@media(max-width:700px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}#panel{top:2%;max-height:95vh}header strong{font-size:16px}}"
].join("\n");
css.textContent += "\n/* VOIDWARE V19.1 STUDIO-style presentation */\n:host{--vw-bg:#0d0f14;--vw-raised:#181b23;--vw-line:#2a2d36}\n#panel{top:50%;left:50%;transform:translate(-50%,-50%);width:min(1200px,96vw);height:min(760px,94vh);\nmax-height:94vh;border:1px solid #373944;border-radius:9px;background:var(--vw-bg);\nbox-shadow:0 28px 90px #000b;display:flex;flex-direction:column;}\nheader{height:62px;min-height:62px;padding:0 22px;background:#14161d;border-bottom:1px solid #2a2d36;gap:12px;}\n.brand{display:flex;gap:12px;align-items:center}\n.brandmark{width:32px;height:32px;border-radius:7px;display:grid;place-items:center;background:#282333;\nborder:1px solid #514667;color:#d6c5fb;font-weight:850;font-size:16px}\n.brand-title{font-size:15px;font-weight:820;letter-spacing:1.6px;color:#f3f1f9}\n.brand-title b{color:#b7a1f6}\n.brand-sub{font-size:9px;font-weight:540;color:#777d8e;margin-top:4px}\n.brand-right{display:flex;align-items:center;gap:10px}\n.status-pill{padding:6px 9px;border:1px solid #284c3e;background:#15251f;color:#7db89a;\nborder-radius:5px;font-size:10px;font-weight:650}\n.version-pill{padding:7px 10px;border:1px solid #323540;border-radius:5px;color:#b7a1f6;\nbackground:#1a1d26;font-size:10px}\nbutton{background:#1a1d26;border:1px solid #323540;border-radius:5px;color:#adb1bf;font-weight:650}\nbutton:hover{background:#262a34;border-color:#50515d;color:#f4f4f8}\nbutton.primary{background:#42315d;border-color:#7c66a6}\n#tabs{height:40px;min-height:40px;display:flex;gap:22px;align-items:center;flex-wrap:nowrap;overflow-x:auto;\npadding:0 20px;background:#111319;border-bottom:1px solid #22252e}\n#tabs button{height:39px;position:relative;border:0;background:none;border-radius:0;padding:0 1px;\ncolor:#9599a6;font-size:11px;font-weight:650;white-space:nowrap}\n#tabs button.active{background:none;color:#f5f3fc}\n#tabs button.active:after{content:\"\";position:absolute;bottom:0;left:0;right:0;height:2px;background:#a78bee}\n#subbar{height:46px;min-height:46px;display:flex;align-items:center;gap:8px;padding:0 20px;\nbackground:#0f1117;border-bottom:1px solid #22252e}\n#subnav{display:flex;gap:4px;min-width:0;align-items:center;flex:1;overflow-x:auto;scrollbar-width:none}\n#subnav::-webkit-scrollbar{display:none}\n#subnav button{height:31px;flex-shrink:0;border:1px solid transparent;background:transparent;border-radius:5px;\npadding:7px 11px;font-size:11px;font-weight:550;color:#9a9eac}\n#subnav button.active{background:#25222f;border-color:#494053;color:#e4ddf7;font-weight:680}\n#vw-search{min-width:100px;width:180px;max-width:25%;background:#181b23;border:1px solid #30333f;\nborder-radius:5px;height:30px;color:#eef0f4;font:500 11px Inter,Segoe UI,Arial,sans-serif;padding:4px 10px;outline:none}\n#vw-search:focus{border-color:#766499}\n#main{flex:1;min-height:0;overflow-y:auto;padding:25px 28px 32px;background:var(--vw-bg)}\n#page-title{font-size:19px;font-weight:740;color:#f0f1f5;margin:0 0 5px}\n.lead{font-size:11px;color:#858a9b;line-height:1.55;margin:0 0 20px}\n.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}\n.card{min-height:87px;padding:14px 13px;background:#12151b;border:1px solid #2a2d36;\nborder-radius:6px;box-shadow:none}\n.card:hover{background:#191c26;border-color:#41424f}\n.card h3{font-size:12px;font-weight:650;letter-spacing:0;color:#e7e8ed;margin:0 0 10px}\n.card p{font-size:10.3px;line-height:1.42;color:#888d9d;margin:7px 0 0}\n.field{font-size:11px;margin:8px 0}\n.field span{color:#c6c9d2}\ninput[type=range]{accent-color:#a67dff}\ninput[type=color]{cursor:pointer}\ninput[type=text],select{background:#0d1119;color:#f0f0fb;border:1px solid #353d50;\nborder-radius:6px;padding:8px;width:100%;max-width:155px;outline:none;font-size:11px}\ninput[type=text]:focus,select:focus{border-color:#a778ff}\nfooter{height:41px;min-height:41px;background:#0c0f17;border-top:1px solid #252b39;\npadding:0 20px;color:#778196;font-size:10px}\nfooter strong{color:#c5a4ff;font-weight:650}\n#reticle{z-index:2147483001}\n@media(max-width:850px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}#tabs{gap:13px}}\n@media(max-width:540px){.grid{grid-template-columns:1fr}#vw-search{width:110px}header{padding:0 10px}\n.brand-right .status-pill{display:none}#subbar{padding:0 8px}#main{padding:14px}}\n";
shadow.appendChild(css);
const panel=document.createElement("div");
panel.id="panel";
shadow.appendChild(panel);
const reticle=document.createElement("div");
reticle.id="reticle";
reticle.innerHTML='<span class="rr left"></span><span class="rr right"></span><span class="rr top"></span><span class="rr bottom"></span><i></i>';
shadow.appendChild(reticle);
const toastEl=document.createElement("div");
toastEl.id="toast";shadow.appendChild(toastEl);
const override=document.createElement("style");
override.id="voidware-astra-css-overrides";
document.head.appendChild(override);
(document.body||document.documentElement).appendChild(root);
let visible=true, toastTimer=null, drillTimer=null, drillReady=0, drillState="idle", runs=0;
let measuredFPS=0, frames=0, lastFPS=performance.now(), rAF=0;
const tabs=["Home","FPS","Rage","Legit","Visuals","Misc","Skins","Config"];
let activeSub=0, searchTerm="";
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function save(){try{localStorage.setItem(KEY,JSON.stringify(cfg));}catch(_){}}
function toast(msg){
 toastEl.textContent=msg;toastEl.style.display="block";
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.style.display="none",2600);
}
function nativeSet(id,value){
 const el=document.getElementById(id);
 if(!el)return false;
 el.value=String(value);
 el.dispatchEvent(new Event("input",{bubbles:true}));
 el.dispatchEvent(new Event("change",{bubbles:true}));
 return true;
}
function syncNative(){
 [["sens",cfg.sensitivity],["bright",cfg.brightness],["vol",cfg.volume],
 ["gfxFps",cfg.fps],["gfxScale",cfg.scale],["gfxShadows",cfg.shadows],
 ["gfxAa",cfg.aa],["gfxMeter",cfg.gfxMeter]].forEach(x=>nativeSet(x[0],x[1]));
}
function apply(){
 reticle.style.display=cfg.showReticle?"block":"none";
 reticle.style.setProperty("--rc",cfg.reticleColor);
 reticle.style.setProperty("--rs",cfg.reticleSize+"px");
 reticle.style.setProperty("--rg",cfg.reticleGap+"px");
 reticle.style.setProperty("--rt",cfg.reticleThickness+"px");
 reticle.querySelector("i").style.display=cfg.reticleDot?"block":"none";
 const styles=[];
 if(cfg.hideNativeReticle)styles.push("#crosshair{visibility:hidden!important}");
 if(cfg.hideKillfeed)styles.push("#killfeed,#killCards{display:none!important}");
 if(cfg.hideRadar)styles.push("#radarBox{display:none!important}");
 if(cfg.hideDamageFx)styles.push("#damageFx,#damageArc{display:none!important}");
 if(cfg.dimScope)styles.push("#scope{opacity:.65!important}");
 if(cfg.largeHud)styles.push("#ha{transform:scale(1.2)!important;transform-origin:bottom center!important}");
 if(cfg.minimalUi)styles.push("#money,#weapons,#awards{display:none!important}");
 override.textContent=styles.join("\n");
 syncNative();save();
}
function range(key,name,min,max,step){
 return '<label class="field"><span>'+esc(name)+'</span><b class="val">'+esc(cfg[key])+'</b></label><input data-key="'+key+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+cfg[key]+'">';
}
function toggle(key,name){
 return '<label class="field"><input data-key="'+key+'" type="checkbox" '+(cfg[key]?"checked":"")+'><span>'+esc(name)+'</span></label>';
}
function color(key,name){
 return '<label class="field"><span>'+esc(name)+'</span><input data-key="'+key+'" type="color" value="'+esc(cfg[key])+'"></label>';
}
function select(key,name,opts){
 return '<label class="field"><span>'+esc(name)+'</span><select data-key="'+key+'">'+opts.map(o=>'<option value="'+esc(o[0])+'" '+(String(cfg[key])===String(o[0])?'selected':'')+'>'+esc(o[1])+'</option>').join("")+'</select></label>';
}
function card(title,body,desc){
 return '<div class="card"><h3>'+title+'</h3>'+body+(desc?'<p>'+desc+'</p>':'')+'</div>';
}
function button(action,label){return '<button data-action="'+action+'">'+label+'</button>';}
function disabledFeatures(label){
 return card(label,'<div class="warning" style="font-size:12px">Not connected to Astra combat engine</div>',
 "Would require a tested, game-specific integration. No fake switches.");
}
function page(){
 switch(cfg.activeTab){
 case "Home": return [
  '<p class="lead">ASTRA STRIKE EDITION · Astra-native HUD, controls and practice tools. Loaded on <b>'+esc(location.host)+'</b>.</p>',
  '<div class="grid">',
  card("STATUS",'<div class="ok">Overlay connected</div><p>Measured FPS: <b id="fpsReadout">'+measuredFPS+'</b></p>',"Game combat engine: not connected."),
  card("MENU HOTKEY",'<div class="ok">'+esc(cfg.menuHotkey)+'</div>'+button("hide","Hide menu"),"Press U by default. Clicking back into game resumes pointer lock."),
  card("QUICK CONTROLS",'<div>'+esc(cfg.quickHotkey)+' = reticle</div><div>'+esc(cfg.hudHotkey)+' = minimal HUD</div>',"All hotkeys can be rebound."),
  card("VERSION",'<div class="ok">V1.0</div>',"Independent Astra file. Original Clutcher VOIDWARE is untouched."),
  '</div>'].join("");
 case "Legit": return '<p class="lead">Your precision setup. The reticle and native sensitivity controls work immediately.</p><div class="grid">'+
  card("CROSSHAIR",toggle("showReticle","Custom reticle")+toggle("hideNativeReticle","Hide Astra reticle")+toggle("reticleDot","Center dot"))+
  card("RETICLE SHAPE",range("reticleSize","Length",2,20,1)+range("reticleGap","Gap",1,18,1))+
  card("RETICLE STYLE",range("reticleThickness","Thickness",1,7,1)+color("reticleColor","Color"))+
  card("NATIVE SENSITIVITY",range("sensitivity","Sensitivity",.2,5,.05),"Uses Astra's existing settings input.")+
  disabledFeatures("AIM ASSIST / SMOOTH FLICK")+
  disabledFeatures("TRIGGER / RECOIL CONTROL")+'</div>';
 case "Rage": return '<p class="lead">Rage lab: reaction training is functional. Gameplay cheats need a separate combat-engine adapter.</p><div class="grid">'+
  card("REACTION CHALLENGE",'<p id="drillState">Click Start, then hit STOP when this turns green.</p>'+button("drill","START / STOP")+'<p>Best: '+(cfg.reactionBest===null?"—":cfg.reactionBest+" ms")+'</p>',"Local drill; does not affect opponents.")+
  card("TARGET PRACTICE",'<div>Press your own shoot key in-game while watching the reticle.</div>',"Use Astra's built-in bot modes for practice.")+
  disabledFeatures("AIMBOT / SILENT AIM")+
  disabledFeatures("ESP / WALLBANG / AUTO-WIN")+'</div>';
 case "Visuals": return '<p class="lead">All toggles below modify visible HUD elements, not enemy visibility through walls.</p><div class="grid">'+
  card("HUD",toggle("hideKillfeed","Hide killfeed")+toggle("hideRadar","Hide radar"))+
  card("EFFECTS",toggle("hideDamageFx","Hide damage flash")+toggle("dimScope","Dim scope overlay"))+
  card("LAYOUT",toggle("largeHud","Larger health / ammo HUD")+toggle("minimalUi","Minimal side UI"))+
  card("CROSSHAIR COLOR",color("reticleColor","Reticle color")+toggle("showReticle","Show custom reticle"))+'</div>';
 case "Misc": return '<p class="lead">Quick quality-of-life controls. No game-clock manipulation or network tampering.</p><div class="grid">'+
  card("VOLUME",range("volume","Volume",0,1,.05))+
  card("BRIGHTNESS",range("brightness","Brightness",.7,1.8,.05))+
  card("GAME SETTINGS",button("settings","Open Astra settings"),"Uses the game's native Settings tab.")+
  card("CLEANUP",button("remove","Remove VOIDWARE Astra"),"Restores Astra display; original game remains unchanged.")+'</div>';
 case "Skins": return '<p class="lead">Skin changer and case simulations cannot be copied from Clutcher: Astra does not expose that inventory system to this script.</p><div class="grid">'+
  card("SKIN EDITOR",'<span class="warning">Unsupported in V1.0</span>',"No fake inventory edits.")+
  card("WEAPON INSPECT",'<div>Press <b>F</b> in Astra to inspect your current weapon.</div>',"Uses the game's native keybind.")+
  card("CONFIGURATIONS",button("export","Export your Astra VOIDWARE config"),"Keep your visual presets and hotkeys.")+'</div>';
 case "Config": return '<p class="lead">Settings are auto-saved per website. Export files to transfer between browsers or domains.</p><div class="grid">'+
  card("MENU KEY",'<label class="field"><span>Menu hotkey</span><input data-key="menuHotkey" type="text" value="'+esc(cfg.menuHotkey)+'"></label>',"Examples: KeyU, Insert, F8.")+
  card("QUICK KEY",'<label class="field"><span>Reticle toggle</span><input data-key="quickHotkey" type="text" value="'+esc(cfg.quickHotkey)+'"></label>')+
  card("HUD KEY",'<label class="field"><span>HUD toggle</span><input data-key="hudHotkey" type="text" value="'+esc(cfg.hudHotkey)+'"></label>')+
  card("PRESETS",button("export","EXPORT JSON")+' '+button("import","IMPORT JSON")+' '+button("reset","RESET"),"Imported files only update whitelisted settings.")+'</div>';
 case "FPS": return '<p class="lead">Real game-engine settings already exposed by Astra. Visual quality and FPS are a tradeoff.</p><div class="grid">'+
  card("CAP",select("fps","FPS limit",[["auto","Auto"],["30","30"],["60","60"],["120","120"],["0","Unlimited"]]))+
  card("SCALE",select("scale","Render scale",[["auto","Auto"],["100","100%"],["85","85%"],["70","70%"],["50","50%"]]))+
  card("SHADOWS",select("shadows","Shadows",[["off","Off"],["static","Map only"],["dynamic","Everything"]]))+
  card("ANTI-ALIASING",select("aa","Anti-aliasing",[["on","On"],["off","Off"]]))+
  card("METER",select("gfxMeter","Astra FPS display",[["on","On"],["off","Off"]]))+
  card("ONE-CLICK PRESETS",button("speed","MAX FPS")+' '+button("quality","MAX QUALITY"),"These use Astra's real settings, not a fake FPS multiplier.")+'</div>';
 default: return "";
 }
}

function applyCardFilters(){
 const cards=[...panel.querySelectorAll("#main .card")];
 cards.forEach((card,i)=>{
  const chosen=activeSub===0||i===activeSub-1;
  const matches=!searchTerm||card.textContent.toLowerCase().includes(searchTerm.toLowerCase());
  card.style.display=chosen&&matches?"":"none";
 });
 const n=cards.filter(c=>c.style.display!=="none").length;
 const empty=panel.querySelector("#nothing-found");
 if(empty)empty.hidden=n>0;
}
function render(){
 const markup=page();
 const tmp=document.createElement("div");tmp.innerHTML=markup;
 const headings=[...tmp.querySelectorAll(".card h3")].map(e=>e.textContent.trim());
 if(activeSub>headings.length)activeSub=0;
 panel.innerHTML=
 '<header><div class="brand"><div class="brandmark">V</div><div><div class="brand-title">VOID<b>WARE</b> <span style="font-weight:400;color:#a4a5b1">ASTRA</span></div>'+
 '<div class="brand-sub">VOIDWARE V2.0 · Studio edition · Astra Strike</div></div></div>'+
 '<div class="brand-right"><span class="status-pill">● ASTRA READY</span><span class="version-pill">v2.0</span>'+button("hide","✕")+'</div></header>'+
 '<nav id="tabs">'+tabs.map(t=>'<button data-tab="'+t+'" class="'+(cfg.activeTab===t?"active":"")+'">'+t+'</button>').join("")+'</nav>'+
 '<div id="subbar"><nav id="subnav">'+['All',...headings].map((t,i)=>'<button data-subtab="'+i+'" class="'+(activeSub===i?"active":"")+'">'+esc(t)+'</button>').join("")+'</nav>'+
 '<input id="vw-search" type="search" aria-label="Search controls" placeholder="Search settings..." value="'+esc(searchTerm)+'"></div>'+
 '<section id="main"><h2 id="page-title">'+esc(cfg.activeTab)+(cfg.activeTab==="FPS"?" Boost":"")+'</h2>'+markup+
 '<p id="nothing-found" hidden style="color:#a9a0b9;padding:20px">No matching controls.</p></section>'+
 '<footer><strong>READY · '+esc(cfg.activeTab.toUpperCase())+'</strong><span style="margin-left:auto">'+
 esc(cfg.menuHotkey)+' MENU · '+esc(cfg.quickHotkey)+' RETICLE · '+esc(cfg.hudHotkey)+' HUD · LOCAL CONTROLS</span></footer>';
 applyCardFilters();
}
function setVisible(next){
 visible=next;panel.classList.toggle("hidden",!visible);
 if(visible&&document.pointerLockElement){
  try{document.exitPointerLock();}catch(_){}
 }
}
function setTab(t){if(tabs.includes(t)){cfg.activeTab=t;activeSub=0;searchTerm="";save();render();}}
function getControlValue(el,key){
 if(el.type==="checkbox")return !!el.checked;
 if(el.type==="range")return Number(el.value);
 return el.value;
}
panel.addEventListener("input",ev=>{
 const el=ev.target,key=el?.dataset?.key;
 if(el.id==="vw-search"){searchTerm=el.value;activeSub=0;panel.querySelectorAll("#subnav button").forEach((b,i)=>b.classList.toggle("active",i===0));applyCardFilters();return;}
 if(!key||!(key in defaults))return;
 cfg[key]=getControlValue(el,key);
 apply();
 if(el.type==="range"){
  const b=el.closest(".card")?.querySelector(".val");if(b)b.textContent=String(cfg[key]);
 }
});
panel.addEventListener("change",ev=>{
 const el=ev.target,key=el?.dataset?.key;
 if(key){cfg[key]=getControlValue(el,key);apply();render();}
});
function startDrill(){
 const p=panel.querySelector("#drillState");
 if(drillState==="waiting"){clearTimeout(drillTimer);drillState="idle";if(p)p.textContent="False start — retry!";return;}
 if(drillState==="ready"){
  const ms=Math.round(performance.now()-drillReady);
  cfg.reactionBest=cfg.reactionBest===null?ms:Math.min(cfg.reactionBest,ms);
  save();drillState="idle";render();
  const e=panel.querySelector("#drillState");if(e)e.textContent=ms+" ms — hit START to retry!";
  return;
 }
 drillState="waiting";if(p)p.textContent="WAIT FOR GREEN...";
 drillTimer=setTimeout(()=>{
  drillState="ready";drillReady=performance.now();
  const e=panel.querySelector("#drillState");if(e){e.textContent="GREEN! CLICK STOP!";e.style.color="#71f0ae";}
 },850+Math.random()*1750);
}
function download(name,text,type){
 const blob=new Blob([text],{type});
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download=name;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),2000);
}
const importInput=document.createElement("input");
importInput.type="file";importInput.accept="application/json,.json";
importInput.style.display="none";root.appendChild(importInput);
importInput.addEventListener("change",async()=>{
 const f=importInput.files?.[0];if(!f)return;
 try{
  const j=JSON.parse(await f.text());
  if(!j||typeof j!=="object")throw Error("Invalid file");
  for(const k of Object.keys(defaults)){
   if(Object.prototype.hasOwnProperty.call(j,k)&&typeof j[k]===typeof defaults[k])cfg[k]=j[k];
  }
  apply();render();toast("Config imported!");
 }catch(e){toast("Import failed: "+e.message);}
 importInput.value="";
});
panel.addEventListener("keydown",ev=>{
  const el=ev.target;
  if(el?.dataset?.key && /Hotkey$/.test(el.dataset.key)){
   ev.preventDefault();ev.stopPropagation();
   if(ev.code==="Escape")return;
   cfg[el.dataset.key]=ev.code;save();render();toast("Hotkey set: "+ev.code);
  }
});
panel.addEventListener("click",ev=>{
 const sub=ev.target.closest("[data-subtab]");
 if(sub){activeSub=Number(sub.dataset.subtab)||0;panel.querySelectorAll("#subnav button").forEach((b,i)=>b.classList.toggle("active",i===activeSub));applyCardFilters();return;}
 const tab=ev.target.closest("[data-tab]");
 if(tab){setTab(tab.dataset.tab);return;}
 const b=ev.target.closest("[data-action]");if(!b)return;
 switch(b.dataset.action){
 case "hide":setVisible(false);break;
 case "drill":startDrill();break;
 case "export":download("VOIDWARE_ASTRA_CONFIG.json",JSON.stringify(cfg,null,2),"application/json");break;
 case "import":importInput.click();break;
 case "reset":cfg=Object.assign({},defaults);apply();render();toast("Defaults restored");break;
 case "speed":cfg.fps="0";cfg.scale="50";cfg.shadows="off";cfg.aa="off";apply();render();toast("Speed preset applied");break;
 case "quality":cfg.fps="auto";cfg.scale="100";cfg.shadows="dynamic";cfg.aa="on";apply();render();toast("Quality preset applied");break;
 case "settings":setVisible(false);document.querySelector('[data-tab="settings"]')?.click();toast("Use Astra settings");break;
 case "remove":window.VOIDWARE_ASTRA?.destroy();break;
 }
});
function onKey(e){
 if(e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;
 if(["INPUT","TEXTAREA","SELECT"].includes(e.target?.tagName))return;
 if(e.code===cfg.menuHotkey){e.preventDefault();e.stopImmediatePropagation();setVisible(!visible);}
 else if(e.code===cfg.quickHotkey){cfg.showReticle=!cfg.showReticle;apply();toast("Reticle "+(cfg.showReticle?"ON":"OFF"));}
 else if(e.code===cfg.hudHotkey){cfg.minimalUi=!cfg.minimalUi;apply();toast("Minimal HUD "+(cfg.minimalUi?"ON":"OFF"));}
}
window.addEventListener("keydown",onKey,true);
function frame(t){
 frames++;if(t-lastFPS>1000){measuredFPS=Math.round(frames*1000/(t-lastFPS));frames=0;lastFPS=t;
  const e=panel.querySelector("#fpsReadout");if(e)e.textContent=String(measuredFPS);
 }
 rAF=requestAnimationFrame(frame);
}
function destroy(){
 window.removeEventListener("keydown",onKey,true);
 cancelAnimationFrame(rAF);clearTimeout(toastTimer);clearTimeout(drillTimer);
 override.remove();root.remove();
 delete window.VOIDWARE_ASTRA;
}
window.VOIDWARE_ASTRA={
 version:"2.0",show:()=>setVisible(true),hide:()=>setVisible(false),
 getConfig:()=>Object.assign({},cfg),destroy
};
render();apply();setVisible(true);rAF=requestAnimationFrame(frame);
console.info("[VOIDWARE ASTRA] V2.0 loaded. U opens menu; J reticle; H HUD. Local visuals/settings; combat cheats not connected.");
})();
