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

    @AuraEnabled(cacheable=true)
    public static List<sObject> getDocumentsbyAppSearch(
                                                String docId,
                                                String searchKey,
                                                String sortBy,
                                                String sortDirection) {
        
        STRING query = 'SELECT id, ' +
                        'name , ' +
                        'file_name__c, ' +
                        'Application__c, ' +
                        'CreatedDate ' +
                'FROM Document_File__c ' +       
                'WHERE Application__c = :docId ';
        
        system.debug('recordId: ' + docId);
        system.debug('query---' + query);
        if ( searchKey != null && searchKey != '' ) {
            String key = '%' + searchKey + '%';
            query += ' AND (File_Name__c LIKE :key';
            query += ' OR Application__r.Name LIKE :key)';
        }
        if ( sortBy != null && sortDirection != null ) {
            query += ' ORDER BY ' + sortBy + ' ' + sortDirection;
        }
        query = query + ' LIMIT 10';

        return Database.query( query );

    }
    }