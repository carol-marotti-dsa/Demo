import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import uploadFile from '@salesforce/apex/cm_fileUploadController.uploadFile';
import uploadFileToAWS from '@salesforce/apex/cm_AWSFileUploadController.uploadFileToAWS'; 
import { publish, MessageContext } from 'lightning/messageService';
import FILE_UPLOADED_CHANNEL from '@salesforce/messageChannel/File_Uploaded__c';

export default class FileUploaderCompLwc extends LightningElement {
    @api recordId;
    fileData
    title
    selectedFilesToUpload = []; //store selected files
    showSpinner = false; //used for when to show spinner
    fileName; //to display the selected file name
    file; //holding file instance
    myFile;    
    fileType;//holding file type
    fileReaderObj;
    base64FileData;
    isCssLoaded = false;
    @api getIdFromParent;

   // get the file name from the user's selection
   handleSelectedFiles(event) {
    if(event.target.files.length > 0) {
        this.selectedFilesToUpload = event.target.files;
        this.fileName = this.selectedFilesToUpload[0].name;
        this.fileType = this.selectedFilesToUpload[0].type;
        console.log('fileName=' + this.fileName);
        console.log('fileType=' + this.fileType);
    }
}
    openfileUpload(event) {
        const file = event.target.files[0]
        var reader = new FileReader()
        reader.onload = () => {
            var base64 = reader.result.split(',')[1]
            this.fileData = {
                'filename': file.name,
                'base64': base64,
                'recordId': this.recordId
            }
            console.log(this.fileData)
        }
        reader.readAsDataURL(file)
    }
    
       //parsing the file and prepare for upload.
       handleFileUpload(){
        if(this.selectedFilesToUpload.length > 0) {
            this.showSpinner = true;
            
            this.file = this.selectedFilesToUpload[0];
            console.log('File to upload: ' + JSON.stringify( this.file));
            //create an intance of File
            this.fileReaderObj = new FileReader();

            //this callback function in for fileReaderObj.readAsDataURL
            this.fileReaderObj.onloadend = (() => {
                //get the uploaded file in base64 format
                let fileContents = this.fileReaderObj.result;
                fileContents = fileContents.substr(fileContents.indexOf(',')+1)
                
                //read the file chunkwise
                let sliceSize = 1024;           
                let byteCharacters = atob(fileContents);
                let bytesLength = byteCharacters.length;
                let slicesCount = Math.ceil(bytesLength / sliceSize);                
                let byteArrays = new Array(slicesCount);
                for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
                    let begin = sliceIndex * sliceSize;
                    let end = Math.min(begin + sliceSize, bytesLength);                    
                    let bytes = new Array(end - begin);
                    for (let offset = begin, i = 0 ; offset < end; ++i, ++offset) {
                        bytes[i] = byteCharacters[offset].charCodeAt(0);                        
                    }
                    byteArrays[sliceIndex] = new Uint8Array(bytes);                    
                }
                
                //from arraybuffer create a File instance
                this.myFile =  new File(byteArrays, this.fileName, { type: this.fileType });
                
                //callback for final base64 String format
                let reader = new FileReader();
                reader.onloadend = (() => {
                    let base64data = reader.result;
                    this.base64FileData = base64data.substr(base64data.indexOf(',')+1); 
                    this.fileUpload();
                });
                reader.readAsDataURL(this.myFile);                                 
            });
            this.fileReaderObj.readAsDataURL(this.file);            
        }
        else {
            this.fileName = 'Please select a file to upload!';
        }
    }

    //this method calls Apex's controller to upload file in AWS
    fileUpload(){
        
        //implicit call to apex
        uploadFileToAWS({ parentId: this.recordId, 
                        strfileName: this.file.name, 
                        fileType: this.file.type,
                        fileContent: encodeURIComponent(this.base64FileData)})
        .then(result => {
            console.log('Upload result = ' +result);            
            console.log('ApplicationId = ' + this.recordId);            
            this.fileName = this.fileName + ' - Uploaded Successfully';
            //this.refreshRelatedView();
            //call to show uploaded files
            //this.updateRecordView();
            this.showSpinner = false;
            // Showing Success message after uploading
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success!!',
                    message: this.file.name + ' - Uploaded Successfully!!!',
                    variant: 'success',
                }),
            );
        })
        .catch(error => {
            // Error to show during upload
            window.console.log(error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error in uploading File',
                    message: error.message,
                    variant: 'error',
                }),
            );
            this.showSpinner = false;
        });        
    }

    //handleClick(){
    //    const {base64, filename, recordId} = this.fileData
    //    uploadFile({ base64, filename, recordId }).then(result=>{
    //        this.fileData = null
    //        console.log('File Name: ' + filename);
    //        let title = filename + ' uploaded successfully!!'
    //        this.toast(title)
    //    })
    //}
    refreshRelatedView() {
        setTimeout(() => {
             eval("$A.get('e.force:refreshView').fire();");
        }, 1000); 
     }
    toast(title){
        const toastEvent = new ShowToastEvent({
            title, 
            variant:"success"
        })
        this.dispatchEvent(toastEvent)
    }

    get acceptedFormats() {
        return ['.pdf', '.png', 'jpeg'];
    }

    @wire(MessageContext)
    messageContext;
    updateRecordView() {
        console.log('Send Message');
      const payload = { 
        fileUploadedFlag : '1'
      };
      publish(this.messageContext, FILE_UPLOADED_CHANNEL, payload);
    }
   
}