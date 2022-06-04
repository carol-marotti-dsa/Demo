public class cmDynamicTable {
    public class ResultWrapper {
        @AuraEnabled
        public List<sobject> lstObject;
        @AuraEnabled
        public List<FieldsWrapper> lstFields;
        
        public ResultWrapper(List<sobject> lstObject, List<FieldsWrapper> lstFields){
            this.lstObject = lstObject;
            this.lstFields = lstFields;
        }        
    }
    public class FieldsWrapper {
        @AuraEnabled
        public String fieldPath {get; set;}
        @AuraEnabled
        public String label {get; set;}
        @AuraEnabled
        public String type {get; set;}
        
        public FieldsWrapper(String fieldPath, String strLabel, String strType){
            this.fieldPath = fieldPath;
            this.label = strLabel;
            this.type = strType;
        }
    }
    @AuraEnabled
    public static ResultWrapper fetchContact( String strObjectName, String sterFieldsetName){
       Set<String> setFieldsToQuery = new Set<String>();
       List<FieldsWrapper> lstFieldsetWrapper = new List<FieldsWrapper>();
       Map<String, String> mapFieldpathLabel = new Map<String, String>();
           
        for(Schema.FieldSetMember fld : readFieldSet(sterFieldsetName, strObjectName)){
            setFieldsToQuery.add(fld.getFieldPath().toLowerCase());
            mapFieldpathLabel.put(String.valueOf(fld.getType()), fld.getFieldPath());
            lstFieldsetWrapper.add(new FieldsWrapper(fld.getFieldPath(), fld.getLabel(), String.valueOf(fld.getType())));
        }
        String queryString = 'SELECT id, ';
        setFieldsToQuery.remove('id'); 
        queryString += String.join(new List<String>(setFieldsToQuery),',');
        queryString.removeEnd(',');
        queryString += ' FROM ' + strObjectName;
        List<sObject> lstObject = Database.query(queryString);       
        System.debug('lstObject ' + lstObject);
        return new ResultWrapper(lstObject, lstFieldsetWrapper);
    }
    private static List<Schema.FieldSetMember> readFieldSet(String fieldSetName, String ObjectName) {
        Map<String, Schema.SObjectType> GlobalDescribeMap = Schema.getGlobalDescribe();
        Schema.SObjectType SObjectTypeObj = GlobalDescribeMap.get(ObjectName);
        Schema.DescribeSObjectResult DescribeSObjectResultObj = SObjectTypeObj.getDescribe();
        Schema.Fieldset fieldSetObj = DescribeSObjectResultObj.FieldSets.getMap().get(fieldSetName);
        
        return fieldSetObj.getFields();
    }
}