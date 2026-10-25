export interface SliderNumericInput { mode?: 'single'|'range'; min?: number; max?: number; step?: number; value: number|readonly [number,number]; thumbLabels?:readonly [string,string]|undefined; }
export interface SliderModel {mode:'single'|'range';min:number;max:number;step:number;steps:number;values:[number]|[number,number];grid:{factor:number;minUnits:number;stepUnits:number}|null;thumbs:{index:number;value:number;min:number;max:number;position:number;label?:string}[];}
export function createSliderModel(props:SliderNumericInput):SliderModel;
export function snapSliderValue(model:SliderModel,value:number,index?:number):number;
