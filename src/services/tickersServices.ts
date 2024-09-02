const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
});
const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function getAll() {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: "scantable_20240830",
    }
    try {
        const data = await dynamoDB.scan(params).promise();
        const tickers = data.Items;
        const response = prepareData(tickers)
        return response;
    } catch (error) {
        console.error('Error scanning table:', error);
        return []
    }
}
async function toggleCheck(ticker: string) {
    dynamoDB.get({
        TableName: 'scantable_20240830',
        Key: { ticker: ticker } // Replace with your primary key
    }, (err: Error, data: any) => {
        if (err) {
            console.error('Unable to get item. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            // console.log(data.Item)
            // Check if the item exists and has the attribute
            const currentItem = data.Item;
            const currentValue = currentItem ? currentItem.Check : false; // Default to false if the item or attribute is missing

            const newValue = !currentValue; // Toggle the boolean value

            // Update with the new toggled value
            dynamoDB.update({
                TableName: 'scantable_20240830',
                Key: { "ticker": ticker }, // Replace with your primary key
                UpdateExpression: 'SET #booleanAttr = :newValue',
                ExpressionAttributeNames: {
                    '#booleanAttr': 'Check' // Replace with your boolean attribute name
                },
                ExpressionAttributeValues: {
                    ':newValue': newValue
                },
                // ReturnValues: 'UPDATED_NEW'
            }, (err: Error, data: any) => {
                if (err) {
                    console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
                } else {
                    console.log('Item updated:', JSON.stringify(data, null, 2));
                }
            });
        }
    });
}
async function remove(ticker: string) {
    const params = {
        TableName: "scantable_20240830",
        Key: { "ticker": ticker },
    };
    try {
        const result = await dynamoDB.delete(params).promise();
        console.log('Item deleted successfully:', result);
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}
function prepareData(tickers: any) {
    const headers = Object.keys(tickers[0]).filter((key) => {
        return key !== "Check" && key !== "priceChart"
    }).map((key) => {
        return {
            name: key,
            type: checkType(key)
        }
    })
    return {
        headers,
        records: tickers
    }
}
function checkType(value: any) {
    if (typeof value === "number") return "Number"
    if (typeof value === "string") return "String"
    if (value instanceof Date && !isNaN(value.getTime())) return "Date"
}

export default {
    getAll,
    toggleCheck,
    remove
}