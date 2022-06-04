import { LightningElement, api } from 'lwc';

export default class TabsetConditionalTab extends LightningElement {
    showTabFour;
    @api recordId;
    @api objectApiName;
    
    toggleOptionalTab() {
        this.showTabFour = !this.showTabFour;
    }
}