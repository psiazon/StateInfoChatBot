import { useEffect, useRef, useState } from 'react';
import { Bot, Send, RotateCcw, Globe2, AlertCircle, Sparkles } from 'lucide-react';
type Message = {role:'user'|'assistant';content:string;error?:boolean};
const starter:Message={role:'assistant',content:'Hello! I’m your StateInfo assistant. Ask me about U.S. states, populations, or information in the connected knowledge base.'};
const suggestions=['What is the capital of Illinois?','Tell me about California','Which states have large populations?'];
const endpoint=import.meta.env.VITE_AGENT_API_URL || '/api/agent/chat';
const THREAD_KEY = 'stateinfo-thread-id';
const MESSAGES_KEY = 'stateinfo-chat-messages';
function getThreadId(): string {
 let id = sessionStorage.getItem(THREAD_KEY);
 if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(THREAD_KEY, id); }
 return id;
}
function getSavedMessages(): Message[] {
 try {
  const saved = JSON.parse(sessionStorage.getItem(MESSAGES_KEY) || 'null');
  if (Array.isArray(saved) && saved.every((m: any) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')) return saved;
 } catch { /* Invalid cached messages: start fresh. */ }
 return [starter];
}
function extractAnswer(data:any):string {if(typeof data==='string')return data;for(const k of ['answer','response','message','output','result']){const v=data?.[k];if(typeof v==='string')return v;if(v && typeof v==='object' && typeof v.content==='string')return v.content;}if(Array.isArray(data?.messages)){const last=[...data.messages].reverse().find((m:any)=>m.role==='assistant'||m.type==='ai');if(typeof last?.content==='string')return last.content;}throw new Error('The agent returned an unrecognized response format. Update extractAnswer() to match your API.');}
export default function App(){
 const [messages,setMessages]=useState<Message[]>(getSavedMessages);const [draft,setDraft]=useState('');const [loading,setLoading]=useState(false);const [error,setError]=useState('');const bottom=useRef<HTMLDivElement>(null);const thread=useRef(getThreadId());const generation=useRef(0);const busy=useRef(false);const controller=useRef<AbortController|null>(null);
 useEffect(()=>{bottom.current?.scrollIntoView({behavior:'smooth'})},[messages,loading]);
 useEffect(()=>{sessionStorage.setItem(MESSAGES_KEY,JSON.stringify(messages))},[messages]);
 useEffect(()=>()=>{controller.current?.abort()},[]);
 async function send(value=draft){const question=value.trim();if(!question||busy.current)return;busy.current=true;const requestGeneration=generation.current;const abortController=new AbortController();controller.current=abortController;setDraft('');setError('');setMessages(m=>[...m,{role:'user',content:question}]);setLoading(true);
 try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},signal:abortController.signal,body:JSON.stringify({message:question,thread_id:thread.current})});if(!response.ok){const body=await response.text();throw new Error(`Agent returned HTTP ${response.status}: ${body.slice(0,250)}`)}const data=await response.json();if(requestGeneration===generation.current)setMessages(m=>[...m,{role:'assistant',content:extractAnswer(data)}]);}
 catch(e){if(requestGeneration!==generation.current || abortController.signal.aborted)return;const detail=e instanceof Error?e.message:'Unknown error';setError(detail);setMessages(m=>[...m,{role:'assistant',content:'Sorry, I could not reach the StateInfoAgent. Please try again.',error:true}]);}finally{if(requestGeneration===generation.current){busy.current=false;controller.current=null;setLoading(false)}}}
 function reset(){generation.current+=1;controller.current?.abort();controller.current=null;busy.current=false;setLoading(false);thread.current=crypto.randomUUID();sessionStorage.setItem(THREAD_KEY,thread.current);sessionStorage.removeItem(MESSAGES_KEY);setMessages([starter]);setDraft('');setError('')}
 return <div className="layout"><aside className="sidebar"><div className="brand"><span className="brand-icon"><Globe2 size={23}/></span><div><strong>StateInfo</strong><small>AI Knowledge Assistant</small></div></div><div className="side-label">WORKSPACE</div><button className="new-chat" onClick={reset}><RotateCcw size={17}/> New conversation</button><div className="side-bottom"><span className="status-dot"/> Connected to StateInfoAgent <p>Powered by Azure AI Foundry</p></div></aside><main className="main"><header><div className="header-bot"><Bot size={22}/></div><div><strong>StateInfo Assistant</strong><span>Explore state data and knowledge</span></div><div className="header-right"><span className="online-dot"/> Online</div></header><section className="messages"><div className="conversation"><div className="intro"><div className="intro-icon"><Sparkles size={26}/></div><h1>What would you like to know?</h1><p>Ask questions about U.S. states, population data, and your connected documents.</p></div>{messages.map((m,i)=><div className={'message '+m.role} key={i}><div className="avatar">{m.role==='assistant'?<Bot size={19}/>: 'You'}</div><div className="bubble">{m.content}</div></div>)}{loading&&<div className="message assistant"><div className="avatar"><Bot size={19}/></div><div className="bubble typing">Thinking<span>•••</span></div></div>}{error&&<div className="error"><AlertCircle size={15}/> {error}</div>}<div ref={bottom}/></div></section><div className="composer-area">{messages.length<=1&&<div className="suggestions">{suggestions.map(s=><button key={s} onClick={()=>send(s)}>{s}</button>)}</div>}<form className="composer" onSubmit={e=>{e.preventDefault();send()}}><input aria-label="Message" placeholder="Ask StateInfo anything..." value={draft} onChange={e=>setDraft(e.target.value)} disabled={loading}/><button aria-label="Send message" type="submit" disabled={!draft.trim()||loading}><Send size={19}/></button></form><p className="disclaimer">AI-generated answers may be inaccurate. Verify important information.</p></div></main></div>
}
