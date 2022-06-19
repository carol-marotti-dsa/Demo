import { LightningElement, api, wire} from 'lwc';
import getDocumentsbyApp from '@salesforce/apex/cm_documentController.getDocumentsbyApp';
//import COLORS from '@salesforce/resourceUrl/colors';
//import {loadStyle} from 'lightning/platformResourceLoader';
import { subscribe, MessageContext } from 'lightning/messageService';
import FILE_UPLOADED_CHANNEL from '@salesforce/messageChannel/File_Uploaded__c';
import { refreshApex } from '@salesforce/apex';

import {ShowToastEvent} from 'lightning/platformShowToastEvent';
const COLUMNS = [
    {label:'Document Name', fieldName:'Name' },
    {label:'File Name', fieldName:'File_Name__c' },
    {label:'Application Id', fieldName:'Application__c'},
    {label:'Upload Date', fieldName:'CreatedDate'},
]
export default class cmDisplayDocumentTable extends LightningElement {
@api recordId; //get the recordId for which files will be attached.
//@api flexipageRegionWidth;
documentData; //to display the uploaded file and link to AWS
error;
subscription = null;
wiredDataResult;
visibleDocuments;

columns = COLUMNS;

@wire(getDocumentsbyApp,{docId: '$recordId'})
//documentsHandler({data, error}){ 
documentsHandler(value){ 
    //Hold on to the provisioned value so we can refresh it later.
    this.wiredDataResult = value;  //track the provisioned value
    const {data, error} = value;  //destructure the provisioned value
    if(data){ 
        
        let rows = JSON.parse( JSON.stringify( data ) );
        console.log( 'Rows are ' + JSON.stringify( rows ) );
        const options = {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false,
            timeZone: 'America/Los_Angeles',
            timeZoneName: 'short'
          };
          for ( let i = 0; i < rows.length; i++ ) {  

            let dataParse = rows[ i ];

            if ( dataParse.CreatedDate ) {
                
                let dt = new Date( dataParse.CreatedDate );

               dataParse.CreatedDate = new Intl.DateTimeFormat( 'en-US', options ).format( dt );
               //dataParse.CreatedDate = new Intl.DateTimeFormat( 'en-US',  { dateStyle: 'full', timeStyle: 'long' } ).format( dt );
            
            }

        }
        this.documentData = rows;

        console.log('Document List Records: ' + JSON.stringify(this.documentData));
    }
    if(error){
        console.error(error)
    }
}

  @wire(MessageContext)
  messageContext;
  subscribeToMessageChannel() {
    this.subscription = subscribe(
      this.messageContext,
      FILE_UPLOADED_CHANNEL,
      (message) => this.handleMessage(message)
    );
  }
  handleMessage(message) {
    console.log('Document Table Refresh Flag: ' + message.fileUploadedFlag);
    if(message.fileUploadedFlag == '1') {
        console.log('Document Table Refresh Now ' + message.fileUploadedFlag);
        
        // Use the value to refresh the wire function
        return refreshApex(this.wiredDataResult);

    }
  }
  connectedCallback() {
    this.subscribeToMessageChannel();
  }
  @api
  refresh() {
    //return refreshApex(this.documentData);
  }

  updateDocumentHandler(event){
    this.visibleDocuments=[...event.detail.records]
    console.log(event.detail.records)
}

}