import {Select} from '@seda-ai/ui';

/** Appearance preference; never writes authored document or canvas typography. */
export function ReferenceTextScale({id,value,onChange}:{id:string;value:number;onChange:(value:number)=>void}){
 const values=[...new Set([80,100,115,150,value])].sort((a,b)=>a-b);
 return <Select id={id} label="Масштаб текста интерфейса" value={String(value)} options={values.map(value=>({value:String(value),label:value+'%'}))} onValueChange={value=>onChange(Number(value))}/>;
}
