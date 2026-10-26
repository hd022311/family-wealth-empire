import{RehearsalClock}from'../../clock.mjs';
/** One pending timer, ordered cues, no background catch-up and no permanent render loop. */
export class CuePlayer{
 constructor(events,onCue,onState=()=>{},clock=new RehearsalClock()){this.events=events;this.onCue=onCue;this.onState=onState;this.clock=clock;this.index=0;this.playing=false;this.started=false;this.lastAt=0;}
 start(){this.stop();this.started=true;this.playing=true;this.index=0;this.lastAt=0;this.onState();this.dispatch();}
 dispatch(){const cue=this.events[this.index];if(!cue){this.finish();return;}this.onCue(cue);this.lastAt=cue.at;this.index++;if(cue.kind==='end'||this.index>=this.events.length){this.finish();return;}this.clock.arm(this.events[this.index].at-cue.at,()=>this.dispatch());}
 pause(){if(!this.playing)return;this.clock.pause();this.playing=false;this.onState();}
 resume(){if(!this.started||this.playing)return;this.playing=true;this.clock.resume();this.onState();}
 finish(){this.clock.cancel();this.playing=false;this.started=false;this.onState();}
 stop(){this.clock.cancel();this.playing=false;this.started=false;this.index=0;this.lastAt=0;this.onState();}
}
