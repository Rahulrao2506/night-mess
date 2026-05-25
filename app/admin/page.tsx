'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = 'https://night-mess-api.onrender.com';
const statusColors: Record<string,string> = { pending:'#f59e0b',accepted:'#3b82f6',preparing:'#8b5cf6',ready:'#22c55e',completed:'#666',rejected:'#ef4444' };
const statusNext: Record<string,string> = { pending:'accepted',accepted:'preparing',preparing:'ready',ready:'completed' };
const statusLabel: Record<string,string> = { pending:'Accept',accepted:'Start Preparing',preparing:'Mark Ready',ready:'Complete' };
function toDateString(d:Date){return d.toISOString().split('T')[0];}
function isSameDay(a:string,b:string){return a.startsWith(b);}

export default function AdminPage() {
  const router = useRouter();
  const [adminName,setAdminName]=useState("");
  const [authChecked,setAuthChecked]=useState(false);
  const [orders,setOrders]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState('all');
  const [selectedDate,setSelectedDate]=useState(toDateString(new Date()));
  const [refreshing,setRefreshing]=useState(false);

  useEffect(()=>{
    const admin=localStorage.getItem('nm_admin');
    if(!admin){router.push('/admin/login');return;}
    setAdminName(JSON.parse(admin).name);
    setAuthChecked(true);
  },[router]);

  const handleLogout=()=>{localStorage.removeItem('nm_admin');window.location.href='/admin/login';};

  const fetchOrders=async(show=false)=>{
    if(show)setRefreshing(true);
    try{
      const res=await fetch(`${API}/api/orders/all`);
      const data=await res.json();
      if(data.success)setOrders(data.orders);
    }catch(err){}
    setLoading(false);
    if(show)setTimeout(()=>setRefreshing(false),600);
  };

  useEffect(()=>{if(!authChecked)return;fetchOrders();const t=setInterval(fetchOrders,10000);return()=>clearInterval(t);},[authChecked]);

  const updateStatus=async(id:string,status:string)=>{
    await fetch(`${API}/api/orders/${id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
    fetchOrders();
  };

  const rejectOrder=async(id:string)=>{
    await fetch(`${API}/api/orders/${id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'rejected'})});
    fetchOrders();
  };

  const isToday=selectedDate===toDateString(new Date());
  const ordersForDate=orders.filter(o=>isSameDay(o.createdAt,selectedDate));
  const filtered=filter==='all'?ordersForDate:ordersForDate.filter(o=>o.status===filter);
  const revenue=ordersForDate.filter(o=>o.status!=='rejected').reduce((s,o)=>s+(o.totalAmount||0),0);
  const counts={pending:ordersForDate.filter(o=>o.status==='pending').length,preparing:ordersForDate.filter(o=>o.status==='accepted'||o.status==='preparing').length,ready:ordersForDate.filter(o=>o.status==='ready').length,completed:ordersForDate.filter(o=>o.status==='completed').length};

  if(!authChecked)return<div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',color:'#ff6b35',fontFamily:'sans-serif'}}>Verifying...</div>;
  if(loading)return<div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>Loading...</div>;

  return(
    <div style={{minHeight:'100vh',background:'#0a0a0a',color:'#fff',fontFamily:'sans-serif',padding:'20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
        <h1 style={{fontSize:24,fontWeight:800,color:'#ff6b35'}}>🍽️ Admin Dashboard</h1>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>fetchOrders(true)} style={{background:'#1a1a1a',border:'1px solid #333',borderRadius:10,padding:'8px 16px',color:refreshing?'#ff6b35':'#888',fontSize:12,fontWeight:700,cursor:'pointer'}}>
            {refreshing?'🔄 Refreshing...':'🔄 Refresh'}
          </button>
          <button onClick={handleLogout} style={{background:'#1a0a0a',border:'1px solid #3a1a1a',borderRadius:10,padding:'8px 16px',color:'#ef4444',fontSize:12,fontWeight:700,cursor:'pointer'}}>Logout</button>
        </div>
      </div>
      <p style={{color:'#666',fontSize:13,marginBottom:16}}>Welcome, {adminName} · Auto-refreshes every 10s</p>

      <div style={{display:'flex',gap:8,marginBottom:16,alignItems:'center'}}>
        <span style={{color:'#888',fontSize:13}}>📅</span>
        <input type="date" value={selectedDate} max={toDateString(new Date())} onChange={e=>setSelectedDate(e.target.value)}
          style={{background:'#1a1a1a',border:'1px solid #333',borderRadius:10,padding:'8px 12px',color:'#fff',fontSize:13,cursor:'pointer'}}/>
        {!isToday&&<button onClick={()=>setSelectedDate(toDateString(new Date()))} style={{background:'#ff6b3522',border:'1px solid #ff6b3544',borderRadius:8,padding:'6px 12px',color:'#ff6b35',fontSize:12,fontWeight:600,cursor:'pointer'}}>Today</button>}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[{label:'Pending',value:counts.pending,color:'#f59e0b'},{label:'Preparing',value:counts.preparing,color:'#8b5cf6'},{label:'Ready',value:counts.ready,color:'#22c55e'},{label:"Revenue",value:`₹${revenue}`,color:'#ff6b35'}].map(s=>(
          <div key={s.label} style={{background:'#1a1a1a',borderRadius:12,padding:'16px 12px',textAlign:'center',border:'1px solid #2a2a2a'}}>
            <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{fontSize:11,color:'#666',marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:8,marginBottom:20,overflowX:'auto' as const}}>
        {[{key:'all',label:'All',count:ordersForDate.length},{key:'pending',label:'Pending',count:counts.pending},{key:'accepted',label:'Accepted',count:ordersForDate.filter(o=>o.status==='accepted').length},{key:'preparing',label:'Preparing',count:ordersForDate.filter(o=>o.status==='preparing').length},{key:'ready',label:'Ready',count:counts.ready},{key:'completed',label:'Completed',count:counts.completed},{key:'rejected',label:'Rejected',count:ordersForDate.filter(o=>o.status==='rejected').length}].map(f=>(
          <button key={f.key} onClick={()=>setFilter(f.key)} style={{padding:'8px 14px',borderRadius:20,border:'1px solid',fontSize:12,fontWeight:500,cursor:'pointer',flexShrink:0,background:filter===f.key?'#ff6b35':'transparent',borderColor:filter===f.key?'#ff6b35':'#333',color:filter===f.key?'#fff':'#888'}}>
            {f.label}{f.count>0?` (${f.count})`:''}
          </button>
        ))}
      </div>

      {filtered.length===0?(
        <div style={{textAlign:'center',color:'#444',padding:'60px 0',fontSize:14}}>No orders found</div>
      ):filtered.map(order=>(
        <div key={order._id} style={{background:'#1a1a1a',borderRadius:16,padding:'16px 20px',marginBottom:12,border:`1px solid ${order.status==='pending'?'#f59e0b44':'#2a2a2a'}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div>
              <span style={{fontSize:18,fontWeight:800,color:'#ff6b35'}}>#{order.tokenNumber}</span>
              <span style={{fontSize:12,color:'#666',marginLeft:10}}>{new Date(order.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>
            </div>
            <span style={{background:statusColors[order.status]+'22',color:statusColors[order.status],padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,textTransform:'uppercase' as const}}>{order.status}</span>
          </div>
          <div style={{fontSize:12,color:'#888',marginBottom:10}}>👤 {order.student?.name||'Student'} • {order.student?.rollNumber||order.student?.email||''}</div>
          <div style={{marginBottom:12}}>
            {order.items?.map((item:any,i:number)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#ccc',marginBottom:4}}>
                <span>{item.name} × {item.quantity}</span><span>₹{item.price*item.quantity}</span>
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid #2a2a2a',paddingTop:10,marginBottom:14}}>
            <span style={{fontSize:13,color:'#888'}}>Total</span>
            <span style={{fontSize:15,fontWeight:800,color:'#ff9a3c'}}>₹{order.totalAmount}</span>
          </div>
          {isToday&&order.status!=='completed'&&order.status!=='rejected'&&(
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>updateStatus(order._id,statusNext[order.status])} style={{flex:1,padding:'10px',background:'#ff6b35',border:'none',borderRadius:10,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer'}}>
                ✅ {statusLabel[order.status]}
              </button>
              {order.status==='pending'&&(
                <button onClick={()=>rejectOrder(order._id)} style={{padding:'10px 16px',background:'#1a1a1a',border:'1px solid #ef4444',borderRadius:10,color:'#ef4444',fontWeight:700,fontSize:13,cursor:'pointer'}}>❌ Reject</button>
              )}
            </div>
          )}
          {!isToday&&<div style={{fontSize:11,color:'#444',textAlign:'center',padding:'6px',background:'#111',borderRadius:8}}>Past order — view only</div>}
        </div>
      ))}
    </div>
  );
}