/** Same seven speeches and 42-second budget. No extra narrative or legal result. */
export const ACTING={
 quiet:{lead:650,hold:0,camera:'wide',reaction:{player:180,brother:350,sister:0},gaze:{player:[5,0],brother:[-5,1],sister:[-2,1]},heads:{player:.25,brother:-.2,sister:-.45},shoulders:{player:0,brother:.3,sister:0},blink:[['brother',2400],['player',3860],['sister',4850]],breath:[['sister',1300,.55]]},
 memory:{lead:780,hold:0,camera:'wide',reaction:{player:60,brother:620,sister:420},gaze:{player:[-2,4],brother:[-5,0],sister:[-3,1]},heads:{player:1.1,brother:-.35,sister:-.25},shoulders:{player:1.2,brother:0,sister:0},blink:[['player',3150],['sister',4780]],breath:[['player',1850,.65]]},
 objection:{lead:1000,hold:1350,camera:'brother',reaction:{brother:80,player:420,sister:720},gaze:{player:[6,0],brother:[-6,0],sister:[5,0]},heads:{player:0,brother:-.55,sister:.2},shoulders:{player:0,brother:.55,sister:0},blink:[['brother',4120]],breath:[]},
 surprise:{lead:1150,hold:1000,camera:'player',reaction:{player:0,brother:740,sister:500},gaze:{player:[5,0],brother:[-5,0],sister:[-3,3]},heads:{player:.25,brother:-.15,sister:.7},shoulders:{player:.25,brother:.8,sister:.7},blink:[['player',3280],['sister',4350]],breath:[]},
 pressure:{lead:650,hold:0,camera:'hold',reaction:{brother:100,player:600,sister:900},gaze:{player:[5,1],brother:[-2,4],sister:[4,2]},heads:{player:.55,brother:1.35,sister:.8},shoulders:{player:.7,brother:2.2,sister:.5},blink:[['brother',2620],['player',5120]],breath:[['brother',3600,1.15]]},
 listen:{lead:800,hold:0,camera:'wide',reaction:{sister:80,brother:650,player:430},gaze:{player:[5,0],brother:[-5,0],sister:[-3,0]},heads:{player:.45,brother:.6,sister:-.6},shoulders:{player:.3,brother:1,sister:.1},blink:[['sister',3180],['brother',4820]],breath:[['sister',1900,.55]]},
 pause:{lead:550,hold:0,camera:'wide',reaction:{player:50,brother:560,sister:890},gaze:{player:[6,0],brother:[-6,0],sister:[-2,0]},heads:{player:-.2,brother:.3,sister:0},shoulders:{player:0,brother:.7,sister:0},blink:[['player',2270],['brother',3970]],breath:[['player',1500,.6]]},
};
export function glyphDelay(char){return /[。！？]/.test(char)?410:/[…]/.test(char)?300:/[，、；：]/.test(char)?170:46;}
export function mouthAperture(index,char){if(/[\s。，！？、；：…「」]/.test(char))return 0;return [.30,0,.17,.38,0,.23,.12,0][index%8];}
