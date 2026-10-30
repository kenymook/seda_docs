/** Serializable numeric-buffer facts. A missing/Mixed/partial value is never zero. */
export function createNumberFieldModel({value,min,max,step=1,mixed=false}={}) {
  if(typeof value!=='string'||typeof mixed!=='boolean'||!Number.isFinite(step)||step<=0||min!==undefined&&!Number.isFinite(min)||max!==undefined&&!Number.isFinite(max)||min!==undefined&&max!==undefined&&min>max)throw TypeError('NumberField requires a string buffer, finite ordered bounds and a positive step');
  const text=value.trim(),empty=text==='';
  const syntax=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text),number=syntax?Number(text):NaN;
  const known=Number.isFinite(number),partial=/^[+-]?\d*(?:\.\d*)?$/.test(text)||/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)e[+-]?$/i.test(text);
  return {raw:value,value:known?number:null,min:min??null,max:max??null,step,mixed:empty&&mixed,numericState:empty?(mixed?'mixed':'empty'):known?'number':partial?'incomplete':'invalid',outOfRange:known&&(min!==undefined&&number<min||max!==undefined&&number>max)};
}

// Decimal strings avoid cumulative .1+.2 errors without rounding large offsets
// to a fixed number of significant digits. The final result is still a JS number.
function add(value,step,multiple) {
  const parts=n=>{const [base,exp='0']=String(n).toLowerCase().split('e');const fraction=base.split('.')[1]?.length??0;return {integer:BigInt(base.replace('.','')),scale:fraction-Number(exp)};};
  const a=parts(value),b=parts(step),scale=Math.max(a.scale,b.scale);
  const sum=a.integer*10n**BigInt(scale-a.scale)+BigInt(multiple)*b.integer*10n**BigInt(scale-b.scale);
  return Number(sum.toString()+'e'+String(-scale));
}

/** A string intent only. The controlled owner decides whether to accept it. */
export function stepNumberFieldValue(model,key) {
  let next;
  if(key==='Home')next=model.min;
  else if(key==='End')next=model.max;
  else {
    const amounts={ArrowUp:1,ArrowDown:-1,PageUp:10,PageDown:-10};
    if(!Object.hasOwn(amounts,key))throw TypeError('Unsupported NumberField step key');
    if(model.value===null)return undefined;
    next=add(model.value,model.step,amounts[key]);
    next=Math.max(model.min??-Infinity,Math.min(model.max??Infinity,next));
  }
  if(next===null||!Number.isFinite(next)||next===model.value)return undefined;
  return String(next);
}
