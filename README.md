# Api-Valter

Valter is your api contract validator. It is very easy and lightwight only thing that you should do is create a contract in json format.

Imagine that you have a REST service which is being used by other applications. So that according to the consumer driven contract (http://martinfowler.com/articles/consumerDrivenContracts.html), clients expects some data from your service this is defined as contract. 

Basically other teams write contracts to your service and you should integrate api-valter pipeline into your continuous integration tool before production somewhere so that you will know whether you broke the clients data expectations when you push some changes. 


## Installation
* Install nodejs from https://nodejs.org/
* Clone Api-Valter into your workspace

## Usage
Create sample.contract file in your contract directory
```javascript
{
    "producer": "http://yourserviceurl.com",
    "for": "description",
    "on": "GET",
    "uri": "/endpoint",
    "expect": {
        "request": {
            "status_code": 200,
            "headers": []
        },
        "body": {
            "mydata": {
					"key" : "val"
            }
        }
    }
}
```

### Execute
Execute in your terminal:
* cd cloned-api-valter-directory
* `api-valter-directory$ node app.js -p "/contract-directory"`

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
