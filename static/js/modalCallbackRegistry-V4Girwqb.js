const c=new Map;function e(){return`cb-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}function n(a){const t=e();c.set(t,a);try{console.log(`modalCallbackRegistry: registerCallback -> ${t}`)}catch{}return t}export{n as registerCallback};
//# sourceMappingURL=modalCallbackRegistry-V4Girwqb.js.map
