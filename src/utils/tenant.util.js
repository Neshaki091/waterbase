const mongoose = require ('mongoose');

function getTenantModel(appID, modelName, schema){
    const collectionName = `${appID}_${modelName}`;
    return mongoose.model(collectionName, schema, collectionName);
}

module.exports = getTenantModel;