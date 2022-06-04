import { LightningElement, wire } from 'lwc';
import getDocuments from '@salesforce/apex/documentController.getDocuments'
import {loadStyle} from 'lightning/platformResourceLoader'
import COLORS from '@salesforce/resourceUrl/colors'
const COLUMNS = [
    {label:'Document Name', fieldName:'Name',  cellAttributes:{
        class:{fieldName:'accountColor'}
    }},
    {label:'File Name', fieldName:'File_Name__c',  cellAttributes:{
        class:{fieldName:'accountColor'}
    }},
    {label:'Application Id', fieldName:'Application__c',  cellAttributes:{
        class:{fieldName:'accountColor'}
    }},
]
export default class documentList extends LightningElement {
    tableData
    columns = COLUMNS
    isCssLoaded = false

    @wire(getDocuments)
    documentsHandler({data, error}){ 
        if(data){ 
            
            this.tableData = data.map(item=>{
                return {...item
                }
            })
            console.log(this.tableData)
        }
        if(error){
            console.error(error)
        }
    }

    renderedCallback(){ 
        if(this.isCssLoaded) return
        this.isCssLoaded = true
        loadStyle(this, COLORS).then(()=>{
            console.log("Loaded Successfully")
        }).catch(error=>{ 
            console.error("Error in loading the colors")
        })
    }

}