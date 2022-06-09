public with sharing class cm_AWSFileUploadController {
    
    //This method is used to post file to AWS
    @AuraEnabled
    public static boolean uploadFileToAWS(Id parentId,
                                        String strfileName, String fileType,
                                        String fileContent){
        System.debug('parentId=' + parentId);
        System.debug('strfileName=' + strfileName);
        System.debug('fileType=' + fileType);
        HttpRequest req = new HttpRequest();

        Blob base64Content = EncodingUtil.base64Decode(EncodingUtil.urlDecode(fileContent, 'UTF-8'));
        String attachmentBody =  fileContent;           
        String formattedDateString = Datetime.now().formatGMT('EEE, dd MMM yyyy HH:mm:ss z');
        String dateString = Datetime.now().format('ddMMYYYYHHmmss');        
        String filename = dateString + '_' + parentId + '_' + strfileName;
        
        //AWS specific information
        String key = 'AKIART2HCL5IEPE2BT7R'; //AWS key
        String secret = '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'; //AWS Secret key
        String bucketname = 'user-data-bucket-cm001'; //AWS bucket name
        String host = 's3.amazonaws.com:443'; //'s3.amazonaws.com:443'
       
        String method = 'PUT';
        String endPoint = 'https://' + bucketname + '.' + host + '/'+ filename;

        req.setMethod(method);
        req.setEndpoint(endPoint);

        system.debug('Endpoint='+endPoint);
        //create header information
        req.setHeader('Host', bucketname + '.' + host);
        req.setHeader('Access-Control-Allow-Origin', '*');
        req.setHeader('Content-Length', String.valueOf(attachmentBody.length()));
        req.setHeader('Content-Encoding', 'UTF-8');
        req.setHeader('Content-type', fileType);
        req.setHeader('Connection', 'keep-alive');
        req.setHeader('Date', formattedDateString); 
        req.setHeader('ACL', 'public-read');
        //store file as blob       
        req.setBodyAsBlob(base64Content);
        
        //prepare for signing information
        String stringToSign = 'PUT\n\n' +
        fileType + '\n' +
        formattedDateString + '\n' + '/' + bucketname + '/' + filename;

        String encodedStringToSign = EncodingUtil.urlEncode(stringToSign, 'UTF-8');
        Blob mac = Crypto.generateMac('HMACSHA1', blob.valueof(stringToSign),blob.valueof(secret));
        String signedKey  = EncodingUtil.base64Encode(mac);

        //assign Authorization information
        String authHeader = 'AWS' + ' ' + key + ':' + signedKey;                    
        req.setHeader('Authorization',authHeader);
        

        //finally send information to AWS        
        //Http http = new Http();
        //HTTPResponse res = http.send(req);


        //System.debug('*Resp:' + String.ValueOF(res.getBody()));
        //System.debug('RESPONSE STRING: ' + res.toString());
        //System.debug('RESPONSE STATUS: ' + res.getStatus());
        //System.debug('STATUS_CODE: ' + res.getStatusCode());

        //if(res.getStatusCode() == 200){
            insertDocumentRecord (parentId,strfileName,endPoint);
         //   return true;
        //}
        //return false;
        //Bypass the actual upload to AWS
        return true;
    }

    //This method inserts file information to Custom Document object
    public static void insertDocumentRecord (Id parentId, String fileName, String fileURL){
        Document_File__c document = new Document_File__c();
        document.Application__c = parentId;
        document.File_URL__c = fileURL;
        document.File_Name__c =  fileName;
        insert document;                                           
    }

}