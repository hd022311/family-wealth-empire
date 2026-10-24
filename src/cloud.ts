import {createClient} from '@supabase/supabase-js';
import {fromCloud,type CloudRow,type Slot} from './saves';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const publicLocalDemo=import.meta.env.VITE_PUBLIC_DEMO === "true";
function configure(){if(publicLocalDemo)return null;try{return url&&key?createClient(url,key):null;}catch{return null;}}
export const cloud=configure();
export const cloudConfigured=Boolean(cloud);
export async function listCloud():Promise<Slot[]> {if(!cloud)throw Error('尚未設定 Supabase');const {data,error}=await cloud.from('family_saves').select('*').order('updated_at',{ascending:false});if(error)throw error;return (data as CloudRow[]).map(fromCloud);}
export async function uploadCloud(slot:Slot):Promise<Slot|null>{if(!cloud)throw Error('尚未設定 Supabase');const {data,error}=await cloud.rpc('save_family',{p_id:slot.id,p_name:slot.name,p_snapshot:{version:1,state:slot.state,generations:slot.generations},p_expected_revision:slot.revision});if(error)throw error;return data?.length?fromCloud(data[0]):null;}
