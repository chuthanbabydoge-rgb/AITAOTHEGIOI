"use strict";

// ============================
// STATE
// ============================
var mapState = {
  zoom: 1, panX: 0, panY: 0,
  dragging: false, lastMX: 0, lastMY: 0,
  selected: null,    // { type, id }
  timelineYear: null, // null = hiện tại, số = năm cụ thể
  timelineActive: false
};

var _mapCanvas   = null;
var _mapCtx      = null;
var _mapRAF      = null;
var _mapHover    = null;
var _mapInited   = false;
var _mapLayerVis = {
  regions: true, countries: true, empires: true,
  cities: true,  dungeons: true,  secrets: true,
  npcs: true,    sects: true,     bosses: true,
  fog: true
};

// Fog of World — cells đã khám phá (% coordinates 0..99)
var _fogGrid = {};       // key = "cx,cy" (grid cell 10x10), value = true nếu đã khám phá
var _fogGenerated = false;

// Timeline snapshots — lưu lãnh thổ theo năm
var _timelineSnapshots = {};   // year -> { countries: [...], empires: [...] }
var _lastSnapshotYear  = -1;

// ============================
// DEBUG LOG
// ============================
function mapLog(msg) {
  console.log("[MAP] " + msg);
  var el = document.getElementById("mapDebugLog");
  if (el) {
    var line = document.createElement("div");
    line.style.cssText = "font-size:10px;color:#4ade80;border-bottom:1px solid rgba(255,255,255,0.05);padding:2px 0";
    line.textContent = "[" + new Date().toLocaleTimeString() + "] " + msg;
    el.insertBefore(line, el.firstChild);
    if (el.children.length > 20) el.removeChild(el.lastChild);
  }
}

// ============================
// COLORS & ICONS
// ============================
var REGION_COLORS   = ["#60a5fa","#fb923c","#4ade80","#67e8f9","#f472b6","#c084fc","#facc15","#ff9e40","#a78bfa","#34d399"];
var EMPIRE_COLORS   = ["#facc15","#f87171","#60a5fa","#c084fc","#4ade80","#fb923c","#67e8f9","#ff9e40"];
var BIOME_ICONS     = { mountain:"🗻", volcano:"🌋", ocean:"🌊", arctic:"❄️", forest:"🌲", desert:"🏜️", plain:"🌾", swamp:"🌿" };

function regionIcon(name) {
  var m = (name || "").match(/\p{Emoji}/u);
  return m ? m[0] : "🌐";
}
function stripEmoji(s) {
  if (!s) return "";
  return s.replace(/[\u{1F300}-\u{1FFFF}]/gu,"").replace(/[\u{2600}-\u{26FF}]/gu,"")
          .replace(/[\u{2700}-\u{27BF}]/gu,"").replace(/[\uFE00-\uFEFF]/gu,"")
          .replace(/[\u{1F900}-\u{1F9FF}]/gu,"").replace(/[\u{1FA00}-\u{1FA9F}]/gu,"").trim();
}

// ============================
// FIXED LAYOUT POSITIONS
// ============================
var FIXED_REGION_POS = [
  {x:25,y:25},{x:72,y:22},{x:18,y:60},{x:55,y:55},{x:80,y:65},
  {x:40,y:80},{x:62,y:38},{x:30,y:45},{x:85,y:40},{x:50,y:18}
];
var COUNTRY_SPREAD = [
  {dx:-8,dy:-7},{dx:9,dy:-6},{dx:-7,dy:9},{dx:10,dy:8},
  {dx:0,dy:-13},{dx:-12,dy:4},{dx:13,dy:2},{dx:-3,dy:12}
];
var CITY_SPREAD = [
  {dx:0,dy:0},{dx:5,dy:4},{dx:-5,dy:5},{dx:5,dy:-5},{dx:-4,dy:-4},{dx:7,dy:-1}
];
var DUNGEON_SPREAD = [
  {dx:14,dy:-8},{dx:-14,dy:7},{dx:8,dy:14},{dx:-8,dy:-14}
];
var SECRET_POS = [
  {x:35,y:35},{x:65,y:25},{x:50,y:60},{x:20,y:70},{x:78,y:55},{x:42,y:82}
];

// ============================
// MAP DATA GENERATION
// ============================
function buildMapData() {
  var data = { regions:{}, countries:{}, empires:{}, cities:{}, dungeons:{}, secrets:{}, npcPos:{}, sectPos:{} };

  var liveRegions   = (typeof regions   !== "undefined" && Array.isArray(regions))   ? regions   : [];
  var liveCountries = (typeof countries !== "undefined" && Array.isArray(countries)) ? countries : [];
  var liveNPCs      = (typeof npcs      !== "undefined" && Array.isArray(npcs))      ? npcs      : [];
  var liveSects     = (typeof sects     !== "undefined" && Array.isArray(sects))     ? sects     : [];
  var liveBosses    = (typeof bosses    !== "undefined" && Array.isArray(bosses))    ? bosses    : [];

  mapLog("buildMapData: regions=" + liveRegions.length + " countries=" + liveCountries.length + " npcs=" + liveNPCs.length);

  // --- REGIONS ---
  liveRegions.forEach(function(r, i) {
    var pos = FIXED_REGION_POS[i % FIXED_REGION_POS.length];
    data.regions[r.id] = {
      id: r.id, name: r.name,
      x: pos.x, y: pos.y,
      color: REGION_COLORS[i % REGION_COLORS.length],
      icon: regionIcon(r.name),
      danger: r.danger || 1,
      population: r.population || 0,
      resources: r.resources || {},
      biome: r.biome || "plain"
    };
  });
  if (liveRegions.length === 0) {
    var fallbacks = [
      {id:"r1",name:"🗻 Bắc Châu",biome:"mountain"},{id:"r2",name:"🌾 Nam Châu",biome:"plain"},
      {id:"r3",name:"🌊 Đông Hải",biome:"ocean"},{id:"r4",name:"🏜️ Tây Mạc",biome:"desert"}
    ];
    fallbacks.forEach(function(r,i){ var pos=FIXED_REGION_POS[i];
      data.regions[r.id]={id:r.id,name:r.name,x:pos.x,y:pos.y,color:REGION_COLORS[i],
        icon:regionIcon(r.name),danger:2,population:50000,resources:{},biome:r.biome};});
    mapLog("WARNING: Used fallback regions");
  }

  var regionArr = Object.values(data.regions);

  // --- COUNTRIES + EMPIRES ---
  liveCountries.forEach(function(c, idx) {
    var matchedRegion = null;
    regionArr.forEach(function(rd) {
      if (!matchedRegion && c.territory) {
        var t = stripEmoji(c.territory).toLowerCase(), n = stripEmoji(rd.name).toLowerCase();
        if (t && n && (t.indexOf(n) >= 0 || n.indexOf(t) >= 0)) matchedRegion = rd;
      }
    });
    if (!matchedRegion) matchedRegion = regionArr[idx % regionArr.length];
    var off = COUNTRY_SPREAD[idx % COUNTRY_SPREAD.length];
    var x = clamp(matchedRegion.x + off.dx + jitter(3), 5, 95);
    var y = clamp(matchedRegion.y + off.dy + jitter(3), 5, 95);

    var isEmpire = (c.level || 1) >= 4 || c.status === "empire" ||
                   (c.type && c.type.toLowerCase().indexOf("đế") >= 0);
    var empireColor = isEmpire ? EMPIRE_COLORS[Object.keys(data.empires).length % EMPIRE_COLORS.length] : null;

    data.countries[c.id] = {
      id:c.id, name:c.name, x:x, y:y,
      regionId: matchedRegion.id,
      color: isEmpire ? empireColor : matchedRegion.color,
      isEmpire: isEmpire,
      population: c.population||0, wealth: c.wealth||0,
      army: c.army||c.military||0,
      territory: c.territory||"",
      founded: c.founded||1
    };
    if (isEmpire) {
      data.empires[c.id] = Object.assign({}, data.countries[c.id], { empireColor: empireColor });
    }

    // Cities
    var numCities = 2 + Math.floor(Math.random() * 2);
    var cityTemplates = ["Đông Thành","Tây Thành","Nam Thành","Bắc Thành","Trung Thành","Kim Thành","Ngọc Kinh","Thiên Quan"];
    for (var ci = 0; ci < numCities; ci++) {
      var cid = "city_"+c.id+"_"+ci;
      var coff = CITY_SPREAD[ci % CITY_SPREAD.length];
      var cityName = ci===0 ? c.name+" Kinh Thành" : cityTemplates[(idx*numCities+ci)%cityTemplates.length];
      data.cities[cid] = {
        id:cid, name:cityName,
        x: clamp(x+coff.dx*0.7+jitter(2),3,97),
        y: clamp(y+coff.dy*0.7+jitter(2),3,97),
        countryId:c.id, regionId:matchedRegion.id,
        type: ci===0?"capital":"city", icon: ci===0?"🏯":"🏰",
        population: Math.floor((c.population||50000)/numCities*(1+Math.random()*0.5))
      };
    }

    // Dungeons
    var numDungeons = 1+(idx%2);
    var dungeonNames=["🔥 Hỏa Diệm Cốc","❄️ Băng Ngục Cổ","☠️ Tử Thần Mê Cung","🌑 Hắc Ám Hang","⚡ Lôi Thần Bí Địa","💀 Âm Hồn Trận","🌊 Thâm Hải Ngục","🗡️ Thập Vạn Đại Sơn"];
    for (var di=0; di<numDungeons; di++) {
      var did="dungeon_"+c.id+"_"+di;
      var doff=DUNGEON_SPREAD[(idx*numDungeons+di)%DUNGEON_SPREAD.length];
      data.dungeons[did]={
        id:did, name:dungeonNames[(idx*numDungeons+di)%dungeonNames.length],
        x:clamp(x+doff.dx+jitter(4),3,97), y:clamp(y+doff.dy+jitter(4),3,97),
        countryId:c.id, regionId:matchedRegion.id,
        danger:Math.min(5,1+Math.floor(Math.random()*4)), bossIdx:null
      };
    }
  });

  // Secret zones
  var secretNames=["🌀 Cổ Thần Di Tích","🌸 Tiên Nhân Cốc","💫 Hư Không Liệt Địa","🔮 Linh Mạch Bí Địa","🌌 Thiên Địa Lỗ Hổng","🏺 Vạn Cổ Kho Tàng"];
  for (var si=0; si<secretNames.length; si++) {
    var spos=SECRET_POS[si];
    data.secrets["secret_"+si]={
      id:"secret_"+si, name:secretNames[si],
      x:spos.x+jitter(5), y:spos.y+jitter(5),
      minRealm:1+Math.floor(si/2), discovered:false
    };
  }

  // NPC positions
  var cityArr=Object.values(data.cities), countryArr2=Object.values(data.countries);
  liveNPCs.forEach(function(npc){
    var px,py;
    var npcCity=cityArr.find(function(c){ return c.name.toLowerCase().indexOf(npc.city?npc.city.toLowerCase():"xxx")>=0; });
    if (npcCity){ px=npcCity.x+jitter(4); py=npcCity.y+jitter(4); }
    else if (countryArr2.length){
      var rc=countryArr2[npc.id%countryArr2.length]||countryArr2[0];
      px=rc.x+jitter(8); py=rc.y+jitter(8);
    } else { px=20+Math.random()*60; py=20+Math.random()*60; }
    data.npcPos[npc.id]={x:clamp(px,3,97),y:clamp(py,3,97),tx:null,ty:null,moving:false};
  });

  // Assign bosses to dungeons
  var dungArr=Object.values(data.dungeons);
  liveBosses.forEach(function(boss,bi){ if(dungArr[bi]) dungArr[bi].bossIdx=bi; });

  // Pre-compute sect positions (single source of truth for draw + hit-test)
  var liveSects0=(typeof sects!=="undefined"&&Array.isArray(sects))?sects:[];
  liveSects0.slice(0,20).forEach(function(s,si){
    var tr=regionArr.find(function(rd){
      var t=stripEmoji(s.territory||"").toLowerCase(), n=stripEmoji(rd.name).toLowerCase();
      return t&&n&&(t.indexOf(n)>=0||n.indexOf(t)>=0);
    })||regionArr[si%Math.max(regionArr.length,1)];
    if (!tr) return;
    var angle=(si/Math.max(liveSects0.length,1))*Math.PI*2;
    var dist=9+(si%3)*4;
    data.sectPos[s.id]={
      x:clamp(tr.x+Math.cos(angle)*dist,3,97),
      y:clamp(tr.y+Math.sin(angle)*dist,3,97)
    };
  });

  mapLog("Map built: "+Object.keys(data.regions).length+"R "+Object.keys(data.countries).length+"C "+
    Object.keys(data.cities).length+"Ci "+Object.keys(data.dungeons).length+"D "+Object.keys(data.secrets).length+"S");
  return data;
}

function clamp(v,lo,hi){ return Math.max(lo,Math.min(hi,v)); }
function jitter(r){ return (Math.random()-0.5)*r*2; }

// ============================
// MAP DATA CACHE
// ============================
var _mapDataCache = {};
var _mapDataVersion = {};

function getMapData() {
  var wid=(typeof currentWorldId!=="undefined")?currentWorldId:null;
  if (!wid && typeof worlds!=="undefined" && Array.isArray(worlds) && worlds.length>0) wid=worlds[0].id;
  if (!wid) return null;
  var lR=(typeof regions!=="undefined"&&Array.isArray(regions))?regions.length:0;
  var lC=(typeof countries!=="undefined"&&Array.isArray(countries))?countries.length:0;
  var lN=(typeof npcs!=="undefined"&&Array.isArray(npcs))?npcs.length:0;
  var ver=_mapDataVersion[wid];
  var stale=!ver||ver.r!==lR||ver.c!==lC;
  if (!_mapDataCache[wid]||stale) {
    var snap=null;
    if (typeof worlds!=="undefined"&&Array.isArray(worlds)) snap=worlds.find(function(w){return w.id===wid;});
    if (snap&&snap.mapData&&snap.mapData.regions&&Object.keys(snap.mapData.regions).length>=lR) {
      _mapDataCache[wid]=snap.mapData; mapLog("Restored map from snapshot");
    } else { _mapDataCache[wid]=buildMapData(); mapLog("Generated fresh map data"); }
    _mapDataVersion[wid]={r:lR,c:lC,n:lN};
    // Sync new NPCs
    var lN2=(typeof npcs!=="undefined"&&Array.isArray(npcs))?npcs:[];
    lN2.forEach(function(npc){
      if (!_mapDataCache[wid].npcPos[npc.id]){
        var cd=Object.values(_mapDataCache[wid].countries);
        var base=cd.length?cd[npc.id%cd.length]:{x:50,y:50};
        _mapDataCache[wid].npcPos[npc.id]={x:clamp(base.x+jitter(10),3,97),y:clamp(base.y+jitter(10),3,97),tx:null,ty:null,moving:false};
      }
    });
  }
  return _mapDataCache[wid];
}

function regenMapData() {
  var wid=(typeof currentWorldId!=="undefined")?currentWorldId:null;
  if (!wid){ if(typeof toast==="function")toast("⚠ Chưa có thế giới!"); return; }
  delete _mapDataCache[wid]; delete _mapDataVersion[wid];
  _fogGrid={}; _fogGenerated=false;
  getMapData();
  initFog();
  if (typeof toast==="function") toast("🗺 Đã tạo lại bản đồ!");
  renderMapSidebar(null); updateMapOverlay();
  mapLog("Map regenerated");
}

function toggleMapLayer(btn,layer) {
  _mapLayerVis[layer]=!_mapLayerVis[layer];
  if (btn) btn.classList.toggle("active",_mapLayerVis[layer]);
}

// ============================
// FOG OF WORLD
// ============================
function initFog() {
  if (_fogGenerated) return;
  _fogGrid = {};
  // Reveal cells near existing countries/cities
  var md=getMapData();
  if (!md) return;
  // Start: reveal 40% of map near civilized areas
  var revealed=[];
  Object.values(md.countries).forEach(function(c){
    for(var dx=-2;dx<=2;dx++) for(var dy=-2;dy<=2;dy++){
      var cx=Math.floor(c.x/10)+dx, cy=Math.floor(c.y/10)+dy;
      if(cx>=0&&cx<10&&cy>=0&&cy<10) _fogGrid[cx+","+cy]=true;
    }
  });
  // Also reveal some random exploration paths
  for(var i=0;i<8;i++){
    var rx=Math.floor(Math.random()*10), ry=Math.floor(Math.random()*10);
    _fogGrid[rx+","+ry]=true;
    // trail
    var tx=rx, ty=ry;
    for(var j=0;j<3;j++){
      tx=clamp(tx+(Math.random()<0.5?1:-1),0,9); ty=clamp(ty+(Math.random()<0.5?1:-1),0,9);
      _fogGrid[tx+","+ty]=true;
    }
  }
  _fogGenerated=true;
  mapLog("Fog initialized: "+Object.keys(_fogGrid).length+"/100 cells revealed");
}

function revealFog(x, y, radius) {
  // x, y in % coordinates
  radius = radius || 1;
  for(var dx=-radius;dx<=radius;dx++) for(var dy=-radius;dy<=radius;dy++){
    var cx=Math.floor(x/10)+dx, cy=Math.floor(y/10)+dy;
    if(cx>=0&&cx<10&&cy>=0&&cy<10) _fogGrid[cx+","+cy]=true;
  }
}

function isFogCell(cx,cy){ return !_fogGrid[cx+","+cy]; }

// ============================
// TIMELINE SNAPSHOTS
// ============================
function captureSnapshot() {
  var yr=(typeof year!=="undefined")?year:0;
  if (yr===_lastSnapshotYear) return;
  _lastSnapshotYear=yr;
  var liveC=(typeof countries!=="undefined"&&Array.isArray(countries))?countries:[];
  var empireList=liveC.filter(function(c){ return (c.level||1)>=4||c.status==="empire"; });
  _timelineSnapshots[yr]={
    year: yr,
    countryNames: liveC.map(function(c){ return {id:c.id,name:c.name,pop:c.population,territory:c.territory}; }),
    empireIds: empireList.map(function(c){ return c.id; }),
    countryCount: liveC.length,
    npcCount: (typeof npcs!=="undefined"&&Array.isArray(npcs))?npcs.length:0
  };
}

function getSnapshotYears() {
  return Object.keys(_timelineSnapshots).map(Number).sort(function(a,b){return a-b;});
}

// ============================
// CANVAS INIT
// ============================
function initMapCanvas() {
  _mapCanvas=document.getElementById("worldMapCanvas");
  if (!_mapCanvas){ console.warn("[MAP] Canvas not found"); return; }
  _mapCtx=_mapCanvas.getContext("2d");
  _mapInited=true;
  safeResizeCanvas();
  if (!_mapCanvas._eventsbound){ bindMapEvents(); _mapCanvas._eventsbound=true; }
  if (!_mapRAF) mapRenderLoop();
  mapLog("Canvas initialized: "+_mapCanvas.width+"×"+_mapCanvas.height);
}

function safeResizeCanvas() {
  if (!_mapCanvas) return;
  var wrap=document.querySelector(".map-canvas-wrap");
  var W=wrap?wrap.offsetWidth:0, H=wrap?wrap.offsetHeight:0;
  if (W<50&&_mapCanvas.parentElement){
    var el=_mapCanvas.parentElement;
    while(el&&el!==document.body){ if(el.offsetWidth>50){W=el.offsetWidth;H=el.offsetHeight;break;} el=el.parentElement; }
  }
  if (W<50) W=window.innerWidth-460;
  if (H<50) H=window.innerHeight-100;
  W=Math.max(200,Math.floor(W)); H=Math.max(200,Math.floor(H));
  if (_mapCanvas.width!==W||_mapCanvas.height!==H){ _mapCanvas.width=W; _mapCanvas.height=H; mapLog("Canvas resized "+W+"×"+H); }
}

// ============================
// RENDER LOOP
// ============================
function mapRenderLoop() {
  _mapRAF=requestAnimationFrame(mapRenderLoop);
  var panel=document.getElementById("panel-worldmap");
  if (!panel||!panel.classList.contains("active")) return;
  if (!_mapCanvas||!_mapCtx){ initMapCanvas(); return; }
  safeResizeCanvas();
  if (_mapCanvas.width<10||_mapCanvas.height<10) return;
  drawMap();
}

// ============================
// DRAW MAP — MAIN
// ============================
function drawMap() {
  var W=_mapCanvas.width, H=_mapCanvas.height;
  if (W<10||H<10) return;
  var ctx=_mapCtx;
  ctx.clearRect(0,0,W,H);

  // Background
  var bg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*0.8);
  bg.addColorStop(0,"#0d1520"); bg.addColorStop(1,"#060a10");
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // Grid
  ctx.strokeStyle="rgba(250,204,21,0.04)"; ctx.lineWidth=1;
  for(var gx=0;gx<W;gx+=60){ ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke(); }
  for(var gy=0;gy<H;gy+=60){ ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke(); }

  var hasWorld=(typeof world!=="undefined")&&world!==null;
  var md=getMapData();

  if (!hasWorld){
    drawCenteredMsg(ctx,W,H,"⚠ Chưa có thế giới. Hãy tạo thế giới trước.","Sau khi tạo thế giới, vào lại tab Bản Đồ.");
    return;
  }
  if (!md){
    drawCenteredMsg(ctx,W,H,"🔄 Đang tải dữ liệu bản đồ...","Nhấn ✨ Tạo Lại Bản Đồ nếu màn hình không hiện");
    return;
  }

  // Apply transform
  ctx.save();
  ctx.translate(mapState.panX,mapState.panY);
  ctx.scale(mapState.zoom,mapState.zoom);
  var sw=W/mapState.zoom, sh=H/mapState.zoom, z=mapState.zoom;
  function wx(p){ return (p/100)*sw; }
  function wy(p){ return (p/100)*sh; }

  // ---- SCENE BACKGROUND: biome areas ----
  drawBiomeBackground(ctx,sw,sh,md,wx,wy);

  // ---- REGION BLOBS ----
  if (_mapLayerVis.regions) drawRegions(ctx,md,wx,wy,z);

  // ---- ROADS between same-region countries ----
  if (_mapLayerVis.countries) drawRoads(ctx,md,wx,wy);

  // ---- EMPIRE TERRITORIES (colored zones) ----
  if (_mapLayerVis.empires) drawEmpireTerritories(ctx,md,wx,wy,z);

  // ---- DUNGEONS ----
  if (_mapLayerVis.dungeons) drawDungeons(ctx,md,wx,wy,z);

  // ---- SECRET ZONES ----
  if (_mapLayerVis.secrets) drawSecrets(ctx,md,wx,wy,z);

  // ---- CITIES ----
  if (_mapLayerVis.cities) drawCities(ctx,md,wx,wy,z);

  // ---- COUNTRIES ----
  if (_mapLayerVis.countries) drawCountries(ctx,md,wx,wy,z);

  // ---- SECTS ----
  if (_mapLayerVis.sects) drawSects(ctx,md,wx,wy,z);

  // ---- NPCS ----
  if (_mapLayerVis.npcs) drawNPCs(ctx,md,wx,wy,z);

  // ---- FOG OF WORLD ----
  if (_mapLayerVis.fog) drawFog(ctx,sw,sh,wx,wy);

  ctx.restore();

  // Fixed UI overlays
  drawCompass(ctx,W,H);
  drawStatusBar(ctx,W,H,md);
  if (_mapHover) drawTooltip(ctx,_mapHover,W,H);

  // Timeline indicator
  if (mapState.timelineActive && mapState.timelineYear!==null) {
    drawTimelineIndicator(ctx,W,H);
  }
}

// ============================
// BIOME BACKGROUND
// ============================
function drawBiomeBackground(ctx,sw,sh,md,wx,wy) {
  var biomeColors={mountain:"rgba(100,80,60,0.06)",ocean:"rgba(30,80,180,0.08)",
    desert:"rgba(200,140,40,0.07)",forest:"rgba(30,120,60,0.07)",
    arctic:"rgba(180,210,240,0.07)",plain:"rgba(60,140,60,0.04)",
    swamp:"rgba(40,100,60,0.06)",volcano:"rgba(180,40,20,0.07)"};
  Object.values(md.regions).forEach(function(r){
    var col=biomeColors[r.biome]||"rgba(60,80,120,0.05)";
    var x=wx(r.x), y=wy(r.y), rad=Math.min(sw,sh)*0.22;
    var g=ctx.createRadialGradient(x,y,0,x,y,rad);
    g.addColorStop(0,col); g.addColorStop(1,"transparent");
    ctx.beginPath(); ctx.arc(x,y,rad,0,6.28); ctx.fillStyle=g; ctx.fill();
  });
}

// ============================
// DRAW REGIONS
// ============================
function drawRegions(ctx,md,wx,wy,z) {
  Object.values(md.regions).forEach(function(r){
    var x=wx(r.x), y=wy(r.y), rad=Math.min(wx(100),wy(100))*0.18;
    ctx.beginPath(); ctx.arc(x,y,rad*0.85,0,6.28);
    ctx.strokeStyle=hexA(r.color,0.18); ctx.lineWidth=1.5;
    ctx.setLineDash([5,8]); ctx.stroke(); ctx.setLineDash([]);
    var sel=mapState.selected&&mapState.selected.type==="region"&&mapState.selected.id===r.id;
    var fs=Math.round(Math.min(22,14*z));
    ctx.font=fs+"px serif"; ctx.textAlign="center"; ctx.globalAlpha=sel?1:0.75;
    ctx.fillText(r.icon,x,y+fs*0.4); ctx.globalAlpha=1;
    var lfs=Math.round(Math.min(14,11*z));
    ctx.font="bold "+lfs+"px 'Noto Serif',serif"; ctx.textAlign="center";
    var label=stripEmoji(r.name).trim();
    ctx.strokeStyle="rgba(0,0,0,0.9)"; ctx.lineWidth=3;
    ctx.strokeText(label,x,y+fs+lfs+2);
    ctx.fillStyle=sel?"#facc15":r.color; ctx.fillText(label,x,y+fs+lfs+2);
  });
}

// ============================
// DRAW ROADS
// ============================
function drawRoads(ctx,md,wx,wy) {
  var cArr=Object.values(md.countries);
  for(var i=0;i<cArr.length;i++) for(var j=i+1;j<cArr.length;j++) {
    if (cArr[i].regionId===cArr[j].regionId){
      ctx.beginPath(); ctx.moveTo(wx(cArr[i].x),wy(cArr[i].y)); ctx.lineTo(wx(cArr[j].x),wy(cArr[j].y));
      ctx.strokeStyle="rgba(250,204,21,0.07)"; ctx.lineWidth=0.8; ctx.setLineDash([3,7]); ctx.stroke(); ctx.setLineDash([]);
    }
  }
}

// ============================
// DRAW EMPIRE TERRITORIES
// ============================
function drawEmpireTerritories(ctx,md,wx,wy,z) {
  Object.values(md.empires).forEach(function(e){
    var x=wx(e.x), y=wy(e.y);
    var rad=Math.min(wx(100),wy(100))*0.13;
    // Empire zone
    var g=ctx.createRadialGradient(x,y,rad*0.3,x,y,rad*1.5);
    g.addColorStop(0,hexA(e.empireColor,0.12));
    g.addColorStop(0.7,hexA(e.empireColor,0.05));
    g.addColorStop(1,"transparent");
    ctx.beginPath(); ctx.arc(x,y,rad*1.5,0,6.28); ctx.fillStyle=g; ctx.fill();
    // Border
    ctx.beginPath(); ctx.arc(x,y,rad,0,6.28);
    ctx.strokeStyle=hexA(e.empireColor,0.5); ctx.lineWidth=2;
    ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
    // Crown icon
    var fs=Math.round(Math.min(18,13*z));
    drawEmoji(ctx,"👑",x,y-rad-4,fs);
    // Label
    if (z>0.7){
      var lfs=Math.round(Math.min(12,9*z));
      ctx.font="bold "+lfs+"px 'Noto Serif',serif"; ctx.textAlign="center";
      ctx.strokeStyle="rgba(0,0,0,0.9)"; ctx.lineWidth=3;
      ctx.strokeText(e.name,x,y+rad+lfs+4);
      ctx.fillStyle=e.empireColor; ctx.fillText(e.name,x,y+rad+lfs+4);
    }
  });
}

// ============================
// DRAW DUNGEONS
// ============================
function drawDungeons(ctx,md,wx,wy,z) {
  Object.values(md.dungeons).forEach(function(d){
    var x=wx(d.x), y=wy(d.y);
    var sel=mapState.selected&&mapState.selected.type==="dungeon"&&mapState.selected.id===d.id;
    var r=sel?9:6;
    ctx.beginPath(); ctx.arc(x,y,r*1.8,0,6.28); ctx.fillStyle="rgba(248,113,113,0.08)"; ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,r,0,6.28);
    ctx.fillStyle=sel?"rgba(248,113,113,0.5)":"rgba(248,113,113,0.2)"; ctx.fill();
    ctx.strokeStyle=sel?"#f87171":"rgba(248,113,113,0.6)"; ctx.lineWidth=sel?2:1.2; ctx.stroke();
    drawEmoji(ctx,"🏚",x,y-r-1,Math.max(10,Math.round(11*z)));
    if (z>1.0){
      var lfs=Math.round(Math.min(11,9*z));
      ctx.font=lfs+"px 'Noto Serif',serif"; ctx.textAlign="center";
      ctx.strokeStyle="rgba(0,0,0,0.8)"; ctx.lineWidth=2.5; ctx.strokeText(d.name,x,y+r+lfs+2);
      ctx.fillStyle="#f87171"; ctx.fillText(d.name,x,y+r+lfs+2);
    }
    if (d.bossIdx!==null&&(typeof bosses!=="undefined")&&bosses[d.bossIdx]) {
      drawEmoji(ctx,"🐉",x+r+3,y-r,Math.max(9,Math.round(10*z)));
    }
  });
}

// ============================
// DRAW SECRETS
// ============================
function drawSecrets(ctx,md,wx,wy,z) {
  var t=Date.now()/1000;
  Object.values(md.secrets).forEach(function(sz){
    var x=wx(sz.x), y=wy(sz.y);
    var pulse=0.5+0.5*Math.sin(t*1.5+sz.x*0.3);
    var sel=mapState.selected&&mapState.selected.type==="secret"&&mapState.selected.id===sz.id;
    ctx.beginPath(); ctx.arc(x,y,6+pulse*4,0,6.28);
    ctx.fillStyle="rgba(192,132,252,"+(0.06+pulse*0.08)+")"; ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,5,0,6.28);
    ctx.fillStyle=sel?"rgba(192,132,252,0.7)":"rgba(192,132,252,0.35)"; ctx.fill();
    ctx.strokeStyle="#c084fc"; ctx.lineWidth=sel?2:1; ctx.stroke();
    var icon=sz.discovered?"🌀":"❓";
    drawEmoji(ctx,icon,x,y-7,Math.max(10,Math.round(12*z)));
    if (z>1.2&&sz.discovered){
      var lfs=Math.round(Math.min(10,8*z));
      ctx.font=lfs+"px 'Noto Serif',serif"; ctx.textAlign="center";
      ctx.strokeStyle="rgba(0,0,0,0.8)"; ctx.lineWidth=2; ctx.strokeText(sz.name,x,y+8+lfs);
      ctx.fillStyle="#c084fc"; ctx.fillText(sz.name,x,y+8+lfs);
    }
  });
}

// ============================
// DRAW CITIES
// ============================
function drawCities(ctx,md,wx,wy,z) {
  Object.values(md.cities).forEach(function(c){
    var x=wx(c.x), y=wy(c.y), isCapital=c.type==="capital";
    var sel=mapState.selected&&mapState.selected.type==="city"&&mapState.selected.id===c.id;
    var r=isCapital?5.5:3.5; if(sel) r+=2;
    ctx.beginPath(); ctx.arc(x,y,r,0,6.28);
    ctx.fillStyle=isCapital?(sel?"rgba(250,204,21,0.9)":"rgba(250,204,21,0.55)"):(sel?"rgba(255,255,255,0.8)":"rgba(255,255,255,0.35)");
    ctx.fill(); ctx.strokeStyle=isCapital?"#facc15":"rgba(255,255,255,0.6)"; ctx.lineWidth=isCapital?1.5:1; ctx.stroke();
    drawEmoji(ctx,c.icon,x,y-r-1,Math.max(9,Math.round((isCapital?13:10)*z)));
    if (z>0.9||isCapital){
      var lfs=Math.round(Math.min(11,(isCapital?10:8)*z));
      ctx.font=(isCapital?"bold ":"")+lfs+"px 'Noto Serif',serif"; ctx.textAlign="center";
      ctx.strokeStyle="rgba(0,0,0,0.85)"; ctx.lineWidth=2.5; ctx.strokeText(c.name,x,y+r+lfs+3);
      ctx.fillStyle=isCapital?"#facc15":"rgba(232,232,240,0.8)"; ctx.fillText(c.name,x,y+r+lfs+3);
    }
  });
}

// ============================
// DRAW COUNTRIES
// ============================
function drawCountries(ctx,md,wx,wy,z) {
  Object.values(md.countries).forEach(function(c){
    if (c.isEmpire) return; // Drawn separately as empire
    var x=wx(c.x), y=wy(c.y);
    var sel=mapState.selected&&mapState.selected.type==="country"&&mapState.selected.id===c.id;
    var r=sel?11:8;
    var g2=ctx.createRadialGradient(x,y,0,x,y,r*2.2);
    g2.addColorStop(0,hexA(c.color,0.35)); g2.addColorStop(1,"transparent");
    ctx.beginPath(); ctx.arc(x,y,r*2.2,0,6.28); ctx.fillStyle=g2; ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,r,0,6.28);
    ctx.fillStyle=hexA(c.color,sel?0.85:0.55); ctx.fill();
    ctx.strokeStyle=c.color; ctx.lineWidth=sel?2.5:1.5; ctx.stroke();
    var lfs=Math.round(Math.min(13,10*z));
    ctx.font="bold "+lfs+"px 'Noto Serif',serif"; ctx.textAlign="center";
    ctx.strokeStyle="rgba(0,0,0,0.88)"; ctx.lineWidth=3.5; ctx.strokeText(c.name,x,y-r-5);
    ctx.fillStyle=sel?"#facc15":"#e8e8f0"; ctx.fillText(c.name,x,y-r-5);
  });
}

// ============================
// DRAW SECTS
// ============================
function drawSects(ctx,md,wx,wy,z) {
  var liveSects2=(typeof sects!=="undefined"&&Array.isArray(sects))?sects:[];
  liveSects2.slice(0,20).forEach(function(s){
    var pos=md.sectPos[s.id]; if (!pos) return;
    var sx2=wx(pos.x), sy2=wy(pos.y);
    var sel=mapState.selected&&mapState.selected.type==="sect"&&mapState.selected.id===s.id;
    ctx.beginPath(); ctx.arc(sx2,sy2,sel?7:5,0,6.28);
    ctx.fillStyle=sel?"rgba(250,204,21,0.6)":"rgba(250,204,21,0.2)"; ctx.fill();
    ctx.strokeStyle=sel?"#facc15":"rgba(250,204,21,0.5)"; ctx.lineWidth=1; ctx.stroke();
    drawEmoji(ctx,"⛩️",sx2,sy2-6,Math.max(8,Math.round(10*z)));
    if (z>1.5){
      var lfs=Math.round(Math.min(9,7*z));
      ctx.font=lfs+"px 'Noto Serif',serif"; ctx.textAlign="center";
      ctx.fillStyle="rgba(250,204,21,0.7)"; ctx.fillText(s.name,sx2,sy2+8+lfs);
    }
  });
}

// ============================
// DRAW NPCS
// ============================
function drawNPCs(ctx,md,wx,wy,z) {
  var liveNPCs3=(typeof npcs!=="undefined"&&Array.isArray(npcs))?npcs:[];
  var realmColors=["#94a3b8","#4ade80","#facc15","#fb923c","#f472b6","#c084fc","#67e8f9","#ff9e40","#ffffff"];
  var topNPCs=liveNPCs3.filter(function(n){return !n.dead&&n.status!=="dead";})
    .sort(function(a,b){return (b.realm||0)-(a.realm||0);}).slice(0,60);
  topNPCs.forEach(function(npc){
    var pos=md.npcPos[npc.id]; if (!pos) return;
    var x=wx(pos.x), y=wy(pos.y), ri=Math.min(npc.realm||0,8);
    var nc=realmColors[ri], nr=2+(ri/8)*2;
    ctx.beginPath(); ctx.arc(x,y,nr,0,6.28); ctx.fillStyle=nc; ctx.fill();
    if (z>1.8){ ctx.font=Math.round(8*z)+"px serif"; ctx.textAlign="center"; ctx.fillStyle=nc; ctx.fillText(npc.name,x,y-nr-2); }
  });
  // Bosses
  if (_mapLayerVis.bosses){
    var liveBosses2=(typeof bosses!=="undefined"&&Array.isArray(bosses))?bosses:[];
    var dungArr=Object.values(md.dungeons);
    liveBosses2.forEach(function(boss,bi){
      var dung=dungArr[bi%Math.max(dungArr.length,1)]; if (!dung) return;
      var x=wx(dung.x), y=wy(dung.y);
      drawEmoji(ctx,"🐉",x,y+10,Math.max(12,Math.round(16*z)));
    });
  }
}

// ============================
// DRAW FOG OF WORLD
// ============================
function drawFog(ctx,sw,sh,wx,wy) {
  if (!_fogGenerated) return;
  var cellW=sw/10, cellH=sh/10;
  ctx.save();
  for (var cx2=0;cx2<10;cx2++) for(var cy2=0;cy2<10;cy2++) {
    if (!_fogGrid[cx2+","+cy2]) {
      var fx=cx2*cellW, fy=cy2*cellH;
      ctx.fillStyle="rgba(4,8,16,0.82)";
      ctx.fillRect(fx,fy,cellW+1,cellH+1);
      // Fog texture dots
      ctx.fillStyle="rgba(250,204,21,0.015)";
      for(var fi=0;fi<3;fi++){
        var fdx=Math.random()*cellW, fdy=Math.random()*cellH;
        ctx.beginPath(); ctx.arc(fx+fdx,fy+fdy,1+Math.random()*2,0,6.28); ctx.fill();
      }
    }
  }
  // Soft edge blend at boundaries
  for(var cx3=0;cx3<10;cx3++) for(var cy3=0;cy3<10;cy3++){
    if (_fogGrid[cx3+","+cy3]){
      // Check if has foggy neighbor → draw edge gradient
      var hasNeighborFog=false;
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){
        var nx=cx3+d[0], ny=cy3+d[1];
        if (nx>=0&&nx<10&&ny>=0&&ny<10&&!_fogGrid[nx+","+ny]) hasNeighborFog=true;
      });
      if (hasNeighborFog){
        var ex=cx3*cellW, ey=cy3*cellH;
        var eg=ctx.createRadialGradient(ex+cellW/2,ey+cellH/2,0,ex+cellW/2,ey+cellH/2,cellW*0.7);
        eg.addColorStop(0,"transparent"); eg.addColorStop(1,"rgba(4,8,16,0.35)");
        ctx.fillStyle=eg; ctx.fillRect(ex,ey,cellW,cellH);
      }
    }
  }
  ctx.restore();
}

// ============================
// TIMELINE INDICATOR
// ============================
function drawTimelineIndicator(ctx,W,H) {
  var yr=mapState.timelineYear;
  var snap=_timelineSnapshots[yr];
  var text="📅 Năm "+yr;
  if (snap) text+="  · "+snap.countryCount+" quốc gia  · "+snap.npcCount+" tu sĩ";
  ctx.fillStyle="rgba(8,12,20,0.88)"; ctx.strokeStyle="rgba(250,204,21,0.5)"; ctx.lineWidth=1;
  rrect(ctx,W/2-120,8,240,30,8); ctx.fill(); ctx.stroke();
  ctx.fillStyle="#facc15"; ctx.font="bold 12px 'Noto Serif',serif"; ctx.textAlign="center";
  ctx.fillText(text,W/2,28);
}

// ============================
// COMPASS
// ============================
function drawCompass(ctx,W,H) {
  var cx=W-38, cy=38, r=19;
  ctx.save(); ctx.globalAlpha=0.65;
  ctx.beginPath(); ctx.arc(cx,cy,r,0,6.28);
  ctx.fillStyle="rgba(8,12,20,0.85)"; ctx.fill();
  ctx.strokeStyle="rgba(250,204,21,0.3)"; ctx.lineWidth=1; ctx.stroke();
  [["N",0,-1,"#f87171"],["S",0,1,"rgba(250,204,21,0.6)"],["E",1,0,"rgba(250,204,21,0.6)"],["W",-1,0,"rgba(250,204,21,0.6)"]].forEach(function(d){
    ctx.fillStyle=d[3]; ctx.font="bold 9px serif"; ctx.textAlign="center";
    ctx.fillText(d[0],cx+d[1]*(r-6),cy+d[2]*(r-6)+3);
  });
  ctx.globalAlpha=1; ctx.restore();
}

// ============================
// STATUS BAR
// ============================
function drawStatusBar(ctx,W,H,md) {
  var lC=(typeof countries!=="undefined"?countries:[]).length;
  var lS=(typeof sects!=="undefined"?sects:[]).length;
  var yr=(typeof year!=="undefined")?year:"—";
  var statusText="🔍 "+Math.round(mapState.zoom*100)+"%  ·  "+
    Object.keys(md.regions).length+" vùng  ·  "+lC+" quốc gia  ·  "+
    lS+" tông môn  ·  📅 Năm "+yr;
  if (mapState.timelineActive&&mapState.timelineYear!==null) statusText="⏪ TIMELINE: "+statusText;
  ctx.font="11px 'Noto Serif',serif";
  var stW=ctx.measureText(statusText).width;
  ctx.fillStyle="rgba(8,12,20,0.75)"; rrect(ctx,8,H-28,stW+20,22,6); ctx.fill();
  ctx.fillStyle=mapState.timelineActive?"#67e8f9":"rgba(250,204,21,0.55)";
  ctx.font="11px 'Noto Serif',serif"; ctx.textAlign="left"; ctx.fillText(statusText,18,H-13);
}

// ============================
// TOOLTIP
// ============================
function drawTooltip(ctx,info,W,H) {
  var mx=info.mx, my=info.my, lines=[info.name];
  if (info.sub) lines.push(info.sub);
  ctx.font="bold 12px 'Noto Serif',serif";
  var maxW=0; lines.forEach(function(l){maxW=Math.max(maxW,ctx.measureText(l).width);});
  var pad=10, tw=maxW+pad*2, th=lines.length*17+pad*2;
  var tx=mx+14, ty=my-th/2;
  if (tx+tw>W-5) tx=mx-tw-14;
  if (ty<5) ty=5; if(ty+th>H-5) ty=H-th-5;
  ctx.fillStyle="rgba(10,14,22,0.93)"; ctx.strokeStyle="rgba(250,204,21,0.45)"; ctx.lineWidth=1;
  rrect(ctx,tx,ty,tw,th,7); ctx.fill(); ctx.stroke();
  lines.forEach(function(l,i){
    ctx.textAlign="left"; ctx.fillStyle=i===0?"#facc15":"rgba(232,232,240,0.65)";
    ctx.font=(i===0?"bold ":"")+"11px 'Noto Serif',serif";
    ctx.fillText(l,tx+pad,ty+pad+14+i*17);
  });
}

function drawCenteredMsg(ctx,W,H,title,sub){
  ctx.fillStyle="rgba(250,204,21,0.55)"; ctx.font="bold 15px 'Noto Serif',serif"; ctx.textAlign="center";
  ctx.fillText(title,W/2,H/2-16);
  ctx.fillStyle="rgba(250,204,21,0.3)"; ctx.font="12px 'Noto Serif',serif";
  ctx.fillText(sub,W/2,H/2+10);
}

// ============================
// HELPERS
// ============================
function drawEmoji(ctx,emoji,x,y,size) {
  ctx.font=size+"px serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(emoji,x,y); ctx.textBaseline="alphabetic";
}
function rrect(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}
function hexA(hex,alpha){
  if (!hex||hex[0]!=="#") return "rgba(250,204,21,"+alpha+")";
  var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return "rgba("+r+","+g+","+b+","+alpha+")";
}
function fmtPop(n){ if(!n)return"0"; if(n>=1000000)return(n/1000000).toFixed(1)+"M"; if(n>=1000)return Math.floor(n/1000)+"K"; return""+n; }
function fmtNum(n){ if(!n)return"0"; if(n>=1000000)return(n/1000000).toFixed(1)+"M"; if(n>=1000)return Math.floor(n/1000)+"K"; return""+n; }

// ============================
// HIT TESTING
// ============================
function getHit(mx,my) {
  if (!_mapCanvas) return null;
  var W=_mapCanvas.width, H=_mapCanvas.height;
  var sw=W/mapState.zoom, sh=H/mapState.zoom;
  var sx=(mx-mapState.panX)/mapState.zoom, sy=(my-mapState.panY)/mapState.zoom;
  function wx(p){return (p/100)*sw;} function wy(p){return (p/100)*sh;}
  function d2(ax,ay,bx,by){return Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by));}
  var md=getMapData(); if (!md) return null;
  var hits=[];
  Object.values(md.cities).forEach(function(c){
    var dist=d2(sx,sy,wx(c.x),wy(c.y));
    if(dist<12) hits.push({priority:1,dist:dist,type:"city",id:c.id,
      name:c.icon+" "+c.name,sub:"👥 "+fmtPop(c.population)+(c.type==="capital"?" · 🏯 Kinh Thành":" · 🏙 Thành Phố")});
  });
  Object.values(md.countries).forEach(function(c){
    var dist=d2(sx,sy,wx(c.x),wy(c.y));
    if(dist<16) hits.push({priority:2,dist:dist,type:c.isEmpire?"empire":"country",id:c.id,
      name:(c.isEmpire?"👑 ":"⚔️ ")+c.name,sub:"👥 "+fmtPop(c.population)+" · 💰 "+fmtNum(c.wealth)});
  });
  Object.values(md.dungeons).forEach(function(d){
    var dist=d2(sx,sy,wx(d.x),wy(d.y));
    if(dist<12) hits.push({priority:1,dist:dist,type:"dungeon",id:d.id,name:d.name,sub:"☠️ Nguy hiểm: "+d.danger+"/5"});
  });
  Object.values(md.secrets).forEach(function(sz){
    var dist=d2(sx,sy,wx(sz.x),wy(sz.y));
    if(dist<12) hits.push({priority:1,dist:dist,type:"secret",id:sz.id,name:sz.name,sub:"🔮 Cảnh giới tối thiểu: "+sz.minRealm});
  });
  Object.values(md.regions).forEach(function(r){
    var dist=d2(sx,sy,wx(r.x),wy(r.y));
    if(dist<24) hits.push({priority:3,dist:dist,type:"region",id:r.id,name:r.name,sub:"👥 "+fmtPop(r.population)+" · ⚠️ "+r.danger+"/5"});
  });
  if (typeof sects!=="undefined"&&Array.isArray(sects)){
    sects.slice(0,20).forEach(function(s){
      var pos=md.sectPos[s.id]; if (!pos) return;
      var sx2=wx(pos.x), sy2=wy(pos.y);
      var dist=d2(sx,sy,sx2,sy2);
      if(dist<10) hits.push({priority:1,dist:dist,type:"sect",id:s.id,
        name:"⛩️ "+s.name,sub:"Uy tín: "+s.prestige+" · "+(s.members||[]).length+" thành viên"});
    });
  }
  if (!hits.length) return null;
  hits.sort(function(a,b){return a.priority-b.priority||a.dist-b.dist;});
  return hits[0];
}

// ============================
// EVENTS
// ============================
function bindMapEvents() {
  if (!_mapCanvas) return;
  _mapCanvas.addEventListener("wheel",function(e){
    e.preventDefault();
    var delta=e.deltaY>0?0.88:1.14;
    var rect=_mapCanvas.getBoundingClientRect(), mx=e.clientX-rect.left, my=e.clientY-rect.top;
    mapState.panX=mx-(mx-mapState.panX)*delta; mapState.panY=my-(my-mapState.panY)*delta;
    mapState.zoom=clamp(mapState.zoom*delta,0.25,5);
  },{passive:false});
  var _dragStartX=0, _dragStartY=0, _didDrag=false;
  _mapCanvas.addEventListener("mousedown",function(e){
    mapState.dragging=true; mapState.lastMX=e.clientX; mapState.lastMY=e.clientY;
    _dragStartX=e.clientX; _dragStartY=e.clientY; _didDrag=false;
    _mapCanvas.style.cursor="grabbing";
  });
  _mapCanvas.addEventListener("mousemove",function(e){
    var rect=_mapCanvas.getBoundingClientRect(), mx=e.clientX-rect.left, my=e.clientY-rect.top;
    if (mapState.dragging){
      mapState.panX+=e.clientX-mapState.lastMX; mapState.panY+=e.clientY-mapState.lastMY;
      mapState.lastMX=e.clientX; mapState.lastMY=e.clientY;
      if(Math.abs(e.clientX-_dragStartX)>4||Math.abs(e.clientY-_dragStartY)>4) _didDrag=true;
      _mapHover=null;
    } else {
      var hit=getHit(mx,my);
      if(hit){_mapHover=Object.assign({},hit,{mx:mx,my:my});_mapCanvas.style.cursor="pointer";}
      else{_mapHover=null;_mapCanvas.style.cursor="grab";}
    }
  });
  _mapCanvas.addEventListener("mouseup",function(e){
    var rect=_mapCanvas.getBoundingClientRect(), mx=e.clientX-rect.left, my=e.clientY-rect.top;
    mapState.dragging=false; _mapCanvas.style.cursor="grab";
    if (!_didDrag){
      var hit=getHit(mx,my);
      mapState.selected=hit?{type:hit.type,id:hit.id}:null;
      renderMapSidebar(hit||null);
      // Reveal fog around click
      if (hit) {
        var md2=getMapData();
        if (md2){
          var obj=md2.countries[hit.id]||md2.cities[hit.id]||md2.dungeons[hit.id]||md2.regions[hit.id];
          if(obj) revealFog(obj.x,obj.y,1);
        }
      }
    }
  });
  _mapCanvas.addEventListener("mouseleave",function(){mapState.dragging=false;_mapHover=null;_mapCanvas.style.cursor="default";});
  // Touch
  var _lastTouchDist=0;
  _mapCanvas.addEventListener("touchstart",function(e){
    if(e.touches.length===1){mapState.dragging=true;mapState.lastMX=e.touches[0].clientX;mapState.lastMY=e.touches[0].clientY;}
    else if(e.touches.length===2) _lastTouchDist=Math.hypot(e.touches[1].clientX-e.touches[0].clientX,e.touches[1].clientY-e.touches[0].clientY);
  },{passive:true});
  _mapCanvas.addEventListener("touchmove",function(e){
    e.preventDefault();
    if(e.touches.length===1&&mapState.dragging){
      mapState.panX+=e.touches[0].clientX-mapState.lastMX; mapState.panY+=e.touches[0].clientY-mapState.lastMY;
      mapState.lastMX=e.touches[0].clientX; mapState.lastMY=e.touches[0].clientY;
    } else if(e.touches.length===2){
      var d=Math.hypot(e.touches[1].clientX-e.touches[0].clientX,e.touches[1].clientY-e.touches[0].clientY);
      mapState.zoom=clamp(mapState.zoom*(d/_lastTouchDist),0.25,5); _lastTouchDist=d;
    }
  },{passive:false});
  _mapCanvas.addEventListener("touchend",function(){mapState.dragging=false;});
}

// ============================
// MAP CONTROLS
// ============================
function mapZoomIn()  { mapState.zoom=clamp(mapState.zoom*1.3,0.25,5); }
function mapZoomOut() { mapState.zoom=clamp(mapState.zoom/1.3,0.25,5); }
function mapReset()   { mapState.zoom=1;mapState.panX=0;mapState.panY=0;mapState.selected=null;renderMapSidebar(null); }
function mapFogClear() {
  for(var cx=0;cx<10;cx++) for(var cy=0;cy<10;cy++) _fogGrid[cx+","+cy]=true;
  if(typeof toast==="function") toast("🌫 Đã mở hết sương mù!");
}

// ============================
// TIMELINE CONTROLS
// ============================
function updateTimelineSlider() {
  var slider=document.getElementById("mapTimelineSlider");
  var label=document.getElementById("mapTimelineLabel");
  if (!slider||!label) return;
  var years=getSnapshotYears();
  var curYr=(typeof year!=="undefined")?year:0;
  // Ensure current year is captured
  captureSnapshot();
  years=getSnapshotYears();
  if (years.length===0){ label.textContent="Chưa có dữ liệu"; return; }
  slider.min=years[0];
  slider.max=years[years.length-1];
  if (!mapState.timelineActive) { slider.value=curYr; label.textContent="Hiện tại (Năm "+curYr+")"; }
}

function onTimelineChange(val) {
  var yr=parseInt(val);
  mapState.timelineYear=yr;
  mapState.timelineActive=true;
  var label=document.getElementById("mapTimelineLabel");
  var snap=_timelineSnapshots[yr];
  if (label) {
    if (snap) label.textContent="Năm "+yr+" · "+snap.countryCount+" QG";
    else label.textContent="Năm "+yr+" (không có dữ liệu)";
  }
}

function timelineReset() {
  mapState.timelineActive=false; mapState.timelineYear=null;
  var label=document.getElementById("mapTimelineLabel");
  var curYr=(typeof year!=="undefined")?year:0;
  if (label) label.textContent="Hiện tại (Năm "+curYr+")";
  var slider=document.getElementById("mapTimelineSlider");
  if (slider) slider.value=curYr;
}

// ============================
// SIDEBAR INFO
// ============================
function renderMapSidebar(hit) {
  var el=document.getElementById("mapInfoPanel"); if (!el) return;
  if (!hit){
    el.innerHTML='<div style="color:var(--white-dim);font-size:12px;font-style:italic;text-align:center;padding:20px 10px">Nhấp vào một địa điểm để xem thông tin.<br><br><span style="font-size:24px">🗺</span></div>';
    return;
  }
  var md=getMapData(); var html="";
  if (hit.type==="region"||hit.type==="empire"){
    var reg=(typeof regions!=="undefined"?regions:[]).find(function(r){return r.id===hit.id;});
    var rd=md&&md.regions[hit.id];
    if (!reg&&!rd){el.innerHTML="<div style='color:var(--red)'>Không tìm thấy khu vực</div>";return;}
    var rName=reg?reg.name:(rd?rd.name:hit.id);
    var regionSects=(typeof sects!=="undefined"?sects:[]).filter(function(s){
      var t=stripEmoji(s.territory||"").toLowerCase(), n=stripEmoji(rName).toLowerCase();
      return t&&n&&(t.indexOf(n)>=0||n.indexOf(t)>=0);
    });
    var topNPC=(typeof npcs!=="undefined"?npcs:[]).filter(function(n){return !n.dead;})
      .sort(function(a,b){return(b.realm||0)-(a.realm||0);})[0];
    html='<div class="map-info-title">'+rName+'</div>'+
      '<div class="map-info-badge">🌐 Khu Vực</div>'+
      '<div class="map-info-stats">'+mkStat(fmtPop(reg?reg.population:0),"Dân Số")+mkStat('<span style="color:var(--red)">'+(reg?reg.danger:"?")+'/5</span>',"Nguy Hiểm")+'</div>'+
      '<div class="map-info-section">🏯 Tông Môn ('+regionSects.length+')</div>'+
      (regionSects.slice(0,4).map(function(s){return '<div class="map-info-row">⛩️ '+s.name+' <span style="color:var(--gold)">Uy '+s.prestige+'</span></div>';}).join("")||"<div style='color:var(--white-dim);font-size:11px'>Chưa có tông môn</div>")+
      (topNPC?'<div class="map-info-section">⭐ Cường Giả Mạnh Nhất</div><div class="map-info-row" style="cursor:pointer" onclick="if(typeof openNPCModal===\'function\')openNPCModal(\''+topNPC.id+'\')">🧑 '+topNPC.name+' · <span style="color:var(--gold)">'+(typeof REALMS!=="undefined"&&REALMS[topNPC.realm]?REALMS[topNPC.realm].name:"?")+'</span></div>':"");
  } else if (hit.type==="country"){
    var c2=(typeof countries!=="undefined"?countries:[]).find(function(c){return c.id===hit.id;});
    if (!c2){el.innerHTML="<div style='color:var(--red)'>Không tìm thấy quốc gia</div>";return;}
    var yr2=(typeof year!=="undefined")?year:0;
    var founded=c2.founded||1, age=yr2-founded;
    var topNPC2=(typeof npcs!=="undefined"?npcs:[]).filter(function(n){return !n.dead&&n.country===c2.name;}).sort(function(a,b){return(b.realm||0)-(a.realm||0);})[0];
    html='<div class="map-info-title">'+c2.name+'</div>'+
      '<div class="map-info-badge" style="color:var(--blue)">⚔️ Quốc Gia</div>'+
      '<div class="map-info-stats">'+mkStat(fmtPop(c2.population),"Dân Số")+mkStat('<span style="color:var(--jade)">'+fmtNum(c2.wealth)+'</span>',"Quốc Khố")+mkStat('<span style="color:var(--red)">'+fmtNum(c2.army||c2.military||0)+'</span>',"Quân Đội")+'</div>'+
      '<div class="map-info-stats">'+mkStat("📅 "+(c2.founded||"—"),"Thành Lập")+mkStat((age>0?age+" năm":"—"),"Tuổi")+mkStat(c2.territory||"—","Lãnh Thổ")+'</div>'+
      (c2.king||c2.ruler?'<div class="map-info-section">👑 Quân Vương</div><div class="map-info-row">'+( c2.king||c2.ruler)+'</div>':"")+ 
      (topNPC2?'<div class="map-info-section">⭐ Mạnh Nhất</div><div class="map-info-row" style="cursor:pointer" onclick="if(typeof openNPCModal===\'function\')openNPCModal(\''+topNPC2.id+'\')">🧑 '+topNPC2.name+' · <span style="color:var(--gold)">'+(typeof REALMS!=="undefined"&&REALMS[topNPC2.realm]?REALMS[topNPC2.realm].name:"?")+'</span></div>':"");
  } else if (hit.type==="city"){
    var city=md&&md.cities[hit.id]; if (!city){el.innerHTML="<div style='color:var(--red)'>Không tìm thấy</div>";return;}
    var country3=(typeof countries!=="undefined"?countries:[]).find(function(c){return c.id===city.countryId;});
    html='<div class="map-info-title">'+city.icon+" "+city.name+'</div>'+
      '<div class="map-info-badge" style="color:'+(city.type==="capital"?"var(--gold)":"var(--white-dim)")+'">'+(city.type==="capital"?"🏯 Kinh Thành":"🏰 Thành Phố")+'</div>'+
      '<div class="map-info-stats">'+mkStat(fmtPop(city.population),"Dân Số")+(country3?mkStat('<span style="color:var(--blue)">'+country3.name+'</span>',"Chủ Sở Hữu"):"")+'</div>';
  } else if (hit.type==="dungeon"){
    var dung=md&&md.dungeons[hit.id]; if (!dung) return;
    var boss=dung.bossIdx!==null&&(typeof bosses!=="undefined")?bosses[dung.bossIdx]:null;
    html='<div class="map-info-title">'+dung.name+'</div>'+
      '<div class="map-info-badge" style="color:var(--red)">🏚 Hầm Ngục</div>'+
      '<div class="map-info-stats">'+mkStat('<span style="color:var(--red)">'+dung.danger+'/5</span>',"Nguy Hiểm")+'</div>'+
      (boss?'<div class="map-info-section">🐉 Trùm Cư Ngụ</div><div class="map-info-row" style="color:var(--red)">'+boss.name+'</div><div style="font-size:11px;color:var(--white-dim)">HP: '+boss.hp+'/'+boss.maxHp+'</div><div style="font-size:11px;color:var(--white-dim)">Cảnh giới: '+(typeof REALMS!=="undefined"&&REALMS[boss.realm]?REALMS[boss.realm].name:"?")+'</div>':'<div style="color:var(--white-dim);font-size:11px;margin-top:8px">Chưa có trùm cư ngụ</div>');
  } else if (hit.type==="secret"){
    var sz=md&&md.secrets[hit.id]; if (!sz) return;
    html='<div class="map-info-title">'+sz.name+'</div>'+
      '<div class="map-info-badge" style="color:var(--purple)">🌀 Bí Cảnh</div>'+
      '<div class="map-info-stats">'+mkStat('<span style="color:var(--purple)">'+sz.minRealm+'</span>',"Cảnh Giới TT")+mkStat(sz.discovered?"✅ Đã khám phá":"❓ Chưa khám phá","Trạng Thái")+'</div>'+
      '<div style="color:var(--white-dim);font-size:11px;font-style:italic;margin-top:8px">Vùng đất huyền bí ẩn chứa những bí mật chưa được khám phá...</div>'+
      (!sz.discovered?'<button class="btn-primary small" style="width:100%;margin-top:10px" onclick="discoverSecret(\''+sz.id+'\')">🔍 Khám Phá</button>':"");
  } else if (hit.type==="sect"){
    var sect2=(typeof sects!=="undefined"?sects:[]).find(function(s){return s.id===hit.id;}); if (!sect2) return;
    var sectMembers=(typeof npcs!=="undefined"?npcs:[]).filter(function(n){return n.sectId===sect2.id&&!n.dead;});
    var topMember=sectMembers.sort(function(a,b){return(b.realm||0)-(a.realm||0);})[0];
    html='<div class="map-info-title">⛩️ '+sect2.name+'</div>'+
      '<div class="map-info-badge" style="color:var(--gold)">🏯 Tông Môn</div>'+
      '<div class="map-info-stats">'+mkStat(sect2.prestige||0,"Uy Tín")+mkStat(fmtNum(sect2.treasury||0),"Tài Khố")+mkStat(sectMembers.length,"Thành Viên")+'</div>'+
      '<div class="map-info-section">📍 Vị Trí</div><div class="map-info-row">'+(sect2.territory||"Không xác định")+'</div>'+
      (topMember?'<div class="map-info-section">👑 Tông Chủ/Mạnh Nhất</div><div class="map-info-row" onclick="if(typeof openNPCModal===\'function\')openNPCModal(\''+topMember.id+'\')" style="cursor:pointer">'+topMember.name+' · <span style="color:var(--gold)">'+(typeof REALMS!=="undefined"&&REALMS[topMember.realm]?REALMS[topMember.realm].name:"?")+'</span></div>':"");
  }
  el.innerHTML=html;
}

function mkStat(val,lbl){ return '<div class="map-stat"><div class="ms-val">'+val+'</div><div class="ms-lbl">'+lbl+'</div></div>'; }

function discoverSecret(id) {
  var md=getMapData();
  if (md&&md.secrets[id]){
    md.secrets[id].discovered=true;
    revealFog(md.secrets[id].x,md.secrets[id].y,2);
    if(typeof addLog==="function") addLog("🌀 Vùng đất bí mật "+md.secrets[id].name+" đã được khám phá!","important");
    if(typeof toast==="function") toast("🌀 Đã khám phá vùng đất bí mật!");
    renderMapSidebar({type:"secret",id:id,name:md.secrets[id].name,sub:""});
  }
}

// ============================
// OVERLAY STATS
// ============================
function updateMapOverlay() {
  var el=document.getElementById("mapStatsOverlay"); if (!el) return;
  var lNPCs=(typeof npcs!=="undefined"&&Array.isArray(npcs))?npcs:[];
  var alive=lNPCs.filter(function(n){return !n.dead&&n.status!=="dead";}).length;
  var lCountries=(typeof countries!=="undefined"?countries:[]).length;
  var lEmpires=(typeof countries!=="undefined"?countries:[]).filter(function(c){return (c.level||1)>=4||c.status==="empire";}).length;
  var lSects=(typeof sects!=="undefined"?sects:[]).length;
  var topNPC=lNPCs.filter(function(n){return !n.dead;}).sort(function(a,b){return(b.realm||0)-(a.realm||0);})[0];
  var md=getMapData();
  var cityCount=md?Object.keys(md.cities).length:0;
  el.innerHTML=
    mOS("👤 "+alive,"Tu Sĩ")+mOS("⚔️ "+lCountries,"Quốc Gia")+mOS("👑 "+lEmpires,"Đế Quốc")+
    mOS("🏯 "+lSects,"Tông Môn")+mOS("🏙 "+cityCount,"Thành Phố")+
    mOS("📅 "+(typeof year!=="undefined"?year:"—"),"Năm")+
    (topNPC?'<div class="map-overlay-stat" title="Xem chi tiết" onclick="if(typeof openNPCModal===\'function\')openNPCModal(\''+topNPC.id+'\')" style="cursor:pointer;border-color:rgba(250,204,21,0.3)"><span style="color:var(--gold);font-size:11px">⭐ '+(typeof REALMS!=="undefined"&&REALMS[topNPC.realm]?REALMS[topNPC.realm].name:"?")+'</span><small>'+topNPC.name+'</small></div>':"");
}
function mOS(val,lbl){ return '<div class="map-overlay-stat"><span>'+val+'</span><small>'+lbl+'</small></div>'; }

// ============================
// LEGEND
// ============================
function renderMapLegend() {
  var el=document.getElementById("mapLegendContent"); if (!el) return;
  function li(dot,label){ return '<div class="map-legend-item">'+dot+'<span>'+label+'</span></div>'; }
  function dot(bg,border,size){ size=size||12; return '<span class="map-legend-dot" style="width:'+size+'px;height:'+size+'px;background:'+bg+';border:1.5px solid '+border+'"></span>'; }
  el.innerHTML=
    li(dot("rgba(250,204,21,0.45)","#facc15",14),"Quốc Gia")+
    li(dot("rgba(250,200,50,0.55)","#facc15",18)+"<small>👑</small>","Đế Quốc")+
    li('<span style="font-size:13px">🏯</span>',"Kinh Thành")+
    li('<span style="font-size:13px">🏰</span>',"Thành Phố")+
    li('<span style="font-size:13px">🏚</span>',"Hầm Ngục")+
    li(dot("rgba(192,132,252,0.4)","#c084fc"),"Bí Cảnh 🌀")+
    li('<span style="font-size:13px">⛩️</span>',"Tông Môn")+
    li('<span style="font-size:13px">🐉</span>',"Trùm Boss")+
    li(dot("#4ade80","#22c55e",8),"Tu Sĩ (cảnh thấp)")+
    li(dot("#c084fc","#a855f7",8),"Tu Sĩ (cảnh cao)")+
    '<div style="margin-top:8px;padding:8px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid var(--border)">'+
    '<div style="font-size:9px;color:var(--white-dim);line-height:1.9">'+
    '🖱 Kéo để di chuyển bản đồ<br>🔍 Cuộn để zoom<br>👆 Click để xem chi tiết<br>🌫 Khám phá để mở sương mù'+
    '</div></div>';
}

// ============================
// MAP TICK
// ============================
function mapTick() {
  var wid=(typeof currentWorldId!=="undefined")?currentWorldId:null;
  if (!wid) return;
  var md=_mapDataCache[wid]; if (!md) return;
  // Move NPCs
  var lNPCs=(typeof npcs!=="undefined"&&Array.isArray(npcs))?npcs:[];
  var cityArr=Object.values(md.cities);
  lNPCs.forEach(function(npc){
    if (!md.npcPos[npc.id]){
      var cd=Object.values(md.countries);
      var base=cd.length?cd[npc.id%cd.length]:{x:50,y:50};
      md.npcPos[npc.id]={x:clamp(base.x+jitter(10),3,97),y:clamp(base.y+jitter(10),3,97),tx:null,ty:null,moving:false};
    }
    var pos=md.npcPos[npc.id];
    if (!pos.moving&&Math.random()<0.04){
      if (cityArr.length&&Math.random()<0.5){
        var dest=cityArr[Math.floor(Math.random()*cityArr.length)];
        pos.tx=dest.x+jitter(3); pos.ty=dest.y+jitter(3);
      } else { pos.tx=clamp(pos.x+jitter(15),3,97); pos.ty=clamp(pos.y+jitter(15),3,97); }
      pos.moving=true;
    }
    if (pos.moving&&pos.tx!==null){
      var dx=pos.tx-pos.x, dy=pos.ty-pos.y, dist=Math.sqrt(dx*dx+dy*dy);
      if (dist<0.5){pos.x=pos.tx;pos.y=pos.ty;pos.moving=false;pos.tx=null;pos.ty=null;}
      else { var sp=Math.min(1.2,dist); pos.x+=dx/dist*sp; pos.y+=dy/dist*sp; }
      // Reveal fog as NPC moves
      if (Math.random()<0.05) revealFog(pos.x,pos.y,0);
    }
  });
  // Update bosses
  var liveBosses2=(typeof bosses!=="undefined"&&Array.isArray(bosses))?bosses:[];
  var dungArr=Object.values(md.dungeons);
  liveBosses2.forEach(function(boss,bi){ if(dungArr[bi]) dungArr[bi].bossIdx=bi; });
  // Live update: check for country count or property change (war result, annexation, etc.)
  var liveCArr2=(typeof countries!=="undefined"&&Array.isArray(countries))?countries:[];
  var liveC=liveCArr2.length;
  var liveCSig=liveCArr2.reduce(function(s,c){return s+(c.name||"")+(c.territory||"")+(c.level||0)+(c.status||"");},"");
  var ver=_mapDataVersion[wid];
  if (ver&&(ver.c!==liveC||ver.sig!==liveCSig)){ delete _mapDataVersion[wid]; mapLog("Country data changed — will rebuild map"); }
  // Capture timeline snapshots every N years
  var curYr=(typeof year!=="undefined")?year:0;
  if (curYr>0&&curYr%10===0) captureSnapshot();
  // Update overlay
  if (curYr%3===0) updateMapOverlay();
}

function hookNPCGeneration() {
  var wid=(typeof currentWorldId!=="undefined")?currentWorldId:null;
  if (!wid||!_mapDataCache[wid]) return;
  var md=_mapDataCache[wid];
  var lNPCs=(typeof npcs!=="undefined"&&Array.isArray(npcs))?npcs:[];
  var cd=Object.values(md.countries);
  lNPCs.forEach(function(npc){
    if (!md.npcPos[npc.id]){
      var base=cd.length?cd[npc.id%cd.length]:{x:50,y:50};
      md.npcPos[npc.id]={x:clamp(base.x+jitter(10),3,97),y:clamp(base.y+jitter(10),3,97),tx:null,ty:null,moving:false};
    }
  });
}

// ============================
// PANEL SHOW
// ============================
function onMapPanelShow() {
  mapLog("Panel opened");
  _mapInited=false;
  if (_mapCanvas){
    try {
      var oldCanvas=_mapCanvas, newCanvas=oldCanvas.cloneNode(false);
      if (oldCanvas.parentNode) oldCanvas.parentNode.replaceChild(newCanvas,oldCanvas);
    } catch(e) {}
  }
  _mapCanvas=null; _mapCtx=null;
  setTimeout(function(){
    initMapCanvas(); safeResizeCanvas();
    var md=getMapData();
    if (md) {
      mapLog("Data ready: "+Object.keys(md.regions).length+"R "+Object.keys(md.countries).length+"C");
      initFog();
    } else { mapLog("WARNING: No map data"); }
    renderMapLegend(); updateMapOverlay(); renderMapSidebar(null);
    captureSnapshot(); updateTimelineSlider();
  },60);
}

// ============================
// AUTO INIT
// ============================
(function autoInit() {
  function tryInit(){
    var canvas=document.getElementById("worldMapCanvas");
    if (canvas&&!_mapInited){ initMapCanvas(); mapLog("Auto-init complete"); }
    if (!_mapRAF) mapRenderLoop();
    renderMapLegend(); updateMapOverlay();
    captureSnapshot();
  }
  if (document.readyState==="loading") document.addEventListener("DOMContentLoaded",function(){setTimeout(tryInit,500);});
  else setTimeout(tryInit,500);
  window.addEventListener("resize",function(){ if(_mapCanvas) safeResizeCanvas(); });
})();

// ============================
// PERSISTENCE PATCH
// ============================
(function patchMapPersistence(){
  var _origSave=window.save;
  window.save=function(){
    if (_origSave) _origSave();
    try {
      localStorage.setItem("cgv6_mapState",JSON.stringify({panX:mapState.panX,panY:mapState.panY,zoom:mapState.zoom}));
      localStorage.setItem("cgv6_fogGrid",JSON.stringify(_fogGrid));
      localStorage.setItem("cgv6_timelineSnaps",JSON.stringify(_timelineSnapshots));
    } catch(e) {}
  };
  var _origLoad=window.load;
  window.load=function(){
    if (_origLoad) _origLoad();
    try {
      var ms=localStorage.getItem("cgv6_mapState");
      if (ms){ var p=JSON.parse(ms);
        if(typeof p.panX==="number") mapState.panX=p.panX;
        if(typeof p.panY==="number") mapState.panY=p.panY;
        if(typeof p.zoom==="number") mapState.zoom=p.zoom;
      }
      var fg=localStorage.getItem("cgv6_fogGrid");
      if (fg){ _fogGrid=JSON.parse(fg); _fogGenerated=true; mapLog("Fog loaded from save"); }
      var ts=localStorage.getItem("cgv6_timelineSnaps");
      if (ts){ _timelineSnapshots=JSON.parse(ts); mapLog("Timeline snapshots loaded: "+Object.keys(_timelineSnapshots).length); }
    } catch(e) {}
  };
})();