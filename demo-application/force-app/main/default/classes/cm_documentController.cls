public with sharing class cm_documentController {

    @AuraEnabled(cacheable=true)
    public static List<Document_File__c> getDocuments() {
        return [SELECT id, 
                        name ,
                        file_name__c,
                        Application__c,
                        CreatedDate
                FROM Document_File__c            
                ORDER BY CreatedDate DESC
                LIMIT 50];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Document_File__c> getDocumentsbyApp(String docId) {
        system.debug('recordId: ' + docId);
        return [SELECT id, 
                        name ,
                        file_name__c,
                        Application__c,
                        CreatedDate
                FROM Document_File__c        
                WHERE Application__c = :docId    
                ORDER BY CreatedDate DESC
                LIMIT 50];
    }
    }