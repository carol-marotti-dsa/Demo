import { LightningElement, wire, track } from 'lwc';
import CONTACT_ID_FIELD from '@salesforce/schema/Contact.Id';
import CONTACT_NAME_FIELD from '@salesforce/schema/Contact.Name';
import CONTACT_EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import CONTACT_PHONE_FIELD from '@salesforce/schema/Contact.Phone';
import getContacts from '@salesforce/apex/ContactController.getContactDetails';
import getRecentContact from '@salesforce/apex/ContactController.getRecentContact';

const ACTIONS = [
    {label: 'View Details', name: 'view_details'},
    {label: 'Delete', name: 'delete'},
];

const COLUMNS = [
    {
        label: 'Name',
        fieldName: 'name',
        type: 'text'
    },
    {
        label: 'Current',
        fieldName: '',
        type: 'text',
            cellAttributes:{
                iconName: {
                    fieldName: 'currentIcon'
                },
                iconPosition:'right'
            },
    },    
    {
        label: 'Account Name',
        fieldName: 'accountLink',
        type: 'url',
            typeAttributes:{
                label: {
                    fieldName: 'accountName'
                },
                target:'_blank'
            },
    },
    {
        label: 'Account Rating',
        fieldName: 'rating',
        type: 'text',
            cellAttributes:{
                iconName: {
                    fieldName: 'accountRatingIcon'
                },
                iconPosition:'right'
            },
    },
    {
        label: 'Email',
        fieldName: 'contactLink',
        type: 'url',
            typeAttributes: {
                label: {
                    fieldName: 'email'
                },
                target: '_blank'
        },
    },
    //Use Custom Type for email to launch template
    //Need to pass the recordId attribute to the template 
  
    {
        label: 'Mobile',
        fieldName: 'mobilePhone',
        type: 'phone'
    },
    {
        type: 'action',
        typeAttributes: { rowActions: ACTIONS },
    },
    ];

    export default class DataTableEmailLinks extends LightningElement {
           columns = COLUMNS;
            data;
            contacts;
            recentContact;

            @wire(getRecentContact)
            recentContact;

            @wire(getContacts)
            wiredContacts({error,data}){
                if(data){
                    this.contacts = data;
                    let contactsList = [];

                    //loop through the list of contacts and assign an icon based on the rating
                    this.contacts.forEach(record => {
                        //copy the details in record object to contactObj object
                        let contactObj = {...record};
                        if(record.accountRating === 'Hot'){
                            contactObj.accountRatingIcon = "custom:custom1";
                        }else if(record.accountRating === 'Warm'){
                            contactObj.accountRatingIcon = "custom:custom3";
                        }else if(record.accountRating === 'Cold'){
                            contactObj.accountRatingIcon = "custom:custom5";
                        }else{
                            contactObj.accountRatingIcon = "standard:empty";
                        }
                        if(record.rowNum == '0'){
                            contactObj.currentIcon = 'custom:custom1';
                        }
                        console.log ('Row Number: ' + record.rowNum);
                        contactObj['accountLink'] = '/lightning/r/Account/' + record.accountId +'/view';
                        contactObj['contactLink'] = '/lightning/r/Contact/' + record.id +'/view';
                        contactsList.push(contactObj);
                    });
                    this.data = contactsList;
                }
            }
    }