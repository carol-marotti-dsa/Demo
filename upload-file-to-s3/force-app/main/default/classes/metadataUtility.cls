//https://sfdcian.com/apex-code-to-create-custom-field-programmatically/
//MetadataUtility.generateFormulaField('Account', 'Ac_Name__c', 'formual Field created by apex', 'Account Name (Formula)', 'Text', '(Name)');
//MetadataUtility.generateTextField('Account', 'Type_x__c', 'Text Field created by apex', 'Type (apex)');
public class metadataUtility{

    public static void generateTextField(String objectAPIName, String fieldAPIName, String fieldDescription, String fieldLabel){
        String metadata = '{"Metadata" : {"type" : "Text","description" : "'+fieldDescription+'", "inlineHelpText" : "","precision" : null,"label" : "'+fieldLabel+'","length" : 255,"required" : false}, "FullName" : "'+objectAPIName+'.'+fieldAPIName+'"}';
        String responseBody = createField(metadata);
    }
    public static void generateFormulaField(String objectAPIName, String fieldAPIName, String fieldDescription, String fieldLabel, String retrunType, String validFormula){
        
        String metadata = '{"Metadata" : {"type" : "'+retrunType+'","description" : "'+fieldDescription+'", "formula" : "'+String.escapeSingleQuotes(validFormula)+'","formulaTreatBlanksAs" : "BlankAsZero","label" : "'+fieldLabel+'"}, "FullName" : "'+objectAPIName+'.'+fieldAPIName+'"}';
        String responseBody = createField(metadata);
        system.debug(responseBody);
    }
    
    public static String createField(String metadata) {
        HttpRequest request = new HttpRequest();
        request.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionID());
        request.setHeader('Content-Type', 'application/json');
        request.setEndpoint(URL.getSalesforceBaseUrl().toExternalForm()+'/services/data/v46.0/tooling/sobjects/CustomField');
        request.setMethod('POST');
        
        request.setBody(metadata);
        
        Http http = new Http();
        HTTPResponse res = http.send(request);
        return res.getBody();
    }
}