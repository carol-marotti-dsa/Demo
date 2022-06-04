public class AWSCallout {

    @future(callout = true) public static void callAWSApiGateway (String id, String name, String website){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://anf0zlv2na.execute-api.us-east-1.amazonaws.com/Test/savesfaccount');  //AWS endpoint
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setBody('{"id": "'+id+'","name": "'+name+'","website": "'+website+'"}');
        
            HttpResponse response = http.send(request);
            System.debug('responseStatusCode: '+response.getStatusCode());
        System.debug('responseBody: '+response.getBody());
    }
}