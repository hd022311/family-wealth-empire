/** One bounded timeout; pause retains remaining time. No background progression. */
export class RehearsalClock{
 constructor({now=()=>performance.now(),set=(fn,ms)=>setTimeout(fn,ms),clear=id=>clearTimeout(id)}={}){this.now=now;this.set=set;this.clear=clear;this.id=null;this.remaining=0;this.started=0;this.callback=null;}
 arm(ms,fn){this.cancel();this.remaining=ms;this.callback=fn;this.resume();}
 pause(){if(this.id!==null){this.clear(this.id);this.id=null;this.remaining=Math.max(0,this.remaining-(this.now()-this.started));}}
 resume(){if(this.id!==null||!this.callback)return;this.started=this.now();this.id=this.set(()=>{this.id=null;const fn=this.callback;this.callback=null;this.remaining=0;fn?.();},this.remaining);}
 cancel(){if(this.id!==null)this.clear(this.id);this.id=null;this.remaining=0;this.callback=null;}
}
