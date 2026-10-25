/** Browser-safe numeric facts shared by compiler and React. No callbacks are executed. */
export function createSliderModel(props={}){
 const {mode='single',min=0,max=100,step=1,value,thumbLabels}=props;
 const text=v=>typeof v==='string'&&v.trim().length>0;
 if(!['single','range'].includes(mode))throw TypeError('Unsupported Slider mode');
 const count=(max-min)/step,tolerance=1e-7;
 if(![min,max,step].every(Number.isFinite)||max<=min||step<=0||min+step===min||max-step===max||!Number.isSafeInteger(Math.round(count))||Math.round(count)<1||Math.abs(count-Math.round(count))>tolerance)throw TypeError('Slider requires finite bounds and an evenly divided, representable step');
 const values=mode==='range'?value:[value];
 const aligned=n=>Number.isFinite(n)&&n>=min&&n<=max&&Math.abs((n-min)/step-Math.round((n-min)/step))<=tolerance;
 if(!Array.isArray(values)||values.length!==(mode==='range'?2:1)||!values.every(aligned)||mode==='range'&&(values[0]>values[1]||!Array.isArray(thumbLabels)||thumbLabels.length!==2||!thumbLabels.every(text)))throw TypeError('Slider value must be ordered and aligned to its step; range thumbs need names');
 const places=n=>{const[base,exponent='0']=n.toString().toLowerCase().split('e');return Math.max(0,(base.split('.')[1]?.length??0)-Number(exponent));};
 const factor=10**Math.max(places(min),places(step)),minUnits=Math.round(min*factor),stepUnits=Math.round(step*factor),steps=Math.round(count);
 const exact=[factor,minUnits,stepUnits,steps*stepUnits,minUnits+steps*stepUnits].every(Number.isSafeInteger)&&stepUnits>0;
 return {mode,min,max,step,steps,values:[...values],grid:exact?{factor,minUnits,stepUnits}:null,thumbs:values.map((n,index)=>({index,value:n,min:mode==='range'&&index===1?values[0]:min,max:mode==='range'&&index===0?values[1]:max,position:(n-min)/(max-min)*100,...(mode==='range'?{label:thumbLabels[index]}:{})}))};
}
/** Global rail snap or a thumb-constrained intent. Neither mutates the authored model. */
export function snapSliderValue(model,value,index){
 if(!Number.isFinite(value)||index!==undefined&&(!Number.isInteger(index)||index<0||index>=model.values.length))throw TypeError('Invalid Slider intent');
 const tick=Math.min(model.steps,Math.max(0,Math.round((value-model.min)/model.step))),grid=model.grid;
 const next=Math.min(model.max,Math.max(model.min,grid?(grid.minUnits+tick*grid.stepUnits)/grid.factor:model.min+tick*model.step));
 return index===undefined?next:Math.min(model.thumbs[index].max,Math.max(model.thumbs[index].min,next));
}
