export const nextReleaseVersion=current=>current?current.split('.').map((part,index)=>index===2?String(Number(part)+1):part).join('.'):'0.1.0';
/** Isolated UX prototype. No network, D1, package publication or production writes. */
export const scenarios=[['ready','Готовый черновик'],['empty','Нет изменений'],['first','Первый выпуск'],['offline','Нет сети'],['syncing','Сохранение'],['conflict','Конфликт черновика'],['invalid','Ошибка ссылки'],['warning','Предупреждение'],['stale','Изменения после проверки'],['error','Ошибка выпуска'],['unknown','Ответ потерян'],['incompatible','Новая база токенов']];
export function initialReleaseState(scenario='ready'){
 return {scenario,revision:12,validatedRevision:null,acknowledged:false,phase:scenario==='unknown'?'unknown':'idle',current:scenario==='first'?null:'0.6.2',history:scenario==='first'?[]:[{version:'0.6.2',description:'Текущая конфигурация',rollbackOf:null,edits:{}},{version:'0.6.1',description:'Базовые роли и состояния',rollbackOf:null,edits:{}}],message:'',draft:scenario!=='empty',operation:null};
}
export function releaseBlocker(s){
 if(s.phase==='checking'||s.phase==='publishing'||s.phase==='restoring')return 'Операция уже выполняется';
 if(!s.draft)return 'Нет изменений для выпуска';
 const blockers={offline:'Изменения пока сохранены только на этом устройстве.',syncing:'Дождитесь сохранения черновика.',conflict:'Сначала разрешите конфликт черновика.',invalid:'Исправьте ссылку на отсутствующую роль.',incompatible:'База токенов обновилась. Нужно перенести изменения.',unknown:'Сначала узнайте результат предыдущего выпуска.'};
 if(blockers[s.scenario]&&s.scenario!=='unknown')return blockers[s.scenario];
 if(s.phase==='unknown')return blockers.unknown;
 if(s.validatedRevision!==s.revision)return 'Проверьте текущие изменения';
 if(s.scenario==='warning'&&!s.acknowledged)return 'Подтвердите просмотр предупреждения';
 return null;
}
export function transitionRelease(s,event){
 switch(event.type){
 case 'scenario':return initialReleaseState(event.value);
 case 'check':if(['offline','syncing','conflict','incompatible'].includes(s.scenario)||!s.draft||['checking','publishing','restoring','unknown'].includes(s.phase))return s;return {...s,phase:'checking',validatedRevision:null,acknowledged:false,message:''};
 case 'checked':if(s.phase!=='checking'||event.revision!==s.revision)return s;return {...s,phase:'idle',validatedRevision:s.scenario==='invalid'?null:s.revision,message:s.scenario==='invalid'?'Проверка нашла ошибку':'Проверки завершены'};
 case 'edit':return {...s,phase:s.phase==='checking'?'idle':s.phase,revision:s.revision+1,validatedRevision:null,acknowledged:false,draft:true,message:'Черновик изменился. Проверьте его заново.'};
 case 'acknowledge':return {...s,acknowledged:event.value};
 case 'publish':if(releaseBlocker(s))return s;return {...s,phase:'publishing',publishingRevision:s.revision,publicationEdits:{...(event.edits??{})},operation:event.operation,message:''};
 case 'failed':if(s.phase!=='publishing'||s.operation!==event.operation)return s;return {...s,phase:'error',message:'Выпуск не создан. Текущая версия и черновик сохранены.'};
 case 'unknown':if(s.phase!=='publishing'||s.operation!==event.operation)return s;return {...s,phase:'unknown',message:'Не удалось получить ответ. Выпуск мог завершиться.'};
 case 'published':if(!['publishing','unknown'].includes(s.phase)||s.operation!==event.operation)return s;{const version=nextReleaseVersion(s.current);return {...s,phase:'success',draft:s.publishingRevision!=null&&s.revision!==s.publishingRevision,validatedRevision:null,current:version,history:[{version,description:event.description||'Обновление оформления Select',rollbackOf:null,edits:{...(s.publicationEdits??{})}},...s.history],message:'Версия '+version+' выпущена в прототипе.'};}
 case 'restore':if(['publishing','unknown','restoring'].includes(s.phase)||event.version===s.current||!s.history.some(item=>item.version===event.version))return s;return {...s,phase:'restoring',restoreTarget:event.version,operation:event.operation,message:''};
 case 'restored':if(s.phase!=='restoring'||s.operation!==event.operation||s.restoreTarget!==event.version)return s;{const version=nextReleaseVersion(s.current);return {...s,current:version,phase:'success',validatedRevision:null,history:[{version,description:'Возврат к '+event.version,rollbackOf:event.version,edits:{...(s.history.find(item=>item.version===event.version)?.edits??{})}},...s.history],message:'Создана '+version+' из '+event.version+'. Черновик сохранён; нужна повторная проверка.'};}
 case 'resolve':return {...s,scenario:'ready',conflictResolution:event.choice??s.conflictResolution,phase:'idle',revision:s.revision+1,validatedRevision:null,message:'Черновик согласован. Нужна новая проверка.'};
 case 'reset':if(['publishing','unknown','restoring'].includes(s.phase))return s;return {...s,draft:false,validatedRevision:null,message:'Изменения черновика отменены. Выпущенная версия не изменилась.'};
 default:return s;
 }
}
