public with sharing class ContactController {
    public class ContactWrapper {
        @AuraEnabled public String id{get;set;}
        @AuraEnabled public String name{get;set;}
        @AuraEnabled public String title{get;set;}
        @AuraEnabled public String mobileNumber{get;set;}
        @AuraEnabled public String email{get;set;}
        @AuraEnabled public String accountName{get;set;}
        @AuraEnabled public String accountNumber{get;set;}
        @AuraEnabled public String accountRating{get;set;}
        @AuraEnabled public String industry{get;set;}
        @AuraEnabled public String accountId{get;set;}
    }

    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {   
        String sqltxt = 'SELECT Id, Name, Email,Phone FROM Contact';
        Contact[] contactList = Database.query(sqltxt);
        //return [SELECT Name, Email,Phone  FROM Contact];
        return (contactList);
    }
     @AuraEnabled(cacheable=true)
     public static List<ContactController.ContactWrapper> getContactDetails() {   
        List<Contact> contactDetailsList = new List<Contact>();
        List<ContactController.ContactWrapper> contactDetailsWrapperList = new List<ContactController.ContactWrapper>();
        contactDetailsList = [SELECT    Id,
                                        Name,
                                        Title,
                                        MobilePhone,
                                        Email,
                                        Account.Name,
                                        Account.AccountNumber,
                                        Account.Rating,
                                        Account.Industry,
                                        Account.Id 
                                FROM Contact 
                                LIMIT 10];
        for(Contact cObj : contactDetailsList){
            ContactController.ContactWrapper cdWrapper = new ContactController.ContactWrapper();
            cdWrapper.Id = cObj.Id;
            cdWrapper.name = cObj.Name;
            cdWrapper.title = cObj.Title;
            cdWrapper.mobileNumber = cObj.MobilePhone;
            cdWrapper.email = cObj.Email;
            cdWrapper.accountName = cObj.Account.Name;
            cdWrapper.accountNumber = cObj.Account.AccountNumber;
            cdWrapper.accountRating = cObj.Account.Rating;
            cdWrapper.industry = cObj.Account.Industry;
            cdWrapper.accountId = cObj.Account.Id;

            contactDetailsWrapperList.add(cdWrapper);

        }
        return contactDetailsWrapperList;
     }
        
}
