import {CHARACTERS,EXPRESSION_LABELS,EXPRESSIONS}from'./scene.mjs';
/** Original procedural VECTOR PLACEHOLDER. Shared geometry, not six generated faces. */
const FACES={
 calm:{brows:['M139 158 Q158 148 179 156','M221 156 Q242 148 261 158'],eyes:['M139 180 Q159 168 180 181 Q160 190 139 180','M220 181 Q241 168 262 180 Q241 190 220 181'],mouth:'M177 243 Q200 249 223 242',irisY:180},
 happy:{brows:['M138 153 Q157 140 180 150','M220 150 Q243 140 263 153'],eyes:['M140 180 Q159 166 179 180 Q160 187 140 180','M221 180 Q242 166 262 180 Q242 187 221 180'],mouth:'M174 239 Q200 253 226 239 Q204 273 174 239',irisY:177},
 angry:{brows:['M138 148 L181 166','M219 166 L263 148'],eyes:['M140 178 L179 185 Q158 194 140 178','M221 185 L261 178 Q243 194 221 185'],mouth:'M177 252 Q200 239 225 252',irisY:184},
 sad:{brows:['M138 163 Q159 161 180 145','M220 145 Q242 161 263 163'],eyes:['M140 181 Q159 177 179 184 Q159 197 140 181','M221 184 Q242 177 262 181 Q242 197 221 184'],mouth:'M177 255 Q201 238 224 255',irisY:185},
 shocked:{brows:['M137 145 Q158 127 180 141','M220 141 Q242 127 264 145'],eyes:['M138 180 Q158 156 181 180 Q161 204 138 180','M219 180 Q242 156 264 180 Q242 204 219 180'],mouth:'M187 244 C186 224 214 224 215 245 C214 266 188 265 187 244',irisY:180},
 skeptical:{brows:['M137 145 Q159 131 180 143','M221 158 Q243 157 263 163'],eyes:['M139 179 Q159 162 180 179 Q160 194 139 179','M221 184 Q243 176 262 184 Q241 192 221 184'],mouth:'M177 249 Q199 244 222 250',irisY:180},
};
export function createRig(id){
 const c=CHARACTERS[id];if(!c)throw Error('Unknown rehearsal actor');const uid=`rig-${id}`;
 const female=c.style==='sister',older=c.style==='brother';
 const hairBack=female?'<path d="M100 169 C87 54 142 31 203 39 C303 28 309 128 298 204 L326 381 Q278 420 246 339 L136 350 Q72 403 76 350Z" fill="url(#HAIR)"/>':'';
 const hairFront=female?'<path d="M105 173 C92 90 121 50 191 48 C268 33 303 87 293 161 Q273 153 260 110 Q210 153 153 132 Q130 145 115 177Z" fill="url(#HAIR)"/><path d="M265 98 Q293 157 282 266 L309 324 Q310 164 294 110Z" fill="url(#HAIR)"/>':older?'<path d="M106 165 C91 91 123 47 181 50 C229 21 297 67 296 146 L284 173 L272 119 Q200 142 157 117 Q136 119 118 173Z" fill="url(#HAIR)"/><path d="M125 114 Q183 62 254 89 M145 99 Q203 57 268 102" fill="none" stroke="#687079" stroke-width="5" opacity=".48"/>':'<path d="M106 166 C90 100 116 52 163 53 C198 25 271 45 288 91 Q307 119 288 172 L272 125 Q218 123 189 93 Q158 139 126 131 L118 174Z" fill="url(#HAIR)"/><path d="M130 108 Q160 58 212 64 M168 87 Q217 57 269 101" fill="none" stroke="#58616a" stroke-width="4" opacity=".5"/>';
 const svg=`<svg viewBox="0 0 400 680" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>
 <linearGradient id="SKIN" x1="0" y1="0" x2="1" y2=".5"><stop stop-color="#fae1c1"/><stop offset=".53" stop-color="${c.face}"/><stop offset="1" stop-color="#b97e65"/></linearGradient>
 <linearGradient id="HAIR" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#666264"/><stop offset=".4" stop-color="${c.hair}"/><stop offset="1" stop-color="#151e24"/></linearGradient>
 <linearGradient id="COAT" x1="0" y1="0" x2="1" y2=".4"><stop stop-color="${c.jacket}"/><stop offset=".55" stop-color="${c.jacket}"/><stop offset="1" stop-color="#162c35"/></linearGradient>
 <linearGradient id="SHIRT" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c.shirt}"/><stop offset="1" stop-color="#9eaaa1"/></linearGradient>
 <radialGradient id="CHEEK"><stop stop-color="#b77261" stop-opacity=".42"/><stop offset="1" stop-color="#c67765" stop-opacity="0"/></radialGradient>
 </defs>
 <g class="rig-body"><path d="M131 319 Q75 331 40 371 Q12 428 12 680 H388 Q384 424 358 373 Q328 337 266 320Z" fill="url(#COAT)"/>
 <path d="M154 306 L246 306 L275 358 L245 680 H149 L126 356Z" fill="url(#SHIRT)"/>
 <path d="M158 269 L156 317 Q199 365 244 317 L242 267Z" fill="url(#SKIN)"/><path d="M158 280 Q198 319 242 277 L242 300 Q200 332 158 301Z" fill="#905d4d" opacity=".25"/>
 <path d="M151 307 L123 331 L141 378 L192 337Z M247 307 L276 332 L258 378 L205 338Z" fill="${c.shirt}"/>
 <path d="M123 329 L97 365 L121 387 L106 412 L148 680 M276 329 L306 365 L281 388 L294 412 L246 680" fill="none" stroke="#a1b7ad" stroke-opacity=".32" stroke-width="3"/>
 <path d="M51 399 Q64 496 50 680 M351 399 Q336 494 349 680" stroke="#07191f" stroke-opacity=".35" stroke-width="5" fill="none"/>
 ${!female?'<path d="M206 358 L206 680" stroke="#828b80" stroke-width="2"/><g fill="#56625d"><circle cx="214" cy="395" r="3"/><circle cx="214" cy="454" r="3"/><circle cx="214" cy="513" r="3"/></g>':'<path d="M166 359 Q200 382 235 359" fill="none" stroke="#8c826e" stroke-width="3"/><circle cx="201" cy="370" r="5" fill="#dfcb96"/>'}
 <path d="M66 386 Q94 352 120 348" stroke="#c5d4c4" stroke-opacity=".18" stroke-width="6" fill="none"/>
 </g>
 <g class="rig-head">${hairBack}
 <ellipse cx="110" cy="191" rx="17" ry="29" fill="url(#SKIN)"/><ellipse cx="288" cy="191" rx="17" ry="29" fill="url(#SKIN)"/>
 <path d="M114 145 C113 93 151 69 200 69 C253 69 287 102 285 151 L279 222 Q269 278 201 299 Q133 280 120 224Z" fill="url(#SKIN)"/>
 <path d="M117 165 Q115 250 164 279 Q126 236 137 167Z" fill="#b67e67" opacity=".22"/>
 <ellipse cx="145" cy="221" rx="30" ry="26" fill="url(#CHEEK)"/><ellipse cx="254" cy="221" rx="30" ry="26" fill="url(#CHEEK)"/>
 <path d="M200 182 L190 218 Q200 226 211 218" fill="none" stroke="#b7826b" stroke-width="2.5" stroke-linecap="round"/>
 <path d="M196 192 L194 211" stroke="#ffdfbd" stroke-width="4" opacity=".45" stroke-linecap="round"/>
 <g class="rig-brows" fill="none" stroke="${c.hair}" stroke-width="${female?5:7}" stroke-linecap="round"><path data-brow="0"/><path data-brow="1"/></g>
 <g class="rig-eyes"><g data-eye="0"><path class="eye-white" fill="#f7e8d7" stroke="#745d54" stroke-width="2"/><circle class="iris" cx="160" cy="180" r="7" fill="#473d35"/><circle class="pupil" cx="160" cy="180" r="3.5" fill="#111d21"/><circle cx="158" cy="177" r="2" fill="#fff4db"/></g><g data-eye="1"><path class="eye-white" fill="#f7e8d7" stroke="#745d54" stroke-width="2"/><circle class="iris" cx="241" cy="180" r="7" fill="#473d35"/><circle class="pupil" cx="241" cy="180" r="3.5" fill="#111d21"/><circle cx="239" cy="177" r="2" fill="#fff4db"/></g></g>
 <g class="rig-lids" fill="none" stroke="#76564b" stroke-width="3" stroke-linecap="round"><path d="M139 181 Q159 190 180 181"/><path d="M220 181 Q241 190 262 181"/></g>
 ${older?'<path d="M141 201 Q158 205 175 201 M226 201 Q242 205 259 201" fill="none" stroke="#ae7c68" stroke-width="1.5" opacity=".6"/>':''}
 <g class="rig-mouth"><path class="mouth-rest" fill="none" stroke="#8f544e" stroke-width="3" stroke-linecap="round"/><g class="mouth-speaking"><ellipse cx="201" cy="246" rx="15" ry="8" fill="#663d3c"/><path d="M188 242 Q201 239 214 242 L211 246 H191Z" fill="#fff0d9"/><ellipse cx="201" cy="250" rx="8" ry="2.5" fill="#c47d7b"/></g></g>
 <path d="M184 269 Q201 274 217 268" fill="none" stroke="#d7a387" stroke-width="2" opacity=".65"/>
 ${hairFront}${female?'<circle cx="113" cy="218" r="4" fill="#d3b77f"/><circle cx="287" cy="218" r="4" fill="#d3b77f"/>':''}
 </g></svg>`;
 const el=document.createElement('div');el.className='performer';el.dataset.actor=id;el.dataset.position='off';el.dataset.expression='calm';el.setAttribute('role','img');el.innerHTML=svg.replace(/\b(SKIN|HAIR|COAT|SHIRT|CHEEK)\b/g,x=>`${uid}-${x}`);setExpression(el,'calm');return el;
}
export function setExpression(el,name){if(!EXPRESSIONS.includes(name))throw Error('Unknown rehearsal expression');const f=FACES[name],id=el.dataset.actor;el.dataset.expression=name;el.setAttribute('aria-label',`${CHARACTERS[id].name}，${EXPRESSION_LABELS[name]}，分層向量佔位立繪`);el.querySelectorAll('[data-brow]').forEach((p,i)=>p.setAttribute('d',f.brows[i]));el.querySelectorAll('.eye-white').forEach((p,i)=>p.setAttribute('d',f.eyes[i]));el.querySelectorAll('.iris,.pupil').forEach(p=>p.setAttribute('cy',f.irisY));const m=el.querySelector('.mouth-rest');m.setAttribute('d',f.mouth);m.setAttribute('fill',name==='happy'||name==='shocked'?'#774d46':'none');}
