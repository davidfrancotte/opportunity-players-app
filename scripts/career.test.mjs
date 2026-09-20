import test from 'node:test';
import assert from 'node:assert/strict';
import { careerActors,createCareerState,careerReducer,availableSlots,recommendations,appointmentPurposes } from '../lib/career.ts';
import { initialProfile } from '../lib/model.ts';
const actors=careerActors(initialProfile,false), now=Date.parse('2026-09-20T10:00:00Z');
const run=(s,id,action,blocked=[])=>careerReducer(s,{action,context:{actor:actors.find(a=>a.id===id),actors,blocked,now}});
test('recommendations explain sport/location matches, exclude blocked people and wrong audiences',()=>{
 const s=createCareerState();let r=recommendations(s,actors[0],['marc']);
 assert.ok(!r.people.some(x=>x.member.id==='marc'));assert.ok(r.offers.every(x=>x.offer.audience==='Professionnel'));assert.ok(r.people.every(x=>x.reasons.length));
 const next=run(s,'self',{type:'preferences',sport:'Basketball',city:'Liège'});assert.equal(recommendations(next,actors[0],[]).people[0].member.id,'noah');
});
test('applications: single submission, restricted dossier, shortlist, invite, candidate confirms and withdraws',()=>{
 let s=run(createCareerState(),'lea',{type:'apply',id:'a',offerId:'padel-trial'});assert.equal(s.applications.length,1);
 assert.equal(run(s,'lea',{type:'apply',id:'b',offerId:'padel-trial'}).error,'duplicate');
 assert.equal(run(s,'marc',{type:'stage',id:'a',stage:'shortlisted'}).error,'forbidden');
 s=run(s,'horizon',{type:'stage',id:'a',stage:'shortlisted'});assert.equal(s.applications[0].stage,'shortlisted');
 s=run(s,'horizon',{type:'stage',id:'a',stage:'invited',trial:{start:'2026-10-01T10:00:00Z',place:'Club fictif, Namur'}});assert.equal(s.applications[0].stage,'invited');
 assert.equal(run(s,'horizon',{type:'stage',id:'a',stage:'confirmed'}).error,'forbidden');
 s=run(s,'lea',{type:'stage',id:'a',stage:'confirmed'});assert.equal(s.applications[0].stage,'confirmed');
 s=run(s,'lea',{type:'stage',id:'a',stage:'withdrawn'});assert.equal(s.applications[0].stage,'withdrawn');
 assert.equal(run(s,'horizon',{type:'stage',id:'a',stage:'invited'}).error,'transition');
 assert.ok(!JSON.stringify(s.applications[0]).includes('1997-03-21'));
});
test('recruitment requires premium and matching audience; blocked and closed offers reject application',()=>{
 const s=createCareerState(), offer={...s.offers[0],id:'custom',owner:'self'};
 assert.equal(run(s,'self',{type:'offer',offer}).error,'premium');
 assert.equal(run(s,'lea',{type:'apply',id:'a',offerId:'coach'}).error,'ineligible');
 assert.equal(run(s,'lea',{type:'apply',id:'a',offerId:'padel-trial'},['horizon']).error,'ineligible');
 const closed=run(s,'horizon',{type:'close-offer',id:'padel-trial'});
 assert.equal(run(closed,'lea',{type:'apply',id:'a',offerId:'padel-trial'}).error,'ineligible');
});
test('appointments: no slots or booking before professional accepts; wrong actor cannot accept',()=>{
 let s=createCareerState();s=run(s,'marc',{type:'slot',slot:{id:'s',professional:'marc',start:'2026-10-01T10:00:00Z',place:'Visioconférence'}});
 s=run(s,'self',{type:'request',id:'r',professional:'marc',purpose:appointmentPurposes[0]});
 assert.deepEqual(availableSlots(s,s.appointments[0],'self',now),[]);
 assert.equal(run(s,'self',{type:'book',id:'r',slot:'s'}).error,'slot');
 assert.equal(run(s,'lea',{type:'respond',id:'r',accept:true}).error,'forbidden');
 s=run(s,'marc',{type:'respond',id:'r',accept:true});assert.equal(availableSlots(s,s.appointments[0],'self',now).length,1);
 assert.deepEqual(availableSlots(s,s.appointments[0],'lea',now),[]);
 s=run(s,'self',{type:'book',id:'r',slot:'s'});assert.equal(s.appointments[0].status,'booked');
 assert.ok(s.notices.some(n=>n.recipient==='self'));assert.ok(s.notices.some(n=>n.recipient==='marc'));
});
test('appointments: double booking, past dates, overlap and unpaid professional blocked; cancellation releases slot',()=>{
 let s=createCareerState();assert.equal(run(s,'self',{type:'request',id:'r',professional:'sam',purpose:appointmentPurposes[0]}).error,'unavailable');
 assert.equal(run(s,'marc',{type:'slot',slot:{id:'past',professional:'marc',start:'2026-09-01T10:00:00Z',place:'Club'}}).error,'invalid');
 s=run(s,'marc',{type:'slot',slot:{id:'s',professional:'marc',start:'2026-10-01T10:00:00Z',place:'Club'}});
 assert.equal(run(s,'marc',{type:'slot',slot:{id:'s2',professional:'marc',start:'2026-10-01T10:15:00Z',place:'Club'}}).error,'overlap');
 for(const id of ['self','lea']) {s=run(s,id,{type:'request',id,professional:'marc',purpose:appointmentPurposes[0]});s=run(s,'marc',{type:'respond',id,accept:true});}
 s=run(s,'self',{type:'book',id:'self',slot:'s'});assert.equal(run(s,'lea',{type:'book',id:'lea',slot:'s'}).error,'slot');
 assert.equal(run(s,'marc',{type:'remove-slot',id:'s'}).error,'forbidden');
 s=run(s,'self',{type:'cancel',id:'self'});s=run(s,'lea',{type:'book',id:'lea',slot:'s'});assert.equal(s.appointments.find(a=>a.id==='lea').status,'booked');
 assert.equal(run(s,'lea',{type:'reset'}).appointments.length,0);
});
