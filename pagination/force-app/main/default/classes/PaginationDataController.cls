public with sharing class PaginationDataController {
    @AuraEnabled(cacheable= true)
    public static List<Contact> getContactList(){
        return [SELECT Id, Name FROM Contact];
    }

    @AuraEnabled(cacheable= true)
    public static List<Account> getAccountList(){
        return [SELECT Id, Name FROM Account];
    }
}