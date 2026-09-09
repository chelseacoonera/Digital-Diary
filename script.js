const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const moods=[
  {id:"happy",emoji:"😊",name:"Happy"},{id:"loved",emoji:"🥰",name:"Loved"},
  {id:"calm",emoji:"😌",name:"Calm"},{id:"okay",emoji:"😐",name:"Okay"},
  {id:"sad",emoji:"😔",name:"Sad"},{id:"tired",emoji:"😴",name:"Tired"}
];
const quotes=[
  "Small steps still move you forward.",
  "You deserve to remember the good little things.",
  "Let today be imperfect and still beautiful.",
  "Your ordinary days are part of your story.",
  "Keep the moments that make your heart feel warm."
];
const key="moriDiary_v1";
let state=JSON.parse(localStorage.getItem(key)||"null")||{entries:[],moodLog:{},settings:{name:"",theme:"light"}};
let tempImage="";
function save(){localStorage.setItem(key,JSON.stringify(state));}
function todayISO(){const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function formatDate(s){return new Date(s+"T00:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}
function monthKey(s){return s.slice(0,7)}
function moodById(id){return moods.find(m=>m.id===id)||moods[3]}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2200)}
function applyTheme(){document.body.classList.toggle("dark",state.settings.theme==="dark");$("#themeSelect").value=state.settings.theme;$("#themeBtn").textContent=state.settings.theme==="dark"?"☀":"☾"}
function greeting(){const h=new Date().getHours();const n=state.settings.name?`, ${state.settings.name}`:"";$("#greeting").textContent=(h<12?"Good morning":h<18?"Good afternoon":"Good evening")+n+" ✨";$("#todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
function navigate(page){$$(".page").forEach(p=>p.classList.toggle("active",p.id===page));$$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===page));window.scrollTo({top:0,behavior:"smooth"});if(page==="diary")renderEntries();if(page==="mood")renderMood();if(page==="memories")renderMemories()}
function renderMoodChips(){
  $("#homeMoodRow").innerHTML=moods.map(m=>`<button class="mood-chip ${state.moodLog[todayISO()]===m.id?"selected":""}" data-mood="${m.id}"><span class="emoji">${m.emoji}</span>${m.name}</button>`).join("");
  $$(".mood-chip").forEach(b=>b.onclick=()=>setMood(b.dataset.mood));
  $("#moodGrid").innerHTML=moods.map(m=>`<button class="mood-option ${state.moodLog[todayISO()]===m.id?"selected":""}" data-mood="${m.id}"><span>${m.emoji}</span><small>${m.name}</small></button>`).join("");
  $$(".mood-option").forEach(b=>b.onclick=()=>setMood(b.dataset.mood));
}
function setMood(id){state.moodLog[todayISO()]=id;save();renderMoodChips();renderOverview();renderCalendar();$("#moodSaved").textContent=`Saved: ${moodById(id).emoji} ${moodById(id).name}`;toast("Mood saved ♡")}
function renderOverview(){
  const mk=monthKey(todayISO()), entries=state.entries.filter(e=>monthKey(e.date)===mk), days=Object.keys(state.moodLog).filter(k=>k.startsWith(mk)).length;
  $("#overviewStats").innerHTML=`<div class="stat"><b>${entries.length}</b><span>diary entries</span></div><div class="stat"><b>${days}</b><span>mood check-ins</span></div><div class="stat"><b>${state.entries.filter(e=>e.favorite).length}</b><span>favorites</span></div>`;
}
function renderRecent(){
  const arr=[...state.entries].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  $("#recentEntries").innerHTML=arr.length?arr.map(entryHTML).join(""):`<div class="empty">Your first memory is waiting here. ✿<br><button class="text-btn" onclick="openModal()">Write it down →</button></div>`;
  bindEntryActions();
}
function entryHTML(e){
  const m=moodById(e.mood), tags=(e.tags||[]).map(t=>`<span class="tag">#${escapeHtml(t)}</span>`).join("");
  return `<article class="entry"><div><div class="entry-meta"><span>${m.emoji} ${m.name}</span>${tags}</div><h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.text).slice(0,220)}${e.text.length>220?"…":""}</p>${e.song?`<p style="margin-top:8px">🎵 ${escapeHtml(e.song)}</p>`:""}</div><div class="entry-side">${formatDate(e.date)}<div class="entry-actions"><button class="small-btn" data-edit="${e.id}">Edit</button><button class="small-btn" data-delete="${e.id}">Delete</button></div></div></article>`;
}
function renderEntries(){
  const q=$("#searchInput").value.toLowerCase(), f=$("#tagFilter").value;
  let arr=[...state.entries].sort((a,b)=>b.date.localeCompare(a.date)).filter(e=>(e.title+" "+e.text+" "+(e.tags||[]).join(" ")).toLowerCase().includes(q));
  if(f!=="all")arr=arr.filter(e=>(e.tags||[]).includes(f));
  $("#allEntries").innerHTML=arr.length?arr.map(entryHTML).join(""):`<div class="empty">No entries found. Try another search or write something new.</div>`;
  const tags=[...new Set(state.entries.flatMap(e=>e.tags||[]))].sort();$("#tagFilter").innerHTML=`<option value="all">All tags</option>`+tags.map(t=>`<option ${t===f?"selected":""} value="${escapeAttr(t)}">#${escapeHtml(t)}</option>`).join("");
  bindEntryActions();
}
function bindEntryActions(){
  $$("[data-edit]").forEach(b=>b.onclick=()=>openModal(b.dataset.edit));
  $$("[data-delete]").forEach(b=>b.onclick=()=>{if(confirm("Delete this diary entry?")){state.entries=state.entries.filter(e=>e.id!==b.dataset.delete);save();renderAll();toast("Entry deleted")}})
}
function renderCalendar(){
  const now=new Date(), y=now.getFullYear(), mo=now.getMonth(), first=new Date(y,mo,1).getDay(), days=new Date(y,mo+1,0).getDate();
  $("#monthName").textContent=now.toLocaleDateString(undefined,{month:"long",year:"numeric"});
  let h=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x=>`<div class="cal-head">${x}</div>`).join("");
  for(let i=0;i<first;i++)h+=`<div class="cal-day empty"></div>`;
  for(let d=1;d<=days;d++){const s=`${y}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,m=state.moodLog[s],today=s===todayISO();h+=`<div class="cal-day ${today?"today":""}">${d}${m?`<span class="cal-mood">${moodById(m).emoji}</span>`:""}</div>`}
  $("#calendar").innerHTML=h;
}
function renderMemories(){
  const arr=[...state.entries].filter(e=>e.image).sort((a,b)=>b.date.localeCompare(a.date));
  $("#memoryGrid").innerHTML=arr.length?arr.map(e=>`<article class="memory"><img src="${e.image}" alt=""><div class="memory-info"><h3>${escapeHtml(e.title)}</h3><p>${formatDate(e.date)} · ${moodById(e.mood).emoji}</p></div></article>`).join(""):`<div class="empty" style="grid-column:1/-1">Photo memories will appear here when you add a photo to a diary entry. 📷</div>`;
}
function renderAll(){greeting();renderMoodChips();renderOverview();renderRecent();renderEntries();renderCalendar();renderMemories();$("#nameInput").value=state.settings.name||"";applyTheme()}
function openModal(id){
  $("#entryModal").classList.add("show");$("#entryModal").setAttribute("aria-hidden","false");tempImage="";
  $("#entryMood").innerHTML=moods.map(m=>`<option value="${m.id}">${m.emoji} ${m.name}</option>`).join("");
  $("#entryDate").value=todayISO();$("#entryRating").value="5";$("#entryId").value="";$("#entryTitle").value="";$("#entryTags").value="";$("#entryText").value="";$("#entrySong").value="";$("#imagePreview").hidden=true;$("#modalTitle").textContent="Write your day";
  if(id){const e=state.entries.find(x=>x.id===id);if(!e)return;$("#modalTitle").textContent="Edit your memory";$("#entryId").value=e.id;$("#entryDate").value=e.date;$("#entryTitle").value=e.title;$("#entryMood").value=e.mood;$("#entryTags").value=(e.tags||[]).join(", ");$("#entryText").value=e.text;$("#entrySong").value=e.song||"";$("#entryRating").value=e.rating||5;if(e.image){tempImage=e.image;$("#imagePreview").src=e.image;$("#imagePreview").hidden=false}}
}
function closeModal(){$("#entryModal").classList.remove("show");$("#entryModal").setAttribute("aria-hidden","true")}
$("#entryImage").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{tempImage=r.result;$("#imagePreview").src=tempImage;$("#imagePreview").hidden=false};r.readAsDataURL(f)}
$("#entryForm").onsubmit=e=>{e.preventDefault();const id=$("#entryId").value||Date.now().toString();const old=state.entries.find(x=>x.id===id);const obj={id,date:$("#entryDate").value,title:$("#entryTitle").value.trim(),mood:$("#entryMood").value,tags:$("#entryTags").value.split(",").map(x=>x.trim().toLowerCase()).filter(Boolean),text:$("#entryText").value.trim(),song:$("#entrySong").value.trim(),rating:Number($("#entryRating").value),image:tempImage,favorite:old?.favorite||false};state.entries=old?state.entries.map(x=>x.id===id?obj:x):[obj,...state.entries];save();closeModal();renderAll();toast("Memory saved ♡")}
$("#closeModal").onclick=closeModal;$("#entryModal").onclick=e=>{if(e.target.id==="entryModal")closeModal()}
$("#newEntryBtn").onclick=()=>openModal();$("#heroWriteBtn").onclick=()=>openModal();$("#diaryNewBtn").onclick=()=>openModal();
$("#searchInput").oninput=renderEntries;$("#tagFilter").onchange=renderEntries;$("#newQuoteBtn").onclick=()=>$("#quoteText").textContent=quotes[Math.floor(Math.random()*quotes.length)];
$("#themeBtn").onclick=()=>{state.settings.theme=state.settings.theme==="dark"?"light":"dark";save();applyTheme()};$("#themeSelect").onchange=e=>{state.settings.theme=e.target.value;save();applyTheme()};
$("#saveSettingsBtn").onclick=()=>{state.settings.name=$("#nameInput").value.trim();save();greeting();toast("Settings saved ♡")};
$("#exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="mori-diary-backup.json";a.click();URL.revokeObjectURL(a.href);toast("Backup exported")};
$("#clearBtn").onclick=()=>{if(confirm("This removes all diary data from this browser. Continue?")){localStorage.removeItem(key);location.reload()}}
$$(".nav-btn").forEach(b=>b.onclick=()=>navigate(b.dataset.page));$$("[data-page-link]").forEach(b=>b.onclick=()=>navigate(b.dataset.pageLink));
$("#quoteText").textContent=quotes[Math.floor(Math.random()*quotes.length)];
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHtml(s)}
renderAll();
