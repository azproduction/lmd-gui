var _ = require('_'),
    Backbone = require('Backbone');

var ProjectModel = Backbone.Model.extend({
    defaults: {
        name: ''
    },

    validate: function (attrs) {
        if (!attrs.location) {
            return "location should not be empty";
        }
    }
});

module.exports = ProjectModel;
