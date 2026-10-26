/** Source pixels at 1024×1536. No full-face swaps: all variant pixels outside these regions are discarded. */
export const SIZE={width:1024,height:1536};
export const FRAMES={portrait:{x:190,y:0,width:600,height:900},detail:{x:240,y:100,width:440,height:660}};
export const EYE_REGION={x:324,y:238,width:202,height:82};
export const MOUTH_REGION={x:397,y:363,width:102,height:55};
export const EYE_MASKS=[{x:366,y:290,rx:39,ry:20},{x:480,y:265,rx:41,ry:19}];
export const MOUTH_MASKS=[{x:447,y:391,rx:47,ry:25}];
export const PATCH_FILES={half:'eyes-half',closed:'eyes-closed',down:'eyes-down',narrow:'mouth-narrow',open:'mouth-open'};
export const INSPECTION={
 base:{eyes:'base',mouth:'base',label:'基準圖・放鬆閉口'},
 half:{eyes:'half',mouth:'base',label:'眼皮半閉幀'},
 closed:{eyes:'closed',mouth:'base',label:'閉眼幀'},
 down:{eyes:'down',mouth:'base',label:'視線向下幀'},
 narrow:{eyes:'base',mouth:'narrow',label:'輕張口幀'},
 open:{eyes:'base',mouth:'open',label:'張口幀'},
};
export function contains(region,x,y){return x>=region.x&&x<region.x+region.width&&y>=region.y&&y<region.y+region.height;}
export function insideEditableRegion(x,y){return contains(EYE_REGION,x,y)||contains(MOUTH_REGION,x,y);}
