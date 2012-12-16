var _ = require('_'),
    Backbone = require('Backbone'),
    BuildModel = require('BuildModel');

var BuildsCollection = Backbone.Collection.extend({
    model: BuildModel,
    localStorage: new Backbone.LocalStorage('lmd-builds'),

    destroyByProjectId: function (projectId) {
        _.each(this.where({projectId: projectId}), function (build) {
            this.get(build.id).destroy();
        }, this);
    }
});

var builds = new BuildsCollection();

module.exports = builds;
