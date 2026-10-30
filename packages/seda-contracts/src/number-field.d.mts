export interface NumberFieldModel {
  raw:string;value:number|null;min:number|null;max:number|null;step:number;mixed:boolean;
  numericState:'empty'|'mixed'|'number'|'incomplete'|'invalid';outOfRange:boolean;
}
export function createNumberFieldModel(props:{value:string;min?:number|undefined;max?:number|undefined;step?:number|undefined;mixed?:boolean|undefined}):NumberFieldModel;
export function stepNumberFieldValue(model:NumberFieldModel,key:'ArrowUp'|'ArrowDown'|'PageUp'|'PageDown'|'Home'|'End'):string|undefined;
