import { LightningElement, api, wire,track} from 'lwc';
import getDocumentsbyApp from '@salesforce/apex/cm_documentController.getDocumentsbyApp';

const COLUMNS = [
    {label:'Document Name', fieldName:'Name' },
    {label:'File Name', fieldName:'File_Name__c' },
    {label:'Application Name', fieldName:'Application__c'},
    {label:'Upload Date', fieldName:'CreatedDate'},
];
export default class cmDocumentListPagination extends LightningElement {
    columns = COLUMNS;
    result;

    @api recordId;
    @api sortedDirection = 'asc';
    @api sortedBy = 'Name';
    @api searchKey = '';

    @track documentListData;
    @track data;
    @track rows;
    @track value;
    @track error;
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
    mapoppNameVsOpp = new Map();
  
    @wire(getDocumentsbyApp,{docId: '$recordId'})
  //  wiredDocuments({ error, data }) {
  //      console.log('Data Loading.');
  //      if (data) {
  //          //this.processRecords(data);
  //          this.data = data;
  //          this.error = undefined;
  //          console.log('Data: ' + JSON.stringify(data));
  //      } else if (error) {
  //          this.error = error;
  //          this.data = undefined;
  //          console.log('Error: ' + JSON.stringify(error));
  //      } else {
  //          console.log('Unknown Error');
  //      }
  wiredDocuments({error, data}){
        if (data) {
            let rows = JSON.parse( JSON.stringify( data ) );
            console.log( 'Rows are ' + JSON.stringify( rows ) );
            this.processRecords(rows);
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
            this.documentListData = rows;
            console.log('Document List Records: ' + JSON.stringify(this.documentListData));
            } else if (error) {
            this.error = error;
    
            console.log('Error: ' + JSON.stringify(error));
        } else {
            console.log('Unknown Error');
        }
    }
    
    processRecords(data){
        console.log('Process Records: ' + JSON.stringify(data));
        this.items = data;
        this.totalRecountCount = data.length; 
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
            
        this.data = this.items.slice(0,this.pageSize); 
        this.endingRecord = this.pageSize;
        this.columns = COLUMNS;
    }

    //clicking on previous button this method will be called
    previousHandler() {
        this.isPageChanged = true;
        console.log('Previous Clicked');
        console.log('Total Pages: ' + this.totalPage);
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
    console.log('Next Clicked');
    console.log('Total Pages: ' + this.totalPage);
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
        console.log('Display Per Page');
        console.log('Page Size: ' + this.pageSize);
        console.log('Page: ' + page);

        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        console.log('Starting Record: ' + this.startingRecord);
        console.log('Ending Record: ' + this.endingRecord);

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
    
}