const fs = require("fs");
const { isEmpty } = require("lodash");
const hTp = async () => {
    const input_file = "./input/hop.json"
    const output_file = "./output/output.json"
    
    const hop = fs.readFileSync(input_file, "utf8")
    const hoJson = JSON.parse(hop);

    let itemCollection = []
    let itemFolders = []
    for (const el of hoJson.folders) {
        let itemRequests = []
        for (const el_request of el.requests) {

            let authObj = {}
            if (el_request.auth.authActive) {
                authObj = {
                    type: "bearer",
                    bearer: [
                        {
                            "key": "token",
                            "value": `{{accessToken}}`,
                            "type": "string"
                        }
                    ]
                }
            }

            let temp_params = []
            el_request.params.forEach(ep => {
                temp_params.push({
                    key: ep.key,
                    value: ep.value
                })
            });

            // replace char
            let temp_endpoint = el_request.endpoint.replace('<<', '{{');
            temp_endpoint = temp_endpoint.replace('>>', '}}');

            // slice first element
            const temp_path = temp_endpoint.split('/').slice(1)

            // clear escaped json string 
            let temp_body = null
            if (el_request.body.body) {
                temp_body = JSON.parse(JSON.stringify(el_request.body.body), null, 4)
            }


            const itemRequestsObj = {
                auth: authObj,
                method: el_request.method,
                header: el_request.headers,
                ...(isEmpty(el_request.body) ? {} : {
                    body: {
                        mode: "raw",
                        raw: temp_body,
                        options: {
                            raw: {
                                language: "json"
                            }
                        }
                    }
                }),

                url: {
                    raw: temp_endpoint,
                    host: [
                        "{{base_url}}"
                    ],
                    path: temp_path,
                    query: temp_params
                },

            }

            const temp_request = {
                name: el_request.name,
                request: itemRequestsObj
            }

            itemRequests.push(temp_request)
        }


        const itemFoldersObj = {
            name: el.name,
            item: itemRequests
        }

        itemFolders.push(itemFoldersObj)
    }

    // push folder to collection
    itemCollection.push(...itemFolders)

    let collections = {
        info: {
            "name": hoJson.name,
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        item: itemCollection
    }

    const json = JSON.stringify(collections, null, 4);

    fs.writeFile(output_file, json, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved! ", output_file);
    });


}

module.exports = hTp