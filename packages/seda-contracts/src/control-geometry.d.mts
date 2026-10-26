export interface ControlParameters {
  readonly scale:number;
  readonly extraPaddingInline:number;
  readonly extraPaddingBlock:number;
  readonly radiusScale:number;
  readonly preserveMinimumHeight:boolean;
}
export interface ControlGeometryPreset {
  readonly height:number;readonly font:number;readonly line:number;readonly icon:number;
  readonly radius:number;readonly border:number;readonly buttonPaddingX:number;readonly fieldPaddingX:number;
}
export interface ControlGeometry {
  readonly font:number;readonly line:number;readonly icon:number;readonly basePad:number;readonly py:number;
  readonly raw:number;readonly height:number;readonly radius:number;readonly buttonPaddingX:number;readonly fieldPaddingX:number;
  readonly choiceSize:number;readonly constraint:boolean;readonly parameters:Readonly<ControlParameters>;
}
export const defaultControlParameters:Readonly<ControlParameters>;
export function controlParameterMetadata():{kind:string;schemaVersion:string;experimental:boolean;modelSource:string;defaults:ControlParameters;ranges:Record<string,{min:number;max:number}>;preserveMinimumHeight:string;inheritance:string;sizePriority:string;textScale:string;cssRequirement:string;runtimeConformance:string};
export function normalizeControlParameters(input?:Partial<ControlParameters>,parent?:Readonly<ControlParameters>):Readonly<ControlParameters>;
export function controlParameterVariables(parameters:Partial<ControlParameters>):Record<string,string|number>;
export function deriveControlGeometry(preset:ControlGeometryPreset,parameters?:Partial<ControlParameters>):Readonly<ControlGeometry>;
export function controlGeometryDeclarations():string;
export function controlGeometryVariables(geometry:Readonly<ControlGeometry>):Record<string,string|number>;
