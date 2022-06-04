({
     cmsearchKeyChange: function(component, event, helper) {
         var myEvent = $A.get("e.c:cmSearchKeyChange");
         myEvent.setParams({"searchKey": event.target.value});
         myEvent.fire();
     }
 })