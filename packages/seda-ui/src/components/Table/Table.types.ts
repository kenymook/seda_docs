import type {CSSProperties, HTMLAttributes, ReactNode} from 'react';

export interface TableSort {key:string; direction:'ascending'|'descending'}
export interface TableCellContext {disabled:boolean; loading:boolean}
export interface TableColumn<Row> {
  key:string;
  header:string;
  type:'text'|'numeric'|'status'|'date'|'link'|'avatar'|'custom'|'actions';
  /** Formatting and units belong to the application. Never coerce objects into strings. */
  render:(row:Row, context:TableCellContext)=>ReactNode;
  align?:'start'|'center'|'end';
  width?:CSSProperties['width'];
  sortable?:boolean;
}
export interface TablePagination {
  page:number;
  pageSize:number;
  total:number;
  onPageChange:(page:number)=>void;
}
/** Native data table. Data transforms and remote request ownership remain controlled by its caller. */
export interface TableProps<Row> extends Omit<HTMLAttributes<HTMLDivElement>,'children'> {
  label:string;
  columns:readonly TableColumn<Row>[];
  data:readonly Row[];
  rowKey:(row:Row)=>string;
  rowLabel?:(row:Row)=>string;
  density?:'compact'|'medium'|'comfortable';
  striped?:boolean;
  bordered?:boolean;
  fixedHeader?:boolean;
  maxHeight?:CSSProperties['maxHeight'];
  minWidth?:CSSProperties['minWidth'];
  sort?:TableSort|null;
  onSortChange?:(sort:TableSort|null)=>void;
  selectedRowKeys?:readonly string[];
  onSelectionChange?:(keys:string[])=>void;
  selectionLabel?:string;
  isRowDisabled?:(row:Row)=>boolean;
  expandedRowKeys?:readonly string[];
  onExpandedChange?:(keys:string[])=>void;
  renderExpanded?:(row:Row)=>ReactNode;
  rowActions?:(row:Row,context:TableCellContext)=>ReactNode;
  actionsLabel?:string;
  toolbar?:ReactNode;
  footer?:ReactNode;
  pagination?:TablePagination;
  loading?:boolean;
  loadingLabel?:string;
  emptyState?:ReactNode;
  errorState?:ReactNode;
  onRetry?:()=>void;
  retryLabel?:string;
}
