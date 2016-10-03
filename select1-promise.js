var oracledb = require('oracledb');
var fs = require('fs');
var dbConfig = require('./dbconfig.js');

var outputFileName = "/Users/anakin/Desktop/ali/save.json";
var rowCount = 0;
var queryData = {};



oracledb.getConnection({
        user: dbConfig.user,
        password: dbConfig.password,
        connectString: dbConfig.connectString
    })
    .then(function(connection) {
        return connection.execute(
                "select QQ_ID from GATHER_QQ_NUMS order by QQ_ID, IMPTIME", [], // no bind variables
                {
                    resultSet: true,
                    outFormat: oracledb.OBJECT
                } // return a result set.  Default is false
            )
            .then(function(result) {
                console.log("****** this is 'result' : ******");
                console.log(result);
                // console.log("****** this is 'metaData' : ******");
                // console.log(result.resultSet.metaData);
                console.log("****** start reading lines : ******");
                fetchOneRowFromRS(connection, result.resultSet);
            })
            .catch(function(err) {
                console.error(err.message);
                doRelease(connection);
                return;
            })
    })
    .then(function(connection){
        return connection.execute(
                "select NICK from GATHER_QQ_NUMS order by QQ_ID, IMPTIME", [], // no bind variables
                {
                    resultSet: true,
                    outFormat: oracledb.OBJECT
                } // return a result set.  Default is false
            )
            .then(function(result) {
                console.log("****** this is 'result' : ******");
                console.log(result);
                // console.log("****** this is 'metaData' : ******");
                // console.log(result.resultSet.metaData);
                console.log("****** start reading lines : ******");
                fetchOneRowFromRS(connection, result.resultSet);
            })
            .catch(function(err) {
                console.error(err.message);
                doRelease(connection);
                return;
            })
    });





function fetchOneRowFromRS(connection, resultSet) {
    resultSet.getRow( // get one row
        function(err, row) {
            if (err) {
                console.error(err.message);
                doClose(connection, resultSet); // always close the result set
            } else if (!row) { // no rows, or no more rows
                doClose(connection, resultSet); // always close the result set
            } else {
                rowCount++;

                console.log("fetchOneRowFromRS(): row " + rowCount);
                console.log(row);
                queryData["result_" + rowCount] = row;

                fetchOneRowFromRS(connection, resultSet);
            }
        });
}

function doRelease(connection) {
    connection.release(
        function(err) {
            if (err) {
                console.error(err.message);
            }
        });
}

function doClose(connection, resultSet) {
    resultSet.close(
        function(err) {
            if (err) {
                console.error(err.message);
            }
            //write data to JSON
            fs.writeFile(outputFileName, JSON.stringify(queryData, null, 4), function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("JSON saved to " + outputFileName);
                }
            });
            doRelease(connection);
        });
}
