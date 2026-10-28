import {CAST} from '../story.mjs';
export const NAME_BACKGROUND='#07111e';
export const SPEAKERS=Object.freeze({
 player:{label:'主角',color:'#9bd9ff'},father:{label:'父親',color:'#f5d38b'},mother:{label:'母親',color:'#f1b7ca'},
 brother:{label:'哥哥',color:'#ffb29b'},sister:{label:'妹妹',color:'#c8beff'},spouse:{label:'配偶',color:'#a7e1c0'},
});
export function speakerFor(id){const spec=SPEAKERS[id];return spec?{...spec,name:CAST[id].name,text:`${CAST[id].name}（${spec.label}）`}:{label:'旁白',name:'那一天',text:'那一天',color:'#d9e2eb'};}
export function contrast(a,b){const luminance=hex=>{const v=hex.replace('#','').match(/../g).map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
