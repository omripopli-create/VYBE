
const places = [
  {id:1,name:"Neon Bowling",score:88,price:18,distance:.7,mood:["fun","music"],people:"עמוס",x:72,y:25,emoji:"🎳",report:"מוזיקה חזקה וכמעט כל המסלולים מלאים"},
  {id:2,name:"Sunset Rooftop",score:76,price:24,distance:1.4,mood:["chill","music"],people:"חי",x:62,y:61,emoji:"🌇",report:"אווירה טובה ושקיעה מטורפת"},
  {id:3,name:"Pixel Arcade",score:91,price:15,distance:2.2,mood:["fun"],people:"מפוצץ",x:38,y:42,emoji:"🕹️",report:"טורניר קטן התחיל עכשיו"},
  {id:4,name:"Street Bites",score:68,price:12,distance:.9,mood:["food","chill"],people:"בינוני",x:50,y:80,emoji:"🍔",report:"אין כמעט תור כרגע"},
  {id:5,name:"Wave Café",score:52,price:10,distance:2.8,mood:["food","chill"],people:"רגוע",x:22,y:22,emoji:"☕",report:"שקט, יש הרבה שולחנות"},
  {id:6,name:"Pulse Arena",score:83,price:30,distance:3.6,mood:["fun","music"],people:"עמוס",x:84,y:72,emoji:"⚡",report:"אירוע מתחיל בקרוב"}
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function scoreClass(score){
  if(score >= 80) return "hot";
  if(score >= 60) return "mid";
  return "chill";
}
function scoreEmoji(score){
  if(score >= 80) return "🔥";
  if(score >= 60) return "⚡";
  return "😌";
}

function renderPins(){
  $("#pins").innerHTML = places.map(p => `
    <button class="pin ${scoreClass(p.score)}" style="left:${p.x}%;top:${p.y}%"
      title="${p.name}" onclick="openPlace(${p.id})">${p.score}</button>`).join("");
}

function renderPlaces(){
  const sorted = [...places].sort((a,b)=>b.score-a.score);
  $("#placesGrid").innerHTML = sorted.map(p => `
    <article class="place-card" onclick="openPlace(${p.id})">
      <div class="place-top">
        <span style="font-size:30px">${p.emoji}</span>
        <span class="score">${p.score} ${scoreEmoji(p.score)}</span>
      </div>
      <h3>${p.name}</h3>
      <div class="meta">${p.distance} ק״מ · בערך €${p.price} לאדם · ${p.people}</div>
      <div class="tags">
        ${p.mood.map(m=>`<span class="tag">${m}</span>`).join("")}
      </div>
    </article>`).join("");
}

window.openPlace = function(id){
  const p = places.find(x=>x.id===id);
  $("#placeDetails").innerHTML = `
    <button class="close" onclick="placeDialog.close()">×</button>
    <span class="eyebrow">LIVE PLACE</span>
    <div class="detail-hero">
      <div><h2>${p.emoji} ${p.name}</h2><div class="meta">${p.report}</div></div>
      <div class="big-score">${p.score} ${scoreEmoji(p.score)}</div>
    </div>
    <div class="detail-stats">
      <div class="stat"><b>${p.distance} ק״מ</b><span>מרחק</span></div>
      <div class="stat"><b>€${p.price}</b><span>מחיר משוער</span></div>
      <div class="stat"><b>${p.people}</b><span>עומס</span></div>
    </div>
    <button class="primary full" onclick="postDialog.showModal(); placeDialog.close(); postPlace.value='${p.id}'">📸 דווח על ה־VYBE</button>
  `;
  $("#placeDialog").showModal();
}

$("#openFinder").onclick = () => $("#finderDialog").showModal();
$("#postBtn").onclick = () => $("#postDialog").showModal();

$("#people").oninput = e => $("#peopleValue").textContent = e.target.value;

let selectedMood = "fun";
$$(".chip").forEach(btn => btn.onclick = () => {
  $$(".chip").forEach(x=>x.classList.remove("selected"));
  btn.classList.add("selected");
  selectedMood = btn.dataset.mood;
});

$("#findBtn").onclick = () => {
  const budget = Number($("#budget").value);
  const distance = Number($("#distance").value);
  const matches = places
    .filter(p => p.price <= budget && p.distance <= distance && p.mood.includes(selectedMood))
    .sort((a,b)=>b.score-a.score)
    .slice(0,3);

  $("#finderResults").innerHTML = matches.length ? matches.map(p=>`
    <div class="result">
      <span>${p.emoji} <b>${p.name}</b><br><small>${p.distance} ק״מ · €${p.price}</small></span>
      <strong>${p.score} ${scoreEmoji(p.score)}</strong>
    </div>`).join("") : `<div class="result">לא מצאתי התאמה מושלמת — נסה להגדיל מרחק או תקציב.</div>`;
};

$("#postPlace").innerHTML = places.map(p=>`<option value="${p.id}">${p.name}</option>`).join("");

let postScore = 75;
$$(".rating").forEach(btn => btn.onclick = () => {
  $$(".rating").forEach(x=>x.classList.remove("selected"));
  btn.classList.add("selected");
  postScore = Number(btn.dataset.score);
});

$("#submitVibe").onclick = () => {
  const id = Number($("#postPlace").value);
  const p = places.find(x=>x.id===id);
  p.score = Math.round(p.score * .65 + postScore * .35);
  p.people = postScore >= 90 ? "מפוצץ" : postScore >= 70 ? "חי" : postScore >= 45 ? "רגוע" : "שקט";
  const txt = $("#postText").value.trim();
  if(txt) p.report = txt;

  localStorage.setItem("vybe_places", JSON.stringify(places));
  $("#postStatus").textContent = `הדיווח על ${p.name} פורסם ✓`;
  renderPins();
  renderPlaces();
  setTimeout(()=> {
    $("#postDialog").close();
    $("#postStatus").textContent = "";
    $("#postText").value = "";
  }, 800);
};

$("#refreshBtn").onclick = () => {
  places.forEach(p => {
    p.score = Math.max(20, Math.min(99, p.score + Math.floor(Math.random()*9)-4));
  });
  renderPins(); renderPlaces();
};

$("#locationBtn").onclick = () => {
  if (!navigator.geolocation) {
    alert("המכשיר שלך לא תומך במיקום.");
    return;
  }

  $("#locationBtn").textContent = "📍 מאתר...";

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const latitude = coords.latitude;
      const longitude = coords.longitude;

      localStorage.setItem(
        "vybe_location",
        JSON.stringify({ latitude, longitude })
      );

      $("#locationBtn").textContent = "📍 המיקום נמצא";

      alert(
        `המיקום נמצא ✅\n${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      );
    },
    () => {
      $("#locationBtn").textContent = "📍 האזור שלי";
      alert("לא הצלחנו לקבל את המיקום. בדוק שאישרת הרשאת מיקום.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
};

const saved = localStorage.getItem("vybe_places");
if(saved){
  try{
    const stored = JSON.parse(saved);
    stored.forEach(s => {
      const p = places.find(x=>x.id===s.id);
      if(p) Object.assign(p,s);
    });
  }catch(e){}
}

renderPins();
renderPlaces();
