import { LightningElement,wire,api } from 'lwc';
import getApplicationbyId from '@salesforce/apex/applicationController.getApplicationbyId'
//import {loadStyle} from 'lightning/platformResourceLoader'
//import COLORS from '@salesforce/resourceUrl/colors'
const CHUNK_SIZE = 750000;
const COLUMNS = [
    {label:'Application Name', fieldName:'Name',  cellAttributes:{
        class:{fieldName:'accountColor'}
    }},
    {label:'Stage', fieldName:'Stage__c',  cellAttributes:{
        class:{fieldName:'accountColor'}
    }},
    {label:'Create Date', fieldName:'CreatedDate',  cellAttributes:{
        class:{fieldName:'accountColor'}
    }},
]
export default class LoanApplication extends LightningElement {

    applicationData;
    columns = COLUMNS;
    isCssLoaded = false
    isLoading = false;
    error;
    @api recordId;

@wire(getApplicationbyId,{parentId: '$recordId'})
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

            this.applicationData = rows.map(item=>{
                return {...item                  
                }
            })
            console.log(this.applicationData)
        }
        if(error){
            console.error(error)
        }
    }
}