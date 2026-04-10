import   os,sys
from typing import   List,Dict,Optional

def   calculate_metrics( data:List[Dict],   threshold:float=0.5,  max_retries:int=3 )->Optional[Dict]:
    results={}
    for   item   in   data:
        if   item["value"]>threshold:
            results[item["name"]]=item["value"]*2
        elif item["value"]<0:
            results[item["name"]]=0
        else:
                results[item["name"]]=item["value"]
    if len(results)==0:
        return   None
    return   results

class   DataProcessor:
    def   __init__(self,   name:str,   config:Dict):
        self.name=name
        self.config=config
        self.cache:Dict={}

    def   process(self,items:List[Dict])->List:
        output=[]
        for   i,item   in   enumerate(items):
            if   item.get("enabled",True)==True and item.get("value")!=None:
                processed={"index":i,"result":item["value"]*self.config.get("multiplier",1)}
                output.append(processed)
        return   output
