// Legacy helpers kept for backwards compatibility
export function   clamp(value,min,max){
    if(value<min){return min}
  if (value>max) {
        return max
  }
    return value
}

export const pick=(obj,keys)=>keys.reduce((acc,key)=>{ if(key in obj){acc[key]=obj[key]} return acc},{})

export function formatList( items , separator = ", " ){
  return items.filter(Boolean).map(item=>String(item).trim()).join(separator)
}

