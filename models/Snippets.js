const { Schema, model } = require('mongoose');

const SnippetSchema = new Schema({

    nombre:String,
    creador: {type: Schema.Types.ObjectId, ref: 'User'},
    codigo:String,
    lenguaje:String
},{
    timestamps: true
});

module.exports = model('Snippet', SnippetSchema);