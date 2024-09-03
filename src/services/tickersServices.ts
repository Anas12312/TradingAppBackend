const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
});
const dynamoDB = new AWS.DynamoDB.DocumentClient();

function getTableName() {
    const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    return currentDate;
    // return "tvtable_20240805";
}

interface Result {
    records: any[]
}

async function getAll() {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    const scanData = (await getScanTable()) as Result
    const signalData = (await getSignalsTable()) as Result

    signalData.records = signalData.records.map(x => {
        const scan = scanData.records.filter(z => z.ticker === x.ticker)[0]
        return {
            ...x,
            volume_today: scan.volume_today,
        }
    })

    const signalLogData = (await getSignalsLogTable()) as Result

    signalLogData.records = signalLogData.records.map(x => {
        const scan = scanData.records.filter(z => z.ticker === x.ticker)[0]
        return {
            ...x,
            volume_today: scan.volume_today,
        }
    })

    return {
        scan: scanData,
        signal: signalData,
        signalLogs: signalLogData
    }
}
async function getSignalsTable() {
    const params = {
        TableName: "signaltable_20240903",
        // TableName: "signaltable_" + getTableName(),
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
async function getSignalsLogTable() {
    const params = {
        TableName: "signallogtable_20240902",
        // TableName: "signallogtable_" + getTableName(),
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
async function getScanTable() {
    const params = {
        TableName: "scantable_20240830",
        // TableName: "scantable_" + getTableName(),
        FilterExpression: "inactive = :inactiveVal",
        ExpressionAttributeValues: {
            ":inactiveVal": false
        }
    }
    try {
        const data = await dynamoDB.scan(params).promise();
        const tickers = data.Items;
        const response = prepareData(tickers);
        return response;
    } catch (error) {
        console.error('Error scanning table:', error);
        return [];
    }
}
async function dismissCheck(ticker: string) {
    dynamoDB.update({
        TableName: 'scantable_20240830',
        // TableName: "scantable_" + getTableName(),
        Key: { "ticker": ticker },
        UpdateExpression: 'SET #booleanAttr = :newValue',
        ExpressionAttributeNames: {
            '#booleanAttr': 'inactive'
        },
        ExpressionAttributeValues: {
            ':newValue': true
        },
    }, (err: Error, data: any) => {
        if (err) {
            console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('Item updated:', JSON.stringify(data, null, 2));
        }
    });
}
async function activateAlerts(ticker: string) {
    dynamoDB.update({
        TableName: 'scantable_20240830',
        // TableName: "scantable_" + getTableName(),
        Key: { "ticker": ticker },
        UpdateExpression: 'SET #booleanAttr = :newValue',
        ExpressionAttributeNames: {
            '#booleanAttr': 'status'
        },
        ExpressionAttributeValues: {
            ':newValue': 1
        },
    }, (err: Error, data: any) => {
        if (err) {
            console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('Item updated:', JSON.stringify(data, null, 2));
        }
    });
}
async function deactivateAlerts(ticker: string) {
    dynamoDB.update({
        // TableName: 'tvtable_20240830',
        TableName: "tvtable_" + getTableName(),
        Key: { "ticker": ticker },
        UpdateExpression: 'SET #booleanAttr = :newValue',
        ExpressionAttributeNames: {
            '#booleanAttr': 'status'
        },
        ExpressionAttributeValues: {
            ':newValue': 5
        },
    }, (err: Error, data: any) => {
        if (err) {
            console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('Item updated:', JSON.stringify(data, null, 2));
        }
    });
}
async function intrade(ticker: string) {
    dynamoDB.update({
        TableName: 'scantable_20240830',
        // TableName: "scantable_" + getTableName(),
        Key: { "ticker": ticker },
        UpdateExpression: 'SET #booleanAttr = :newValue',
        ExpressionAttributeNames: {
            '#booleanAttr': 'intrade'
        },
        ExpressionAttributeValues: {
            ':newValue': 1
        },
    }, (err: Error, data: any) => {
        if (err) {
            console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('Item updated:', JSON.stringify(data, null, 2));
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
    const headers = Object.keys(tickers[0]).map((key) => {
        return {
            name: key,
            type: checkType(key, tickers[0])
        }
    })
    return {
        headers,
        records: tickers
    }
}
function checkType(value: any, ticker: any) {
    if (typeof ticker[value] === "number") return "Number"
    const datePattern = /^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}$/;
    if (datePattern.test(ticker[value])) return "Date"
    if (typeof ticker[value] === "string") return "String"
}

export default {
    getAll,
    dismissCheck,
    remove,
    activateAlerts,
    deactivateAlerts,
    intrade
}