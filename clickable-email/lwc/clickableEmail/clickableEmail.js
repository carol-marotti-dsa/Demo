import { LightningElement,api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class clickableEmail extends NavigationMixin(LightningElement) {
    @api recordId;
    @api email;
    
    navigateToRecord(event) {
        //Naviate to record and open in a new tab
        event.preventDefault(event);
            this[NavigationMixin.GenerateUrl]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.recordId,
                    actionName: 'view'
                }
            }).then(url => {window.open(url) });
    }
}