import test from 'node:test';
import assert from 'node:assert/strict';
import {limits,calendarMonth} from '../lib/entitlements.ts';
import {monthlyPricesInCents} from '../lib/pricing.ts';
import {createSocialState,guardedSocialReducer,remainingMessages,canReceive,visibleMessages,accessReason} from '../lib/social.ts';
import {createExtensionState,extensionReducer,workspace,weeklyDates,calendarFile,roleCan} from '../lib/extensions.ts';
const now=Date.parse('2026-09-20T10:00:00Z'), context={key:'self:Organisation',category:'Organisation',premium:true,now};
const act=(s,action,c=context)=>extensionReducer(s,{action,context:c});
const get=s=>workspace(s,context.key);
test('workbook quotas and owner clarification',()=>{
 assert.deepEqual(monthlyPricesInCents,{Sportif:299,Professionnel:1499,Organisation:2999});
 assert.equal(limits('Sportif',false).contacts,3);assert.equal(limits('Organisation',false).contacts,5);
 assert.equal(limits('Professionnel',false).publish,true);assert.equal(limits('Organisation',false).publish,false);
 assert.equal(limits('Sportif',false).photos,3);assert.equal(limits('Organisation',false).videoSeconds,60);assert.equal(limits('Organisation',true).videoSeconds,180);
 assert.equal(limits('Professionnel',false).offers,0);assert.equal(limits('Organisation',false).offers,1);
 assert.equal(calendarMonth(Date.parse('2026-09-30T22:00:00Z')),'2026-10');
});
test('new contacts count once; replies, comments, received messages always free',()=>{
 const c={category:'Sportif',month:'2026-09'};let s=createSocialState();
 const send=(id)=>{s=guardedSocialReducer(s,{context:c,action:{type:'open-chat',id}});s=guardedSocialReducer(s,{context:c,action:{type:'message',id,message:{id:crypto.randomUUID(),text:'Bonjour',mine:true}}});};
 send('lea');assert.equal(remainingMessages(s,c.month),3); // existing conversation
 for(const id of ['ines','camille','sam'])send(id);
 assert.equal(remainingMessages(s,c.month),0);send('academie');assert.equal(s.gate,'quota');
 send('sam');assert.equal(remainingMessages(s,c.month),0);assert.equal(remainingMessages(s,'2026-10'),3);
 for(const category of ['Sportif','Professionnel','Organisation']){assert.equal(canReceive(s,category),true);assert.equal(accessReason(s,{...c,category},'comment','sam'),null);}
});
test('saved search quota, premium alerts, new matches deduplicated',()=>{
 let s=createExtensionState(),q={id:'q',name:'Tennis Bruxelles',kind:'people',filters:{sport:'Tennis'},alerts:false,seen:['lea']};
 s=act(s,{type:'search',value:q},{...context,premium:false});assert.equal(get(s).searches.length,1);
 assert.match(act(s,{type:'search',value:{...q,id:'q2'}},{...context,premium:false}).error,/Limite/);
 s=act(s,{type:'search',value:{...q,alerts:true}});s=act(s,{type:'search-check',id:'q',results:['lea','new']});assert.equal(get(s).notices.length,1);
 s=act(s,{type:'search-check',id:'q',results:['lea','new']});assert.equal(get(s).notices.length,1);
});
test('scheduled publication requires future date, moderation, premium; downgrade pauses',()=>{
 const value={id:'p',text:'Au tennis ce soir',sport:'Tennis',start:'2026-10-01T10:00:00Z',status:'planned'};let s=act(createExtensionState(),{type:'schedule',value});
 assert.equal(get(s).schedules.length,1);assert.match(act(s,{type:'schedule-status',id:'p',status:'published'},{...context,premium:false}).error,/Premium/);
 assert.ok(act(s,{type:'schedule',value:{...value,id:'old',start:'2020-01-01'}}).error);
 s=act(s,{type:'schedule-status',id:'p',status:'published'});assert.equal(get(s).schedules[0].status,'published');
});
test('lists enforce combined quota; notes require premium',()=>{
 let s=act(createExtensionState(),{type:'list',id:'l',name:'Talents'},{...context,premium:false});
 for(let i=0;i<20;i++)s=act(s,{type:'talent',list:'l',id:String(i)},{...context,premium:false});
 assert.equal(get(s).lists[0].profiles.length,20);assert.match(act(s,{type:'talent',list:'l',id:'21'},{...context,premium:false}).error,/Limite/);
 assert.match(act(s,{type:'talent',list:'l',id:'1',note:'Privé'},{...context,premium:false}).error,/Premium/);
 s=act(s,{type:'talent',list:'l',id:'1',note:'Privé',step:'Contacté'});assert.equal(get(s).lists[0].profiles[1].note,'Privé');
});
test('team relation is not confirmed without simulated member consent',()=>{
 let s=act(createExtensionState(),{type:'team',value:{id:'t',name:'U18',sport:'Football',description:'',need:'',eventIds:[],links:[]}},{...context,premium:false});
 s=act(s,{type:'link',team:'t',id:'lea',role:'Joueur'});assert.equal(get(s).teams[0].links[0].status,'pending');
 s=act(s,{type:'link-reply',team:'t',id:'lea',accept:true});assert.equal(get(s).teams[0].links[0].status,'confirmed');
});
test('five managers including owner, permission checks, owner cannot be removed',()=>{
 let s=createExtensionState();for(let i=1;i<=4;i++){s=act(s,{type:'manager',value:{id:String(i),name:'Gestionnaire '+i,role:'viewer',status:'invited'}});s=act(s,{type:'manager-activate',id:String(i)});}
 assert.equal(get(s).managers.length,5);assert.ok(act(s,{type:'manager',value:{id:'6',name:'Sixième',role:'admin'}}).error);
 s=act(s,{type:'manager-switch',id:'1'});assert.equal(roleCan(get(s),'recruit'),false);assert.ok(act(s,{type:'list',id:'x',name:'Interdit'}).error);
 s=act(s,{type:'manager-switch',id:'owner'});assert.ok(act(s,{type:'manager-remove',id:'owner'}).error);
});
test('group trials reject over-capacity and accept individual replies',()=>{
 let value={id:'s',title:'Détection',start:'2026-10-01T10:00:00Z',place:'Club',capacity:1,participants:[{id:'lea',status:'invited'}]};let s=act(createExtensionState(),{type:'session',value});
 s=act(s,{type:'session-reply',id:'s',person:'lea',accept:true});assert.equal(get(s).sessions[0].participants[0].status,'accepted');
 assert.ok(act(s,{type:'session',value:{...value,id:'s2',capacity:0}}).error);
});
test('interview needs all approvals and refuses collisions',()=>{
 const value={id:'i',candidate:'lea',staff:['owner'],start:'2026-10-01T10:00:00Z',place:'Club',accepted:[],status:'proposed'};let s=act(createExtensionState(),{type:'interview',value});
 s=act(s,{type:'interview-reply',id:'i',person:'owner',accept:true});assert.equal(get(s).interviews[0].status,'proposed');
 s=act(s,{type:'interview-reply',id:'i',person:'lea',accept:true});assert.equal(get(s).interviews[0].status,'confirmed');
 assert.match(act(s,{type:'interview',value:{...value,id:'i2'}}).error,/chevauche/);
});
test('invitation stages, isolated workspaces, recurrence and calendar export',()=>{
 let s=act(createExtensionState(),{type:'invitation',id:'a',name:'Contact fictif'});for(let i=0;i<6;i++)s=act(s,{type:'invitation-progress',id:'a'});
 assert.equal(get(s).invitations[0].status,'qualified');assert.equal(workspace(s,'other').invitations.length,0);
 assert.equal(weeklyDates('2026-10-01T10:00:00Z',4).length,4);assert.deepEqual(weeklyDates('invalid',4),[]);
 const ics=calendarFile([{id:'t',title:'Match, test',start:'2026-10-01T10:00:00Z',minutes:90,place:'Club'}],15);
 assert.match(ics,/DTEND:20261001T113000Z/);assert.match(ics,/TRIGGER:-PT15M/);assert.ok(ics.includes('SUMMARY:Match\\, test'));
});
