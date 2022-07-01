import { LightningElement, wire, api, track} from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getDocumentsbyApp from '@salesforce/apex/cm_documentController.getDocumentsbyApp';
import setPrimaryDocument from '@salesforce/apex/cm_documentController.setPrimaryDocument';
import { subscribe, MessageContext } from 'lightning/messageService';
import FILE_UPLOADED_CHANNEL from '@salesforce/messageChannel/File_Uploaded__c';
import UserPermissionsJigsawProspectingUser from '@salesforce/schema/User.UserPermissionsJigsawProspectingUser';

//const columns = [{
//        label: 'Name',
//        fieldName: 'Name',
//        type: 'text',
//        sortable: true
//    },
//    {
//        label: 'Stage',
//        fieldName: 'StageName',
//        sortable: true
//    },
//    {
//        label: 'Close Date',
//        fieldName: 'CloseDate',
//        sortable: true
//    }
//];


const columns = [
 //   {label:'Select Loan', fieldName:'',
 //       type: 'text',
 //       cellAttributes: {
 //           iconName: {fieldName: 'currentIcon'},
 //           iconPosition:'right'
 //           }
//
 //       },
 //       {
 //           type:"button",
 //           fixedWidth: 150,
 //           disabled:"true",
 //           typeAttributes: {
 //               label: 'Select',
 //               name: 'select',
 //               variant: {fieldName: 'buttonVariant'}
 //           }
 //       },  
    {label:'Document Name', fieldName:'name' },
    {label:'File Name', fieldName:'fileName' },
    {label:'Application Name', fieldName:'applicationName'},
    //{label:'Upload Date', fieldName:'CreatedDate'},
    {
        label: "Upload Time",
        fieldName: "createdDate",
        type: "date",
        typeAttributes:{
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    },
    {label:'Is Current', fieldName:'is_current'},
];

export default class LightningDatatableExample extends LightningElement {
    @api recordId;
    @api documentId;
    @api docId;

    @track value;
    @track error;
    @track data;
    @api sortedDirection = 'asc';
    @api sortedBy = 'Name';
    @api searchKey = '';
    result;
    wiredDataResult;
    @track allSelectedRows = [];
    @track page = 1; 
    @track items = []; 
    @track data = []; 
    @track columns; 
    @track startingRecord = 1;
    @track endingRecord = 0; 
    @track pageSize = 5; 
    @track totalRecountCount = 0;
    @track totalPage = 0;
    isPageChanged = false;
    initialLoad = true;
    mapoppNameVsOpp = new Map();;
  
   // @wire(getOpps, {searchKey: '$searchKey', sortBy: '$sortedBy', sortDirection: '$sortedDirection'})
   //wiredAccounts({ error, data }) {
   //    if (data) {
   //         this.processRecords(data);
   //         this.error = undefined;
   //     } else if (error) {
   //         this.error = error;
   //         this.data = undefined;
   //     }
   // }

    //@wire(getDocumentsbyApp, {docId: '$recordId'})
    //wiredAccounts({ error, data }) {
    //    this.wiredDataResult = data;  //track the provisioned value
    //    if (data) {
    //        this.processRecords(data);
    //        this.error = undefined;
    //    } else if (error) {
    //        this.error = error;
    //        this.data = undefined;
    //    }
    //}

    @wire(getDocumentsbyApp, {docId: '$recordId'})
    wiredDocuments(value) {
        //Hold on to the provisioned value so we can refresh it later.
        this.wiredDataResult = value;  //track the provisioned value
        const {data, error} = value;  //destructure the provisioned value
        if (data) {
            this.processRecords(data);

            this.documents = data;
            let documentsList = [];

            //loop through the list of documents and assign an icon based on
            //the most recent file
            this.documents.forEach(record => {
                //copy the details in record object to contactObj object
                let documentObj = {...record};
                //if(record.rowNum == '0'){
                //    documentObj.currentIcon = 'custom:custom1';
                //    console.log ('Row Number 0 Found');
                //}

                if(record.is_current == true){
                    documentObj.currentIcon = 'custom:custom1';
                    documentObj.buttonVariant = 'brand';
                    console.log ('Row Number 0 Found');                    
                }
                console.log ('Row Number: ' + record.rowNum);
                documentsList.push(documentObj);
            });
            this.selectedRows = this.documentsList[0].id;
            this.data = documentsList;

   
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }

    processRecords(data){
        this.items = data;
            this.totalRecountCount = data.length; 
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
            
            this.data = this.items.slice(0,this.pageSize); 
            this.endingRecord = this.pageSize;
            this.columns = columns;
    }
    //clicking on previous button this method will be called
    previousHandler() {
        this.isPageChanged = true;
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
          var selectedIds = [];
          for(var i=0; i<this.allSelectedRows.length;i++){
            selectedIds.push(this.allSelectedRows[i].Id);
          }
        this.template.querySelector(
            '[data-id="table"]'
          ).selectedRows = selectedIds;
    }

    //clicking on next button this method will be called
    nextHandler() {
        this.isPageChanged = true;
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }
          var selectedIds = [];
          for(var i=0; i<this.allSelectedRows.length;i++){
            selectedIds.push(this.allSelectedRows[i].Id);
          }
        this.template.querySelector(
            '[data-id="table"]'
          ).selectedRows = selectedIds;
    }

    //this method displays records page by page
    displayRecordPerPage(page){

        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 

        this.data = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }    
    
    sortColumns( event ) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        return refreshApex(this.result);
        
    }

    handleRowSelection = event => {
        var selectedRows=event.detail.selectedRows;
        var el = this.template.querySelector('lightning-datatable');
        //console.log('Initial Selected: '+ selectedRows[0].id);

        var selected = el.getSelectedRows();
        console.log('Selected Record ==> ' + JSON.stringify(selected));
        console.log('Selected ID ==> ' + selected[0].id);

        //if(selectedRows.length>1)
        //{
        //    var el = this.template.querySelector('lightning-datatable');
//
        //    selectedRows=el.selectedRows=el.selectedRows.slice(1);
 //
  //          event.preventDefault();
//
//            return;
//        }
    }

 //   handleDocumentSelection (event) {
 //       const row = event.detail.row;
 //       this.docId = row.id;
 //       console.log('Application Id ==> '+ this.recordId);
 //       console.log('Document Id ==> '+ this.docId);
//
//        setPrimaryDocument({appId: this.recordId,
 //                           docId: this.docId})
 //           .then(result => {
 //           console.log('Primary Update Result = ' +result);                      
 //           })
 //           .catch(error => {
 //               // Error to show during upload
 //               window.console.log(error);
 //           });
 //       //setPrimaryDocument(docId);  //4
      
 //  }
    //handleRowSelection = event => {
    //    var selectedRows=event.detail.selectedRows;
    //    console.log('Initial Selected: '+ selectedRows[0].Name);
//
    //    if(selectedRows.length>1)
     //   {
     //       var el = this.template.querySelector('lightning-datatable');
//
 //           selectedRows=el.selectedRows=el.selectedRows.slice(1);
 //
 //           event.preventDefault();
 //           console.log('Selected: '+ JSON.stringify(selectedRows[0]));
 //           return;
 //       }
 //   }

    //Below is overridden
    onRowSelection(event){
        if(!this.isPageChanged || this.initialLoad){
            if(this.initialLoad) this.initialLoad = false;
            this.processSelectedRows(event.detail.selectedRows);
        }else{
            this.isPageChanged = false;
            this.initialLoad =true;
        }
        
    }
    processSelectedRows(selectedOpps){
        var newMap = new Map();
        for(var i=0; i<selectedOpps.length;i++){
            if(!this.allSelectedRows.includes(selectedOpps[i])){
                this.allSelectedRows.push(selectedOpps[i]);
            }
            this.mapoppNameVsOpp.set(selectedOpps[i].Name, selectedOpps[i]);
            newMap.set(selectedOpps[i].Name, selectedOpps[i]);
        }
        for(let [key,value] of this.mapoppNameVsOpp.entries()){
            if(newMap.size<=0 || (!newMap.has(key) && this.initialLoad)){
                const index = this.allSelectedRows.indexOf(value);
                if (index > -1) {
                    this.allSelectedRows.splice(index, 1); 
                }
            }
        }
    }
    
    handleKeyChange( event ) {
        this.searchKey = event.target.value;
        var data = [];
        for(var i=0; i<this.items.length;i++){
            if(this.items[i]!= undefined && this.items[i].Name.includes(this.searchKey)){
                data.push(this.items[i]);
            }
        }
        this.processRecords(data);
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
  
}