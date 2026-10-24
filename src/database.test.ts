import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {it,expect} from 'vitest';
it('真實 PostgreSQL 引擎：RLS 隔離、禁止直接寫入、CAS 衝突及未登入拒絕',async()=>{
 const db=new PGlite();
 try {
 await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');`);
 await db.exec(readFileSync(new URL('../supabase/migrations/202610230001_family_saves.sql',import.meta.url),'utf8'));
 await db.exec(`set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';`);
 const insert=`select * from public.save_family('10000000-0000-0000-0000-000000000001','林家','{"version":1}',0)`;
 expect((await db.query(insert)).rows).toHaveLength(1);
 expect((await db.query(insert)).rows).toHaveLength(0);
 expect((await db.query(`select * from public.save_family('10000000-0000-0000-0000-000000000001','林家','{"version":1}',1)`)).rows).toHaveLength(1);
 expect((await db.query(`select * from public.save_family('10000000-0000-0000-0000-000000000001','舊裝置','{"version":1}',1)`)).rows).toHaveLength(0);
 await expect(db.exec(`update public.family_saves set name='作弊'`)).rejects.toThrow();
 await db.exec(`set request.jwt.claim.sub='00000000-0000-0000-0000-000000000002';`);
 expect((await db.query('select * from public.family_saves')).rows).toHaveLength(0);
 expect((await db.query(`select * from public.save_family('10000000-0000-0000-0000-000000000001','別人的','{"version":1}',2)`)).rows).toHaveLength(0);
 await db.exec(`set request.jwt.claim.sub='';`);
 await expect(db.query(insert)).rejects.toThrow('authentication required');
 }finally{await db.close();}
},20000);
it('排名結構：禁止客戶端成績與憑據寫入，公開同意可撤回，個人名次隔離',async()=>{
 const db=new PGlite();
 try{
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;insert into auth.users values('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');`);
 await db.exec(readFileSync(new URL('../supabase/migrations/202610230002_rankings_spec.sql',import.meta.url),'utf8'));
 await db.exec(`insert into public.leaderboard_definitions values('net-worth','淨資產','v1','{}',false);
 insert into public.ranking_seasons values('20000000-0000-0000-0000-000000000001','示意季','2026-10-01','2026-11-01','virtual','standard','scenario','v1','initial','seed','prices',24,'planned');
 insert into public.family_public_profiles values('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','暱稱甲','甲家',true),('30000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','暱稱乙','乙家',false);
 insert into public.score_verifications values('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','net-worth',100,24,'log','v1',now());
 insert into public.ranking_snapshots values('50000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','net-worth','30000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',now(),1,null,1,100);
 insert into public.player_achievements values('60000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','legacy','未同意成就',now(),'40000000-0000-0000-0000-000000000001',false);
 set role authenticated;set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';`);
 expect((await db.query('select * from public.public_rankings')).rows).toHaveLength(1);
 const cards=await db.query('select * from public.public_family_cards');expect(cards.rows).toHaveLength(1);expect(Object.keys(cards.rows[0] as object)).toEqual(['id','nickname','family_name']);
 expect((await db.query('select * from public.public_achievements')).rows).toHaveLength(0);
 expect((await db.query('select * from public.my_rankings')).rows).toHaveLength(1);
 for(const table of ['score_verifications','ranking_snapshots','player_achievements'])await expect(db.exec(`insert into public.${table} default values`)).rejects.toThrow();
 await expect(db.query('select * from public.score_verifications')).rejects.toThrow();
 await db.exec(`select public.set_family_visibility('30000000-0000-0000-0000-000000000001',false);`);
 expect((await db.query('select * from public.public_rankings')).rows).toHaveLength(0);
 expect((await db.query('select * from public.my_rankings')).rows).toHaveLength(1);
 await db.exec(`set request.jwt.claim.sub='00000000-0000-0000-0000-000000000002';`);
 expect((await db.query('select * from public.my_rankings')).rows).toHaveLength(0);
 expect((await db.query(`select public.set_family_visibility('30000000-0000-0000-0000-000000000001',true) as changed`)).rows).toEqual([{changed:false}]);
 await db.exec('set role anon');await expect(db.query('select * from public.my_rankings')).rejects.toThrow();
 }finally{await db.close();}
},20000);
