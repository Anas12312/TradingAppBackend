const AWS = require('aws-sdk');
AWS.config.update({
    // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-2'
});
const dynamoDB = new AWS.DynamoDB.DocumentClient();

function getTableName() {
    const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
    // return currentDate;
    return "20241004";
}

interface Result {
    headers: any[]
    records: any[]
}

let SCAN_DATA: Result = {
    headers: [],
    records: []
}
let INACTIVE_DATA: Result = {
    headers: [],
    records: []
}
let SIGNAL_DATA: Result = {
    headers: [],
    records: []
}
let SIGNAL_LOG_DATA: Result = {
    headers: [],
    records: []
}
let INTRADE_DATA: Result = {
    headers: [],
    records: []
}
async function readDynamo() {
    try {
        const dynamoDB = new AWS.DynamoDB.DocumentClient();
        const _SCAN_DATA = (await getScanTable()) as Result
        INACTIVE_DATA = (await getInactiveScanTable()) as Result
        SIGNAL_DATA = (await getSignalsTable()) as Result
        SIGNAL_LOG_DATA = (await getSignalsLogTable()) as Result
        INTRADE_DATA = (await getIntradeTable()) as Result
        if (_SCAN_DATA.records.length > 0) {
            SCAN_DATA = _SCAN_DATA
        }

        // if (_INACTIVE_DATA && _INACTIVE_DATA.records.length) {
        //     INACTIVE_DATA = _INACTIVE_DATA
        // }

        // if (_SIGNAL_DATA && _SIGNAL_DATA.records.length) {
        //     SIGNAL_DATA = _SIGNAL_DATA
        // }

        // if (_SIGNAL_LOG_DATA && _SIGNAL_LOG_DATA.records.length) {
        //     SIGNAL_LOG_DATA = _SIGNAL_LOG_DATA
        // }
    }
    catch (e) {
        console.log('INTERVAL READ', e);
    }
}

readDynamo()

setInterval(readDynamo, 30_000)

async function getAll() {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();
    const scanData = SCAN_DATA
    const inactiveData = INACTIVE_DATA
    const signalData = SIGNAL_DATA
    const intradeData = INTRADE_DATA
    scanData.records = scanData.records.map(x => {
        const intrade = intradeData.records.filter(z => z.ticker === x.ticker)[0]
        if(!intrade) return x

        return {
            ...x,
            ema10_bullish: intrade.ema10_bullish,
            ema10_raising: intrade.ema10_raising,
            price_angle: intrade.price_angle,
            smooth_ha: intrade.smooth_ha,
            trendcatcher_status: intrade.trendcatcher_status,
            trendtracer_status: intrade.trendtracer_status,
            vwap_raising: intrade.vwap_raising
        }
    })
    intradeData.records = intradeData.records.filter((ticker) => {
        if(scanData?.records.find(t => ticker.ticker === t.ticker)?.intrade == "True") {
            return true
        }
        return false
    })
    signalData.records = signalData?.records.map(x => {
        const scan = scanData.records.filter(z => z.ticker === x.ticker)[0]
        if (!scan) return x

        return {
            ...x,
            volume_today: scan.volume_today,
            halt_resume_time: scan.halt_resume_time,
            momo_time: scan.momo_time,
            turbo_time: scan.turbo_time,
            gap_go_time: scan.gap_go_time
        }
    })

    // console.log("intrade", scanData.records.map(x => x.intrade))
    const signalLogData = SIGNAL_LOG_DATA

    signalLogData.records = signalLogData.records.map(x => {
        const scan = scanData.records.filter(z => z.ticker === x.ticker)[0]
        if (!scan) return x
        return {
            ...x,
            volume_today: scan.volume_today,
            halt_resume_time: scan.halt_resume_time,
            momo_time: scan.momo_time,
            turbo_time: scan.turbo_time,
            gap_go_time: scan.gap_go_time
        }
    })

    const response = {
        scan: scanData,
        signal: signalData,
        signalLogs: signalLogData,
        inactive: inactiveData,
        intrade: intradeData
    }
    // console.log(response)
    return response
}
async function getIntradeTable() {
    const params = {
        // TableName: "intrade_20241001",
        TableName: "intradetable_" + getTableName(),
    }

    try {
        const data = await dynamoDB.scan(params).promise();
        const tickers = data.Items;
        const response = prepareData(tickers)
        return response || [];
    } catch (error) {
        console.error('Error scanning intrade table:', error);
        return prepareData([])
    }
}
async function getSignalsTable() {
    const params = {
        // TableName: "signaltable_20240903",
        TableName: "signaltable_" + getTableName(),
    }

    try {
        const data = await dynamoDB.scan(params).promise();
        const tickers = data.Items;
        const response = prepareData(tickers)
        return response || [];
    } catch (error) {
        console.error('Error scanning signals table:', error);
        return prepareData([])
    }
}
async function getSignalsLogTable() {
    const params = {
        // TableName: "signallogtable_20240902",
        TableName: "signallogtable_" + getTableName(),
    }
    try {
        const data = await dynamoDB.scan(params).promise();
        const tickers = data.Items;
        const response = prepareData(tickers)
        return response || [];
    } catch (error) {
        console.error('Error scanning logs table:', error);
        return prepareData([])
    }
}
async function getScanTable() {
    const params = {
        // TableName: "scantable_20240904",
        TableName: "scantable_" + getTableName(),
        FilterExpression: "inactive = :inactiveVal",
        ExpressionAttributeValues: {
            ":inactiveVal": "False"
        }
    }
    console.log("scantable_" + getTableName())
    try {
        const data = await dynamoDB.scan(params).promise();
        const tickers = data.Items;
        const response = prepareData(tickers);
        return response || [];
    } catch (error) {
        console.error('Error scanning scan table:', error);
        return prepareData([]);
    }
}
async function getInactiveScanTable() {
    const params = {
        // TableName: "scantable_20240904",
        TableName: "scantable_" + getTableName(),
        FilterExpression: "inactive = :inactiveVal",
        ExpressionAttributeValues: {
            ":inactiveVal": "True"
        }
    }
    try {
        const data = await dynamoDB.scan(params).promise();
        const tickers = data.Items;
        const response = prepareData(tickers);
        return response || [];
    } catch (error) {
        console.error('Error scanning scan table:', error);
        return prepareData([]);
    }
}
async function dismissCheck(ticker: string) {
    dynamoDB.update({
        // TableName: 'scantable_20240904',
        TableName: "scantable_" + getTableName(),
        Key: { "ticker": ticker },
        UpdateExpression: 'SET #booleanAttr = :newValue',
        ExpressionAttributeNames: {
            '#booleanAttr': 'inactive'
        },
        ExpressionAttributeValues: {
            ':newValue': "True"
        },
    }, (err: Error, data: any) => {
        if (err) {
            console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('Item updated:', JSON.stringify(data, null, 2));
        }
    });
}
async function activeTicker(ticker: string) {
    console.log(ticker)
    dynamoDB.update({
        // TableName: 'scantable_20240904',
        TableName: "scantable_" + getTableName(),
        Key: { "ticker": ticker },
        UpdateExpression: 'SET #booleanAttr = :newValue',
        ExpressionAttributeNames: {
            '#booleanAttr': 'inactive'
        },
        ExpressionAttributeValues: {
            ':newValue': "False"
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
        // TableName: 'scantable_20240904',
        TableName: "scantable_" + getTableName(),
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
    console.log(ticker)
    dynamoDB.update({
        // TableName: 'scantable_20240904',
        TableName: "scantable_" + getTableName(),
        Key: { "ticker": ticker },
        UpdateExpression: 'SET #booleanAttr = :newValue',
        ExpressionAttributeNames: {
            '#booleanAttr': 'intrade'
        },
        ExpressionAttributeValues: {
            ':newValue': "True"
        },
    }, (err: Error, data: any) => {
        if (err) {
            console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('Item updated:', JSON.stringify(data, null, 2));
        }
    });
}
async function detrade(ticker: string) {
    dynamoDB.update({
        // TableName: 'scantable_20240904',
        TableName: "scantable_" + getTableName(),
        Key: { "ticker": ticker },
        UpdateExpression: 'SET #booleanAttr = :newValue',
        ExpressionAttributeNames: {
            '#booleanAttr': 'intrade'
        },
        ExpressionAttributeValues: {
            ':newValue': "False"
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
        TableName: "scantable_20240904",
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
    let headers: any[] = []
    if (tickers.length) {
        headers = Object.keys(tickers[0]).map((key) => {
            return {
                name: key,
                type: checkType(key, tickers[0])
            }
        })

    }
    return {
        headers,
        records: tickers || []
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
    intrade,
    activeTicker,
    detrade
}