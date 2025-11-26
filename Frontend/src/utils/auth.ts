export function getToken(){
  return localStorage.getItem('token');
}

export function parseToken(token?: string){
  try{
    const t = token || getToken();
    if(!t) return null;
    const parts = t.split('.');
    if(parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  }catch(e){ return null; }
}

export function isAdmin(){
  const p = parseToken();
  return !!(p && p.isAdmin);
}
