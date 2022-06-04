public with sharing class applicationController {

@AuraEnabled(cacheable=true)
public static List<Application__c> getApplications() {
    return [SELECT id, 
                    name ,
                    Stage__c,
                    CreatedDate
            FROM Application__c
            ORDER BY CreatedDate DESC
            LIMIT 50];
}

@AuraEnabled(cacheable=true)
public static List<Application__c> getApplicationbyId(Id parentId) {
    return [SELECT id, 
                    name ,
                    Stage__c,
                    CreatedDate
            FROM Application__c
            WHERE id = :parentId];
}

}