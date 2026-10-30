/** Surface availability, deliberately independent of spec `ready` and acceptance. */
export function componentAvailability(catalog,id){
 const entry=catalog.entries.find(item=>item.id===id);
 if(entry?.runtime.status==='exported'&&entry.preview.status==='registered')return{kind:'live',label:'Live preview',description:'Реальный компонент @seda-ai/ui. Регистрация preview не означает полную приёмку.'};
 if(entry?.runtime.status==='exported')return{kind:'runtime',label:'Runtime · no preview',description:'Публичный компонент есть в @seda-ai/ui, но Studio preview пока не подключён. Здесь доступны цветовые токены.'};
 return{kind:'tokens',label:'Tokens only',description:entry?'В Studio доступны цветовые токены. Публичный React runtime для этой записи отсутствует.':'Покрытие не подтверждено каталогом; доступные токены не доказывают наличие React runtime.'};
}
