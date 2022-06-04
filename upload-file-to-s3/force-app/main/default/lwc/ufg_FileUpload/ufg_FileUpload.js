import { LightningElement, api, wire } from 'lwc';
import getDocuments from '@salesforce/apex/documentController.getDocuments'
import {loadStyle} from 'lightning/platformResourceLoader'
//import COLORS from '@salesforce/resourceUrl/colors'
const CHUNK_SIZE = 750000;
const COLUMNS = [
    {label:'Document Name', fieldName:'Name',  cellAttributes:{
        class:{fieldName:'accountColor'}
    }},
    {label:'File Name', fieldName:'File_Name__c',  cellAttributes:{
        class:{fieldName:'accountColor'}
    }},
    {label:'Upload Date', fieldName:'CreatedDate',  cellAttributes:{
        class:{fieldName:'accountColor'}
    }},
]
export default class documentList extends LightningElement {

tableData
columns = COLUMNS
isCssLoaded = false
fileName = '';
filesUploaded = [];
isLoading = false;
fileSize;
records;
error;

@api recordId;

    handleFilesChange(event) {
        if(event.target.files.length > 0) {
            this.filesUploaded = event.target.files;
            this.fileName = event.target.files[0].name;
        }
    }

    saveFile(){
        var fileCon = this.filesUploaded[0];
        this.fileSize = this.formatBytes(fileCon.size, 2);
        if (fileCon.size > MAX_FILE_SIZE) {
            let message = 'File size cannot exceed ' + MAX_FILE_SIZE + ' bytes.\n' + 'Selected file size: ' + fileCon.size;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: message,
                variant: 'error'
            }));
            return;
        }
        var reader = new FileReader();
        var self = this;
        reader.onload = function() {
            var fileContents = reader.result;
            var base64Mark = 'base64,';
            var dataStart = fileContents.indexOf(base64Mark) + base64Mark.length;
            fileContents = fileContents.substring(dataStart);
            self.upload(fileCon, fileContents);
        };
        reader.readAsDataURL(fileCon);
    }

    upload(file, fileContents){
        var fromPos = 0;
        var toPos = Math.min(fileContents.length, fromPos + CHUNK_SIZE);
        
        this.uploadChunk(file, fileContents, fromPos, toPos, ''); 
    }

    uploadChunk(file, fileContents, fromPos, toPos, attachId){
        this.isLoading = true;
        var chunk = fileContents.substring(fromPos, toPos);
        
        saveTheChunkFile({ 
            parentId: this.recordId,
            fileName: file.name,
            base64Data: encodeURIComponent(chunk), 
            contentType: file.type,
            fileId: attachId
        })
        .then(result => {
            
            attachId = result;
            fromPos = toPos;
            toPos = Math.min(fileContents.length, fromPos + CHUNK_SIZE);    
            if (fromPos < toPos) {
                this.uploadChunk(file, fileContents, fromPos, toPos, attachId);  
            }else{
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success!',
                    message: 'File Upload Success',
                    variant: 'success'
                }));
                this.isLoading = false;
            }
        })
        .catch(error => {
            console.error('Error: ', error);
        })
        .finally(()=>{
            
        })
    }

    formatBytes(bytes,decimals) {
        if(bytes == 0) return '0 Bytes';
        var k = 1024,
            dm = decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }


    @wire(getDocuments)
    documentsHandler({data, error}){ 
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
            this.data = rows

            this.tableData = rows.map(item=>{
                return {...item                  
                }
            })
            console.log(this.tableData)
        }
        if(error){
            console.error(error)
        }
    }

   // renderedCallback(){ 
   //     if(this.isCssLoaded) return
   //     this.isCssLoaded = true
   //     loadStyle(this, COLORS).then(()=>{
   //         console.log("Loaded Successfully")
   //     }).catch(error=>{ 
   //         console.error("Error in loading the colors")
   //     })
   // }
 
}