/** Serializable authored facts only; this cannot certify focus or keyboard behavior. */
export function deriveTree(props) {
  const items=[], ids=new Set();
  function visit(nodes,parent=null,level=1,inheritedDisabled=false,visible=true) {
    if(!Array.isArray(nodes)||level>128)throw new TypeError('Tree requires arrays and at most 128 levels');
    nodes.forEach((node,i)=>{
      if(!node||typeof node.id!=='string'||!node.id.trim()||ids.has(node.id)||typeof node.label!=='string'||!node.label.trim()||(node.disabled!==undefined&&typeof node.disabled!=='boolean'))throw new TypeError('Tree requires unique nonempty ids/labels and boolean disabled');
      ids.add(node.id);const nodeDisabled=inheritedDisabled||node.disabled===true,disabled=props.disabled===true||nodeDisabled;
      if(node.children!==undefined&&!Array.isArray(node.children))throw new TypeError('Tree children must be arrays');
      const branch=!!node.children?.length;
      const expanded=branch&&!nodeDisabled&&(props.expandedIds??props.defaultExpandedIds??[]).includes(node.id);
      items.push({id:node.id,parent,level,position:i+1,count:nodes.length,disabled,visible,branch,expanded});
      if(node.children)visit(node.children,node.id,level+1,nodeDisabled,visible&&expanded);
    });
  }
  for(const state of ['selectedIds','defaultSelectedIds','expandedIds','defaultExpandedIds'])if(props[state]!==undefined&&(!Array.isArray(props[state])||props[state].some(id=>typeof id!=='string')))throw new TypeError('Tree states require string arrays');
  visit(props.items);
  const requested=props.selectedIds??props.defaultSelectedIds??[];
  const selectedIds=items.filter(item=>!item.disabled&&requested.includes(item.id)).map(item=>item.id).slice(0,props.selectionMode==='multiple'?undefined:1);
  return {selectionMode:props.selectionMode??'single',selectionControlled:props.selectedIds!==undefined,expansionControlled:props.expandedIds!==undefined,selectedIds,expandedIds:items.filter(item=>item.expanded).map(item=>item.id),items:items.map(item=>({...item,selected:!item.disabled&&selectedIds.includes(item.id)}))};
}

export function validateTreeState(props) {
  for(const [value,fallback,handler] of [['selectedIds','defaultSelectedIds','onSelectionChange'],['expandedIds','defaultExpandedIds','onExpandedChange']]) {
    if(props[value]!==undefined&&(props[fallback]!==undefined||!(typeof props[handler]==='function'||props[handler]&&typeof props[handler].$handler==='string')))return false;
  }
  return props.selectionMode!=='single'||(props.selectedIds??props.defaultSelectedIds??[]).length<=1;
}
