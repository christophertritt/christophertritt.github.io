const T = {transportation:"Transportation",environment:"Environment",housing:"Housing and design",data:"Data tools",health:"Public health"};
/* Draft notes only show with ?draft in the URL. Unfinished case studies
   (draft:true) are left out of the public list until they're written. */
const DRAFT = (()=>{try{return new URLSearchParams(location.search).has("draft")}catch(e){return false}})();
const todo = s => DRAFT ? `<em class="todo">${s}</em>` : "";

const art = {
  ctr: `<svg viewBox="0 0 320 180" aria-hidden="true"><rect width="320" height="180" fill="var(--map-land)"/>
    <g stroke="var(--line)" stroke-width="1">${[40,80,120,160,200,240,280].map(x=>`<line x1="${x}" y1="0" x2="${x}" y2="180"/>`).join("")}${[45,90,135].map(y=>`<line x1="0" y1="${y}" x2="320" y2="${y}"/>`).join("")}</g>
    <path d="M0 120 C60 110 90 60 160 70 S260 40 320 30" fill="none" stroke="var(--green)" stroke-width="5"/>
    ${[[60,108],[118,72],[176,66],[232,52],[286,36]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="var(--surface)" stroke="var(--green)" stroke-width="4"/>`).join("")}
    <rect x="18" y="138" width="22" height="30" fill="var(--signal)"/><rect x="46" y="128" width="22" height="40" fill="var(--green)"/><rect x="74" y="146" width="22" height="22" fill="var(--muted)"/></svg>`,
  roslyn: `<svg viewBox="0 0 320 180" aria-hidden="true"><rect width="320" height="180" fill="var(--map-land)"/>
    ${[[70,110,0],[120,85,0],[170,60,1],[220,85,0],[120,135,1],[170,110,0],[220,135,0]].map(([x,y,n])=>{
      const c=n?"var(--signal)":"var(--surface)";return `<g stroke="var(--ink)" stroke-width="1.2" stroke-linejoin="round"><path d="M${x} ${y} l25 -14 l25 14 l-25 14z" fill="${c}"/><path d="M${x} ${y} v-${n?30:18} l25 -14 v${n?30:18}" fill="${n?"var(--signal)":"var(--green-soft)"}"/><path d="M${x+25} ${y-14-(n?30:18)} l25 14 v${n?30:18}" fill="${n?"var(--signal)":"var(--map-water)"}"/><path d="M${x} ${y-(n?30:18)} l25 -14 l25 14 l-25 14z" fill="${c}"/></g>`}).join("")}</svg>`,
  grayland: `<svg viewBox="0 0 320 180" aria-hidden="true"><rect width="320" height="180" fill="var(--map-land)"/>
    <path d="M0 0 H70 C60 60 80 120 60 180 H0z" fill="var(--map-water)"/>
    <path d="M70 0 C95 60 85 120 100 180 H60 C80 120 60 60 70 0z" fill="var(--green)" opacity=".35"/>
    ${[0,1,2,3,4,5].map(i=>`<path d="M${120+i*32} 0 C${100+i*32} 60 ${140+i*32} 110 ${115+i*32} 180" fill="none" stroke="var(--muted)" stroke-width="1"/>`).join("")}
    <path d="M190 0 C200 50 240 90 230 180" fill="none" stroke="var(--green)" stroke-width="3"/>
    <path d="M190 0 C200 50 240 90 230 180" fill="none" stroke="var(--green)" stroke-width="22" opacity=".18"/>
    <rect x="150" y="60" width="90" height="70" fill="none" stroke="var(--signal)" stroke-width="2.5" stroke-dasharray="6 4"/></svg>`,
  "south-hill": `<svg viewBox="0 0 320 180" aria-hidden="true"><rect width="320" height="180" fill="var(--map-land)"/>
    <g stroke="var(--line)" stroke-width="2">${[30,70,110,150].map(y=>`<line x1="0" y1="${y}" x2="320" y2="${y}"/>`).join("")}${[50,110,170,230,290].map(x=>`<line x1="${x}" y1="0" x2="${x}" y2="180"/>`).join("")}</g>
    <path d="M70 40 L160 22 L250 50 L262 120 L200 160 L95 150 L58 100z" fill="var(--green)" fill-opacity=".16" stroke="var(--green)" stroke-width="3"/>
    <circle cx="160" cy="92" r="20" fill="none" stroke="var(--signal)" stroke-width="3"/><path d="M160 80 v24 M148 92 h24" stroke="var(--signal)" stroke-width="3"/></svg>`,
  detroit: `<svg viewBox="0 0 320 180" aria-hidden="true"><rect width="320" height="180" fill="var(--map-land)"/>
    ${Array.from({length:7},(_,c)=>Array.from({length:4},(_,r)=>`<rect x="${12+c*44}" y="${10+r*42}" width="36" height="34" fill="var(--surface)" stroke="var(--line)"/>`).join("")).join("")}
    <path d="M-5 150 C70 140 110 100 150 92 S230 60 330 20" fill="none" stroke="var(--green)" stroke-width="14" opacity=".25"/>
    <path d="M-5 150 C70 140 110 100 150 92 S230 60 330 20" fill="none" stroke="var(--green)" stroke-width="4"/>
    <circle cx="150" cy="92" r="9" fill="var(--signal)"/></svg>`
};

const photos={"ctr": {"src": "/images/homepage/photo-1.jpg", "alt": "Buses under the canopy at Bellevue Transit Center", "credit": "Dweymouth, CC BY-SA 4.0", "href": "https://commons.wikimedia.org/wiki/File:Bellevue_Transit_Center_west_end.jpg"}, "roslyn": {"src": "/images/homepage/photo-2.jpg", "alt": "Historic storefronts along downtown Roslyn's main street", "credit": "Flytzjl93, CC BY-SA 4.0", "href": "https://commons.wikimedia.org/wiki/File:Downtown_Roslyn_2026.jpg"}, "grayland": {"src": "/images/homepage/photo-3.jpg", "alt": "Driftwood on the sand at Grayland Beach at sunset", "credit": "Steve Ginn, CC0", "href": "https://commons.wikimedia.org/wiki/File:Grayland_Beach_State_Park_(33475037010).jpg"}, "south-hill": {"src": "/images/homepage/photo-4.jpg", "alt": "USGS aerial view of Puyallup and South Hill", "credit": "USGS, public domain", "href": "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Puyallup_and_South_Hill,_Washington,_August_16,_2023.jpg"}};
const thumb=(id,big)=>photos[id]?`<img src="${photos[id].src}" alt="${photos[id].alt}" loading="lazy">`+(big?`<a class="credit" href="${photos[id].href}" target="_blank" rel="noopener">Photo: ${photos[id].credit}</a>`:`<span class="credit">${photos[id].credit}</span>`):(big?art[id]:art[id].replace("<svg ",'<svg preserveAspectRatio="xMidYMid slice" '));
const allProjects = [
  {id:"ctr", board:"Bellevue CTR dashboard", code:"BEL", file:"ctr_dashboard.pbix", title:"Bellevue CTR dashboard", tags:["transportation","data"],
   blurb:"A multi-page Power BI dashboard and Python pipeline that lets employer transportation coordinators see their own commute results.",
   lede:"One clean data source and a Python pipeline now feed a dashboard that each employer coordinator can open to see their own site's commute trip reduction results.",
   glance:{Role:"Lead developer, Assistant Planner",Context:"City of Bellevue TDM, Commute Trip Reduction",Date:"2025 – 2026",Tools:"Power BI, Python, ArcGIS Pro, GTFS"},
   problem:"Commute Trip Reduction survey results lived in several spreadsheets. Employer transportation coordinators had no simple way to see how their own worksite was doing, and the team rebuilt the same summaries by hand.",
   role:"I designed and built the dashboard, wrote the data pipeline, and geocoded every CTR worksite. "+todo("Name anyone who reviewed or supplied data."),
   approach:["Consolidated survey exports into one cleaned source file that every dashboard version reads.","Moved transformation logic into a Python script, ctr_transform.py, so updates rerun in one step.","Geocoded worksites in ArcGIS Pro and layered GTFS stops and routes plus pedestrian and bike facilities.","Built pages for drive-alone rate, vehicle miles traveled, mode share, amenities, a savings calculator, and a map.","Filtered each employer's view by CTR ID with row-level security, versioned as 0.2, 0.3, and onward."],
   outcome:todo("Add: number of worksites covered, who uses it, and what it replaced."),
   reflect:"Next I want to add a network analysis that scores each worksite's real transit and bike access, so coordinators can see why their numbers look the way they do.",
   note:"Figures and employer names in the screenshots are sample data."},
  {id:"roslyn", board:"Roslyn middle housing", code:"RSL", file:"roslyn_model.blend", title:"Roslyn middle housing model", tags:["housing"], status:"In progress",
   blurb:"A 3D model of Roslyn, WA showing existing conditions and HB 1110 middle housing infill.",
   lede:"A rebuilt 3D model of Roslyn that shows where middle housing allowed under HB 1110 could fit within the town's existing fabric.",
   glance:{Role:"Sole author",Context:"Independent portfolio project",Date:"2026",Tools:"QGIS, Blender, open-source code"},
   problem:"Washington's middle housing law changes what small towns must allow, but it is hard for residents to picture what a duplex or fourplex would look like on their own street.",
   role:"I am rebuilding an earlier model from scratch, handling the data, modeling, and rendering.",
   approach:["Assemble parcel, building footprint, and terrain data in QGIS.","Model existing conditions in Blender from that data.","Test infill scenarios against the comprehensive plan goals and HB 1110.","Render before-and-after views and an interactive viewer."],
   outcome:todo("Add renders and findings when the rebuild is finished."),
   reflect:"The same method will extend to Long Beach, Ilwaco, Raymond, and South Bend so the four Pacific County cities can be compared side by side."},
  {id:"grayland", board:"Grayland constraints", code:"GRY", file:"grayland_constraints.qgz", title:"Grayland environmental constraints", tags:["environment"],
   blurb:"Constraints and regulatory analysis for a large coastal property in Grays Harbor County.",
   lede:"A constraints analysis that maps where development is limited on a large coastal property in Grayland, and why.",
   glance:{Role:"Analyst",Context:"UW graduate coursework",Date:"2025 – 2026",Tools:"QGIS, Excel"},
   problem:"Coastal land in Grays Harbor County carries overlapping limits from slope, soils, flooding, streams, and county critical areas code. Those limits need to be read together before any site decision.",
   role:"I gathered the data, ran the overlay analysis, and produced the deliverables.",
   approach:["Collected slope, soils, FEMA flood zone, and stream data.","Applied stream buffers and Grays Harbor County critical areas regulations.","Combined the layers into a single constraints picture.","Packaged the results as an Excel workbook and a QGIS-ready data package."],
   outcome:"A workbook and data package that show buildable and constrained areas with the regulation behind each one. Related work converted tsunami hazard layers into GeoJSON for web mapping.",
   reflect:todo("Add what you would change or test next.")},
  {id:"south-hill", board:"South Hill HIA", code:"SHL", draft:true, file:"south_hill_hia.pdf", title:"South Hill Health Impact Assessment", tags:["health","transportation"],
   blurb:"How incorporating South Hill as a city could affect residents' health, prepared with Pierce County.",
   lede:"A health impact assessment of South Hill's possible incorporation, completed for Pierce County through UW's Livable City Year program.",
   glance:{Role:"Team member",Context:"UW ENV H / URBAN 536 with Pierce County Planning and Public Works",Date:"2026",Tools:"Literature review, GIS, stakeholder input"},
   problem:"South Hill is one of Pierce County's largest unincorporated communities and is weighing incorporation. The county wanted to understand how a change in governance could affect residents' health.",
   role:"I was one of sixteen graduate students on the assessment. "+todo("Describe your section and what you produced."),
   approach:["Scoped health pathways tied to governance and services.","Assessed existing conditions in the community.","Compared no-action and incorporation scenarios.","Wrote recommendations for the county."],
   outcome:`The final report is published by UW Livable City Year. <a href="https://lcy.be.uw.edu/wp-content/uploads/sites/35/2026/06/2026-HIA-Report_FINAL_public.pdf" target="_blank" rel="noopener">Read the report (PDF)</a>.`,
   reflect:todo("Add one lesson from working with a county client.")},
  {id:"detroit", board:"Joe Louis Greenway", code:"DTW", draft:true, file:"joe_louis_greenway.pdf", title:"Joe Louis Greenway plan", tags:["housing"],
   blurb:"A UW team entry for the 2026 APA Student Planning and Design Competition in Detroit.",
   lede:"A small-area plan for the Davison-Schoolcraft neighborhood along Detroit's Joe Louis Greenway, made for the 2026 APA Student Planning and Design Competition.",
   glance:{Role:"Team member",Context:"APA Student Planning and Design Competition",Date:"2026",Tools:todo("Add tools")},
   problem:"The competition site is a 47-acre stretch of Davison-Schoolcraft cut by a new section of the greenway, with light industry, vacant schools, and established neighborhoods side by side.",
   role:"I worked on a four-person UW team with Yasmeen Sobaih and two classmates. "+todo("Describe your part of the plan."),
   approach:[todo("Add the team's main moves and one process graphic.")],
   outcome:todo("Add the submission boards and how the entry placed."),
   reflect:todo("Add what you would do differently.")}
];
const projects = allProjects.filter(p => DRAFT || !p.draft);


