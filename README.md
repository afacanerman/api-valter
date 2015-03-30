# Api-Valter

Valter is your api contract validator. It is very easy and lightwight only thing that you should do is create a contract in json format

## Installation

download it

## Usage
Create sample contract in your folder
`
{
    "producer": "http://yourserviceurl.com",
    "expectations": [{
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
    }]
}`

### Linux

`node app.js -p "/yourPath"`

### Windows

`node app.js -p "c:\yourPath"`

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

