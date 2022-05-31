import LightningDatatable from 'lightning/datatable';
import clickableEmailTemplate from './clickableEmailTemplate.html';

export default class MyDatatable extends LightningDatatable {
    static customTypes = {
        clickableEmail: {
            template: clickableEmailTemplate,
            standardCellLayout: true,
            typeAttributes: ['recordId'],
        },
        //more custom tpes
        currentIndicator: {
            template: clickableEmailTemplate,
            standardCellLayout: true,
            typeAttributes: ['recordId'],
        }
        };
}