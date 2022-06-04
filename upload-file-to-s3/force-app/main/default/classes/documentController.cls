public with sharing class documentController {

@AuraEnabled(cacheable=true)
public static List<Document__c> getDocuments() {
    return [SELECT id, 
                    name ,
                    file_name__c,
                    Application__c,
                    CreatedDate
            FROM Document__c            
            ORDER BY CreatedDate DESC
            LIMIT 50];
}

@AuraEnabled(cacheable=true)
public static List<Document__c> getDocumentsbyApp(id parentId) {
    return [SELECT id, 
                    name ,
                    file_name__c,
                    Application__c,
                    CreatedDate
            FROM Document__c        
            WHERE Application__c = :parentId    
            ORDER BY CreatedDate DESC
            LIMIT 50];
}
}