public with sharing class cm_documentController {
    public class DocumentWrapper {
        @AuraEnabled public String id{get;set;}
        @AuraEnabled public String name{get;set;}
        @AuraEnabled public String fileName{get;set;}
        @AuraEnabled public String applicationName{get;set;}
        @AuraEnabled public Datetime createdDate{get;set;}
        @AuraEnabled public Boolean is_current{get;set;}
        @AuraEnabled public Integer rowNum{get;set;}
    }

 //   @AuraEnabled(cacheable=true)
 //   public static List<Document_File__c> getDocuments() {
 //       return [SELECT id, 
 //                       name ,
 //                       file_name__c,
 //                       Application__c,
 //                       CreatedDate
 //               FROM Document_File__c            
 //               ORDER BY CreatedDate DESC
 //               LIMIT 50];
 //   }

    @AuraEnabled(cacheable=true)
    public static List<cm_documentController.DocumentWrapper> getDocumentsbyApp(String docId) {   
       Integer i = 0;
       List<Document_File__c> documentList = new List<Document_File__c>();
       List<cm_documentController.DocumentWrapper> documentWrapperList = new List<cm_documentController.DocumentWrapper>();
       documentList = [SELECT    Id,
                                       Name,
                                       File_Name__c,
                                       Application__r.Name,
                                       Is_Current__c,
                                       CreatedDate                                                                            
                               FROM Document_File__c 
                               WHERE Application__c = :docId  
                               ORDER BY CreatedDate DESC
                               LIMIT 10];
       for(Document_File__c dObj : documentList){
        cm_documentController.DocumentWrapper docWrapper = new cm_documentController.DocumentWrapper();
           docWrapper.Id = dObj.Id;
           docWrapper.Name = dObj.Name;
           docWrapper.fileName = dObj.File_Name__c;
           docWrapper.applicationName = dObj.Application__r.Name;
           docWrapper.CreatedDate = dObj.CreatedDate;
           docWrapper.is_current = dObj.Is_Current__c;
           docWrapper.rowNum = i;
           i+= 1;

           documentWrapperList.add(docWrapper);

       }
       return documentWrapperList;
    }

//    @AuraEnabled(cacheable=true)
//    public static List<Document_File__c> getDocumentsbyApp(String docId) {
//        system.debug('recordId: ' + docId);
//        return [SELECT id, 
//                        name ,
//                        file_name__c,
//                        Application__c,
//                        CreatedDate
//                FROM Document_File__c        
//                WHERE Application__c = :docId    
//                ORDER BY CreatedDate DESC
//                LIMIT 50];
//    }

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

    @AuraEnabled(cacheable=true)
    public static string setPrimaryDocument (id appId, id docId){
        Integer i = 0;       
        String CurrDocId;
        String documentQuery = 'SELECT Id, ' +
                                'Is_Current__c, ' + 
                                'CreatedDate  ' +
                        'FROM Document_File__c ' +
                        'WHERE Application__c = :appId ' +
                        'ORDER BY CreatedDate DESC ' ;
        List<Document_File__c> documentList = Database.query(documentQuery);

        //system.debug('Primary Document: ==> ' + docId);
        for (Document_File__c ctx : documentList) 
        {         
              
            String newId = String.valueOf(ctx.Id);

            If (docId == newId){
                ctx.Is_Current__c = false;
                CurrDocId = String.ValueOf(newId);
            }
            else {
                ctx.Is_Current__c = true;
            }
            documentList.add(ctx);
            i += 1;
        }
        if(documentList != null && !documentList.IsEmpty())
            Database.update(documentList);
            
        String returnMsg = 'Successful ==> Application ID: ' + 
                                                String.ValueOf(appId) + 
                                            ' Count: ' + 
                                                String.ValueOf(i) +
                                            ' Document ID: ' +
                                                String.ValueOf(docId) +
                                            ' Last Document ID: ' +
                                                String.ValueOf(CurrDocId);
        return(returnMsg);
        }

    }