var _ = require('_'),
    Backbone = require('Backbone');

var BuildModel = Backbone.Model.extend({
    defaults: {
        name: '',
        projectId: null, // belongs to one project
        isWatching: false,
        isBuilding: false,
        isStats: false,
        isCurrent: false
    },

    validate: function (attrs) {
        if (!attrs.projectId) {
            return "projectId should be specified";
        }
    },

    focus: function () {
        var currentSelected = this.collection.where({isCurrent: true});
        _.each(currentSelected, function (build) {
            this.collection.get(build.id).blur();
        }, this);

        this.save({
            isCurrent: true
        });
    },

    blur: function () {
        this.save({
            isCurrent: false
        });
    }
});

module.exports = BuildModel;