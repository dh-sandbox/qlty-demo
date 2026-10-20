// URL helpers
export function buildQuery(params){
  return Object.entries(params).filter(([,value])=>value!==undefined&&value!==null).map(([key,value])=>`${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')
}

export function joinPath( ...parts ) {
      return parts.map((part,index)=>{
    if(index===0){return part.replace(/\/+$/,'')}
        return part.replace(/^\/+|\/+$/g,'')
  }).filter(Boolean).join("/")
}
